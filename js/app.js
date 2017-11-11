var TOKEN_ADDRESS = "",
    TOKEN_DISCOUNT_PRICE = "...",//Value in Ether
    tokenContract,
    tokenInstance,
    claimedUnits,
    claimedPrepaidUnits,
    promissoryUnits = 3000000,
    calls = {
      claimedUnits : "claimedUnits()",
      claimedPrepaidUnits: "claimedPrepaidUnits()"
    },
    isblinking;

const ERR_ACCOUNT_IS_LOCKED = 'Error: account is locked',
      ERR_NO_ACCOUNTS = 'No accounts available. Please, create or unlock your account and refresh the page.',
      ERR_PERSONAL_NOT_AVAILABLE = 'Error: The method personal_unlockAccount does not exist/is not available',
      ERR_NO_METAMASK = 'Metamask is recommened for use. Security!!!',
      ERR_NO_WEB3 = "Web3 not available.";

  window.addEventListener('load', function () {
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    window = typeof window == 'undefined'?{}:window;
    global = typeof global == 'undefined'?{}:global;
    web3 = window.web3 || global.web3;
    if (typeof web3 !== 'undefined') {
      // Use Mist/MetaMask's provider
      window.web3 = new Web3(Web3.givenProvider || web3.currentProvider);
    } else {
      console.log('No web3? You should consider trying MetaMask!');
      alert(ERR_NO_METAMASK);
      // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
      window.web3 = new Web3(
        new Web3.providers.HttpProvider("http://localhost:8545"));
    }
    // Now you can start your app & access web3 freely:
    startApp();
    loadMarquee();
  });

  function loadMarquee(){
   $('.marquee').marquee({
     //If you wish to always animate using jQuery
     allowCss3Support: true,
     //works when allowCss3Support is set to true - for full list see http://www.w3.org/TR/2013/WD-css3-transitions-20131119/#transition-timing-function
     css3easing: 'linear',
     //requires jQuery easing plugin. Default is 'linear'
     easing: 'linear',
     //pause time before the next animation turn in milliseconds
     delayBeforeStart: 0,
     //'left', 'right', 'up' or 'down'
     direction: 'left',
     //true or false - should the marquee be duplicated to show an effect of continues flow
     duplicated: true,
     //speed in milliseconds of the marquee in milliseconds
     duration: 10000,
     //gap in pixels between the tickers
     gap: 20,
     //on cycle pause the marquee
     pauseOnCycle: false,
     //on hover pause the marquee - using jQuery plugin https://github.com/tobia/Pause
     pauseOnHover: true,
     //the marquee is visible initially positioned next to the border towards it will be moving
     startVisible: false
   });
  }

  function startApp() {
    if (typeof web3 !== "undefined" && web3 instanceof Web3) {
      //Ensure we are on the right network
      web3.version.getNetwork(function (err, netId) {
        network = netId;
        switch (netId) {
          case "1":
            console.log('This is mainnet');
            break;
          case "2":
            console.log(
              'This is the deprecated Morden test network.');
            break;
          case "3":
            console.log('This is the ropsten test network.');
            break;
          default:
            console.log('This is an unknown network.');
        }
        if (netId !== "1") {
          disable_button();
          alert(
            "Kindly switch to the Main Ethereum network, then refresh the page to claim Tokens.");
          //return;TODO uncomment for prod
        }
        loadContract(netId)
      });

    } else {
      disable_button();
      alert(ERR_NO_WEB3);
    }


    refresh_values();
    setInterval(
      function () {
        refresh_values();
      }, 15000);

    $('#claim_value').on('input', function () {
      var
        _value = this.value,
        tokens = Math.floor(_value / TOKEN_DISCOUNT_PRICE),
        tokenLeft = promissoryUnits-claimedUnits-claimedPrepaidUnits;

        if(tokens > tokenLeft){
          tokens = tokenLeft;
          var maxeth = tokens*TOKEN_DISCOUNT_PRICE
          $('#claim_value').val(maxeth)
        }

        $('#claim_button').text('Claim [' + tokens + '] Tokens');
    });
  }

  var getAddresses = function(accounts_count){
      accounts_count = typeof web3.eth.accounts == 'object'?web3.eth.accounts.length:0

      if (accounts_count === 0) {
        alert(ERR_NO_ACCOUNTS);
        add_to_log(ERR_NO_ACCOUNTS);
        disable_button();
        return;
      }
      var $accounts = $('#eth_accounts');
      for (var i = 0; i < accounts_count; i++) {
        var $option = $('<option>').attr('value',
          web3.eth.accounts[i]).text(web3.eth.accounts[i]);
        $accounts.append($option);
      }
      getAddressBalance();
  }

  var loadContract = function(network){
    //if(network == '1')TODO uncomment for prod
    try {
      accounts_count = web3.eth.accounts.length;
      tokenContract = web3.eth.contract(config.abi);
      tokenInstance = tokenContract.at(config.address);
      enable_button();
      log_events(tokenInstance);
    } catch (e) {
      console.log(e);
      disable_button();
      alert(
        'Cannot initiate token contract instance. Please, make sure your node has RPC available.');
        add_to_log('Error: cannot initiate token contract instance.');
        return;
    }
    getAddresses();
  }

  var roundPrecise = function (number, precision) {
    var factor = Math.pow(10, precision);
    var tempNumber = number * factor;
    var roundedTempNumber = Math.round(tempNumber);
    return roundedTempNumber / factor;
  };

  function getFunctionSignature(fnx){
    return web3.sha3(fnx).substring(0,10);
  }

  function getGasPrice(){
    web3.eth.getGasPrice(function(e,r){

      if(e)
        return false;
      var gas = web3.fromWei( r , 'gwei');
      $('#gas_price').val(gas+' GWEI')
    })
  }

  function getAddressBalance(){
    var addressbox = $('#eth_accounts'),
    address = addressbox.val(),
    balbox = $('#tokn_bal');

    if(!web3.isAddress(address )){
      balbox.val(0);
      return;
    }

    function fetchNext(){
      tokenInstance.checkBalance.call(address,index,{from:address},function(e,r){
        if(e)
          return alert('Unable to fetch Token balance');
        if(Number(r[1]) > 0)
          claimed.push(r[1]);
        empty = r[4] == false;
        if(!empty){
          index++;
          fetchNext();}
        else{
          var total = claimed.reduce(function add(a, b) {
            return Number(a) + Number(b);
          },0);
          balbox.text(total.toLocaleString()+ ' ['+index+' Txns ]')
        }
      });
    }

    var empty=false,
    index=0,claimed=[];
    balbox.text('...');
    fetchNext();
  }

  function fetchContractData(){
    claimedPrepaidUnits = claimedUnits = 0;
    return $.post(config.apiaddress,{
      action:"eth_call",
      apikey:config.apikey,
      module:"proxy",
      to:config.address,
      data:getFunctionSignature(calls["claimedPrepaidUnits"]),
      })
          .then(function(d,e){
              claimedPrepaidUnits = web3.toDecimal(d.result);
              //console.log("claimed prepaid",claimedPrepaidUnits);
          })
          .then(function(){
            return $.post(config.apiaddress,{
              action:"eth_call",
              apikey:config.apikey,
              module:"proxy",
              to:config.address,
              data:getFunctionSignature(calls["claimedUnits"]),
            })
            .then(function(d,e){
                claimedUnits = web3.toDecimal(d.result);
                //console.log("claimed",claimedUnits);
            })
          })
  }

  function claim() {
    console.log('Claim')
    if (!tokenInstance) {
      return;
    }
    var
      transactionId,
      _gasPrice = +$('#gas_price').val(),
      _value = +$('#claim_value').val(),
      tokenCountCheck = roundPrecise(_value % TOKEN_DISCOUNT_PRICE, 11);
    if(!(_value > 0))return;//Ensure at least one token is bought
    if (tokenCountCheck !== TOKEN_DISCOUNT_PRICE) {
      _value = roundPrecise(_value - tokenCountCheck, 11);
      $('#claim_value').val(_value);
    }
    if (_value === 0) {
      return;
    }
    var gas = new RegExp(/(\d)+/,'i').exec('20 GWEI')[0];

    disable_button();
    var options = {
      from: $('#eth_accounts').val(),
      value: web3.toWei(_value, 'ether')
    }
    if(Number(gas) > 0)
        options.gasPrice = web3.toWei(gas,'GWEI');

    try {
      transactionId = tokenInstance.claim(options,
       function (error, result) {
        if (!error) {
          _value = +$('#claim_value').val("");
          notify.note('Transaction sent: <a href="https://etherscan.io/tx/'
            + result + '" target="_blank">' + result + '</a>','success');
          //add_to_log('Transaction sent: <a href="https://etherscan.io/tx/'
          //  + result + '" target="_blank">' + result + '</a>');
        } else {
          error = error.toString();
          console.log(error);
          if (Object.keys(error)) {
            if (error.indexOf('Error: Error:') > -1) {
              error = error.substring(13);
              if (error.length > 58) {
                error = error.substring(0, 58) + "...";
              }
            }
            add_to_log('<span style="color:red">' + error
              + '</span>');
          }
        }
        refresh_values();
        enable_button();
      })
    } catch (e) {
      console.log("Excep:", e);
      add_to_log('<span style="color:red">' + e.message + '</span>');
      enable_button();
    }
  }
  function add_to_log(text) {
    $('#eth_log').append($('<div>').html(text).addClass('log_row'));
  }
  function log_events(contractInstance) {
    var events = contractInstance.TokensClaimedEvent({
      fromBlock: 'latest'
    });
    events.watch(function (error, event) {
      if (!error) {
        console.log(event);
        var
          event_name = 'Event ' + event.event,
          event_args = [];
        if (event.args.length !== 0) {
          for (var arg_name in event.args) {
            event_args.push(arg_name + ':' + event.args[arg_name]);
          }
        }
        console.log(event_name + '(' + event_args.join(',') + ')');
      }
    });
  }
  function disable_button() {
    $("#claim_button").prop('disabled', true);
    console.log('do disable')
  }
  function enable_button() {
    $("#claim_button").prop('disabled', false);
    console.log('do enable')
  }
  function refresh_values() {
      getGasPrice();
      fetchContractData()
      .then(function(a,b){
        //console.log("in then",claimedPrepaidUnits, claimedUnits)
        refresh_chart(claimedPrepaidUnits, claimedUnits);
      });
  }

  function blink() {
    $("#presale-over").fadeOut(500);
    $("#presale-over").fadeIn(500);
  }

  function refresh_chart(claimedPrepaidUnits, claimedUnits) {
    this.tokenBought = claimedUnits + claimedPrepaidUnits;
    this.tokenLeft = promissoryUnits - this.tokenBought;
    updateChart(this.tokenLeft,this.tokenBought);
    updateTexts(this.tokenLeft,this.tokenBought,claimedPrepaidUnits);

    if (tokensLeft === 0) {
      $("#tokensLeft").html("Pre-Sale Over");
      $("#presale-over").html("<h2>Pre-Sale Over</h2>");
      if(isblinking)clearInterval(isblinking);
      isblinking = setInterval(blink, 1000);
      blink();
    }
    if (tokensLeft) {
      $("#tokensLeft").html(tokenLeft);
    }
    if (tokenBought) {
      $("#tokensBought").html(tokenBought);
    }

    // Return values to be used in the Amchart
    return [tokenBought, tokenLeft];
  }

  function updateTexts(tokensLeft,tokensBought,prepaid){
    thisRound = promissoryUnits - prepaid,
    discPrice = (prices.tkn_prc*prices.usd_btc*prices.btc_eth).toFixed(2);

    //Update Texts
    $('#prom_tkns').text(promissoryUnits);
    $('#ths_rnd').text(thisRound);
    $('#tkns_lft').text(tokensLeft);
    $('#tkns_bgh').text(tokensBought);
    $('#tkns_bgh').text(tokensBought);
    $('#tkns_bgh').text(tokensBought);
    $('#tkns_dsc_prc').text(prices.tkn_prc+'ETH [ $'+discPrice+' ]');
  }
