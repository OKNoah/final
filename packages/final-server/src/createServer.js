import { resolve } from 'path'
import { Server } from 'http'
import { readdirSync } from 'fs'
import { isArray } from 'lodash'
import { Server as Socket } from 'ws'
import { updater, logger } from './index'

export default async function createServer ({
  directory,
  port,
  components,
  middleware,
  store
} = { directory: './src/components', port: 3001, middleware: [] }) {
  class MyServer extends Server {
    constructor (props) {
      super(props);
      this.port = port
      this.listen(this.port)
    }
  }

  const myServer = new MyServer()

  const server = new Socket({ server: myServer })

  async function lifecycleHandler (req, res) {
    const items = await getComponents()
    const matches = []

    for (let i = 0; i < items.length; i++) {
      const item = items[i]

      try {
        logger('running init')
        await updater.init(item, req, res)
      } catch (error) {
        if (error === 'No match') {
          continue
        }
        console.error(error)
      }

      try {
        await updater(item)
      } catch (error) {
        if (error !== 'No match') {
          await item.componentDidCatch(error)
          break
        }
      }

      matches.push(items[i])
    }

    return matches
  }

  const comps = components || readdirSync(directory)

  async function getComponents () {
    const items = await Promise.all(comps.map(async (comp)=> {
      let Comp = comp

      if (!components) {
        Comp = require(resolve(directory, comp)).default
      }

      if (middleware) {
        if (isArray(middleware)) {
          await Promise.all(middleware.map(async (midd) => {
            const apply = await midd(store || undefined)
            Comp = await apply(Comp)
          }))
        } else {
          const apply = await middleware(store || undefined)
          Comp = await apply(Comp)
        }
      }

      if (store) {
        Comp.prototype.store = store
      }

      return new Comp(store)
    }))

    return items
  }

  async function socketHandler (socket, req) {
    let items = await lifecycleHandler(req, socket)

    /*
      Removes the redux event listener, if it is attached.
    */
    socket.on('close', () => {
      items.forEach((item) => item.end && item.end())
    })

    socket.on('error', (...data) => {
      logger('One connection closed.', data)
    })

    /*
      This should probably update `shouldComponentUpdate` some other lifectyle method rather than it's own special method. Or `updater`.
    */
    socket.on('message', async (message) => {
      await items.map(async (item) => {
        try {
          await item.messageReceived(message)
        } catch (e) {
          typeof e === 'string' ? socket.send(e) : console.error(e)
        }
      })
    })
  }

  server.on('connection', socketHandler)

  server.on('error', logger)
  myServer.on('error', console.error)

  myServer.on('request', async (req, res) => {
    try {
      await lifecycleHandler(req, res)
    } catch (e) {
      console.error(e)
    }
  })

  function getProcessMemoryUsage () {
    const string = (process.memoryUsage().heapUsed / 1028 / 1028).toString()
    return string.slice(0, 4)
  }

  console.log(`
    Final server started.
    Process ${process.pid}
    Memory usage ${getProcessMemoryUsage()} MB
  `)

  setInterval(() => console.log(`Memory usage ${getProcessMemoryUsage()} MB`), 15000)

  return myServer
}
