import tape from 'tape'
import { Suite } from 'benchmark'
import Final from './index'
import { findDecorator } from '../test/ArangoDecorator'

const suite = new Suite()

const test = (msg, cb) => {
  suite.add(msg, cb)
  tape(msg, (t) => cb(t))
}

setTimeout(() => {
  console.log('benchmarks')
  suite.on('cycle', (event) => {
    const [title, stats] = event.target.toString().split(' x ')
    console.log(`(<) ${title}`)
    console.log(` (>) ${stats}`)
  })
  suite.run({ async: false })
}, 5000)

test.onFinish = tape.onFinish

test('package should export Component and createServer', async t => {
  t.ok(Final.Component, 'Component should exist')
  t.ok(Final.createServer, 'createServer should exist')
  t.end()
})

test('creates a component', async (t) => {
  @findDecorator({ collection: 'FinalUser' })
  class MyClass extends Final.Component {}

  t.ok(new MyClass() instanceof Final.Component)
  t.end()
})

test('does respond function', async (t) => {
  @findDecorator({ collection: 'FinalUser' })
  class MyClass extends Final.Component {
    async respond () {
      const data = await this.findOne({ body: 'Updated!' })
      return data
    }
  }

  const User = new MyClass()
  const response = await User.respond()

  t.ok(response)
  t.end()
})
