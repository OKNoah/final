import Final from './Component'
import { findDecorator } from './ArangoDecorator'

@findDecorator({
  collection: 'Post'
})
export default class User extends Final {
  path = '/user/:user?'
  constructor () {
    super()
  }

  async respond () {
    console.log('this.props.params', this.props.params)
    const output = await this.findOne({"body": "Updated!"})
    return output
  }
}
