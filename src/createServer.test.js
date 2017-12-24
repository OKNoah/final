import test from 'tape'
import { resolve } from 'path'
import Final from './index'
import Post from '../test/components/Post'

const PORT = process.env.PORT || 3001

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
