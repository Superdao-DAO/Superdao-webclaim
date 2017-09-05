export default {
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
};
