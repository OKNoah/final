import { parse } from 'url'

const route = require('path-match')({
  sensitive: false,
  strict: false,
  end: false
})

export default class Final {
  lifecycleIncrement = -1;
  path = '/'
  response = {};
  state = {};
  props = {};
  lifecycle = [
    this.requestWillBeReceived.bind(this),
    this.responseWillOccur.bind(this),
    this.respond.bind(this),
    this.responseDidEnd.bind(this)
  ];

  static async setState (instance, state) {
    instance.state = state

    return
  }

  async setState (state) {
    await this.constructor.setState(this, state)

    return
  }

  async requestWillBeReceived (req) {
    this.request = req
    const match = route(this.path)
    const params = match(parse(this.request.url).pathname)
    this.props.params = params
    if (!this.props.params) {
      throw 'No match'
    }
    return
  }

  async messageReceived () {
    return
  }

  async requestReceived () {
    return
  }

  async responseWillOccur () {
    return
  }

  async responseWillEnd () {
    return
  }

  async responseDidEnd (res) {
    const data = JSON.stringify(this.state)
    const length = Buffer.byteLength(JSON.stringify(data))

    try {
      res.writeHead(200, {
        'Content-Length': length,
        'Content-Type': 'application/json'
      })
      res.end(data)
    } catch (e) {
      try {
        res.send(data)
      } catch (e) {
        console.error(e)
      }
    }
    return
  }

  async respond () {
    return { date: Date.now() }
  }

  async componentDidCatch (error, info) {
    console.error(`Check the ${info.stepName} function.`)
    console.error(error)
  }

  async tick () {
    this.lifecycleIncrement++
  }
}
