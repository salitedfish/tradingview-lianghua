import { isMobile } from "./tools"

const createTradingView = (vm, config = {}) => {
    //定义symbol,从vue实例的参数中获取数据
    // console.log(vm.exchange)
    // console.log(vm.symbol)
    // console.log(vm.interval)
    // console.log(vm.xkey)
    const symbolInfo = vm.symbol
        ? { name: vm.symbol, exchange: vm.exchange || "ZHAOBIBI" }
        : {
            name: "ETHUSDT",
            exchange: "ZHAOBI",
        };

    //设置tradingview的默认参数
    const defaultConfig = {
        //根据屏幕自适应大小
        autosize: true,
        // fullscreen: true,
        // width: "100%",
        // height: "100%",
        //周期，可以设置60s或60，没写单位代表60分钟，小时必须用分钟表示。用来设置每个K线间隔的时间
        // interval:  "1D",
        interval: vm.interval || "60",
        //初始商品名
        symbol: symbolInfo.name.toUpperCase(),
        //挂载的dom元素
        container_id: "kline_container_" + vm.xkey,
        // datafeed: new Datafeeds.UDFCompatibleDatafeed("http://172.16.103.31:15921/kdata",10000),
        //采用接口提供数据
        datafeed: new Datafeeds.UDFCompatibleDatafeed(
            vm.DIYExchange,
            vm.xkey == 'reAnalyse'?360000000:10000,//哈哈，量化回归分析100个小时请求一次数据,
        ),
        //设置static文件夹路径
        library_path: `${vm.baseUrl}kline/charting_library/`,
        locale: "zh",
        timezone: "Asia/Shanghai", // 设置时区
        charts_storage_api_version: "1.1",
        client_id: "tradingview.com",
        user_id: "public_user_id",
        debug: false,
        // loading_screen: { backgroundColor: "#000000", foregroundColor: "#000000", },//todo:do it
        allow_symbol_change: true,
        theme: "Light",
        // timeframe: isMobile()?"720":"1d",//设置初始的时间展示范围,
        timeframe:vm.xkey == 'reAnalyse'?'1d': isMobile()?"720":"1d",//设置初始的时间展示范围
        // toolbar_bg: "#FFF",
        //点击改变周期，将周期转化为resolution写的周期
        time_frames: vm.xkey == 'reAnalyse'?[]:[
            { text: "1y", resolution: "2D", title: "1年" },
            { text: "6m", resolution: "2D", title: "6个月" },
            { text: "3m", resolution: "1D", title: "3个月" },
            { text: "1m", resolution: "1D", title: "1个月" },
            { text: "7d", resolution: "60", title: "7天" },
            { text: "3d", resolution: "15", title: "3天" },
            { text: "1d", resolution: "5", title: "1天" },
        ],
        custom_indicators_getter: function (PineJS) {
            return Promise.resolve([
                {
                    // 将<study name>替换为您的指标名称
                    // 它将由图表库内部使用
                    name: "holdKLine",
                    metainfo: {
                        "_metainfoVersion": 40,
                        "id": "holdKLine@tv-basicstudies-1",
                        "scriptIdPart": "",
                        "name": "holdKLine",
                        // 此说明将显示在指标窗口中
                        // 当调用createStudy方法时，它也被用作“name”参数
                        "description": "holdKLine",
                        // 该描述将显示在图表上
                        "shortDescription": "holdKLine",
                        "is_hidden_study": true,
                        "is_price_study": false,
                        "isCustomIndicator": true,
                        "plots": [{ "id": "plot_0", "type": "line" }],
                        "defaults": {
                            "styles": {
                                "plot_0": {
                                    "linestyle": 0,
                                    "visible": true,
                                    // 绘图线宽度
                                    "linewidth": 1,
                                    // 绘制类型:
                                    //    1 - 直方图
                                    //    2 - 线形图
                                    //    3 - 十字指针
                                    //    4 - 山形图
                                    //    5 - 柱状图
                                    //    6 - 圆圈图
                                    //    7 - 中断线
                                    //    8 - 中断区块
                                    "plottype":2,
                                    // 显示价格线?
                                    "trackPrice": true,
                                    // 绘制透明度，百分比。
                                    "transparency": 40,
                                    // 以#RRGGBB格式绘制颜色
                                    "color": "#880000"
                                }
                            },
                            // 指标输出值的精度
                            // (小数点后的位数)。
                            "precision": 2,
                            "inputs": {}
                        },
                        "styles": {
                            "plot_0": {
                                // 输出的名字将在样式窗口显示
                                "title": "holdKline",
                                "histogramBase": 0,
                            }
                        },
                        "inputs": [],
                    },
                    constructor: function () {
                        this.init = function (context, inputCallback) {
                            this._context = context;
                            this._input = inputCallback;
                            // 定义要绘制的商品。
                            // 商品应该是一个字符串。
                            // 您可以使用PineJS.Std.ticker（this._context）获取所选商品的代码。
                            // 例,
                            //    var symbol = "AAPL";
                            //    var symbol = "#EQUITY";
                            //    var symbol = PineJS.Std.ticker(this._context) + "#TEST";
                            var symbol = "HOLD:ETHUSDT";
                            this._context.new_sym(symbol, PineJS.Std.period(this._context), PineJS.Std.period(this._context));
                        };
                        this.main = function (context, inputCallback) {
                            // window.console.log(this._context)
                            this._context = context;
                            this._input = inputCallback;
                            this._context.select_sym(1);
                            // 您可以在PineJS.Std对象中使用以下内置函数：
                            //     open, high, low, close
                            //    hl2, hlc3, ohlc4
                            var o = PineJS.Std.open(this._context)
                            var h = PineJS.Std.high(this._context)
                            var l = PineJS.Std.low(this._context)
                            var c = PineJS.Std.close(this._context);
                            // console.log('ooooooooooooo',o)
                            // console.log('hhhhhhhhhhhhh',h)
                            // console.log('lllllllllllll',l)
                            // console.log('ccccccccccccc',c)
                            return [0 - o, 0 - h, 0 - l, 0 - c];
                            // return {
                            //     open: [0 - o],
                            //     high: [0 - h],
                            //     low: [0 - l],
                            //     close: [0 - c]
                            // }

                        }
                    }
                }
            ])
        },
        //设置禁用哪些特性
        disabled_features: [
            // "edit_buttons_in_legend",
            // "header_widget", 
            isMobile()?"left_toolbar":'',
            // "edit_buttons_in_legend",
            "use_localstorage_for_settings",//禁用此功能，否则更改图表一些样式无法及时生效
            // "timeframes_toolbar",
            // "display_market_status",
            // "border_around_the_chart",
            // "context_menus",
            // "property_pages",
            // "dont_show_boolean_study_argument",
            // "source_selection_markers",
            // "caption_buttons_text_if_possible",
            // "volume_force_overlay",
            // "remove_library_container_border",
            // "fundamental_widget",
            "volume_force_overlay",
            // "control_bar", //控制图表工具栏（鼠标移至底部会出现）
            // "legend_widget"
            // "show_chart_property_page"
            'header_settings'
        ],
        //设置开启哪些特性
        enabled_features: [
            // "study_templates",
        ],
        overrides: {
            // "has_no_volume":false,
            // "volumePaneSize": "small",
            // "paneProperties.legendProperties.showLegend": false,

            "mainSeriesProperties.style": 1, // k线图
            // "paneProperties.background": "rgb(27,34,63)", // 背景色透明
            // "paneProperties.background": "#000000",
            // "paneProperties.background": "#ffffff",
            "paneProperties.vertGridProperties.color": "transparent", // 垂直分割线
            "paneProperties.horzGridProperties.color": "rgb(47, 55, 89)", // 水平分割线
            "paneProperties.vertGridProperties.style": 1, //分割线 solid = 0; dotted = 1; dashed = 2; large dashed = 3
            "paneProperties.horzGridProperties.style": 1,
            "scalesProperties.lineColor": "#767D99", //每个panel之间的分割线的颜色
            "scalesProperties.textColor": "#767D99",
            "scalesProperties.fontSize": 12,//改变坐标线的字体大小

            // 'paneProperties.legendProperties.showSeriesTitle': true, // 图表标题
            // 'mainSeriesProperties.lineStyle.color':'#fff',

            //这些是k线图 mainSeriesProperties为1时生效
            // "mainSeriesProperties.candleStyle.upColor": "#5FBD7B", // 蜡烛图阳线颜色
            "mainSeriesProperties.candleStyle.upColor": "#02C076", // 蜡烛图阳线颜色
            "mainSeriesProperties.candleStyle.borderUpColor": "#02C076", // 阳线边框颜色
            "mainSeriesProperties.candleStyle.wickUpColor": "#02C076", // 阳线的影线颜色

            "mainSeriesProperties.candleStyle.downColor": "#F84960", // 蜡烛图阴线颜色
            "mainSeriesProperties.candleStyle.borderDownColor": "#F84960", // 阴线边框颜色
            "mainSeriesProperties.candleStyle.wickDownColor": "#F84960", // 阴线的影线颜色

            //这些是空心k线图 mainSeriesProperties为9时生效
            "mainSeriesProperties.showPriceLine": 1, // 是否显示当前价格线
            "mainSeriesProperties.hollowCandleStyle.upColor": "#02C076",
            "mainSeriesProperties.hollowCandleStyle.borderUpColor": "#02C076",
            "mainSeriesProperties.hollowCandleStyle.wickUpColor": "#02C076",

            "mainSeriesProperties.hollowCandleStyle.downColor": "#F84960",
            "mainSeriesProperties.hollowCandleStyle.wickDownColor": "#F84960",
            "mainSeriesProperties.hollowCandleStyle.borderDownColor": "#F84960",

            "mainSeriesProperties.hollowCandleStyle.drawBorder": false,
        },

        //统一设置指标的属性
        studies_overrides: {
            "volume.volume.color.0": "rgba(180,82,94,.6)",//设置成交量的颜色，0代表跌的时候
            "volume.volume.color.1": "rgba(95,189,123,.6)",//设置成交量颜色，1代表涨的时候
            // "holdKline.style": 2,
            // "volume.volume.transparency": 100
            // 对比K线样式
            // "Overlay.style": 1, // k线图
            // "Overlay.candleStyle.upColor": "#5FBD7B", // 蜡烛图阳线颜色
            // "Overlay.candleStyle.borderUpColor": "#5FBD7B", // 阳线边框颜色
            // "Overlay.candleStyle.wickUpColor": "#5FBD7B", // 阳线的影线颜色

            // "Overlay.candleStyle.downColor": "#B4525E", // 蜡烛图阴线颜色
            // "Overlay.candleStyle.borderDownColor": "#B4525E", // 阴线边框颜色
            // "Overlay.candleStyle.wickDownColor": "#B4525E", // 阴线的影线颜色

            //下面是我感觉正确的颜色
            // "Overlay.style": 1, // k线图
            // "Overlay.candleStyle.upColor": "#02C076", // 蜡烛图阳线颜色
            // "Overlay.candleStyle.borderUpColor": "#02C076", // 阳线边框颜色
            // "Overlay.candleStyle.wickUpColor": "#02C076", // 阳线的影线颜色

            // "Overlay.candleStyle.downColor": "#F84960", // 蜡烛图阴线颜色
            // "Overlay.candleStyle.borderDownColor": "#F84960", // 阴线边框颜色
            // "Overlay.candleStyle.wickDownColor": "#F84960", // 阴线的影线颜色

            "Overlay.style": 1, // k线图
            "Overlay.candleStyle.upColor": "#F84960", // 蜡烛图阳线颜色
            "Overlay.candleStyle.borderUpColor": "#F84960", // 阳线边框颜色
            "Overlay.candleStyle.wickUpColor": "#F84960", // 阳线的影线颜色

            "Overlay.candleStyle.downColor": "#02C076", // 蜡烛图阴线颜色
            "Overlay.candleStyle.borderDownColor": "#02C076", // 阴线边框颜色
            "Overlay.candleStyle.wickDownColor": "#02C076", // 阴线的影线颜色



            // "bollinger bands.upper.linewidth": 10,//用来设置布林带的上规宽度
            // "bollinger bands.lower.linewidth": 10,
            // "Moving Average.plot.color": "#333333",//设置全部均线的默认颜色，后续每次创建均线指标时可以覆盖
        },

    }
    //将用户配置与默认参数合并
    const currentConfig = {}
    Object.assign(currentConfig, defaultConfig, config)
    // console.log('cc', currentConfig)
    //返回tradingview实例
    return new TradingView.widget(currentConfig);

}

export {
    createTradingView
}