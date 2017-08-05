import tokenStrings from './config/token';

const Web3 = require('web3');
const $ = require('jquery');

export default class {
// RPC api access
  constructor() {
    this.apiaddress = 'https://api.etherscan.io/api';
    // var apiaddress = "https://ropsten.etherscan.io/api",//ropsten api
  }

  fetchContractData() {
    const calls = {
      claimedUnits: 'claimedUnits()',
      claimedPrepaidUnits: 'claimedPrepaidUnits()',
    };
    let claimedPrepaidUnits = 0;
    let claimedUnits = 0;
    return $.post(this.apiaddress, {
      action: 'eth_call',
      apikey: tokenStrings.apikey,
      module: 'proxy',
      to: tokenStrings.main_token_address,
      data: this.constructor.getFunctionSignature(calls.claimedPrepaidUnits),
    })
      .then((d, e) => {
        if (e) {
          console.log(e);
          return;
        }
        claimedPrepaidUnits = Web3.toDecimal(d.result);
        console.log('claimed prepaid', claimedPrepaidUnits);
      })
      .then(() => {
        $.post(this.apiaddress, {
          action: 'eth_call',
          apikey: tokenStrings.apikey,
          module: 'proxy',
          to: tokenStrings.main_token_address,
          data: this.constructor.getFunctionSignature(calls.claimedUnits),
        })
          .then((d, e) => {
            if (e) {
              console.log(e);
              return;
            }
            claimedUnits = Web3.toDecimal(d.result);
            console.log('claimed', claimedUnits);
          });
      });
  }

  static getFunctionSignature(fnx) {
    return Web3.sha3(fnx).substring(0, 10);
  }
}
