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

  setTimeout(() => t.end(), 3000)
})

test('get response', (t) => {
  client
    .get('localhost:3001/post/1')
    .then((response) => {
      t.ok(response.body)
      t.end()
    })
})
