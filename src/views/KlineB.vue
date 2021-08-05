<template>
  <div class="kline">
    <div
      class="kline_container"
      :id="'kline_container_' + xkey"
    ></div>
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
      DIYExchange: "/zhaobiapi",
    };
  },
  mounted() {
    console.log("TradingView-version:", TradingView.version());
    let vm = this;
    setTimeout(() => {
      //在index.html里面已经引入了tradingView,可以直接使用
      vm.widget = createTradingView(vm);

      //当图表准备就绪时调用回调
      vm.widget.onChartReady(() => {
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
        // createStudy(vm.widget, "holdKLine", false, true);
        //这里选择overlay指标，该指标参数就是symbol
        createStudy(vm.widget, "Overlay", false, false,['HOLD:'+this.symbol]);
        // this.config[symbolInfo.exchange] &&
        //   this.config[symbolInfo.exchange].forEach((val) => {
        //     vm.widget
        //       .chart()
        //       .createStudy(
        //         "Overlay",
        //         false,
        //         false,
        //         ["HOLD:" + symbolInfo.name],
        //         (val) => {
        //           entityId.push(val);
        //         }
        //       );
        //   });

        //订阅商品更改时的事件
        vm.widget
          .chart()
          .onSymbolChanged()
          .subscribe(
            null,
            (Subscription) => {
              const changedSymbol = vm.widget
                .activeChart()
                .symbolExt().description;
              this.$emit("symbolChanged", {
                symbol: changedSymbol,
                index: this.yIndex,
              });

              // entityId.forEach((item) => {
              //   vm.widget.chart().removeEntity(item);
              // });
              // entityId = [];
              // this.config[Subscription.exchange] &&
              //   this.config[Subscription.exchange].forEach((val) => {
              //     vm.widget
              //       .chart()
              //       .createStudy(
              //         "Overlay",
              //         false,
              //         false,
              //         ["HOLD:" + Subscription.name],
              //         (val) => {
              //           entityId.push(val);
              //         }
              //       );
              //   });
            },
            false
          );
      });
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


