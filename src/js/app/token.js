import strings from './strings';
import tokenConfig from './config/token';
import environment from './config/environment';
import ABI from './abi';
import SupError from './error';

const Web3 = require('web3');
const $ = require('jquery');

/**
 * This is the main promissory token class
 */
export default class {
  /**
   * This is the class constructor
   * @constructor
   */
  constructor() {
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
      alert(strings.err_no_metamask);
      // fallback - use your fallback strategy
      this.web3 = new Web3(new Web3.providers.HttpProvider(
        environment.debug ? tokenConfig.test_http_endpoint
          : tokenConfig.main_http_endpoint,
      ));
      this.injected = false;
    }
    this.checkNetwork();
    this.makeContractInst();
  }

  makeContractInst() {
    try {
      this.accounts_count = this.web3.eth.accounts.length;
      this.tokenInstance = this.web3.eth.contract(ABI).at(this.address);
    } catch (e) {
      console.log(e);
      // disable_button();
      alert(strings.err_no_token_instance);
    }
  }

  checkNetwork() {
    const netId = this.web3.version.network;
    switch (netId) {
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
    if (netId !== '1' && !environment.debug) {
      // disable_button();
      throw SupError(strings.err_no_main_net_claim);
    }
  }

  static roundPrecise(number, precision) {
    const factor = 10 ** precision;
    const tempNumber = number * factor;
    const roundedTempNumber = Math.round(tempNumber);
    return roundedTempNumber / factor;
  }

  claim() {
    if (!this.tokenInstance) {
      throw SupError(strings.err_token_inst_not_init);
    }
    let transactionId;
    let _gasPrice = $('#gas_price').val();
    let _value = $('#claim_value').val();
    let tokenCountCheck = this.constructor.roundPrecise(_value % TOKEN_DISCOUNT_PRICE, 11);
    if (tokenCountCheck !== TOKEN_DISCOUNT_PRICE) {
      _value = this.constructor.roundPrecise(_value - tokenCountCheck, 11);
      $('#claim_value').val(_value);
    }
    if (_value === 0) {
      return;
    }
  }
}
