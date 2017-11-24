import test from 'tape'
import client from 'superagent'
import Final from './index'
import { findDecorator } from '../test/ArangoDecorator'

@findDecorator({
  collection: 'Post'
})
class User extends Final.Component {
  path = '/user/:user?'
  constructor () {
    super()
  }

  async respond () {
    const data = await this.findOne({"body": "Updated!"})
    return {
      data,
      params: this.props.params
    }
  }
}

const PORT = process.env.PORT || 3001
let server = {}

test('start server with components', async t => {
  server = await Final.createServer({
    components: [User],
    port: PORT
  })

  t.ok(server, 'server should be truthy')
  t.ok(server.close, 'server.close should exist')
  t.end()
})

test('get response', (t) => {
  client
    .get('localhost:3001/user/1')
    .then((response) => {
      t.equal(response.status, 200)
      t.equal(response.body.params.user, "1")
      t.ok(response.body.data)
      server.close(t.end())
    })
})
