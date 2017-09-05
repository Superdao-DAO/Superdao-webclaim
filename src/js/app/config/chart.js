export default {
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
    litres: 0,
    color: '#9ACD32',
  }, {
    country: 'tokenBought',
    litres: 0,
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
};
