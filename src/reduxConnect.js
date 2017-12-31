import { EventEmitter } from 'events'
import { updater, logger } from './index'

const reduxConnect = (mapStateToProps, mapActionsToDispatch) => (Component) => {
  function connect (store) {
    const actions = mapActionsToDispatch(store.dispatch)
    const props = mapStateToProps ? mapStateToProps(store.getState()) : {}

    class Subscriptions extends EventEmitter {}

    const subscriptions = new Subscriptions()

    if (store) {
      store.subscribe(() => {
        const data = store.getState()
        subscriptions.emit('data', data)
      })
    }

    Object.assign(Component.prototype, { actions })
    Component.prototype.store = store

    const instance = new Component()

    instance.setProps({
      ...instance.props,
      ...props
    })

    function socketHandler (data) {
      instance.lifecycleIncrement = 1
      const props = mapStateToProps ? mapStateToProps(data) : {}

      if (instance.props.response) {
        updater(instance, props)
      }
    }

    subscriptions.addListener('data', socketHandler)

    /*
      A function to be called when the websocket client closes.
    */
    Component.prototype.end = () => {
      subscriptions.removeListener('data', socketHandler)
    }

    return instance
  }

  if (typeof Component === 'function') {
    return connect
  }
}

export default reduxConnect