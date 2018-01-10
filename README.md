# Final

Master repo for Final-related packages.

* [final-server](packages/final-server) - Package for creating and running apps with the Final framekwork
* [arangolize](packages/arangolize) - The query-builder used in final-arango

More to come!

## Quick intro

```js
import Final, { database, createServer } from '../src/index'
import { UserSchema } from './data-model'

@database({
  collection: 'FinalUser'
})
class User extends Final.Component {
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
```

See the [final-server](packages/final-server) folder for more.