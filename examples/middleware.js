import { createStore } from 'redux'

export const reducer = (state = { count: 0 }, action) => {
  switch (action.type) {
    case 'GET_WHATEVER':
      return {
        ...state,
        count: state.count + 1
      }

    default:
      return state
  }
}

export const store = createStore(reducer)

export async function middleware () {
  const actions = {
    increment: () => store.dispatch({ type: 'GET_WHATEVER', result: { date: Date.now() } })
  }

  /*
    You can really do anything you want to the Components. We just add the redux actions. This is also planned to be implemented through a `connect`-like interface. This applies to _all_ components on all requests.
  */
  return async function (component) {
    component.prototype.actions = actions
    return component
  }
}
