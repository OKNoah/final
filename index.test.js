import test from 'tape'
import { resolve } from 'path'
import client from 'superagent'
import Final from './src'

const PORT = process.env.PORT || 3001

test('start server', t => {
  Final.createServer({
    directory: resolve(__dirname, './test/components'),
    post: PORT
  })

  setTimeout(() => t.end(), 1000)
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
