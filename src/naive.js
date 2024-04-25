const isFunction = obj => typeof obj === 'function'
// null不是规范里的object
const isObject = obj => obj != null && typeof obj === 'object'

const PENDING = 'pending'
const FULFILLED = 'fulfilled'
const REJECTED = 'rejected'

function A(f) {
  this.state = PENDING
  this.result = null
  // 如果then执行的时候是PENDING的话，push一个进去用于未来回调
  this.callbacks = []

  // 状态迁移，回调执行
  const re = (result)=>{
    transition(this, FULFILLED, result)
  }
  const rj = (reason)=>{
    transition(this, REJECTED, reason)
  }

  // 马上执行外部传入的异步处理函数
  try{
    f(re, rj, this)
  }catch(e){
    rj(e)
  }
}
const transition = (promise, state, result) => {
  if (promise.state !== PENDING) return
  promise.state = state
  promise.result = result
  setTimeout(()=>{
    while(promise.callbacks.length) {
      const callback = promise.callbacks.shift()
      // then的回调函数处理
      handleCallback(callback,state,result)
    }
  }, 0)
}

A.prototype.then = function(onFulfilled, onRejected) {
  // 最终返回一个promise2
  return new A((resolve, reject, me) => {
    const callback = { onFulfilled, onRejected, resolve, reject, me}

    if (this.state === PENDING) {
      this.callbacks.push(callback)
    } else {
      setTimeout(() => handleCallback(callback, this.state, this.result), 0)
    }
  })
}

// 根据onFulfilled和onRejected执行的结果执行resolve或者reject，影响resolve对应的promise2的状态
function handleCallback(callback, state, result) {
  // 某一次then的callback
  const { onFulfilled, onRejected, resolve, reject, me } = callback
  try {
    if (state === FULFILLED) {
      // onFulfilled是函数的话执行，它的返回值用于执行pRP；否则沿用上一个promise的状态
      isFunction(onFulfilled) ? pRP(me, onFulfilled(result), resolve, reject) : resolve(result)
    } else if (state === REJECTED) {
      // onRejected是函数的话执行，它的返回值用于执行pRP；否则沿用上一个promise的状态
      isFunction(onRejected) ? pRP(me, onRejected(result), resolve, reject) : reject(result)
    }
  } catch (e) {
    reject(e)
  }
}

// Promise Resolution Procedure
function pRP(me, resultOrReason, resolve, reject) {
  if (me === resultOrReason) {
    const reason = new TypeError('Can not fulfill promise with itself')
    return reject(reason)
  }
  // resultOrReason是promise的话，promise也是object，也有then函数，处理是一样的。目的就是复用resultOrReason的状态
  if (isObject(resultOrReason) || isFunction(resultOrReason)) {
    try {
      const then = resultOrReason.then
      if (isFunction(then)) {
        let promiseCalled = false
        const resolvePromise = (y) => {
          // 只回掉一次
          if (promiseCalled) return
          promiseCalled = true
          // 递归
          pRP(me, y, resolve, reject)
        }
        const rejectPromise = (r) => {
          // 只回掉一次
          if (promiseCalled) return
          promiseCalled = true
          reject(r)
        }
        try {
          // 要用return终止分支
          return then.call(resultOrReason, resolvePromise, rejectPromise)
        } catch (err) {
          if (!promiseCalled) {
            // 要用return终止分支
            return reject(err)
          } else {
            // ignore
            return
          }
        }
      } else {
        return resolve(resultOrReason)
      }
    } catch (e) {
      return reject(e)
    }
  }
  resolve(resultOrReason)
}

module.exports = A