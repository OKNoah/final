import test from 'tape'
import { resolve } from 'path'
import { createStore } from 'redux'
import Final from './index'
import Post from '../test/components/Post'

const PORT = process.env.PORT || 3001

const reducer = (state = { count: 0 }, action) => {
  switch (action.type) {
    case 'INCREMENT':
      return {
        ...state,
        count: state.count + 1
      }

    default:
      return state
  }
}

const sessionStore = createStore(reducer)

async function middlewareSession () {
  const actions = {
    get: () => sessionStore.dispatch({ type: 'GET_WHATEVER', result: { date: Date.now() } })
  }

  return async function (component) {
    component.prototype.sessionActions = actions
    component.prototype.sessionStore = sessionStore
    return component
  }
}

test('start server with directory', async t => {
  const server = await Final.createServer({
    directory: resolve(__dirname, '../test/components'),
    port: PORT
  })

  t.ok(server, 'server should be truthy')
  t.ok(server.close, 'server.close should exist')
  server.close(t.end())
})

test('start server with components', async t => {
  const server = await Final.createServer({
    components: [Post],
    port: PORT
  })

  t.ok(server, 'server should be truthy')
  t.ok(server.close, 'server.close should exist')
  server.close(t.end())
})

test('start the server with middleware', async t => {
  const server = await Final.createServer({
    components: [Post],
    port: PORT,
    middleware: [middlewareSession]
  })

  t.ok(server, 'should launch server with middleware')
  t.ok(server.close, 'server.close should exist')
  server.close(t.end())
})

test('start the server with global store', async t => {
  const server = await Final.createServer({
    components: [Post],
    port: PORT,
    middleware: [middlewareSession],
    store: sessionStore
  })

  t.ok(server, 'should launch server with global store')
  t.ok(server.close, 'server.close should exist')
  server.close(t.end())
})
