/*
  This is just some code to allow adding fake users for testing (and fun). Perhaps it useful to the example too.
*/
const bugs = []

class Bug {
  constructor (player, interval = 2000, dispatch) {
    this.player = player
    this.timeout = interval
    this.dispatch = dispatch
  }

  move () {
    const type = ['map/MOVE_UP', 'map/MOVE_DOWN', 'map/MOVE_RIGHT', 'map/MOVE_LEFT'][Math.floor(Math.random() * 200) % 4]

    this.dispatch({ type, player: this.player })
  }

  run () {
    setInterval(() => {
      this.move()
    }, 2000)
  }
}

export function makeBug (store) {
  return function bug () {
    function getRandomColor () {
      const letters = '0123456789ABCDEF'
      let color = ''
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)]
      }
      return color
    }

    const bug = new Bug(getRandomColor(), undefined, store.dispatch)

    bugs.push(bug.run())

    /*
      Note: this is not an actual action. It just responds with an object to seem like a normal action.
    */
    return { type: 'map/MAKE_BUG' }
  }
}
