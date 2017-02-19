(function (exports) {

    exports.Historik = function () {
        this.history = [];
    };

    exports.Historik.prototype.add = function (entry) {
        this.history.push(entry);
    };

    exports.Historik.prototype.now = function () {
        return this.history[this.history.length - 1];
    };

    exports.Historik.prototype.last = function () {
        return this.history[this.history.length - 2];
    };

})(typeof window === undefined ? module.exports : window);