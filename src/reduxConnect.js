import { EventEmitter } from 'events'
import { updater, logger } from './index'

const reduxConnect = (mapStateToProps, mapActionsToDispatch) => (Component) => {
  function connect (store) {
    const actions = mapActionsToDispatch(store.dispatch)
    const props = mapStateToProps ? mapStateToProps(store.getState()) : {}

    logger('props', props)

    class Subscriptions extends EventEmitter {}

    const subscriptions = new Subscriptions()

    if (store) {
      store.subscribe(() => {
        const data = store.getState()
        subscriptions.emit('data', data)
      })
    }

    Component.prototype.actions = {
      ...Component.prototype.actions,
      ...actions
    }
    Component.prototype.store = store

    const instance = new Component()

    subscriptions.addListener('data', (data) => {
      instance.lifecycleIncrement = 1
      const props = mapStateToProps(data)
      updater(instance, props)
    })

    return instance
  }

  if (typeof Component === 'function') {
    return connect
  }
}

export default reduxConnect