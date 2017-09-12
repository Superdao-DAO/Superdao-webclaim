import chartConf from './config/chart';
import barConf from './config/bar';
import uiConf from './config/ui';

const ProgressBar = require('progressbar.js');
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
  registerChart(tokenLeft, tokenBought) {
    if (!this.chart) {
      chartConf.dataProvider[0].litres = tokenLeft;
      chartConf.dataProvider[1].litres = tokenBought;
      this.chart = AmCharts.makeChart(uiConf.chart_element, chartConf);
    }
  }

  registerBar(tokensLeft, tokensBought) {
    if (!this.bar) {
      this.bar = new ProgressBar.Line(uiConf.bar_element, barConf);
      this.updateBar(tokensLeft, tokensBought);
    }
  }

  updateChart(tokensLeft, tokensBought) {
    if (this.chart) {
      const dataProvider = chartConf.dataProvider;
      dataProvider[0].litres = tokensLeft;
      dataProvider[1].litres = tokensBought;
      this.chart.validateData();
    } else {
      this.registerChart(tokensLeft, tokensBought);
    }
  }

  updateBar(tokensLeft, tokensBought) {
    if (this.bar) {
      this.bar.animate(tokensBought / (tokensLeft + tokensBought));
    } else {
      this.registerBar(tokensLeft, tokensBought);
    }
  }
}
