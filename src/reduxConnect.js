const reduxConnect = (mapStateToProps, mapActionsToDispatch) => (Component) => {
  function connect (store) {
    const actions = mapActionsToDispatch(store.dispatch)

    Component.prototype.actions = {
      ...Component.prototype.actions,
      ...actions
    }
    Component.prototype.store = store
    return new Component()
  }

  if (typeof Component === 'function') {
    return connect
  }
}

export default reduxConnect