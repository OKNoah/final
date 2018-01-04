# Final

![Dependency check](https://david-dm.org/oknoah/final.svg)

This is a very experimental proof of concept for a server framework. It takes ideas from ES6+ and React to see if there's a more enjoyable, versatile way to create APIs. 

> ⚠️ NOTE: Future releases will be pre-release and have `alpha` and `beta` tags. NPM/yarn will probably not install these unless you specify.

Key concepts are:

#### Classes

Each endpoint has a class, which extends the component class. The main method of the class is `respond` which decides what is returned upon each request.

#### Lifecycle

Each component has a lifecycle, with names similar to the lifecycle components of React components.

#### Decorators

Decorators are used to add actions and in-memory state to components. The example decorator that's included is for ArangoDB. A `reduxConnect` decorator is also currently part of the library.

#### WebSockets

WebSocket-functionality is built-in (at present). Depending on how you wish to use the library, you can have components that repeat their lifecycle whenever state is changed. This is most useful for WebSocket servers becuase there may be multiple responses per connection. An `http` request will fire `response` onece, but a WebSocket connection might do it many times.

## Usage

See the [`/examples`](examples) and files matching the patter [`**/*.test.js`](src) for more usage and explanation. Be warned the API will change a lot.

```js
import Final, { reduxConnect, database } from './src/index'
import { bindActionCreators } from 'redux'
import { middleware, store } from './example/middleware'
import { moveUp } from './redux/modules/player'
import { UserSchema } from './schemas' // not an actual thing that's included

/*
  The `findDecorator` adds a few funtions to the class, like `this.findOne`.
*/
@database({
  // this decorator will verify collection or create new one
  collection: 'Post',
  url: 'http://root:@127.0.0.1:8529', // this value is the default
  arangoVersion: 30300 // this is also the default
})
@reduxConnect(
  (state) => ({
    players: state
  }),
  (dispatch) => ({
    moveUp
  })
)
class Post extends Final.Component {
  /*
    The path decides what requests will match this component and the params.
  */
  path = '/post/:post?'
  /*
    Define the schema which is enforced by the arango decorator on `save` commands.
  */
  schema = UserSchema 

  async respond () {
    console.log('this.props.params', this.props.params)
    console.log('this.actions.moveUp', this.action.moveUp)
    const output = await this.actions.findOne({
      where: {"body": "Updated!"} // The `database` has special find functions with query-building
    })
    return {
      data: {
        players: this.props.players,
        output
      }
    }
  }
}

Final.createServer({
  components: [Post],
  port: 3001,
  store, // optional, see `examples/game-server.js`
  // middleware, /* Removed. Purpose needs to be decided. */
})
```
