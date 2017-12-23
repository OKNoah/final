import Final from '../src'
import { Database, aql } from 'arangojs'

const db = new Database({
  url: 'http://root:@127.0.0.1:8529',
});

db.useDatabase('test')

/*
  https://github.com/AvraamMavridis/javascript-decorators
*/
const _isFunction = function ( prop ) {
  return typeof prop === 'function'
}

function hoist (target, classes) {
  classes.forEach( _class => {
    const keys = Object.getOwnPropertyNames( _class.prototype );
    keys.forEach( key => {
      if ( !target.prototype[ key ] && _isFunction( _class.prototype[ key ] ) ) {
        target.prototype[ key ] = _class.prototype[ key ];
      }
    })
  })
  return target
}

export const findDecorator = (options) => {
  const collection = db.collection(options.collection)

  return (target) => {
    class DecoratedClass extends Final.Component {
      constructor () {
        super()
      }

      async findOne (example) {
        const cursor = await collection.firstExample(example)
        return cursor
      }

      async query (query) {
        const cursor = await db.query(query)
        const results = cursor.all()
        return results
      }
    }

    return hoist(target, [DecoratedClass])
  }
}
