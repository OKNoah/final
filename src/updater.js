import { parse } from 'url'
import { logger } from './index'

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

    logger('init step:', name || i)

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
        logger('No match pathname', pathname)
        throw 'No match'
      }
    }

    if (name === 'shouldComponentUpdate') {
      instance.props = {
        ...instance.props,
        request: req,
        response: res
      }
      logger('instance.props', Object.getOwnPropertyNames(instance.props))
    }
  }
}

async function updater (instance, data) {
  const step = instance.lifecycleIncrement++
  const func = instance.lifecycle[step]
  const name = func && func.name && func.name.split(' ')[1]

  logger('updater step:', name || step)

  if (name === 'componentWillReceiveProps') {
    await func(data)
  }

  if (name === 'shouldComponentUpdate') {
    const shouldUpdate = await func(data)
    if (!shouldUpdate) {
      throw "Should not update"
    }
    instance.props = {
      ...instance.props,
      ...data
    }

    if (shouldUpdate) {
      const response = await instance.respond()
      await instance.setState(response)
      logger('responseDidEnd instance.props', Object.getOwnPropertyNames(instance.props))
      await instance.responseDidEnd()
    }
  }

  if (name === 'respond') {
    const response = await func()
    await instance.setState(response)
  }

  if (name === 'responseDidEnd') {
    logger('responseDidEnd instance.props', Object.getOwnPropertyNames(instance.props))
    await func()
  }
}

updater.init = init

export default updater
