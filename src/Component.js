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
  lifecycle = [
    this.componentWillReceiveProps.bind(this),
    this.shouldComponentUpdate.bind(this),
    this.componentWillRespond.bind(this),
    this.respond.bind(this),
    this.responseDidEnd.bind(this)
  ];

  constructor () {
    this.props = {}
  }

  static async setState (instance, state) {
    instance.state = state

    return
  }

  async setState (state) {
    await this.constructor.setState(this, state)

    return
  }

  async shouldComponentUpdate (newProps) {
    if (newProps !== this.props) {
      return true
    }

    return false
  }

  async componentWillReceiveProps () {
    return
  }

  async messageReceived () {
    return
  }

  async componentWillRespond () {
    return
  }

  async responseDidEnd () {
    const data = JSON.stringify(this.state)
    const length = Buffer.byteLength(data)

    try {
      this.props.response.writeHead(200, {
        'Content-Length': length,
        'Content-Type': 'application/json'
      })
      this.props.response.end(data)
      if (this.end) {
        this.end()
      }
    } catch (e) {
      this.props.response.send(data)
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
    return this.lifecycleIncrement + 1
  }
}
