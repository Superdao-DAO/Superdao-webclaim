import {apikey, ABI} from './abi';
import {strings} from './strings';
import {Effects} from './effects';

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
    this.effects = new Effects();
    console.log('ok '+apikey+' '+ABI.toString()+' '+strings.toString());
    console.log($.toString());
  }
}

/** Entry Point **/
$(document).ready( function() {
  new MainApp();
});
