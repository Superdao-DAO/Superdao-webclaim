import Effects from './effects';
import Chart from './chart';
import Token from './token';
import tokenConfig from './config/token';
import strings from './strings';

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
    }
    else {
      this.init();
    }
  }
  init() {
    this.token = new Token(tokenConfig.main_token_address);
    this.effects = new Effects();
    this.chart = new Chart();
  }
}

/**
 * Entry Point
 */
$(document).ready(() => {
  app = new MainApp();
});
