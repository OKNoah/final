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

/**/
test('should return query and bindVars', async (t) => {
  const { bindVars, query } = await arangolize({
    collection: 'test',
    include: {
      as: 'user',
      where: { name: 'Noah', createdAt: "2017-09-05T12:05:30.166Z" }
    }
  })

  t.ok(bindVars, 'should have bindVars')
  t.ok(query, 'should have query')
  t.end()
})

/**/
test('include attributes', async (t) => {
  const { bindVars, query } = await arangolize({
    collection: 'test',
    attributes: ['_createdAt']
  })

  t.ok(bindVars, 'should have bindVars')
  t.ok(query, 'should have query')
  t.end()
})

/**/
test('complex query', async (t) => {
  const { bindVars, query } = await arangolize({
    limit: 5,
    skip: 0,
    sort: 'createdAt DESC',
    include: {
      as: 'creator',
      where: {name: 'noah'}
    }
  })

  t.ok(bindVars, 'should have bindVars')
  t.ok(query, 'should have query')
  t.end()
})
