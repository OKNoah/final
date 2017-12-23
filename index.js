import superagent from 'superagent'
import { resolve } from 'path'
import Final from './src'

Final.createServer({
  directory: resolve(__dirname, './test/components'),
  post: 3001
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
