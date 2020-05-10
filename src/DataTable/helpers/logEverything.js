(function() {
    const { call } = Function.prototype;
    Function.prototype.call = function() {
        console.log(this, arguments);
        return call.apply(this, arguments);
    };
})();
