import test from 'tape'
import arangolize from './index'

/*
  See more tests of what this package is capable of in packages/final-server/database.test.js
*/
test('should return query and bindVars', async (t) => {
  const { bindVars, query } = await arangolize({
    where: { body: 'hello' },
    collection: 'test'
  })

  t.ok(bindVars, 'should have bindVars')
  t.ok(query, 'should have query')
  t.end()
})
