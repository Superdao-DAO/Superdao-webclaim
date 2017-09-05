import Effects from './effects';
import Chart from './chart';
import Token from './token';
import strings from './strings';
import Ui from './ui';

const $ = require('jquery');
const MobileDetect = require('mobile-detect');
const alertify = require('alertifyjs');

let app; // eslint-disable-line no-unused-vars

/**
 * Main application class.
 */
class MainApp {
  /**
   * Main constructor function.
   * @constructor
   */
  constructor() {
    this.mobileDetect = new MobileDetect(window.navigator.userAgent);
    if (this.mobileDetect.phone()) {
      // confirm dialog
      alertify.confirm(strings.ask_msg_mobile, () => {
        this.init();
      }, () => {
        // user clicked "cancel"
      });
    } else {
      this.init();
    }
  }

  init() {
    this.ui = new Ui();
    this.chart = new Chart();
    this.token = new Token(this);
    this.effects = new Effects();
  }

  registerAndUpdate() {
    this.chart.updateChart(this.token.tokensLeft,
      this.token.tokensBought);
    this.chart.updateBar(this.token.tokensLeft,
      this.token.tokensBought);
    this.ui.setTokensLeft(this.token.tokensLeft);
    this.ui.setTokensBought(this.token.tokensBought);
    this.ui.setTokenPriceEthDisc(this.token.tokenPriceDisc);
    this.ui.setAccountDD(this.token.web3.eth.accounts);
    if (this.presaleStatusCheck()) {

    }
  }

  presaleStatusCheck() {
    if (this.token.tokensLeft === 0) {
      this.ui.showPresaleOver();
      return false;
    }
    return true;
  }
}

/**
 * Entry Point
 */
$(document).ready(() => {
  app = new MainApp();
});
