import Final, { database, createServer } from '../src/index'
import { UserSchema } from './data-model'

@database({
  collection: 'FinalUser'
})
class User extends Final.Component {
  path = '/user/:user?'
  schema = UserSchema

  async get () {
    const user = await this.findOne({ name: this.props.params.user })

    return user
  }

  async post () {
    const user = await this.save(this.props.body)

    return user
  }
}

createServer({
  components: [User],
  port: process.env.PORT || 3001
})
