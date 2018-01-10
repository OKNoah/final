import { Component, createServer } from '../src/index'
import database from 'final-arango'
import { UserSchema } from './data-model'

@database({
  collection: 'FinalUser'
})
class User extends Component {
  path = '/user/:user?'
  schema = UserSchema
  uniques = ['email']

  async get () {
    const user = await this.findOne({
      where: { name: this.props.params.user }
    })

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
