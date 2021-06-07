<template>
  <div class="kline">
    <div class="kline_container" :id="'kline_container_' + xkey"></div>
  </div>
</template>

<script>
import { createTradingView } from "../utilities/createTradingView";
import { createStudy } from "../utilities/createStudy";
// import overrides from "../utilities/overrides";
export default {
  props: ["symbol", "interval", "exchange", "xkey", "createDelay", "yIndex"],
  data() {
    return {
      widget: null,
      baseUrl: process.env.BASE_URL,
      config: {
        ZHAOBI: ["HOLD"],
        MT4: ["EASYFOREX", "OANDA"],
      },
    };
  },
  mounted() {
    console.log("TradingView-version:", TradingView.version());
    let vm = this;
    // console.log(this.baseUrl);
    // const query=this.$route.query;
    // let symbolQuery={name:query.name,exchange:query.exchange}
    //
    // if(symbolQuery.name&&!symbolQuery.exchange){
    //   symbolQuery.exchange='ZHAOBI'
    // }
    // if(!symbolQuery.name){
    //   symbolQuery=null;
    // }
    setTimeout(() => {
      //在index.html里面已经引入了tradingView,可以直接使用
      vm.widget = createTradingView(vm);

      //当图表准备就绪时调用回调
      vm.widget.onChartReady(() => {
        var entityId = [];
        //createStudy用来创建指标
        vm.widget.headerReady().then(() => {
          const themeChangeButton = vm.widget.createButton();
          themeChangeButton.textContent = "主题切换";
          themeChangeButton.addEventListener("click", () => {
            this.changeTheme();
          });
        });
        createStudy(
          vm.widget,
          "Moving Average",
          false,
          false,
          [5, "close", 0],
          null,
          {
            "Plot.color": "#965fc4",
          }
        );
        createStudy(
          vm.widget,
          "Moving Average",
          false,
          false,
          [10, "close", 0],
          null,
          {
            "Plot.color": "#84aad5",
          }
        );
        createStudy(
          vm.widget,
          "Moving Average",
          false,
          false,
          [30, "close", 0],
          null,
          {
            "Plot.color": "#55b263",
          }
        );
        createStudy(
          vm.widget,
          "Moving Average",
          false,
          false,
          [60, "close", 0],
          null,
          {
            "Plot.color": "#b7248a",
          }
        );
        createStudy(vm.widget, "Bollinger Bands", false, false, [20, 2]);
        createStudy(vm.widget, "Bollinger Bands", false, false, [50, 2]);
        createStudy(vm.widget, "Bollinger Bands", false, false, [100, 2]);
        // createStudy(vm.widget, "Volume", false, false, [100, 4]);

        // vm.widget.activeChart().createShape(
        //   [
        //     { time: Date.now() / 1000 - 500 * 24 * 3600 * 1000, price: 150 },
        //     { time: Date.now() / 1000, price: 150 },
        //   ],
        //   {
        //     shape: "trend_line",
        //     lock: true,
        //     disableSelection: true,
        //     disableSave: true,
        //     disableUndo: true,
        //     text: "text",
        //     backgroundColor: "red"
        //   }
        // );
        // vm.widget.chart().createStudy("Bollinger Bands",false,false,[200,2])
        // vm.widget.chart().createStudy("Bollinger Bands",false,false,[500,2])

        // this.config[symbolInfo.exchange] && this.config[symbolInfo.exchange].forEach( val => {
        //   vm.widget.chart().createStudy('Overlay', false, false, [val + ':' + symbolInfo.name], (val)=>{
        //     entityId.push(val);
        //   });
        // })
        // vm.widget
        //   .activeChart()
        //   .onIntervalChanged()
        //   .subscribe(null, () => {
        //     console.log("周期改变了");
        //   });
        // setTimeout(() => {
        //   vm.widget.activeChart().setSymbol("BTSUSDT", () => {
        //     console.log("商品改变完了");
        //   });
        // }, 3000);
        // setTimeout(()=>{
        //   vm.widget.chart().setChartType(9)
        // },4000)

        vm.widget
          .chart()
          .onIntervalChanged()
          .subscribe(null, (interval, timeframeObj) => {
            
          });

        //订阅商品更改时的事件
        vm.widget
          .chart()
          .onSymbolChanged()
          .subscribe(
            null,
            (Subscription) => {
              const changedSymbol = vm.widget.activeChart().symbolExt()
                .description;
              this.$emit("symbolChanged", {
                symbol: changedSymbol,
                index: this.yIndex,
              });
              //当商品更改时，便利entityId，移除item
              entityId.forEach((item) => {
                vm.widget.chart().removeEntity(item);
              });
              entityId = [];
              // localStorage.setItem('SymbolInfo', JSON.stringify(Subscription));
              // this.config[Subscription.exchange] && this.config[Subscription.exchange].forEach( val => {
              //   vm.widget.chart().createStudy('Overlay', false, false, [val + ':' + Subscription.name], (val)=>{
              //     entityId.push(val);
              //   });
              // })
            },
            false
          );
      });
      // vm.widget.headerReady().then(function () {
      //   var button = vm.widget.createButton();
      //   button.setAttribute("title", "My custom button tooltip");
      //   button.addEventListener("click", function () {
      //     alert("My custom button pressed!");
      //   });
      //   button.textContent = "葛晓康自定义按钮";
      // });
    }, this.createDelay);
  },
  methods: {
    changeTheme(type) {
      if (type) {
        this.widget.changeTheme(type);
      } else {
        this.widget.changeTheme(
          this.widget.getTheme() == "dark" ? "light" : "dark"
        );
      }

      // this.widget.applyOverrides(overrides);
    },
  },
  beforeDestroy() {
    // for (let id of window.KLINEINTERVALS) {
    //   clearInterval(id);
    // }
    // window.KLINEINTERVALS = [];
  },
};
</script>
<style lang="less">
// .kline,
// .kline_container {
//   height: 100%;
// }

.kline_container {
  height: 100%;
  // iframe {
  //   height: 100%;
  // }
}

/*.kline_container {*/
/*  border: 1px solid black;*/

/*  &:focus-within {*/
/*    border-color: red;*/
/*  }*/
/*}*/
</style>


