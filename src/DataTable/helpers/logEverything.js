// (function() {
//    const { call } = Function.prototype;
//   Function.prototype.call = function() {
//       console.log(this, arguments);
//       return call.apply(this, arguments);
//    };
//     const methods = Object.getOwnPropertyNames(this).filter(item => typeof this[item] === 'function');
//     console.log('methods = ', methods);
// })();

export const logMe = obj => {
    const methods = Object.getOwnPropertyNames(obj).filter(item => typeof obj[item] === 'function');
    console.log('methods = ', methods);
};
