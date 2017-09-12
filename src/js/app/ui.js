import uiConf from './config/ui';
import strings from './strings';
import environment from './config/environment';
import { SupError } from './error';

const $ = require('jquery');

export default class {
  constructor(parent) {
    this.parent = parent;
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
    this.isblinking = setInterval(this.blink, 1000);
    this.blink();
  }

  setTokensLeft(tokensLeft) {
    if (tokensLeft) {
      this.getElement(uiConf.tokens_left_element).html(
        tokensLeft.toLocaleString());
    }
  }

  setTokensBought(tokensBought) {
    this.getElement(uiConf.tokens_bought_element).html(
      tokensBought.toLocaleString());
  }

  setTokenPriceEthDisc(tokenPrice) {
    this.getElement(uiConf.token_price_element).html(tokenPrice);
  }

  setTokenPriceUsdDisc(tokenPrice) {
    this.getElement(uiConf.token_usd_price).html(tokenPrice);
  }

  setAccountDD(accounts) {
    if (accounts.length === 0) {
      throw new SupError(strings.err_accounts_locked);
    }
    for (let i = 0, len = accounts.length; i < len; i += 1) {
      this.getElement(uiConf.eth_account).append(
        $('<option></option>').val(accounts[i]).html(accounts[i]));
    }
  }

  setRibbonDollarPrice(dollarPrice) {
    this.getElement(uiConf.ribbon_token_dollar_price).html(
      dollarPrice.toFixed(2));
  }

  setRibbonTokenPrice(tokenPrice) {
    this.getElement(uiConf.ribbon_token_price).html(tokenPrice);
  }

  setRibbonSupBtcPrice(btcPrice) {
    this.getElement(uiConf.ribbon_token_btc_price).html(btcPrice);
  }

  setRibbonEthBtcPrice(btcPrice) {
    this.getElement(uiConf.ribbon_ether_btc_price).html(btcPrice);
  }

  getGasPriceInput() {
    return this.getElement(uiConf.gas_price_input).val();
  }

  getClaimedEther() {
    return this.getElement(uiConf.claim_eth_input).val();
  }

  getEthAccount() {
    return this.getElement(uiConf.eth_account).val();
  }

  disableClaimButton() {
    this.disableElement(uiConf.claim_button);
  }

  enableClaimButton() {
    this.enableElement(uiConf.claim_button);
  }

  bindClaim(callback) {
    this.getElement(uiConf.claim_button).click(() => {
      console.log('CLAIM BUTTON CLICKED');
      callback();
    });
  }

  bindEtherValue(callback) {
    this.getElement(uiConf.claim_eth_input).on('input', () => {
      console.log('INPUT VALUE CHANGES');
      callback();
    });
  }

  logTransaction(output) {
    this.getElement(uiConf.logging_element).append($('<div>').html(
      `Transaction sent: <a href="https://${environment.debug ? 'ropsten.'
        : ''}etherscan.io/tx/${output}" target="_blank">${output}</a>`));
  }

  logTransactionErr(output) {
    this.getElement(uiConf.logging_element).append(
      $('<div>').html(`<span style="color:red">${output}</span>`));
  }

  displayTokenValue() {
    const value = this.getClaimedEther();
    const tokens = value / this.parent.token.tokenPriceDisc;
    this.getElement(uiConf.claim_button).val(`Claim ${tokens} Tokens`);
  }

  blink(elemID) {
    this.getElement(elemID).fadeOut(500).fadeIn(500);
  }
}
