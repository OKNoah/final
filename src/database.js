import { before } from 'toxic-decorators'
import { Database } from 'arangojs'
import { Component, hoist } from './index'

/*
  For now it just uses the database named 'test'. We could put a place to change this in the decorator, but it will lead to redundant code. Instead, we will create a way to initialize the datebase in `createServer`, or in the `redux` equivelant.
*/
export default function database (options) {
  const db = new Database({
    url: options.url || 'http://root:@127.0.0.1:8529',
    arangoVersion: options.arangoVersion || 30300
  });

  db.useDatabase(options.database || 'test')

  const collection = db.collection(options.collection || 'FinalUser')

  /*
    Check to make sure collection exists before doing any writes or queries. Will create collection if none exists.
  */
  const checkCollection = async () => {
    const collections = await db.listCollections()
    const colExists = collections.map(c => c.name).includes(options.collection)
    if (colExists) {
      return
    }

    await collection.create()
    return
  }

  checkCollection()

  return (target) => {
    class DecoratedClass extends Component {
      constructor (props) {
        super(props)
      }

      async find (args, opts = { andCount: false }) {
        const { andCount } = opts
        await checkCollection()
        let { skip, limit, where, attributes, sort, include } = args

        const bindVars = {
          '@modelName': options.collection,
          limit: limit || 25,
          skip: skip || 0
        }

        const getWhere = () => {
          let count = 0
          const wheres = []
          for (const key in where) {
            const prop = `wherekey${count}`
            const value = `wherevalue${count}`
            bindVars[prop] = key
            bindVars[value] = where[key]
            wheres[count] = ' filter instance.@' + prop + ' == @' + value + ' '
            count++
          }

          return wheres.join('\n')
        }

        if (include) {
          bindVars.includeAs = include.as
        }

        if (attributes) {
          bindVars.attributes = attributes
        }

        /* Begin */
        let query = `let data = (
          for instance in @@modelName
          filter instance._removed != true
        `

        if (where) {
          query += getWhere()
        }

        if (sort) {
          const sortArray = sort.split(' ')
          const direction = sortArray[1].toLowerCase()
          if (['asc', 'desc'].includes(direction)) {
            query += `\n sort instance.@sortparam @sortDirection`
            bindVars.sortparam = sortArray[0]
            bindVars.sortDirection = direction
          } else {
            throw new Error('Your sort parameter should look like this `sort: "createdAt desc"` or `sort: "name asc"`. Looks like you are using something other than "ASC" or "DESC". File a bug if report you want!')
          }
        }

        query += ` return instance ) \n` // ends data = (...)
        query += ` return {
          data: (
            for instance in data
              limit @skip, @limit
        `

        if (attributes) {
          bindVars.attributes = attributes
          query += ` return KEEP(instance, @attributes) \n ), \n`
        } else if (attributes && include) {
          query += `
              let atts = KEEP(instance, @attributes)
              return MERGE(atts, { @includeAs: DOCUMENT(instance[@includeAs]) }) \n), \n
          `
        } else if (include) {
          query += ` return MERGE(instance, { @includeAs: DOCUMENT(instance[@includeAs]) }) \n), \n`
        } else {
          query += ` return instance )`
        }

        if (andCount) {
          query += `, \n meta: { count: LENGTH(data) }`
        }

        query += ` \n }`

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

          return documents[0]
        }
      }

      async findOne (args) {
        await checkCollection()
        args.limit = 1
        const results = await this.find(args)
        return {
          data: results.data[0]
        }
      }

      async findAndCount (args) {
        await checkCollection()
        const results = await this.find(args, { andCount: true })
        return results
      }

      async save (props) {
        await checkCollection()

        if (this.schema) {
          try {
            await this.schema.assert(props)
          } catch (e) {
            const errors = e.message.split('-------------------------------------------------\n\n')
            const messages = errors.map(error => error.split('\n')[0])
            throw new Error(messages)
          }
        }

        props._createdAt = new Date().toISOString()
        props._removed = false
        const data = await collection.save(props, { returnNew: true })
        return data.new
      }

      @before(checkCollection)
      async query (query) {
        const cursor = await db.query(query)
        const results = cursor.all()
        return results
      }
    }

    return hoist(target, DecoratedClass)
  }
}
