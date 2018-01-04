const isArray = function () {
  if(Array && Array.isArray)  {
    return Array.isArray
  }
  return function (o) {
    return Object.prototype.toString.call(o) === '[object Array]'
  }
}

const getEquivalentEmpty = function (objOrArr) {
  return isArray(objOrArr) ? [] : {}
}

const getFirstExtraKeys = function (first, second) {
  let i
  let curExtra
  let childExtra
  for (i in first) {
    if (first.hasOwnProperty(i)) {
      if (first[i] !== null && typeof first[i] === "object") {
        /*
        object includes arrays and objects, null is not
        considered an object, so we make sure its not null
        */
        childExtra = getFirstExtraKeys(first[i], (second || {})[i])
        if (childExtra !== undefined) {
          //curExtra = curExtra || {}
          curExtra = curExtra || getEquivalentEmpty(first)
          curExtra[i] = childExtra
        }
      } else {
        if(second === undefined || second === null || second[i] !== first[i]){
            //curExtra = curExtra || {}
            curExtra = curExtra || getEquivalentEmpty(first)
            curExtra[i] = first[i]
        }
      }
    }
  }
  return curExtra
}

export default function (first, second) {
  const res = getFirstExtraKeys({itm: first}, {itm: second})
  return (res || {}).itm
}
