import Effects from './effects';
import Chart from './chart';
import Token from './token';
import tokenConfig from './config/token';
import { apikey, ABI } from './abi';
import strings from './strings';

const $ = require('jquery');
const MobileDetect = require('mobile-detect');

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
    /*
    // Now you can start your app & access web3 freely:
    startApp()
    */
    this.mobileDetect = new MobileDetect(window.navigator.userAgent);
    if (this.mobileDetect.phone()) {
      // confirm dialog
      alertify.confirm("Message", function () {
        // user clicked "ok"
      }, function() {
        // user clicked "cancel"
      });
      return;
    }
    this.token = new Token(tokenConfig.main_token_address);
    this.effects = new Effects();
    this.chart = new Chart();
    console.log(`ok ${apikey} ${ABI.toString()} ${strings.toString()}`);
    console.log($.toString());
  }
}

/**
 * Entry Point
 */
$(document).ready(() => {
  app = new MainApp();
});
