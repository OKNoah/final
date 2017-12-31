import Final from '../src/index'
import { findDecorator } from '../test/ArangoDecorator'

@findDecorator({
  collection: 'FinalUser'
})
class User extends Final.Component {
  path = '/user/:user?'

  async respond () {
    await this.findOne({ "body": "Updated!" })
    return {
      data: 'hi',
      params: this.props.params
    }
  }
}

const PORT = 3001

Final.createServer({
  components: [User],
  port: PORT
})
