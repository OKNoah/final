import test from 'tape'
import { Component, reduxConnect } from './index'
import { store } from '../examples/middleware'
import database from 'final-arango'
import { bindActionCreators } from 'redux'
import { randomBytes } from 'crypto'

const uid = randomBytes(4).toString('hex')
const name = `test-user-${uid}`
const email = `test-user-${uid}@rainycode.com`

@reduxConnect(
  (state) => ({
    count: state.count
  }),
  (dispatch) => bindActionCreators({
    increment: () => ({ type: 'GET_WHATEVER' })
  }, dispatch)
)
@database({
  database: 'test'
})({
  collection: 'FinalUser'
})
class UserComponent extends Component {
  path = '/user/:user?'

  async respond () {
    await this.save({
      email,
      name,
      "body": "Updated!"
    })
    await this.actions.increment()
    return {
      params: this.props.params,
      state: this.store.getState()
    }
  }
}

const delay = () => new Promise((r) => setTimeout(() => r(true), 2000))

test('create User', async (t) => {
  await delay()
  const User = new UserComponent(store)

  t.ok(typeof User.save === 'function', 'should have save function')
  t.ok(typeof User.respond === 'function', 'should have respond function')
  t.ok(typeof User.actions.increment === 'function', 'should have respond function')

  t.end()
})

test('create User', async (t) => {
  const User = new UserComponent(store)

  t.ok(typeof User.actions.increment === 'function', 'should have respond function')
  t.ok(Number.isInteger(User.props.count), 'count should be number')
  const response = await User.respond()
  t.ok(response.state.count, 'count should be 1')

  t.end()
})
