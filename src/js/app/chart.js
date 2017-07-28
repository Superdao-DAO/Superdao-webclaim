const ProgressBar = require('progressbar.js');
const $ = require('jquery');
require('amcharts/dist/amcharts/amcharts.js');
require('amcharts/dist/amcharts/pie.js');

const AmCharts = window.AmCharts;

/**
 * Token sale chart class
 */
export default class {
  /**
   * Class constructor
   */
  constructor() {
    this.constructor.registerChart(90000, 150000);
    this.refreshChart(100, 10);
  }

  /**
   * Create the token status chart
   * @param _tokenLeft
   * @param _tokenBought
   */
  static registerChart(_tokenLeft, _tokenBought) {
    AmCharts.makeChart('chartdiv', {
      type: 'pie',
      theme: 'light',
      addClassNames: true,
      outlineColor: '#FFFFFF',
      color: '#FFFFFF',
      startDuration: 0,
      fontSize: '10px',
      minRadius: '50',
      pulledField: 'pulled',
      legend: {
        position: 'bottom',
        align: 'center',
        color: '#FFFFFF',
        autoMargins: false,
        markerType: 'circle',
        verticalGap: 8,
        spacing: 10,
      },
      dataProvider: [{
        country: 'tokenLeft',
        litres: _tokenLeft,
        color: '#9ACD32',
      }, {
        country: 'tokenBought',
        litres: _tokenBought,
        color: 'red',
        pulled: true,

      }],
      valueField: 'litres',
      titleField: 'country',
      colorField: 'color',
      balloon: {
        fixedPosition: true,
      },
      export: {
        enabled: false,
      },
    });
  }

  static blink() {
    $('#presale-over').fadeOut(500).fadeIn(500);
  }

  refreshChart(claimedPrepaidUnits, claimedUnits) {
    const promissoryUnits = 3000000;
    this.tokenBought = claimedUnits + claimedPrepaidUnits;
    this.tokenLeft = promissoryUnits - this.tokenBought;
    if (this.tokenLeft === 0) {
      $('#tokensLeft').html('Pre-Sale Over');
      $('#presale-over').html('<h2>Pre-Sale Over</h2>');
      if (this.isblinking) clearInterval(this.isblinking);
      this.isblinking = setInterval(this.blink, 1000);
      this.blink();
    }

    if (this.tokensLeft) {
      $('#tokensLeft').html(this.tokenLeft);
    }
    if (this.tokenBought) {
      $('#tokensBought').html(this.tokenBought);
    }

    if (!this.bar) {
      this.bar = new ProgressBar.Line('.progressbar-container', {
        strokeWidth: 4,
        easing: 'easeInOut',
        duration: 1400,
        color: '#9ACD32',
        trailColor: '#9ACD32',
        trailWidth: 1,
        svgStyle: {
          width: '80%',
          height: '100%',
        },
        text: {
          style: {
            // Text color.
            // Default: same as stroke color (options.color)
            color: 'white',
            position: 'absolute',
            right: '20%',
            top: '10px',
            padding: 0,
            margin: 0,
            transform: null,
          },
          autoStyleContainer: false,
        },
        from: {
          color: '#9ACD32',
        },
        to: {
          color: '#ED6A5A',
        },
        step(state, bar) {
          bar.setText(`${parseFloat(bar.value() * 100).toFixed(2)
          } %`);
        },
      });
    }
    if (this.bar) {
      this.bar.animate(this.tokenBought / (this.tokenLeft + this.tokenBought));
    } // Number from 0.0 to 1.0
    // Return values to be used in the Amchart
    return [this.tokenBought, this.tokenLeft];
  }
}
