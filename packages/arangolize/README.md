# Arangolize

This tool builds find queries in a Sequelize-like way.

## Usage

```js
import arangolize from 'arangolize'
import { Database } from 'arangojs'

/*
  You'll need to get the database and collection yourself.
  This tool just builds the query and bindVars object.

  const db = new Database()... etc
*/

async function getDocument () {
  const { query, bindVars } = await arangolize({
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
  const data = await collection.query({ query, bindVars })

  return data
}
```