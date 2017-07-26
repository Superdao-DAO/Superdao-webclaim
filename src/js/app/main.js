import {apikey, ABI} from './abi';
import {strings} from './strings';

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
    console.log('ok '+apikey+' '+ABI.toString()+' '+strings.toString());
    console.log($.toString());
  }
}

/* Entry Point **/
$(document).ready( function() {
  new MainApp();
});
