import uiConf from './config/ui';
import strings from './strings';

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

  showPresaleOver() {
    this.getElement(uiConf.tokens_left_element).html(strings.lbl_presale_over);
    this.getElement(uiConf.presale_over_element).html(
      `<h2>${strings.lbl_presale_over}</h2>`);
    if (this.isblinking) {
      clearInterval(this.isblinking);
    }
    this.isblinking = setInterval(this.constructor.blink, 1000);
    this.constructor.blink();
  }

  setTokensLeft(tokensLeft) {
    if (tokensLeft) {
      this.getElement(uiConf.tokens_left_element).html(tokensLeft);
    }
  }

  setTokensBought(tokensBought) {
    this.getElement(uiConf.tokens_bought_element).html(tokensBought);
  }

  static blink(elemID) {
    this.getElement(elemID).fadeOut(500).fadeIn(500);
  }
}
