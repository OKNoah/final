/*
  See `examples/data-model.js` for better explanations of the code is this file.
*/
import test from 'tape'
import t from 'flow-runtime'
import { randomBytes } from 'crypto'
import { Component, types } from 'final-server'
import database from './index'

const { StringLengthType, CollectionType, EmailType } = types

const UserSchema = t.type(
  'User', t.object(
    t.property('name', StringLengthType(3, 18)),
    t.property('email', EmailType),
    t.property('body', t.string(), true)
  )
)

@database({
  collection: 'FinalUser'
})
class UserComponent extends Component {
  path = '/user/:user?'
  schema = UserSchema
  uniques = ['email']

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
      t.property('user', CollectionType)
    )
  )
}

@database({
  edge: 'FinalLike'
})
class LikeComponent extends Component {}

const Post = new PostComponent()
const User = new UserComponent()
const Like = new LikeComponent()

const uid = randomBytes(4).toString('hex')
const name = `test-user-${uid}`
const email = `test-user-${uid}@rainycode.com`

test('schema validation', async (tt) => {
  try {
    await User.save({
      name: 'jo',
      email: '123',
      body: 45
    })
  } catch (e) {
    const errors = e.message.split(',')
    tt.equal(errors[0], 'User.name must be between 3 & 18 characters')
    tt.equal(errors[1], 'User.email should be an email address')
    tt.equal(errors[2], 'User.body must be a string')
    tt.end()
  }
})

test('schema validation - no errors', async (tt) => {
  const user = await User.save({
    name: name,
    email: email
  })

  tt.equal(user.name, name, 'should have correct name')
  tt.equal(user.email, email, 'should have correct email')
  tt.ok(user._createdAt, 'should have _createdAt field')
  tt.ok(user._id, 'should have _id field')
  tt.ok(user._key, 'should have _key field')
  tt.ok(user._removed === false, 'should have _removed field')
  tt.end()
})

test('find function', async (tt) => {
  const users = await User.find({
    where: { name: name, email: email }
  })

  tt.ok(users.length >= 1, 'should return array with at least one item')

  tt.end()
})

test('findOne function', async (tt) => {
  const user = await User.findOne({
    where: { name: name, email: email }
  })

  tt.equal(user.name, name, 'should have correct name')
  tt.equal(user.email, email, 'should have correct email')
  tt.ok(user._createdAt, 'should have _createdAt field')
  tt.ok(user._id, 'should have _id field')
  tt.ok(user._key, 'should have _key field')
  tt.ok(user._removed === false, 'should have _removed field')

  tt.end()
})

test('findAndCount function', async (tt) => {
  const { data, meta } = await User.findAndCount({
    where: { name: name, email: email }
  })

  tt.ok(Array.isArray(data), 'should return data data')
  tt.ok(Number.isInteger(meta.count), 'should return meta.count number')

  tt.end()
})

test('including docs when saving', async (tt) => {
  const user = await User.findOne({
    where: { email, name }
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

test('creating edge documents', async (tt) => {
  const user = await User.findOne({ where: { name: name } })
  const post = await Post.findOne({ where: { body: 'I ❤️ Arango' } })

  const like = await Like.save(user, post)

  tt.ok(like, 'edge should be created')
  tt.ok(like._id, 'edge have _id proptery')
  tt.end()
})

test('enforce uniques', async (tt) => {
  try {
    await User.save({
      name,
      email
    })
  } catch (error) {
    tt.ok(error, 'should throw error on not unique')
    tt.end()
  }
})

test('delete documents', async (tt) => {
  const user = await User.findOne({ where: { email } })
  await User.remove(user)
  const user2 = await User.findOne({ where: { email } })

  tt.ok(!user2, 'should not return user after deletion')
  tt.end()
})

