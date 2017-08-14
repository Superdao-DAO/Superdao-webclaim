import api from './api';
import Chart from './chart';
import uiIdentity from './config/ui';

const $ = require('jquery');

export default class {
  constructor() {
    this.elemInsts = {};
  }
  disableElement(elemID) {
    this.elemInsts[elemID] = $(elemID).prop('disabled', true);
  }
  enableElement(elemID) {
    this.getElement(elemID).prop('disabled', false);
  }
  getElement(elemID) {
    if (!(elemID in this.elemInsts)) {
      this.elemInsts[elemID] = $(elemID);
    }
    return this.elemInsts[elemID];
  }
  refreshValues() {
    this.api.fetchContractData()
      .then(() => {
        console.log('in then', api.claimedPrepaidUnits, api.claimedUnits);
        const values = Chart.refresh_chart(api.claimedPrepaidUnits, api.claimedUnits);
        Chart.amChart(values[1], values[0]);
      });
  }
  addToLog(text) {
    this.$(uiIdentity.logging_element).append($('<div>').html(text).addClass('log_row'));
  }
  /* logEvents(contractInstance) {
    const events = contractInstance.TokensClaimedEvent({
      fromBlock: 'latest',
    });
    events.watch((error, event) => {
      if (!error) {
        console.log(event);
        const eventName = 'Event ' + event.event;
        const eventArgs = [];
        if (event.args.length !== 0) {
          for (const argName in event.args) {
            eventArgs.push(argName + ':' + event.args[argName]);
          }
        }
        console.log(eventName + '(' + eventArgs.join(',') + ')');
      }
    });
  } */
}
