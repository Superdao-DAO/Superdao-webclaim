const alertify = require('alertifyjs');

export class SupError {
  constructor(message) {
    alertify.error(message);
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
