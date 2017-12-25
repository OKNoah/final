import { resolve } from 'path'
import { Server } from 'http'
import { readdirSync } from 'fs'
import { isArray } from 'lodash'

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
    
  function functionName (fun) {
    var ret = fun.toString();
    ret = ret.substr('function '.length);
    ret = ret.substr(0, ret.indexOf('('));
    return ret;
  }

  myServer.on('request', async (req, res) => {
    /*
      Determine whether to load the array of classes passed as the `components` option, or use paths from the `directory` option.
    */
    const comps = components || readdirSync(directory)

    const items = await Promise.all(comps.map(async (comp)=> {
      let Comp = comp

      if (!components) {
        Comp = require(resolve(directory, comp)).default
      }

      if (middleware) {
        if (isArray(middleware)) {
          await Promise.all(middleware.map(async (midd) => {
            const apply = await midd()
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

      return new Comp()
    }))

    await items.map(async (item) => {
      try {
        while (item.lifecycleIncrement < item.lifecycle.length - 1) {
          item.lifecycleIncrement++

          const stepName = functionName(item.lifecycle[item.lifecycleIncrement])

          try {
            switch (item.lifecycleIncrement) {
              case 4:
                await item.lifecycle[item.lifecycleIncrement](res)
                break

              case 3:
                const response = await item.lifecycle[item.lifecycleIncrement]()
                item.setState(response)
                break

              case 0:
                await item.lifecycle[item.lifecycleIncrement](req)
                break

              default:
                item.lifecycle[item.lifecycleIncrement]()
            }
          } catch (error) {
            if (error !== 'No match') {
              await item.componentDidCatch(error, {
                stepName
              })
            }
            break
          }
        }
      } catch (error) {
        console.log('NO SENT THAT REQUEST!!!', error)
      }
    })
  })

  return myServer
}
