import { ServerResponse } from 'http'
import WebSocket from 'ws'

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

    return instance.state
  }

  async setState (state) {
    await this.constructor.setState(this, state)

    return
  }

  static async setProps (instance, props) {
    instance.props = props

    return instance.props
  }

  async setProps (props) {
    await this.constructor.setProps(this, props)

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

    if (this.props.response instanceof WebSocket) {
      this.props.response.send(data)
      return
    }

    this.props.response.writeHead(200, {
      'Content-Length': length,
      'Content-Type': 'application/json'
    })

    this.props.response.end(data)

    if (this.end) {
      this.end()
    }
      
    return
  }

  async respond () {
    let response = {}

    if (this.props.response instanceof ServerResponse) {
      switch (this.props.method.toUpperCase()) {
        case 'GET':
          response = await this.get()
          break
        case 'POST':
          response = await this.post()
          break
        case 'PATCH':
          response = await this.patch()
          break
        case 'DELETE':
          response = await this.delete()
          break
        default:
          response = this.props.method.toUpperCase()
      }
    } else {
      response = await this.socket()
    }

    return response
  }

  async get () {
    return {}
  }

  async post () {
    return {}
  }

  async patch () {
    return {}
  }

  async delete () {
    return {}
  }

  async socket () {
    return {}
  }

  async componentDidCatch (error) {
    if (this.props.response instanceof WebSocket) {
      this.props.response.send(error.message)

      if (this.end) {
        this.end()
      }

      return
    }

    this.props.response.writeHead(500, {
      'Content-Type': 'application/json'
    })
    this.props.response.end(error.message)

    return
  }

  async tick () {
    return this.lifecycleIncrement + 1
  }
}
