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

      @before(checkCollection)
      async findOne (example) {
        const cursor = await collection.firstExample(example)
        return cursor
      }

      async save (props) {
        await checkCollection()
        if (this.schema) {
          this.schema.assert(props)
        }

        props._createdAt = new Date().toISOString()
        props._removed = false
        const data = await collection.save(props, { returnNew: true })
        return data
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
