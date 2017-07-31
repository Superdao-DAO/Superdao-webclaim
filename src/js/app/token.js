import strings from './strings';
import tokenConfig from './config/token';

const Web3 = require('web3');

/**
 * This is the main promissory token class
 */
export default class {
  /**
   * This is the class constructor
   * @constructor
   * @param {string} test - Testing flag.
   */
  constructor(test = false) {
    if (test) {
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
        test ? tokenConfig.test_http_endpoint
          : tokenConfig.main_http_endpoint,
      ));
      this.injected = false;
    }
  }

  static roundPrecise(number, precision) {
    const factor = 10 ** precision;
    const tempNumber = number * factor;
    const roundedTempNumber = Math.round(tempNumber);
    return roundedTempNumber / factor;
  }
  /*
    claim() {
      if (!tokenInstance) {
        return;
      }
      var
        transactionId,
        _gasPrice = +$('#gas_price').val(),
        _value = +$('#claim_value').val(),
        tokenCountCheck = roundPrecise(_value % TOKEN_DISCOUNT_PRICE, 11);
      if (tokenCountCheck !== TOKEN_DISCOUNT_PRICE) {
        _value = roundPrecise(_value - tokenCountCheck, 11);
        $('#claim_value').val(_value);
      }
      if (_value === 0) {
        return;
      }
    }
  */
}
