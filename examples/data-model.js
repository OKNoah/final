import { Component, database, types } from '../src/index'
import t from 'flow-runtime'

// there is also an important CollectionType for joining documents
const { StringLengthType, EmailType } = types

/*
  For now I'm using `flow-runtime`'s type test tool. When `flow-runtime` supports Babel 7 we will simply use it as intended. See https://github.com/OKNoah/final/issues/5
*/
export const UserSchema = t.type(
  'User', t.object(
    t.property('name', StringLengthType(3, 16)),
    t.property('email', EmailType),
    /* The third arg in `t.property` makes the whole key/value optional. */
    t.property('body', t.string(), true)
  )
)

@database({
  url: 'http://root:@127.0.0.1:8529',
  collection: 'FinalUser'
})
class User extends Component {
  schema = UserSchema
  uniques = ['email']
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
