const keys = require('./config.js');
const apiKey = keys.apiKey;
const secret = keys.secret;
let timer = 0;
const Binance = require('node-binance-api');
const binance = new Binance().options({
    APIKEY: apiKey,
    APISECRET: secret,
    useServerTime: true,
    recvWindow: 60000, // Set a higher recvWindow to increase response timeout
    verbose: true
});

let bidPriceOne;
let askPriceTwo;
let sellPrice;
let buyPrice;

console.log('BOT IS RUNNING!')

async function trade (){
    
        binance.bookTickers('BTCUSDT', (error, ticker) => {
            if (error){
                console.log('Error bot restarting');
                setTimeout(trade, 2000); 
            } else {
                try {
                    askPriceTwo = ticker.askPrice;
                    askPriceTwo = parseInt(askPriceTwo);
        
                    sellPrice = askPriceTwo + 50;
     
                    sellPrice = String(sellPrice);
                    setTimeout(buySell, 1000);                
                }
                catch (error) {
                    console.log(error);
                    console.log('bot restarting 2');
                    setTimeout(trade, 2000);
                }                
            }

        });
 
}

function buySell() {
        let quantity = 0.01;
       
            binance.sell("BTCUSDT", quantity, sellPrice, {type:'LIMIT'}, (err, response) => {   
                try { 
                    setTimeout(trade, 1000);                    
                } catch (error) {
                    console.log('Bot Restarting');
                    setTimeout(trade, 1000);
                }                 
            });
        
}
trade();