import { createStore, bindActionCreators, combineReducers } from 'redux'
import { createServer, Component, reduxConnect } from '../src/index'
import { makeBug } from '../test/game-server_fake-player.js'
import difference from './object-diff'

const PORT = 3001

const reducer = (state = {}, action) => {
  const radius = 50

  if (!action.player) {
    return state
  }

  const rand = () => Math.floor(Math.random() * 1000) % radius

  const position = !state[action.player] ?
    [rand(), rand()]
  :
    state[action.player].slice()

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
          position[1] < 0 ? radius : position[1] - 1
        ]
      }

    case 'map/MOVE_LEFT':
      return {
        ...state,
        [action.player]: [
          position[0] < 0 ? radius : position[0] - 1,
          position[1]
        ]
      }

    case 'map/MOVE_RIGHT':
      return {
        ...state,
        [action.player]: [
          (position[0] + 1) % radius,
          position[1]
        ]
      }

    case 'map/INIT':
      return {
        [action.player]: [rand(), rand()],
        ...state
      }

    default:
      return state
  }
}

const reducers = combineReducers({
  players: reducer
})

const globalStore = createStore(reducers)

const moveUp = (player) => ({ type: 'map/MOVE_UP', player })
const moveDown = (player) => ({ type: 'map/MOVE_DOWN', player })
const moveLeft = (player) => ({ type: 'map/MOVE_LEFT', player })
const moveRight = (player) => ({ type: 'map/MOVE_RIGHT', player })
const init = (player) => ({ type: 'map/INIT', player })

/*
  This is a "Bug", a fake user/player that moves around randomly. Not to be confused with a software glitch/bug. TODO: Probably change name of this to avoid confusion. See `game-server_fake-player.js`.
*/
const bug = makeBug(globalStore)

@reduxConnect(
  (state) => ({
    players: state.players
  }),
  (dispatch) => bindActionCreators({
    moveUp,
    moveDown,
    moveLeft,
    moveRight,
    init,
    bug
  }, dispatch)
)
class User extends Component {
  path = '/map/:map/player/:player?'
  constructor () {
    super()
  }

  async componentWillRespond (nextProps) {
    if (nextProps) {
      const diff = difference(this.props.players, nextProps.players)
      let diffs = {}

      if (diff) {
        for (const key in diff) {
          diffs = {
            ...diffs,
            [key]: [ 
              diff[key][0] || this.props.players[key][0],
              diff[key][1] || this.props.players[key][1]
            ]
          }
        }

        this.setState({ diff: diffs })
      }
    }
    return
  }

  async messageReceived (msg) {
    if (['moveUp', 'moveDown', 'moveLeft', 'moveRight', 'bug'].includes(msg)) {
      this.actions[msg](this.props.params.player)
    } else {
      throw "That's not a function"
    }

    return
  }

  async get () {
    return {
      data: this.props.players
    }
  }

  async socket () {
    return this.state.diff || this.props.players
  }
}

// class E404 extends Component {
//   path = '**/*'
//   respond () {
//     return 404
//   }
// }

createServer({
  components: [User],
  port: PORT,
  store: globalStore
})
