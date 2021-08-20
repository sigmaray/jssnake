if (!Array.prototype.last) {
  Array.prototype.last = function () {
    return this[this.length - 1];
  };
}

if (!Array.prototype.random) {
  Array.prototype.random = function () {
    return this?.[Math.floor(Math.random() * this.length)];
  };
}
