import test from 'tape'
import { resolve } from 'path'
import client from 'superagent'
import Final from './src'
import Post from './test/components/Post'

const PORT = process.env.PORT || 3001

test('start server with directory', async t => {
  const server = await Final.createServer({
    directory: resolve(__dirname, './test/components'),
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
  t.end()
})

test('get response', (t) => {
  client
    .get('localhost:3001/post/1')
    .then((response) => {
      t.equal(response.status, 200)
      t.equal(response.body.params.post, "1")
      t.ok(response.body.data)
      t.end()
    })
})
