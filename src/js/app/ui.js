const $ = require('jquery');

export default class {
  constructor() {
    this.elemInsts = {};
  }
  disableElement(elemID) {
    this.elemInsts[elemID] = $(elemID).prop('disabled', true);
  }
  enableElement(elemID) {
    this.getElement(elemID).prop('disabled', false);
  }
  getElement(elemID) {
    if (!(elemID in this.elemInsts)) {
      this.elemInsts[elemID] = $(elemID);
    }
    return this.elemInsts[elemID];
  }
}
