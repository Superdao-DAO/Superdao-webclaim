import Effects from './effects';
import Chart from './chart';
import Token from './token';
import strings from './strings';
import Ui from './ui';
import mainConf from './config/main';

const $ = require('jquery');
const MobileDetect = require('mobile-detect');
const alertify = require('alertifyjs');
const BigNumber = require('bignumber.js');
const Wait = require('wait-async');

const wait = new Wait();
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

  mainRegisterAndUpdate() {
    this.chart.updateChart(this.token.tokensLeft,
      this.token.tokensBought);
    this.chart.updateBar(this.token.tokensLeft,
      this.token.tokensBought);
    this.ui.setTokensLeft(this.token.tokensLeft);
    this.ui.setTokensBought(this.token.tokensBought);
    this.ui.setTokenPriceEthDisc(this.token.tokenPriceDisc);
    if (this.presaleStatusCheck()) {
      try {
        this.ui.setAccountDD(this.token.web3.eth.accounts);
      } catch (error) {
        console.log(error);
      }
    }
  }

  ribbonUpdate() {
    this.ui.setRibbonTokenPrice(this.token.tokenPrice);
    $.get(mainConf.ether_price_uri('ETH', 'USD'), wait((data) => {
      this.ethUsdPrice = data.USD;
    }));
    $.get(mainConf.ether_price_uri('ETH', 'BTC'), wait((data) => {
      this.ethBtcPrice = data.BTC;
    }));
    wait.then(() => {
      this.ribbonUpdClbk();
      this.effects.constructor.updateMarquee();
    });
  }

  presaleStatusCheck() {
    if (this.token.tokensLeft === 0) {
      this.ui.showPresaleOver();
      return false;
    }
    return true;
  }

  ribbonUpdClbk() {
    this.ui.setRibbonDollarPrice(
      new BigNumber(this.ethUsdPrice).mul(this.token.tokenPrice).toNumber());
    this.ui.setRibbonSupBtcPrice(
      new BigNumber(this.ethBtcPrice).mul(this.token.tokenPrice).toNumber());
    this.ui.setRibbonEthBtcPrice(this.ethBtcPrice);
  }
}

/**
 * Entry Point
 */
$(document).ready(() => {
  app = new MainApp();
});
