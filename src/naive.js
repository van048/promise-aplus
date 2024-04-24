const isFunction = obj => typeof obj === 'function'
// null不是规范里的object
const isObject = obj => obj != null && typeof obj === 'object'

const PENDING = 'pending'
const FULFILLED = 'fulfilled'
const REJECTED = 'rejected'

function A(f) {
  this.state = PENDING
  this.result = null
  this.callbacks = []

  // 状态迁移
  const re = (result)=>{
    transition(this, FULFILLED, result)
  }
  const rj = (reason)=>{
    transition(this, REJECTED, reason)
  }

  // 只回调一次
  let promiseCalled = false;
  // 当前promise异步执行成功后回调
  const resolvePromise = (y) => {
    if (promiseCalled) return;
    promiseCalled = true;
    // y很多种情况:Promise、thenable、非thenable
    // 递归下去直到递归停止，将递归停止时的值作为当前promise异步执行的结果
    pRP(this, y, re, rj);
  };
  // 当前promise异步执行失败后回调
  const rejectPromise = (r) => {
    if (promiseCalled) return;
    promiseCalled = true;
    rj(r);
  };

  // f实际上可以看作是第一个自定义的then function
  f && f(resolvePromise, rejectPromise, this)
}
const transition = (promise, state, result) => {
  if (promise.state !== PENDING) return
  promise.state = state
  promise.result = result
  setTimeout(()=>{
    while(promise.callbacks.length) {
      const callback = promise.callbacks.shift()
      handleCallback(callback,state,result,callback.p)
    }
  }, 0)
}

A.prototype.then = function(onFulfilled, onRejected) {
  return new A((resolve, reject, p) => {
    // 先假设resolve可以让该promise迁移至fulfilled，参数是result，resolve里可以拿到该promise的引用
    // 先假设reject可以让该promise迁移至rejected，参数是reason
    const callback = { onFulfilled, onRejected, resolve, reject, p }

    if (this.state === PENDING) {
      this.callbacks.push(callback)
    } else {
      setTimeout(() => handleCallback(callback, this.state, this.result, p), 0)
    }
  })
}

// p是跟callback里resolve对应的promise
function handleCallback(callback, state, result, p) {
  const { onFulfilled, onRejected, resolve, reject } = callback
  try {
    if (state === FULFILLED) {
      // TODO resolve(onFulfilled(result))
      isFunction(onFulfilled) ? pRP(p, onFulfilled(result), resolve, reject) : resolve(result)
    } else if (state === REJECTED) {
      // TODO resolve(onRejected(result))
      isFunction(onRejected) ? pRP(p, onRejected(result), resolve, reject) : reject(result)
    }
  } catch (e) {
    reject(e)
  }
}

// Promise Resolution Procedure
function pRP(promise, resultOrReason, resolve, reject) {
  if (promise === resultOrReason) {
    const reason = new TypeError('Can not fulfill promise with itself')
    return reject(reason)
  }
  if (resultOrReason instanceof A) {
    // If x is pending, promise must remain pending until x is fulfilled or rejected.
    if (resultOrReason.state == PENDING) return resultOrReason.then(()=>{
      resolve(resultOrReason.result)
    },()=>{
      reject(resultOrReason.result)
    })
    else if (resultOrReason.state == FULFILLED) return resolve(resultOrReason.result)
    else return reject(resultOrReason.result)
  }
  if (isObject(resultOrReason) || isFunction(resultOrReason)) {
    try {
      const then = resultOrReason.then
      if (isFunction(then)) {
        let promiseCalled = false
        const resolvePromise = (y) => {
          // TODO
          if (promiseCalled) return
          promiseCalled = true
          pRP(promise, y, resolve, reject)
        }
        const rejectPromise = (r) => {
          // TODO
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