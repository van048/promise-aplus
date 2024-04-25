const adapter = require("./adapter-naive");
let rejected = adapter.rejected;
let deferred = adapter.deferred;
let resolved = adapter.resolved;
const Promise = require('./src/naive')

// new Promise((resolve, reject) => {
//     queueMicrotask(() => {
//         resolve('resolved');
//     }, 2000);
// }).then(res => {
//     console.log(res);
// })
// // 输出结果 resolved

// let p = new Promise((res) => {
//     queueMicrotask(() => {
//         res(10);
//     }, 1000)
// });
// p.then(v => {
//     console.log(v + 1);
// });
// p.then(v => {
//     console.log(v + 2);
// });
// // 输出结果 11  12

// console.log('start');
// new Promise(resolve => {
//     console.log('resolved')
//     resolve('resolved');
// }).then(() => {
//     console.log('then');
// });
// console.log('end');
// // 输出顺序为  start resolved  end  then

// let resolve1;
// console.log('start');
// new Promise(resolve => {
//     console.log('pending');
//     resolve1 = resolve;
// }).then(() => {
//     console.log('then');
// });
// resolve1();
// console.log('end');
// // 输出顺序为 start pending  end  then

// let p = new Promise(res => res(2));
// let then = p.then(v => v);
// console.log(then instanceof Promise) // true
// console.log(then === p) // false

// console.log('start');
// new Promise(res => {
//     queueMicrotask(() => {
//         console.log('resolve');
//         res(10);
//     }, 3000)
// }).then(v => {
//     console.log('then1');
//     return v + 3;
// }).then(v => {
//     console.log('then2');
//     console.log(v);
// })
// console.log('end');
// // 输出 start end resolve then1 then2 13
// // 符合预期

// console.log('start');
// new Promise((res) => {
//     console.log('promise1 pending');
//     queueMicrotask(() => {
//         console.log('promise1 resolve');
//         res(1);
//     }, 2000);
// }).then(v => {
//     console.log(`then1: ${v}`);
//     return new Promise(res => {
//         console.log(`promise2 pending: ${v}`);
//         queueMicrotask(() => {
//             console.log(`promise2 resolve: ${v}`);
//             res(v + 3);
//         }, 2000);
//     })
// }).then(v => {
//     console.log(`then2: ${v}`);
// });
// console.log('end');
// // 输出结果
// // start
// // promise1 pending
// // end
// // promise1 resolve
// // then1: 1
// // promise2 pending: 1
// // promise2 resolve: 1
// // then2: 4

// new Promise(res => res(10)).then(v => {
//     return {
//         other: v,
//         then: v + 2
//     }
// }).then(ans => {
//     console.log(ans);
// });

// new Promise(res => res(10)).then(v => {
//     return {
//         other: v,
//         then: () => {
//             return v + 2;
//         }
//     }
// }).then(ans => {
//     console.log(ans);
// });

// new Promise(res => res(10)).then(v => {
//     return {
//         other: v,
//         then: (res, rej) => {
//             res(v + 2);
//         }
//     }
// }).then(ans => {
//     console.log(ans);
// });
// // // 第一个
// // {
// //     other: 10,
// //     then: 12
// // }
// // // 第二个 
// // // 不会打印，即不会then方法里的代码（Promise状态一直在pending）
// // // 第三个
// // 12

// let promise = new Promise(res => res()).then(function () {
//     return promise;
// });
// promise.then(null, (err)=>{console.log(err)})

// new Promise(res => res()).then(() => {
//     return {
//         then: function (onFulfilled) {
//             // 第一个onFulfilled
//             onFulfilled({
//                 then: function (onFulfilled) {
//                     queueMicrotask(function () {
//                         onFulfilled('onFulfilled1');
//                     }, 0);
//                 }
//             });
//             // 第二个onFulfilled
//             onFulfilled('onFulfilled2');
//         }
//     };
// }).then(value => {
//     console.log(value);
// });
// // 正确输出 onFulfilled1