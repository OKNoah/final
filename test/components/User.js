import Final from '../../src/Component'
import { findDecorator } from '../ArangoDecorator'

@findDecorator({
  collection: 'Post'
})
export default class User extends Final {
  path = '/user/:user?'
  constructor () {
    super()
  }

  async respond () {
    const output = await this.findOne({"body": "Updated!"})
    return output
  }
}
