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

    return
  }

  async setState (state) {
    await this.constructor.setState(this, state)

    return
  }

  static async setProps (instance, state) {
    instance.props = state

    return
  }

  async setProps (state) {
    await this.constructor.setProps(this, state)

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
    return { date: Date.now() }
  }

  async componentDidCatch (error, info) {
    // console.error(`Check the ${info.stepName} function.`)

    if (this.end) {
      this.end()
    }

    if (this.props.response instanceof WebSocket) {
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
