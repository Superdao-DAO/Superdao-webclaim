import { apikey, ABI } from './abi';
import strings from './strings';
import Effects from './effects';
import Chart from './chart';

const $ = require('jquery');

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
    this.effects = new Effects();
    this.chart = new Chart();
    console.log(`ok ${apikey} ${ABI.toString()} ${strings.toString()}`);
    console.log($.toString());
  }
}

/**
 * Entry Point
 */
$(document).ready(() => {
  app = new MainApp();
});
