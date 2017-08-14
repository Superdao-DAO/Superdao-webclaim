const alertify = require('alertify.js');

export class SupError {
  constructor(message) {
    alertify.alert(message);
    this.message = message;
  }
  toString() {
    return this.message;
  }
}

export class ValueError {
  constructor(message) {
    this.message = message;
  }
  toString() {
    return this.message;
  }
}
