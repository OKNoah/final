import { Component, createServer } from '../src/index'
import arango from 'final-arango'
import t from 'flow-runtime'
import { parse } from 'feedparser-promised'

const RssSchema = t.type('Rss',
  t.object(
    t.property('title', t.string()),
    t.property('description', t.string(), true),
    t.property('link', t.string()),
    t.property('lastBuildDate', t.string(), true),
    t.property('pubDate', t.string(), true)
  )
)

@arango({
  database: 'rss',
  collection: 'Feeds'
})
export default class Rss extends Component {
  path = '/rss/:rss?'
  schema = RssSchema
  // uniques = ['link']

  async get () {
    return undefined
  }

  async post () {
    const parsedXml = await parse(this.props.body.url, {
      addmeta: true
    })

    const { title, description, link, lastBuildDate, pubDate } = parsedXml[0].meta

    const savedRss = await this.save({
      title,
      description,
      link,
      lastBuildDate,
      pubDate: typeof pubDate === 'object' ? pubDate.toISOString() : pubDate
    })

    return { data: savedRss }
  }
}

createServer({
  components: [Rss],
  port: 3001
})
