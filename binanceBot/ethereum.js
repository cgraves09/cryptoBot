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
let isBought = true;

console.log('BOT IS RUNNING!')


async function trade (){
    
        await binance.useServerTime();
        binance.bookTickers('BNBUSDT', (error, ticker) => {
            try {
                bidPriceOne = ticker.bidPrice;
                askPriceTwo = ticker.askPrice;
                
                bidPriceOne = parseFloat(bidPriceOne);
                askPriceTwo = parseFloat(askPriceTwo);
                sellPrice = askPriceTwo + .03;
                buyPrice = bidPriceOne - .03;
                sellPrice = String(sellPrice);
                buyPrice = String(buyPrice);
                setTimeout(buySell, 1000);                
            }
            catch (error) {
                console.log(error);
                console.log('bot restarting 2');
                setTimeout(trade, 3000);
            }
        });
 
}

function buySell() {
        let quantity = 8;
        if (!isBought){
            binance.buy("BNBUSDT", quantity, buyPrice, {type:'LIMIT'}, (err, response) => {
                try {
                    isBought = true; 
                    setTimeout(trade, 1000);                    
                } catch (error) {
                    console.log('Bot Restarting');
                    setTimeout(trade, 1000);
                }               
            }); 
        }
        else if (isBought){
            binance.sell("BNBUSDT", quantity, sellPrice, {type:'LIMIT'}, (err, response) => {   
                try {
                    isBought = false; 
                    setTimeout(trade, 1000);                    
                } catch (error) {
                    console.log('Bot Restarting');
                    setTimeout(trade, 1000);
                }                 
            });
        }
}
trade();


