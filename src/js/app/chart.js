import chartConf from './config/chart';
import barConf from './config/bar';

const ProgressBar = require('progressbar.js');
const $ = require('jquery');
require('amcharts3');
require('amcharts3/amcharts/pie');

const AmCharts = window.AmCharts;

/**
 * Token sale chart class
 */
export default class {
  /**
   * Create the token status chart
   * @param _tokenLeft
   * @param _tokenBought
   */
  static registerChart(_tokenLeft, _tokenBought) {
    chartConf.dataProvider[0].litres = _tokenLeft;
    chartConf.dataProvider[1].litres = _tokenBought;
    AmCharts.makeChart('chartdiv', chartConf);
  }

  static blink() {
    $('#presale-over').fadeOut(500).fadeIn(500);
  }

  refreshChartBar(tokensLeft, tokensBought) {
    if (tokensLeft === 0) {
      $('#tokensLeft').html('Pre-Sale Over');
      $('#presale-over').html('<h2>Pre-Sale Over</h2>');
      if (this.isblinking) clearInterval(this.isblinking);
      this.isblinking = setInterval(this.blink, 1000);
      this.blink();
    }

    if (tokensLeft) {
      $('#tokensLeft').html(tokensLeft);
    }
    if (tokensBought) {
      $('#tokensBought').html(tokensBought);
    }

    if (!this.bar) {
      this.bar = new ProgressBar.Line('.progressbar-container', barConf);
    }
    if (this.bar) {
      this.bar.animate(tokensBought / (tokensLeft + tokensBought));
    } // Number from 0.0 to 1.0
  }
}
