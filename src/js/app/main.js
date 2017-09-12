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
    if (this.mobileDetect.mobile()) {
      // confirm dialog
      alertify.confirm(strings.ask_msg_mobile, () => {
        this.init();
      }, () => {
        window.location = mainConf.mobile_redirect_uri;
      });
    } else {
      this.init();
    }
  }

  init() {
    this.ui = new Ui(this);
    this.chart = new Chart();
    this.token = new Token(this);
    this.effects = new Effects();
    this.ui.bindClaim(() => {
      this.token.claim();
    });
    this.ui.bindEtherValue(() => {
      this.ui.displayTokenValue();
    });
  }

  mainRegisterAndUpdate(callback) {
    this.chart.updateChart(this.token.tokensLeft,
      this.token.tokensBought);
    this.chart.updateBar(this.token.tokensLeft,
      this.token.tokensBought);
    this.ui.setTokensLeft(this.token.tokensLeft);
    this.ui.setTokensBought(this.token.tokensBought);
    this.ui.setTokenPriceEthDisc(this.token.tokenPriceDisc);
    this.ui.setTokenPriceUsdDisc(
      new BigNumber(this.token.tokenPriceDisc).mul(this.ethUsdPrice).toFixed(
        2));
    if (this.presaleStatusCheck()) {
      try {
        if (typeof callback !== 'undefined') {
          callback();
        } else {
          this.ui.setAccountDD(this.token.web3.eth.accounts);
        }
      } catch (error) {
        this.ui.disableClaimButton();
        console.log(error);
      }
    } else {
      this.ui.disableClaimButton();
    }
  }

  getRemotePrices(callback) {
    $.get(mainConf.ether_price_uri('ETH', 'BTC,USD'), (data) => {
      this.ethBtcPrice = data.BTC;
      this.ethUsdPrice = data.USD;
      callback();
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
    this.ui.setRibbonTokenPrice(this.token.tokenPrice);
    this.ui.setRibbonDollarPrice(
      new BigNumber(this.ethUsdPrice).mul(this.token.tokenPrice).toNumber());
    this.ui.setRibbonSupBtcPrice(
      new BigNumber(this.ethBtcPrice).mul(this.token.tokenPrice).toNumber());
    this.ui.setRibbonEthBtcPrice(this.ethBtcPrice);
    this.effects.constructor.updateMarquee();
  }
}

/**
 * Entry Point
 */
$(window).ready(() => {
  app = new MainApp();
});
