# Arangolize

This tool builds find queries in a Sequelize-like way.

## Usage

```js
import arangolize from 'arangolize'

const { query, bindVars } = arangolize({
  collection: 'Posts', // collection name
  limit: 10, // limits to 10 results
  skip: 10, // skip the first 10 results
  sort: '_createdAt DESC', // sort by `_createdAt` attribute, descending
  where: { body: 'I ❤️ Arango' }, // find based on keys and values. All must match
  include: [{
    as: 'user' // take the value of field `user` and populate it with the corresponding document
    // `user` field bust be valid ArangoID
  }]
})

// now use the qeury and bindVars as you normally would
collection.query({ query, bindVars })
```