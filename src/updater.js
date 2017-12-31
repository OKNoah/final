import { parse } from 'url'
import { logger } from './index'
import WebSocket from 'ws'

const route = require('path-match')({
  sensitive: false,
  strict: false,
  end: false
})

async function init (instance, req, res) {
  for (let i = 1; i <= 2; i++) {
    // const step = await instance.tick()
    const func = instance.lifecycle[i - 1]
    const name = func && func.name && func.name.split(' ')[1]

    // logger('init step:', name || i)

    if (name === 'componentWillReceiveProps') {
      await func(req)
      const pathname = parse(req.url).pathname
      const match = route(instance.path)
      const params = match(pathname)
      instance.props = instance.props || {}
      instance.props = {
        ...instance.props,
        params
      }
      if (!instance.props.params) {
        // logger('No match pathname', pathname)
        throw 'No match'
      }
    }

    if (name === 'shouldComponentUpdate') {
      instance.props = {
        ...instance.props,
        request: req,
        response: res
      }
      if (instance.props.response instanceof WebSocket) {
        logger('✅ is WebSocket')
      }
      logger('instance.props', Object.getOwnPropertyNames(instance.props))
    }
  }
}

/*
  The purpose of this is to run the lifecycle with `newProps`, aka data.
*/
async function updater (instance, data) {
  const nextProps = {
    ...instance.props,
    ...data
  }

  const shouldUpdate = await instance.shouldComponentUpdate(nextProps)

  if (!shouldUpdate) {
    throw "Should not update"
  }

  instance.props = nextProps

  const response = await instance.respond()
  await instance.setState(response)
  logger('responseDidEnd instance.props', Object.getOwnPropertyNames(instance.props))
  try {
    await instance.responseDidEnd()
  } catch (e) {
    if (e.message === 'not opened') {
      logger('Socket not open.')
    }
    return
  }
}

updater.init = init

export default updater
