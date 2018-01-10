# Final

Master repo for Final-related packages.

* [final-server](packages/final-server) - Package for creating and running apps with the Final framekwork
* [final-arango](packages/final-server) - Decorator for adding database functionality to Final
* [arangolize](packages/arangolize) - The query-builder used in final-arango

## Quick intro

[Examples here](packages/final-server/examples)

[Tests here](packages/final-arango/index.test.js)

Simple example:

```js
import Final, { createServer } from 'final-server'
import database from 'final-arango'
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
