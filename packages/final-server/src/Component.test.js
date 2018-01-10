import test from 'tape'
import { Component, reduxConnect } from './index'
import { store } from '../examples/middleware'
import { database } from './index'
import { bindActionCreators } from 'redux'

@reduxConnect(
  (state) => ({
    count: state.count
  }),
  (dispatch) => bindActionCreators({
    increment: () => ({ type: 'GET_WHATEVER' })
  }, dispatch)
)
@database({
  collection: 'FinalUser'
})
class UserComponent extends Component {
  path = '/user/:user?'

  async respond () {
    await this.save({ "body": "Updated!" })
    await this.actions.increment()
    return {
      params: this.props.params,
      state: this.store.getState()
    }
  }
}

test('create User', (t) => {
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
