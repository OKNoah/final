import { createStore } from 'redux'
import Final from '../src/index'
import { findDecorator } from '../test/ArangoDecorator'
import { middleware, store, reducer } from '../examples/middleware'

/*
  You can run this example in node like this (run yarn install if you don't have @babel/register):

  `node -r @babel/register examples/middleware-usage.js`

  You can test it easily in terminal like this:

  `curl -X GET --header 'Accept: application/json' 'http://localhost:3001/user/$v'`

  If you want to run that 1000 times for fun, do this (in bash, not fish. run just 'bash' first to leave fish for bash.):

  'for v in {1..1000} ; do echo "`curl -X GET --header Accept: application/json http://localhost:3001/user/$v`"; done;'

  OR see `../test/scripts.md` for another basic one-liner script that prints a bit better.
*/

/*
  Middleware modifies all Components in an app, in whatever way you want. Just return a function that returns a modified component.

  By creating and attaching a store here, you ensure it will be used per-session only. It is tied to each individual Component instance and destroyed when connection ends.

  To craete a global store, declare the store outside the middleware function, and pass it into `createServer` as the `store` option. See `examples/middleware.js`.

  The middleware receives the global store if there is one set.
*/
async function sessionMiddleware (/*globalStore*/) {
  const sessionStore = createStore(reducer)

  const actions = {
    increment: () => sessionStore.dispatch({ type: 'GET_WHATEVER', result: { date: Date.now() } })
  }

  /*
    This acts simply like a decorator, but it should be async.
  */
  return async function (component) {
    component.prototype.sessionActions = actions
    component.prototype.sessionStore = sessionStore
    return component
  }
}

@findDecorator({
  collection: 'FinalUser'
})
class User extends Final.Component {
  path = '/user/:user?'
  constructor () {
    super()
  }

  async respond () {
    /*
      `this.actions` and `this.sessionActions` Are available as we declared in our middlewares.
    */
    this.sessionActions.increment()
    this.actions.increment()

    return {
      /*
        `this.sesstionStore` is what we added in the sessionMiddleware in this file.
      */
      data: this.sessionStore.getState(),
      params: this.props.params,
      /*
        `this.store` is the _global_ store spassed in through `Final.createServer`
      */
      state: this.store.getState()
    }
  }
}

const PORT = 3001

Final.createServer({
  components: [User],
  port: PORT,
  /*
    This is the _global_ store. Obviously don't store unencrypted personal data here as it can be available between sessions and users.
  */
  store: store,
  /*
    Middlewares can be single or an array. There's currently no check to see if there's conflicting values. Things will be more organized soon.
  */
  middleware: [sessionMiddleware, middleware]
})
