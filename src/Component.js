import { parse } from 'url'

const route = require('path-match')({
  sensitive: false,
  strict: false,
  end: false
})

/*
  At this point, I'm not sure calling the lifecylce methods from the Final class is a good idea. I'm having trouble adding functions to the extended classes and being able to access them in the class declaration.
*/
export default class Final {
  lifecycleIncrement = -1;
  path = '/'
  response = {};
  state = {};
  props = {};
  lifecycle = [
    this.requestWillBeReceived.bind(this),
    this.requestReceived.bind(this),
    this.responseWillOccur.bind(this),
    this.respond.bind(this),
    this.responseDidEnd.bind(this)
  ];

  static async setState (instance, state) {
    instance.state = state

    return
  }

  async setState (state) {
    return this.constructor.setState(this, state)
  }

  async requestWillBeReceived (req) {
    this.request = req
    const match = route(this.path)
    const params = match(parse(this.request.url).pathname)
    if (params === false) {
      throw 'No match'
    }
    this.props = { params }
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
    res.writeHead(200, {
      'Content-Length': Buffer.byteLength(JSON.stringify(this.state)),
      'Content-Type': 'application/json'
    })
    res.end(JSON.stringify(this.state))
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
