import { createStore, bind, bindActionCreators } from 'redux'
import Final from '../src/index'

const PORT = 3001

const reducer = (state = {}, action) => {
  const radius = 20

  const position = !state[action.player] ? [0, 0] : state[action.player].slice()

  switch (action.type) {
    case 'map/MOVE_UP':
      return {
        ...state,
        [action.player]: [
          position[0],
          (position[1] + 1) % radius
        ]
      }

    case 'map/MOVE_DOWN':
      return {
        ...state,
        [action.player]: [
          position[0],
          (position[1] - 1) || 0
        ]
      }

    case 'map/MOVE_LEFT':
      return {
        ...state,
        [action.player]: [
          position[0] - 1,
          position[1]
        ]
      }

    case 'map/MOVE_RIGHT':
      return {
        ...state,
        [action.player]: [
          position[0] + 1,
          position[1]
        ]
      }

    case 'map/INIT':
      return {
        [action.player]: [1, 1],
        ...state
      }

    default:
      return state
  }
}

const globalStore = createStore(reducer)

setInterval(() => {
  const type = ['map/MOVE_UP', 'map/MOVE_DOWN', 'map/MOVE_RIGHT', 'map/MOVE_LEFT'][Math.floor(Math.random()) * 100 % 4]

  globalStore.dispatch({ type, player: 'black' })
}, 1500)

const reduxConnect = (/*options*/) => (Component) => {
  function dressup (store) {
    const { dispatch } = store
    Component.prototype.actions = {
      moveUp: (player) => dispatch({ type: 'map/MOVE_UP', player }),
      moveDown: (player) => dispatch({ type: 'map/MOVE_DOWN', player }),
      moveLeft: (player) => dispatch({ type: 'map/MOVE_LEFT', player }),
      moveRight: (player) => dispatch({ type: 'map/MOVE_RIGHT', player }),
      init: (player) => dispatch({ type: 'map/INIT', player })
    }
    Component.prototype.store = store
    return new Component()
  }

  if (typeof Component === 'function') {
    return dressup
  }
}

@reduxConnect()
class User extends Final.Component {
  path = '/map/:map/player/:player?'
  constructor () {
    super()
  }

  async responseWillOccur () {
    const { player } = this.props.params

    this.actions.init(player)
    this.actions.moveLeft(player)
  }

  async messageReceived (msg) {
    if (['moveUp', 'moveDown', 'moveLeft', 'moveRight'].includes(msg)) {
      this.actions[msg](this.props.params.player)
    } else {
      throw "That's not a function"
    }

    return
  }

  async respond () {
    return {
      data: this.store.getState()
    }
  }
}

Final.createServer({
  components: [User],
  port: PORT,
  store: globalStore
})
