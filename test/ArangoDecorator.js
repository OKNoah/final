import { before } from 'toxic-decorators'
import { Database } from 'arangojs'
import Final from '../src'

/*
  For now it just uses the database named 'test'. We could put a place to change this in the decorator, but it will lead to redundant code. Instead, we will create a way to initialize the datebase in `createServer`, or in the `redux` equivelant.
*/
const db = new Database({
  url: 'http://root:@127.0.0.1:8529',
  arangoVersion: 30300
});

db.useDatabase('test')

export function findDecorator (options) {
  const collection = db.collection(options.collection)

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

  return (target) => {
    class DecoratedClass extends Final.Component {
      constructor (props) {
        super(props)
      }

      @before(checkCollection)
      async findOne (example) {
        const cursor = await collection.firstExample(example)
        return cursor
      }

      @before(checkCollection)
      async save (props) {
        const data = await collection.save(props)
        return data
      }

      @before(checkCollection)
      async query (query) {
        const cursor = await db.query(query)
        const results = cursor.all()
        return results
      }
    }

    return Final.hoist(target, DecoratedClass)
  }
}
