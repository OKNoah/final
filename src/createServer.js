import { resolve } from 'path'
import { Server } from 'http'
import { readdirSync } from 'fs'

export default async function createServer ({
  directory,
  port,
  components
} = { directory: './src/components', port: 3001 }) {
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
      if (!components) {
        const Component = require(resolve(directory, comp)).default

        return new Component()
      }

      return new comp()
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
