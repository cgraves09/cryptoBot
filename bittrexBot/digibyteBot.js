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
console.log('BOT IS RUNNING!')

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
    message +=  '&currency=DGB';
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
    axios.get('https://api.bittrex.com/api/v1.1/public/getmarketsummary?market=BTC-DGB')
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
    
    let buyPrice = bidPrice;
    
    let queryString = 'https://api.bittrex.com/api/v1.1/market/buylimit?apikey=';
    queryString += apiKey;
    queryString += '&market=BTC-DGB';
    queryString += '&quantity=2000';
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
       
        if (!response.data.success) {
            
            if (numOfTrades === 3){
                isBought = true;
                
                let time = 1 * 1000;
                setTimeout(getBalance, time);
            }else {
                
                isBought = false;
                let time = 2 * 1000;
                setTimeout(getBalance, time);
            }
            

        } else if (response.data.success) {
            
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
    
    nonce = randomString(20);
    let sellPrice = askPrice;
    
    let queryString = 'https://api.bittrex.com/api/v1.1/market/selllimit?apikey=';
    queryString += apiKey;
    queryString += '&market=BTC-DGB';
    queryString += '&quantity=2000';
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
            
            if (numOfTrades === 3){
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
    let queryString = 'https://api.bittrex.com/api/v1.1/account/getbalance?apikey=' + apiKey + '&currency=BTC&nonce=' + nonce;
    let newSign = Crypto.createHmac('sha512', secret).update(queryString).digest('hex');
    axios.get(queryString,{
        method: 'get',
        headers: {
            apisign: newSign
        }
    })
    .then(response => {
        usdBalance = response.data.result.Available;
        
        buyCoins();
    }).catch(function(err){
        if (err){
            getBalance();
        };
        
    });
};

getBalance();