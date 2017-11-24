import test from 'tape'
import Final from './index'

test('package should export Component and createServer', async t => {
  t.ok(Final.Component, 'Component should exist')
  t.ok(Final.createServer, 'createServer should exist')
  t.end()
})
