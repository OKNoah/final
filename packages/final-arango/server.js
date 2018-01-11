import { createServer } from 'final-server'
import t from 'flow-runtime'
import { Component, types } from 'final-server'
import { database } from './config'
import { randomBytes } from 'crypto'

const uid = randomBytes(4).toString('hex')
const name = `test-user-${uid}`
const email = `test-user-${uid}@rainycode.com`

const { StringLengthType, EmailType } = types

const UserSchema = t.type(
  'User', t.object(
    t.property('name', StringLengthType(3, 18)),
    t.property('email', EmailType),
    t.property('body', t.string(), true)
  )
)

@database({
  collection: 'FinalUser3'
})
class UserComponent extends Component {
  path = '/user/:user?'
  schema = UserSchema
  // uniques = ['email']

  async respond () {
    await this.save({
      name,
      email,
      "body": "Updated!"
    })

    const data = await this.findOne({
      where: { name, email }
    })

    return { data }
  }
}

createServer({
  components: [UserComponent],
  port: 3002
})
