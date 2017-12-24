# Final

This is a very experimental proof of concept for a sort of MC framework. It's meant to work a little like React, but for handling web requests. One of the posibilities would be very precise handling of how to respond to requests, possibly allowing redux store-like functionality.

## Usage

```js
import Final from './src/index'
import { findDecorator } from './test/ArangoDecorator'
import { middleware, store } from './example/middleware'

/*
  The `findDecorator` adds a few funtions to the class, like `this.findOne`.
*/
@findDecorator({
  // this decorator will verify collection or create new one
  collection: 'Post'
})
class Post extends Final.Component {
  /*
    The path decides what requests will match this component and the params.
  */
  path = '/post/:post?'
  constructor () {
    super()
  }

  /*
    The respond function returns whatever the response will be. Notice the params and `this.findOne` are available.
  */
  async respond () {
    console.log('this.props.params', this.props.params)
    const output = await this.findOne({"body": "Updated!"})
    return output
  }
}

Final.createServer({
  components: [Post],
  port: 3001,
  middleware, // optional, see `examples/middleware-usage.js`
  store // optional, see `examples/middleware-usage.js`
})
```
