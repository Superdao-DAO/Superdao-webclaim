import {apikey, ABI} from './abi';

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
  }
}

new MainApp();
