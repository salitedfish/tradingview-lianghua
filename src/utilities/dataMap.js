const rankDataMap = (count, data) => {
    let KLineData = []
    if (count == "4" || count == "6") {
        const lineOneData = data.slice(0, count / 2);
        const lineTwoData = data.slice(count / 2);
        KLineData = [[...lineOneData], [...lineTwoData]];
    } else if (
        count == "9" ||
        count == "12"
    ) {
        const lineOneData = data.slice(0, count / 3);
        const lineTwoData = data.slice(
            count / 3,
            (count / 3) * 2
        );
        const lineThreeData = data.slice((count / 3) * 2);
        KLineData = [
            [...lineOneData],
            [...lineTwoData],
            [...lineThreeData],
        ];
    } else if (count == "16") {
        const lineOneData = data.slice(0, 4);
        const lineTwoData = data.slice(4, 8);
        const lineThreeData = data.slice(8, 12);
        const lineFourData = data.slice(12);
        KLineData = [
            [...lineOneData],
            [...lineTwoData],
            [...lineThreeData],
            [...lineFourData],
        ];
    }
    return KLineData
}

export {rankDataMap}

export const mapSymbol = (symbol, type) => {
    if(type == 'dydx') {
        switch(symbol){
          case "BTCUSD":
            return "dydx_BTC-USD";
          case "ETHUSD":
            return "dydx_ETH-USD";
        }
    }else if(type == 'okcoin') {
        switch(symbol){
            case "BTCUSD":
              return "okcoin_BTC-USDT-SWAP";
            case "ETHUSD":
              return "okcoin_ETH-USD-SWAP";
          }
    }else if(type == 'huobi') {
        switch(symbol){
          case "BTCUSD":
            return "BTCUSDT";
          case "ETHUSD":
            return "ETHUSDT";
        }
    }
}