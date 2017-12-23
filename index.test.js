import test from 'ava'
import client from 'superagent'

const PORT = process.env.PORT || 3001

test('get nothing', async (t) => {
  const request = await client.get(`localhost:${PORT}`)

  console.log('request', request)

  t.truthy(request)
})
