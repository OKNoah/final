import { autobind } from 'core-decorators'

class Query {
  constructor (args) {
    this.props = args
    this._bindVars = {
      '@modelName': args.collection,
      limit: args.limit || 25,
      skip: args.skip || 0
    }
    this._query = `let data = (
      for instance in @@modelName
      filter instance._removed != true
    `
  }

  getWhere (where) {
    let count = 0
    const wheres = []
    for (const key in where) {
      const prop = `wherekey${count}`
      const value = `wherevalue${count}`
      this._bindVars[prop] = key
      this._bindVars[value] = where[key]
      wheres[count] = ' filter instance.@' + prop + ' == @' + value + ' '
      count++
    }

    return wheres.join('\n')
  }

  /*
    Setter for query.
  */
  @autobind
  query (string) {
    try {
      this._query += string
    } catch (e) {
      console.error(e)
    }
  }

  /*
    Setter for bindVars.
  */
  @autobind
  bindVars (obj) {
    this._bindVars = {
      ...this._bindVars,
      ...obj
    }
  }

  /*
    The `include` syntax is used like in Sequelize. It replaces an ArangoDB ID string with the actual document. It's like a `JOIN`. This accepts an object or array of objects.
  */
  handleInclude () {
    const { include } = this.props
    const { query, bindVars } = this

    if (Array.isArray(include)) {
      query('return MERGE(instance, {\n')

      include.map((inc, index) => {
        const includeAs = `includeAs${index}`
        bindVars({ [includeAs]: inc.as })
        query(` @${includeAs}: DOCUMENT(instance[@${includeAs}])`)
        if (include.length - 1 !== index) {
          query(`,\n`)
        }
      })

      query(`\n })), \n`)
    } else {
      query(`let doc = MERGE(instance, { @includeAs: DOCUMENT(instance[@includeAs]) })`)

      if (include.where) {
        Object.keys(include.where).map((key, index) => {
          const variable = `${key}${index}`
          const value = `${variable}value`
          bindVars({[variable]: key})
          bindVars({[value]: include.where[key]})
          query(`\n filter doc.@includeAs.@${variable} == @${value}`)
        })
      }

      query(`\n return doc)\n`)
    }
  }

  async build () {
    let { where, attributes, sort, include} = this.props
    const { query, bindVars } = this

    if (include && !Array.isArray(include)) {
      bindVars({ includeAs: include.as })
    }

    if (attributes) {
      bindVars({ attributes: attributes })
    }

    if (where) {
      query(this.getWhere(where))
    }

    if (sort) {
      const sortArray = sort.split(' ')
      const direction = sortArray[1].toLowerCase()
      if (['asc', 'desc'].includes(direction)) {
        query`\n sort instance.@sortparam @sortDirection`
        bindVars({ sortparam: sortArray[0] })
        bindVars({ sortDirection: direction })
      } else {
        throw new Error('Your sort parameter should look like this `sort: "createdAt desc"` or `sort: "name asc"`. Looks like you are using something other than "ASC" or "DESC". File a bug if report you want!')
      }
    }

    if (attributes && include) {
      query`let atts = KEEP(instance, @attributes)`
      this.handleInclude()
    } else if (include) {
      this.handleInclude()
    }

    query` return {
      data: (
        for instance in data
          limit @skip, @limit
            return instance
        ),
      meta: { count: LENGTH(data) }
    }
    `

    return { query: this._query, bindVars: this._bindVars }
  }
}

export default async function buildQuery (args) {
  const query = new Query(args)
  const output = await query.build()

  return output
}
