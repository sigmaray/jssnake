if (!Array.prototype.last) {
  Array.prototype.last = function () { // eslint-disable-line func-names, no-extend-native
    return this[this.length - 1];
  };
}

if (!Array.prototype.random) {
  Array.prototype.random = function () { // eslint-disable-line func-names, no-extend-native
    if (this.length > 0) return this[Math.floor(Math.random() * this.length)];
    return null;
  };
}
