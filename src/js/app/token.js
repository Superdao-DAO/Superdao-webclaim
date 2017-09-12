import ABI from './abi';
import strings from './strings';
import tokenConfig from './config/token';
import environment from './config/environment';
import { SupError } from './error';

const Wait = require('wait-async');
const alertify = require('alertifyjs');
const Web3 = require('web3');

const wait = new Wait();

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
      this.tokenInstance = this.web3.eth.contract(ABI).at(this.address);
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
    this.fetchContractDataAndUpdate(() => {
      this.parent.ui.displayTokenValue();
      this.claimCallback();
    });
  }

  claimCallback() {
    let transactionId;
    this.parent.ui.disableClaimButton();
    try {
      transactionId = this.tokenInstance.claim({
        from: this.parent.ui.getEthAccount(),
        value: this.web3.toWei(this.parent.ui.getClaimedEther(), 'ether'),
        gas: this.parent.ui.getGasPriceInput(),
      }, (error, result) => {
        if (!error) {
          console.log(transactionId);
          this.parent.ui.logTransaction(result);
        } else {
          console.log(error);
          this.parent.ui.logTransactionErr(error.toString());
        }
      });
    } catch (e) {
      console.log('Excep:', e);
      this.parent.ui.logTransactionErr(e.message);
    }
    this.parent.ui.enableClaimButton();
  }

  fetchContractDataAndUpdate(callback) {
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
        this.parent.mainRegisterAndUpdate(callback);
        this.parent.ribbonUpdClbk();
      });
    });
  }

  tokensClaimedEvent() {
    const claimEvent = this.tokenInstance.TokensClaimedEvent();
    claimEvent.watch((err, result) => {
      if (!err) {
        console.log(result);
        this.fetchContractDataAndUpdate();
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
