import {apikey, ABI} from './abi';

const $ = require('jquery');

/**
 * Main application class.
 */
export class MainApp {
  /**
   * Main constructor function.
   * @constructor
   */
  constructor() {
    console.log('ok '+apikey+' '+ABI.toString());
    console.log($.toString());
  }
}

new MainApp();
