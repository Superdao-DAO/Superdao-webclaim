export default {
  ether_price_uri(name, currency) {
    return `https://min-api.cryptocompare.com/data/price?fsym=${name}&tsyms=${currency}`;
  },
}
