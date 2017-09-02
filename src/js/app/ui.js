const $ = require('jquery');

export default class {
  constructor() {
    this.elemInsts = {};
  }
  disableElement(elemID) {
    this.getElement(elemID).prop('disabled', true);
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
  static blink(elemID) {
    this.getElement(elemID).fadeOut(500).fadeIn(500);
  }
}
