import Final from '../../src/Component'
import arango from 'final-arango'

@arango({
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
