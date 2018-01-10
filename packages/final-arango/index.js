import { Database } from 'arangojs'
import { Component, hoist } from 'final-server'
import t from 'flow-runtime'
import arangolize from 'arangolize'

const OptionsSchema = t.type('ArangoOptions', t.object(
  t.property('edge', t.string(), true),
  t.property('collection', t.string(), true)
))

/*
  For now it just uses the database named 'test'. We could put a place to change this in the decorator, but it will lead to redundant code. Instead, we will create a way to initialize the datebase in `createServer`, or in the `redux` equivelant.
*/
export default function database (options) {
  OptionsSchema.assert(options)

  const name = options.collection || options.edge

  const db = new Database({
    url: options.url || 'http://root:@127.0.0.1:8529',
    arangoVersion: options.arangoVersion || 30300
  });

  db.useDatabase(options.database || 'test')

  let collection = {}

  if (options.edge) {
    collection = db.edgeCollection(name)
  } else {
    collection = db.collection(name)
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
      paths.map(async (path) => {
        if (!uniques.includes(path)) {
          try {
            await collection.createHashIndex(JSON.parse(path), true)
          } catch (e) {
            console.error(e)
          }
        }
      })
    }
  }

  /*
    Check to make sure collection exists before doing any writes or queries. Will create collection if none exists.
  */
  function checkCollection () {
    db.listCollections().then(collections => {
      const colExists = collections.map(c => c.name).includes(name)

      if (colExists) {
        return
      }

      collection.create()
      return
    })
  }

  checkCollection()

  return (target) => {
    class DecoratedClass extends Component {
      constructor (props) {
        super(props)
        checkCollection()
      }

      async find (args, opts = { andCount: false }) {
        const { andCount } = opts

        const { query, bindVars } = await arangolize({
          ...args,
          collection: options.collection
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
        const isCollection = typeof options.collection === 'string'
        let props = isCollection ? args[0] : args[2] || {}

        if (this.schema) {
          try {
            props = await this.processDocuments(props)
            await this.schema.assert(props)
          } catch (e) {
            const errors = e.message.split('-------------------------------------------------\n\n')
            const messages = errors.map(error => error.split('\n')[0])
            throw new Error(messages)
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

      async query (query) {
        const cursor = await db.query(query)
        const results = cursor.all()
        return results
      }
    }

    return hoist(target, DecoratedClass)
  }
}
