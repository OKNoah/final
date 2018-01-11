import { Database } from 'arangojs'
import { Component, hoist } from 'final-server'
import t from 'flow-runtime'
import arangolize from 'arangolize'
import * as types from './types'

export { types }

const OptionsSchema = t.type('ArangoOptions', t.object(
  t.property('edge', t.string(), true),
  t.property('collection', t.string(), true)
))

function validationErrorHandler (e) {
  const errors = e.message.split('-------------------------------------------------\n\n')
  const messages = errors.map(error => error.split('\n')[0])
  return new Error(messages)
}

/*
  For now it just uses the database named 'test'. We could put a place to change this in the decorator, but it will lead to redundant code. Instead, we will create a way to initialize the datebase in `createServer`, or in the `redux` equivelant.
*/
export default function arango (dbOptions) {
  const database = dbOptions.database || 'test'
  const url = dbOptions.url || 'http://root:@127.0.0.1:8529'
  const arangoVersion = dbOptions.arangoVersion || 30300

  const db = new Database({
    url,
    arangoVersion
  })

  async function checkDatabase () {
    const databases = await db.listDatabases()

    if (!databases.includes(database)) {
      try {
        await db.createDatabase(database)
      } catch (e) {
        if (e.message.toUpperCase() === 'DUPLICATE NAME') {
          return
        }

        throw e
      }
    } else {
      db.useDatabase(database)
    }

    return
  }

  return (colOptions) => {
    try {
      OptionsSchema.assert({
        ...colOptions,
        ...dbOptions
      })
    } catch (e) {
      throw validationErrorHandler(e)
    }

    const name = colOptions.collection || colOptions.edge
    let collection = {}

    /*
      Check to make sure collection exists before doing any writes or queries. Will create collection if none exists.
    */
    async function checkCollection () {
      try {
        if (colOptions.edge) {
          collection = db.edgeCollection(name)
        } else {
          collection = db.collection(name)
        }
      } catch (e) {
        if (e.message.toUpperCase() === 'DUPLICATE NAME') {
          return
        }

        throw e
      }

      const collections = await db.listCollections()
      const colExists = collections.map(c => c.name).includes(name)

      if (colExists) {
        return
      }

      await collection.create()
      return
    }

    // Attemps to see if the index of the instance.uniques already exists in the list of uniques. If not, it creates the index
    async function checkIndexes (instance) {
      if (instance && instance.uniques) {
        const indexes = await collection.indexes()
        const paths = instance.uniques.map(unique => {
          return JSON.stringify(Array.isArray(unique) ? unique.sort() : [unique])
        })
        const uniques = indexes.map(index => {
          return JSON.stringify(index.fields.sort())
        })

        for (let i = 0; i < paths.length ; i++) {
          const path = paths[i]

          if (!uniques.includes(path)) {
            try {
              await collection.createHashIndex(JSON.parse(path), true)
              return
            } catch (e) {
              // console.error(e.message)
            }
          } else {
            return
          }
        }
      }
    }

    async function check () {
      await checkDatabase()
      db.useDatabase(database)
      await checkCollection(name)
      return
    }

    check()

    return (target) => {
      class DecoratedClass extends Component {
        constructor (props) {
          super(props)
        }

        async find (args, opts = { andCount: false }) {
          const { andCount } = opts

          const { query, bindVars } = await arangolize({
            ...args,
            collection: colOptions.collection
          })

          const cursor = await db.query({
            query, 
            bindVars
          })
          const documents = await cursor.all()

          if (documents[0]) {
            if (andCount) {
              return {
                data: documents,
                meta: documents[0].meta
              }
            }

            return documents[0].data
          }
        }

        async findOne (args) {
          args.limit = 1
          const results = await this.find(args)
          return results[0]
        }

        async findAndCount (args) {
          const results = await this.find(args, { andCount: true })
          return results
        }

        /*
          This function looks through the schema to find fields that use the ArangoId type. If they do, they're altered from an object to just a string (`object._id`) if they aren't already an `_id` string. It is for convenience, if all docs are saved as `_id` strings, then there would be no need for this.
        */
        async processDocuments (props) {
          this.schema.type.properties.map((prop) => {
            const isString = typeof props[prop.key] === 'string'
            const isIdField = prop.value.name === 'ArangoId'

            if (isIdField && !isString) {
              props[prop.key] = props[prop.key]._id
            }
          })

          return props
        }

        async save (...args) {
          await checkIndexes(this)
          const isCollection = typeof colOptions.collection === 'string'
          let props = isCollection ? args[0] : args[2] || {}

          if (this.schema) {
            try {
              props = await this.processDocuments(props)
              await this.schema.assert(props)
            } catch (e) {
              throw validationErrorHandler(e)
            }
          }

          // we add a custom _createdAt attribute to all documents for ease
          props._createdAt = new Date().toISOString()
          props._removed = false

          // add _from and _to properties if it's an edge document
          if (!isCollection) {
            props._from = typeof args[0] === 'object' ? args[0]._id : args[0]
            props._to = typeof args[1] === 'object' ? args[1]._id : args[1]
          }

          // add `returnNew` option only if it's a collection. edge does not support it.
          const values = [props, isCollection ? { returnNew: true } : undefined]

          const data = await collection.save(...values)
          return isCollection ? data.new : data
        }

        async remove (doc) {
          if (typeof doc === 'object' && doc._id) {
            await collection.remove(doc._id)
            return
          }

          await collection.remove(doc)
          return
        }

        async query (query) {
          const cursor = await db.query(query)
          const results = cursor.all()
          return results
        }
      }

      return hoist(target, DecoratedClass)
    }
  }
}
