const exmo = require("./exmo");

const apiKey = 'Key';
const apiSecret = 'Secret';

const currency1 = 'BTC';
const currency2 = 'USD';
const currency1MinQuantity = 0.0001;

const orderLifeTime = 15;
const stockFee = 0.003;
const avgPricePeriod = 1;

const canSpend = 43;
const profit = 0.005;

const stockTimeOffset = 0;

currentPair = currency1+'_'+currency2;

exmo.init_exmo({key:apiKey, secret:apiSecret});

//exmo.api_query("user_info", { }, result => console.log(result));

var rounded = function(number){
    return +number.toFixed(2);
}

var trand = function(){
return 'up';
}

function trade(){
exmo.api_query("trades",{"pair":currentPair}, result => {
exmo.api_query('user_info',{}, result_b => {

res_b = JSON.parse(result_b);
        
        


var get_price = function(period){
          	
res = JSON.parse(result);
prices = [];
summ_price = 0;
for(deal in res[currentPair]){
    timePassed = 0;            
    timePassed = (new Date().getTime() / 1000) + stockTimeOffset * 60 * 60 - (res[currentPair][deal].date);
    if(timePassed < period * 60){
        summ_price += parseInt(res[currentPair][deal].price);
        prices.push(parseInt(res[currentPair][deal].price));
    }

}


avgPrice = summ_price / prices.length;

return avgPrice;

}

function first_ord(ord_nam){
balance = res_b.balances[currency1];
balance2 = res_b.balances[currency2];
console.log("Баланс USD: ",balance2);
console.log("Баланс BTC: ",balance);
if(parseInt(balance2) >= parseInt(canSpend)){
    avgPrice = get_price(avgPricePeriod);
    needPrice = rounded(avgPrice*1.0005); 
    ammount = canSpend / needPrice;
              
    if(ammount > currency1MinQuantity){
        if(balance < currency1MinQuantity){
        if(ord_nam < 2){
        console.log('Buy', ammount, needPrice);        
        options = {
            "pair": currentPair,
            "quantity": ammount,
            "price": needPrice,
            "type": 'buy'
        };

        exmo.api_query('order_create', options, res => {
            result = JSON.parse(res);
            if(result.error) console.log(result.error);

            console.log('Создан up-ордер на покупку', result.order_id);
            });
        }
        }
        if(balance >= currency1MinQuantity){
            wannaGet = canSpend + canSpend * (2*stockFee+profit);
            console.log('sell', balance, wannaGet, (wannaGet/balance));

            options = {
                "pair": currentPair,
                "quantity": balance,
                "price": rounded(wannaGet / balance),
                "type": 'sell'
            };
            exmo.api_query("order_create", options, res => {
          	    result = JSON.parse(res);
            if(result.error) console.log(result.error);
          
            console.log("Создан up-ордер на продажу", currency1, result.order_id);
            
            }); 

        }


    }else{
        console.log('Не достаточно средств на создание up-ордера');
    }

}else{
    console.log('Не достаточно средств на создание up-ордера');
}

}





if (trand()=='up'){

openedOrders = exmo.api_query("user_open_orders", { }, result_o=>{
res_o = JSON.parse(result_o);
if(res_o[currentPair] == undefined) console.log('Открытых оредеров нет');
    buyOrders = [];    
    flag=0;
    for(i in res_o[currentPair]){
      console.log(res_o[currentPair][i]);
      if(res_o[currentPair][i].type == 'sell'){
          console.log('Есть открытые ордера на продажу');
          flag=1;
      }else{
        buyOrders.push(res_o[currentPair][i]);
      }
    }

//if(flag==0) first_ord(buyOrders.length);


if(buyOrders.length > 0){
    for(key in buyOrders){
        console.log('Проверка статуса ордера', buyOrders[key]['order_id']);         
        exmo.api_query('order_trades', {"order_id": buyOrders[key]['order_id']}, result_ord => {
            res_ord = JSON.parse(result_ord);       	
          	if(res_ord.result !== false){
				console.log('Выход, продолжаем надеяться докупить валюту по тому курсу, по которому уже купили часть');
          	}else{
          		timePassed = (new Date().getTime() / 1000) + stockTimeOffset * 60 * 60 - (buyOrders[key]['created']);

	            if(timePassed > orderLifeTime * 60){
	                exmo.api_query('order_cancel',{"order_id":buyOrders[key]['order_id']}, res => {
	              		result = JSON.parse(res);
	                  	if(result.error) console.log(result.error);

	                   	console.log(`Отмена ордера, за ${orderLifeTime} минут не удалось купить ${currency1}`);
	                });
	              
	            }else{
	              console.log(`Ордер открыт, со времени создания ордера прошло ${timePassed} секунд`);
	            }
          	}
          });
          
        }
    }else{ 
        balance = res_b.balances[currency1];
        balance2 = res_b.balances[currency2];
        console.log("Баланс USD: ",balance2);

        if(balance >= currency1MinQuantity){
            wannaGet = canSpend + canSpend * (stockFee+profit);
        if(balance<wannaGet*1.5){
            console.log('sell', balance, wannaGet, (wannaGet/balance));
            options = {
                "pair": currentPair,
                "quantity": balance,
                "price": rounded(wannaGet / balance),
                "type": 'sell'
            };
            exmo.api_query("order_create", options, res => {
          	    result = JSON.parse(res);
            if(result.error) console.log(result.error);
          
            console.log("Создан ордер на продажу", currency1, result.order_id);
            
            });
        }else{

            console.log('ОПА, ЛАГАНУЛО!');
        }

        }else{

            if(parseInt(balance2) >= parseInt(canSpend)){
                avgPrice=get_price(avgPricePeriod);
                needPrice = avgPrice - avgPrice * (stockFee + profit);
                ammount = canSpend / needPrice;
                console.log('Buy', ammount, needPrice);
                if(ammount > currency1MinQuantity){
                    options = {
                        "pair": currentPair,
                        "quantity": ammount,
                        "price": rounded(needPrice),
                        "type": 'buy'
                    };

                exmo.api_query('order_create', options, res => {
                	result = JSON.parse(res);
                  	if(result.error) console.log(result.error);

                  	console.log('Создан ордер на покупку', result.order_id);
                });

                }else{
                    console.log('Не достаточно средств на создание ордера');
                }
             }else{
                console.log('Не достаточно средств');
             }

        }

    }


});



}else{
    console.log('down');

}

});
});
}




var timerId = setTimeout(function tick() {
  trade();
  timerId = setTimeout(tick, 10000);
}, 10000);

