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

  refreshChart(tokensLeft, tokensBought) {
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
      this.bar.animate(tokensBought / (tokensLeft + tokensBought))
    } // Number from 0.0 to 1.0
    // Return values to be used in the Amchart
    return [tokensBought, tokensLeft];
  }
}
