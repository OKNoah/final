import { resolve } from 'path'
import { Server } from 'http'
import { readdirSync } from 'fs'

class MyServer extends Server {
  constructor (props) {
    super(props);
    this.port = 3001
    this.listen(this.port)
  }
}

const myServer = new MyServer()

export default async function createServer ({
  directory,
  port
} = { directory: './src/components', port: 3001 }) {
  const components = readdirSync(directory)

  const items = await Promise.all(components.map(async (comp)=> {
    const Component = require(resolve(directory, comp)).default

    return new Component()
  }))
    
  function functionName (fun) {
    var ret = fun.toString();
    ret = ret.substr('function '.length);
    ret = ret.substr(0, ret.indexOf('('));
    return ret;
  }

  myServer.on('request', async (req, res) => {
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
}
