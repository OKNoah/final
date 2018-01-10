import Final from '../../src/Component'
import database from 'final-arango'

/*
  The `findDecorator` adds a few funtions to the class, like `this.findOne`.
*/
@database({
  collection: 'Post'
})
export default class Post extends Final {
  /*
    The path decides whats paths with match this component and the params.
  */
  path = '/post/:post?'

  /*
    The respond function returns whatever the response will be. Notice the params and `this.findOne` are available.
  */
  async respond () {
    const data = await this.findOne({"body": "Updated!"})
    return {
      data,
      params: this.props.params
    }
  }
}
