import { createStore, bind, bindActionCreators } from 'redux'
import { createServer, Component, reduxConnect } from '../src/index'

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

const globalStore = createStore(reducer)

/*
  This is just some code to allow adding fake users for testing (and fun). Perhaps it useful to the example too.
*/
const bugs = []

class Bug {
  constructor (player, interval = 2000) {
    this.player = player
    this.timeout = interval
  }

  move () {
    const type = ['map/MOVE_UP', 'map/MOVE_DOWN', 'map/MOVE_RIGHT', 'map/MOVE_LEFT'][Math.floor(Math.random() * 200) % 4]

    globalStore.dispatch({ type, player: this.player })
  }

  run () {
    setInterval(() => {
      this.move()
    }, 2000)
  }
}

function makeBug () {
  function getRandomColor () {
    const letters = '0123456789ABCDEF'
    let color = ''
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)]
    }
    return color
  }

  const bug = new Bug(getRandomColor())

  bugs.push(bug.run())
}

const moveUp = (player) => ({ type: 'map/MOVE_UP', player })
const moveDown = (player) => ({ type: 'map/MOVE_DOWN', player })
const moveLeft = (player) => ({ type: 'map/MOVE_LEFT', player })
const moveRight = (player) => ({ type: 'map/MOVE_RIGHT', player })
const init = (player) => ({ type: 'map/INIT', player })

@reduxConnect(
  null,
  (dispatch) => bindActionCreators({
    moveUp,
    moveDown,
    moveLeft,
    moveRight,
    init,
    bug: makeBug
  }, dispatch)
)
class User extends Component {
  path = '/map/:map/player/:player?'
  constructor () {
    super()
  }

  async responseWillOccur () {
    const { player } = this.props.params

    this.actions.init(player)
  }

  async messageReceived (msg) {
    if (['moveUp', 'moveDown', 'moveLeft', 'moveRight', 'bug'].includes(msg)) {
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

createServer({
  components: [User],
  port: PORT,
  store: globalStore
})
