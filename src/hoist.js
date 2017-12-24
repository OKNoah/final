/*
  https://github.com/AvraamMavridis/javascript-decorators
*/

export default function hoist (target, _class) {
  const keys = Object.getOwnPropertyNames( _class.prototype )
  const _isFunction = function ( prop ) {
    return typeof prop === 'function'
  }

  keys.forEach(key => {
    if (!target.prototype[key] && _isFunction(_class.prototype[key])) {
      target.prototype[key] = _class.prototype[key]
    }
  })

  return target
}
