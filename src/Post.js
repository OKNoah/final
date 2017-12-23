import Final from './Component'
import { findDecorator } from './ArangoDecorator'

/*
  The `findDecorator` adds a few funtions to the class, like `this.findOne`.
*/
@findDecorator({
  collection: 'Post'
})
export default class Post extends Final {
  /*
    The path decides whats paths with match this component and the params.
  */
  path = '/post/:post?'
  constructor () {
    super()
  }

  /*
    The respond function returns whatever the response will be. Notice the params and `this.findOne` are available.
  */
  async respond () {
    console.log('this.props.params', this.props.params)
    const output = await this.findOne({"body": "Updated!"})
    return output
  }
}
