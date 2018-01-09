import test from 'tape'
import queryBuilder from './queryBuilder'

test('should return query and bindVars', async (t) => {
  const { bindVars, query } = await queryBuilder({
    where: { body: 'hello' },
    collection: 'test'
  })

  t.ok(bindVars, 'should have bindVars')
  t.ok(query, 'should have query')
  t.end()
})
