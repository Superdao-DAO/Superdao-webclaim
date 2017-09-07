import { ABI } from './abi';
import strings from './strings';
import tokenConfig from './config/token';
import environment from './config/environment';
import { SupError } from './error';
import uiControl from './ui';
import uiIdentity from './config/ui';

const Wait = require('wait-async');
const alertify = require('alertifyjs');
const Web3 = require('web3');
const $ = require('jquery');
const BigNumber = require('bignumber.js');

const wait = new Wait();

BigNumber.config({ ERRORS: false });

/**
 * This is the main promissory token class
 */
export default class {
  /**
   * This is the class constructor
   * @constructor
   */
  constructor(parent) {
    this.parent = parent;
    this.abi = ABI;
    this.ethAccount = uiIdentity.eth_account;
    this.claimBtn = uiIdentity.claim_button;
    this.gasPriceInput = uiIdentity.gas_price_input;
    this.claimEtherInput = uiIdentity.claim_eth_input;
    this.loggingElement = uiIdentity.logging_element;
    if (!environment.debug) {
      this.address = tokenConfig.main_token_address;
    } else {
      this.address = tokenConfig.test_token_address;
    }
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof window.web3 !== 'undefined') {
      // Use Mist/MetaMask's provider
      this.web3 = new Web3(window.web3.currentProvider);
      this.injected = true;
    } else {
      console.log(strings.err_no_web3);
      alertify.warning(strings.err_no_metamask);
      // fallback - use your fallback strategy
      this.web3 = new Web3(new Web3.providers.HttpProvider(
        environment.debug ? tokenConfig.test_http_endpoint
          : tokenConfig.main_http_endpoint // eslint-disable-line comma-dangle
      ));
      this.injected = false;
    }
    this.checkNetworkAndInit();
  }

  makeContractInst() {
    try {
      this.tokenInstance = this.web3.eth.contract(this.abi).at(this.address);
    } catch (e) {
      console.log(e);
      this.parent.ui.disableClaimButton();
      throw new SupError(strings.err_no_token_instance);
    }
  }

  checkNetworkAndInit() {
    this.web3.version.getNetwork((error, result) => {
      if (error) {
        throw new SupError(error);
      }
      switch (result) {
        case '1':
          console.log(strings.inf_msg_mainet);
          break;
        case '2':
          console.log(
            strings.inf_msg_morden);
          break;
        case '3':
          console.log(strings.inf_msg_ropsten);
          break;
        default:
          console.log(strings.inf_msg_net_unk);
      }
      if (result !== '1' && !environment.debug) {
        this.parent.ui.disableClaimButton();
        throw new SupError(strings.err_no_main_net_claim);
      }
    });
    this.makeContractInst();
    this.fetchContractDataAndUpdate();
    this.tokensClaimedEvent();
  }

  claim() {
    if (typeof this.tokenInstance === 'undefined') {
      this.makeContractInst();
    }
    let transactionId;
    const gasPrice = $(this.gasPriceInput).val();
    let value = $(this.claimEtherInput).val();
    const tokenCountCheck = this.constructor.roundPrecise(value
      % strings.token_discount_price, 11);
    if (tokenCountCheck !== strings.token_discount_price) {
      value = this.constructor.roundPrecise(value - tokenCountCheck, 11);
      $(this.claimEtherInput).val(value);
    }
    if (value === 0) {
      // return;
    }
    uiControl.disableElement(this.claimBtn);
    try {
      transactionId = this.tokenInstance.claim({
        from: $(this.ethAccount).val(),
        value: Web3.toWei(value, 'ether'),
        gas: gasPrice,
      }, (error, result) => {
        if (!error) {
          console.log(transactionId);
          value = +$(this.claimEtherInput).val('');
          uiControl.addToLog(`Transaction sent: <a href="https://etherscan.io/tx/',
            ${result},'" target="_blank">', ${result}</a>`);
        } else {
          let errorData = error.toString();
          console.log(errorData);
          if (Object.keys(error)) {
            if (error.indexOf('Error: Error:') > -1) {
              errorData = error.substring(13);
              if (error.length > 58) {
                errorData = `${error.substring(0, 58)}, ...`;
              }
            }
            uiControl.addToLog(`<span style="color:red">, ${error}, </span>`);
          }
        }
        uiControl.refreshValues();
        uiControl.enableElement();
      });
    } catch (e) {
      console.log('Excep:', e);
      uiControl.addToLog(`<span style="color:red">, ${e.message}, </span>`);
      uiControl.enableElement();
    }
  }

  fetchContractDataAndUpdate() {
    if (typeof this.tokenInstance === 'undefined') {
      this.makeContractInst();
    }
    this.tokenInstance.claimedPrepaidUnits(wait((error, result) => {
      if (!error) {
        this.claimedPrepaidUnits = result;
      } else {
        this.parent.ui.disableClaimButton();
        throw new SupError(error);
      }
    }));
    this.tokenInstance.claimedUnits(wait((error, result) => {
      if (!error) {
        this.claimedUnits = result;
      } else {
        this.parent.ui.disableClaimButton();
        throw new SupError(error);
      }
    }));
    this.tokenInstance.lastPrice(wait((error, result) => {
      if (!error) {
        this.lastPrice = result;
      } else {
        this.parent.ui.disableClaimButton();
        throw new SupError(error);
      }
    }));
    this.tokenInstance.promissoryUnits(wait((error, result) => {
      if (!error) {
        this.promissoryUnits = result;
      } else {
        this.parent.ui.disableClaimButton();
        throw new SupError(error);
      }
    }));
    wait.then(() => {
      this.parent.getRemotePrices(() => {
        this.parent.mainRegisterAndUpdate();
        this.parent.ribbonUpdClbk();
      });
    });
  }

  displayEtherValue() {
    const value = + $(uiIdentity.claim_eth_input).val();
    const tokens = Math.floor(value / strings.token_discount_price);
    $(uiIdentity.claim_button).val('Claim ' + tokens + ' Tokens');
  }

  tokensClaimedEvent() {
    const claimEvent = this.tokenInstance.TokensClaimedEvent();
    claimEvent.watch((err, result) => {
      if (!err) {
        console.log(result);
      } else {
        throw new SupError(err);
      }
    });
  }

  get tokensLeft() {
    if (
      typeof this.claimedUnits === 'undefined' ||
      typeof this.claimedPrepaidUnits === 'undefined' ||
      typeof this.promissoryUnits === 'undefined') {
      this.parent.ui.disableClaimButton();
      throw new SupError(strings.err_units_not_set);
    }
    return this.promissoryUnits.minus(
      this.claimedUnits.plus(this.claimedPrepaidUnits)).toNumber();
  }

  get tokensBought() {
    if (
      typeof this.claimedUnits === 'undefined' ||
      typeof this.claimedPrepaidUnits === 'undefined') {
      this.parent.ui.disableClaimButton();
      throw new SupError(strings.err_units_not_set);
    }
    return this.claimedUnits.plus(this.claimedPrepaidUnits).toNumber();
  }

  get tokenPriceDisc() {
    if (typeof this.lastPrice === 'undefined') {
      this.parent.ui.disableClaimButton();
      throw new SupError(strings.err_price_not_set);
    }
    const ethPrice = this.web3.fromWei(this.lastPrice, 'ether');
    return ethPrice.minus(ethPrice.times(0.40)).toNumber();
  }

  get tokenPrice() {
    if (typeof this.lastPrice === 'undefined') {
      this.parent.ui.disableClaimButton();
      throw new SupError(strings.err_price_not_set);
    }
    return this.web3.fromWei(this.lastPrice, 'ether').toNumber();
  }
}
