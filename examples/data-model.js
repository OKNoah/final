import { Component, createServer } from '../src/index'
import { findDecorator } from '../test/ArangoDecorator'
import t from 'flow-runtime'

function length (min, max) {
  return function (input) {
    if (input.length > max) {
      return `must be less than ${max} characters`
    }

    if (input.length < min) {
      return `must be more than ${min} characters`
    }
  }
}

/*
  For now I'm using `flow-runtime`'s type test tool. When `flow-runtime` supports Babel 7 we will simply use it as intended. See https://github.com/OKNoah/final/issues/5
*/
const UserSchema = t.type(
  'User', t.object(
    /*
      The third arg in `t.property` makes the whole key/value optional.
    */
    t.property('name', t.refinement(t.string(), length(3, 16)), true),
    t.property('body', t.string())
  )
)

@findDecorator({
  collection: 'FinalUser'
})
class User extends Component {
  schema = UserSchema
  path = '/user/:user?'

  async respond () {
    await this.findOne({ "body": "Updated!" })
    const saved = await this.save({ name: 'bill', body: "Updated!" })
    return {
      data: saved,
      params: this.props.params
    }
  }
}

const PORT = 3001

createServer({
  components: [User],
  port: PORT
})
