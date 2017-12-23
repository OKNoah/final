import { Server } from 'http'
import superagent from 'superagent'
import Post from './src/Post'
import User from './src/User'

class MyServer extends Server {
  constructor (props) {
    super(props);
    this.port = 3001
    this.listen(this.port)
  }
}

const myServer = new MyServer()

const items = [
  new Post(),
  new User()
]

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

        console.log('item.lifecycleIncrement', item.lifecycleIncrement)

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

setTimeout(() => {
  try {
    superagent
    .get('localhost:3001/post/1')
    .then((response) => console.log('sent', response.body))
  } catch (error) {
    console.error('error', error)
  }  
}, 3000)
