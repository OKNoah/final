/*
  See `examples/data-model.js` for better explanations of the code is this file.
*/
import test from 'tape'
import t from 'flow-runtime'
import { isEmail } from 'validator'

import { Component, database } from './index'

const length = (min, max) => (input) => (input.length > max || input.length < min) && (`must be between ${min + ' & ' + max} characters`)
const email = (input) => (!isEmail(input)) && (`should be an email address`)
const arangoId = (input) => (!/^[a-z|A-Z]+\/\d+/g.test(input)) && (`should be an ArangoDB id string`)

const UserSchema = t.type(
  'User', t.object(
    t.property('name', t.refinement(t.string(), length(3, 16))),
    t.property('email', t.refinement(t.string(), email)),
    t.property('body', t.string(), true)
  )
)

@database({
  collection: 'FinalUser'
})
class UserComponent extends Component {
  path = '/user/:user?'
  schema = UserSchema

  async respond () {
    await this.save({ "body": "Updated!" })
    const data = await this.findOne({ "body": "Updated!" })
    await this.actions.increment()
    return {
      data,
      params: this.props.params,
      state: this.store.getState()
    }
  }
}

@database({
  collection: 'FinalPost'
})
class PostComponent extends Component {
  schema = t.type(
    'User', t.object(
      t.property('body', t.string()),
      t.property('user', t.type('ArangoId', t.refinement(t.string(), arangoId)))
    )
  )
}

test('schema validation', async (tt) => {
  const User = new UserComponent()

  try {
    await User.save({
      name: 'jo',
      email: '123',
      body: 45
    })
  } catch (e) {
    const errors = e.message.split(',')
    tt.equal(errors[0], 'User.name must be between 3 & 16 characters')
    tt.equal(errors[1], 'User.email should be an email address')
    tt.equal(errors[2], 'User.body must be a string')
    tt.end()
  }
})

test('schema validation - no errors', async (tt) => {
  const User = new UserComponent()
  const user = await User.save({
    name: 'joe-joe',
    email: '123@me.com'
  })

  tt.equal(user.name, 'joe-joe', 'should have correct name')
  tt.equal(user.email, '123@me.com', 'should have correct email')
  tt.ok(user._createdAt, 'should have _createdAt field')
  tt.ok(user._id, 'should have _id field')
  tt.ok(user._key, 'should have _key field')
  tt.ok(user._removed === false, 'should have _removed field')
  tt.end()
})

test('find function', async (tt) => {
  const User = new UserComponent()
  const users = await User.find({
    where: { name: 'joe-joe', email: '123@me.com' }
  })

  tt.ok(users.length >= 1, 'should return array with at least one item')

  tt.end()
})

test('findOne function', async (tt) => {
  const User = new UserComponent()
  const user = await User.findOne({
    where: { name: 'joe-joe', email: '123@me.com' }
  })

  tt.equal(user.name, 'joe-joe', 'should have correct name')
  tt.equal(user.email, '123@me.com', 'should have correct email')
  tt.ok(user._createdAt, 'should have _createdAt field')
  tt.ok(user._id, 'should have _id field')
  tt.ok(user._key, 'should have _key field')
  tt.ok(user._removed === false, 'should have _removed field')

  tt.end()
})

test('findAndCount function', async (tt) => {
  const User = new UserComponent()
  const { data, meta } = await User.findAndCount({
    where: { name: 'joe-joe', email: '123@me.com' }
  })

  tt.ok(Array.isArray(data), 'should return data data')
  tt.ok(Number.isInteger(meta.count), 'should return meta.count number')

  tt.end()
})

test('including docs when saving', async (tt) => {
  const Post = new PostComponent()
  const User = new UserComponent()
  const user = await User.findOne({
    where: { name: 'joe-joe', email: '123@me.com' }
  })

  const newPost = await Post.save({
    body: 'I ❤️ Arango',
    user
  })

  tt.ok(newPost._id, 'new post should be created')
  tt.equal(newPost.user, user._id, 'post should be user _id')
  tt.end()
})

test('including docs when finding', async (tt) => {
  const Post = new PostComponent()
  const post = await Post.findOne({
    where: { body: 'I ❤️ Arango' },
    include: [{
      as: 'user'
    }]
  })

  tt.ok(post._id, 'new post should be created')
  tt.ok(post.user, 'post should have user key')
  tt.ok(post.user._id, 'post user should have _id')
  tt.end()
})
