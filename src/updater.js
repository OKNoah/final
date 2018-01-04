import { parse } from 'url'
import { logger } from './index'
import WebSocket from 'ws'
import bodyParse from 'co-body'

const route = require('path-match')({
  sensitive: false,
  strict: false,
  end: false
})

async function init (instance, req, res) {
  for (let i = 1; i <= 2; i++) {
    const func = instance.lifecycle[i - 1]
    const name = func && func.name && func.name.split(' ')[1]

    // logger('init step:', name || i)

    if (name === 'componentWillReceiveProps') {
      await func(req)
      const pathname = parse(req.url).pathname
      const match = route(instance.path)
      const params = match(pathname)
      instance.setProps({
        ...instance.props,
        params,
        method: req.method.toUpperCase()
      })
      if (!instance.props.params) {
        // logger('No match pathname', pathname)
        throw 'No match'
      } else if (['POST', 'PATCH'].includes(instance.props.method)) {
        const body = await bodyParse.json(req)

        instance.setProps({
          ...instance.props,
          body
        })
      }
    }

    /*
      TODO: Perhaps the `response` object should be removed and replaced with simply an action to do sending. We abstract the HTTP API (`res.wreiteHead()` and `res.end()`) and make it match the websockets API (`res.send()`)
    */
    if (name === 'shouldComponentUpdate') {
      instance.setProps({
        ...instance.props,
        response: res
      })
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

  try {
    await instance.componentWillRespond(nextProps)
    instance.setProps(nextProps)
    const response = await instance.respond()
    await instance.setState(response)
    logger('responseDidEnd instance.props', Object.getOwnPropertyNames(instance.props))
    await instance.responseDidEnd()
  } catch (e) {
    if (e.message === 'not opened') {
      logger('Socket not open.')
    }
    await instance.componentDidCatch(e || "An unknown server error occured.")
    return
  }
}

updater.init = init

export default updater
