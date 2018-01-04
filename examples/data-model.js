import { Component, database } from '../src/index'
import t from 'flow-runtime'
import { isEmail } from 'validator'

/*
  Returns error message if input is not between `min` and `max`.
*/
const length = (min, max) => (input) => (input.length > max || input.length < min) && (`must be between ${min + ' & ' + max} characters`)
const email = (input) => (!isEmail(input)) && (`should be an email address`)

/*
  For now I'm using `flow-runtime`'s type test tool. When `flow-runtime` supports Babel 7 we will simply use it as intended. See https://github.com/OKNoah/final/issues/5
*/
export const UserSchema = t.type(
  'User', t.object(
    /*
      The third arg in `t.property` makes the whole key/value optional.
    */
    t.property('name', t.refinement(t.string(), length(3, 16))),
    t.property('email', t.refinement(t.string(), email)),
    t.property('body', t.string(), true)
  )
)

@database({
  url: 'http://root:@127.0.0.1:8529',
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

// start the server and stuff
