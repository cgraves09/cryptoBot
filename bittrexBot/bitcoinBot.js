const axios = require('axios');
const keys = require('./config.js');
const Crypto = require('crypto');
const connection = require('./connection.js');
const apiKey = keys.apiKey;
const secret = keys.secret;
let btcBalance;
let usdBalance;
let bidPrice;
let askPrice;
let nonce;
let isBought = true;
let numOfTrades = 0;

var randomString = function(length) {
    let text = '';
    let possible = "0123456789";
    for(let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

function getBalance (){
    nonce = randomString(20);
    let message = 'https://api.bittrex.com/api/v1.1/account/getbalance?apikey=';
    message += apiKey;
    message +=  '&currency=BTC';
    message += '&nonce=' + nonce;
    let signature = Crypto.createHmac('sha512', secret).update(message).digest('hex');
    axios.get(message,{
        method: 'get',
        headers: {
            apisign: signature
        }
    })
    .then(response => {
        btcBalance = response.data.result.Available;
        getPrice();
    }).catch(function(err){
        if (err){
            getBalance();
        };
        
    });
};

function getPrice() {
    axios.get('https://api.bittrex.com/api/v1.1/public/getmarketsummary?market=USDT-BTC')
    .then(response => {
        
         bidPrice = response.data.result[0].Bid;
         askPrice = response.data.result[0].Ask;

        if (!isBought){
            dollarAmount();
        }else if (isBought) {
            sellCoins();
        } else {
            getBalance();
        }
    }).catch(function(err){
        if (err){
            getBalance();
        };
        
    }); 
};

function buyCoins (){
    
    nonce = randomString(20);
    console.log(bidPrice)
    let buyPrice = bidPrice - 10;
    
    let queryString = 'https://api.bittrex.com/api/v1.1/market/buylimit?apikey=';
    queryString += apiKey;
    queryString += '&market=USDT-BTC';
    queryString += '&quantity=0.01';
    queryString += '&rate=' + buyPrice;
    queryString += '&nonce=' + nonce;

    let newSign = Crypto.createHmac('sha512', secret).update(queryString).digest('hex');
    axios.get(queryString,{
        method: 'get',
        headers: {
            apisign: newSign
        }
    })
    .then(response => {
        console.log(numOfTrades)
        
        console.log(response.data)
        if (!response.data.success) {
            console.log('Waiting to sell');
            if (numOfTrades === 9){
                isBought = true;
                numOfTrades = 0;
                let time = 1 * 1000;
                setTimeout(getBalance, time);
            }else {
                numOfTrades++;
                isBought = false;
                let time = 2 * 1000;
                setTimeout(getBalance, time);
            }
            

        } else if (response.data.success) {
            console.log("\n\n\n\nBOUGHT!!!!\n\n\n\n");
            timeStamp = 0;
            isBought = true;
            let time = 1 * 1000;
            setTimeout(getBalance, time);            
        }
    }).catch(function(err){
        if (err){
            getBalance();
        };
        
    });
};

function sellCoins (){
    console.log(numOfTrades);
    nonce = randomString(20);
    let sellPrice = askPrice + 50;
    console.log('\n\n\n\n______________'+ sellPrice + '\n\n\n\n______________')
    let queryString = 'https://api.bittrex.com/api/v1.1/market/selllimit?apikey=';
    queryString += apiKey;
    queryString += '&market=USDT-BTC';
    queryString += '&quantity=0.01';
    queryString += '&rate=' + sellPrice;
    queryString += '&nonce=' + nonce;
    
    let newSign = Crypto.createHmac('sha512', secret).update(queryString).digest('hex');
    axios.get(queryString,{
        method: 'get',
        headers: {
            apisign: newSign
        }
    })
    .then(response => {
        
        if (!response.data.success) {
            console.log('Waiting to buy')
            if (numOfTrades === 9){
                isBought = false;
                numOfTrades = 0;
                let time = 1 * 1000;
                setTimeout(getBalance, time);
            }else {
                numOfTrades++;
                isBought = false;
                let time = 2 * 1000;
                setTimeout(getBalance, time);
            }
            
        } else if (response.data.success){
            console.log("\n\n\n\nSOLD\n\n\n\n");
            timeStamp = 0;
            isBought = true; 
            let time = 1 * 1000;
            setTimeout(getBalance, time);            
        }        
    }).catch(function(err){
        if (err){
            getBalance();
        };
        
    });
};

function dollarAmount (){
    nonce = randomString(20);
    let queryString = 'https://api.bittrex.com/api/v1.1/account/getbalance?apikey=' + apiKey + '&currency=USDT&nonce=' + nonce;
    let newSign = Crypto.createHmac('sha512', secret).update(queryString).digest('hex');
    axios.get(queryString,{
        method: 'get',
        headers: {
            apisign: newSign
        }
    })
    .then(response => {
        usdBalance = response.data.result.Available;
        console.log('\n\n\n Current Amount Made: ' + usdBalance);
        buyCoins();
    }).catch(function(err){
        if (err){
            getBalance();
        };
        
    });
};

getBalance();