import test from 'tape'
import client from 'superagent'
import Final, { reduxConnect } from './index'
import { store } from '../examples/middleware'
import { database } from './index'
import { bindActionCreators } from 'redux'
import WS from 'ws'

const HOST = 'localhost:3001'

@reduxConnect(
  null,
  (dispatch) => bindActionCreators({
    increment: () => ({ type: 'GET_WHATEVER', result: { date: Date.now() } })
  }, dispatch)
)
@database({
  collection: 'FinalUser'
})
class User extends Final.Component {
  path = '/user/:user?'

  async respond () {
    await this.save({ "body": "Updated!" })
    const data = await this.findOne({ "body": "Updated!" })
    await this.actions.increment()
    return {
      data,
      params: this.props.params,
      state: this.store.getState()
    }
  }
}

const PORT = process.env.PORT || 3001
let server = {}

test('start server with components', async t => {
  server = await Final.createServer({
    components: [User],
    port: PORT,
    store,
    // middleware
  })

  t.ok(server, 'server should be truthy')
  t.ok(server.close, 'server.close should exist')
  t.end()
})

test('get response', (t) => {
  client
    .get(HOST + '/user/1')
    .then((response) => {
      t.equal(response.status, 200)
      t.equal(response.body.params.user, "1")
      t.ok(response.body.state.count !== undefined, 'should have `count` property on `body.state`')
      t.equal(response.body.state.count, 1, 'should always be 1')
      t.ok(response.body.data)
      t.end()
    })
})

test('upgrade to web sockets', (t) => {
  const ws = new WS('ws://' + HOST)

  ws.on('open', () => {
    t.ok(ws, 'should open websockets connection')
    server.close(t.end())
  })
})

// test.onFailure(() => server.close())
