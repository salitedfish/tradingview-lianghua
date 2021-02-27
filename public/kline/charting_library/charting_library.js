var initTradingView = function (window) {
  "use strict";

  function e(t, o) {
    var i = assign({}, t);
    for (var s in o) "object" != typeof t[s] || null === t[s] || Array.isArray(t[s]) ? void 0 !== o[s] && (i[s] = o[s]) : i[s] = e(t[s], o[s]);
    return i
  }

  function version() {
    return "1.12 (internal id 630b704a @ 2018-06-06 02:16:11.305509)"
  }

  function i(t) {
    window.addEventListener("DOMContentLoaded", t, !1)
  }

  var assign = Object.assign || function (t) {
    for (var e, o = arguments, i = 1, n = arguments.length; i < n; i++) {
      e = o[i];
      for (var s in e) Object.prototype.hasOwnProperty.call(e, s) && (t[s] = e[s])
    }
    return t
  }

  var s = {
    mobile: {
      disabled_features: ["left_toolbar", "header_widget", "timeframes_toolbar", "edit_buttons_in_legend", "context_menus", "control_bar", "border_around_the_chart"],
      enabled_features: []
    }
  }

  var r = {
      width: 800,
      height: 500,
      symbol: "AA",
      interval: "D",
      timezone: "UTC",
      container_id: "",
      library_path: "",
      locale: "en",
      widgetbar: {
        details: !1,
        watchlist: !1,
        watchlist_settings: {
          default_symbols: []
        }
      },
      overrides: {
        "mainSeriesProperties.showCountdown": !1
      },
      studies_overrides: {},
      brokerConfig: {
        configFlags: {}
      },
      fullscreen: !1,
      autosize: !1,
      disabled_features: [],
      enabled_features: [],
      debug: !1,
      logo: {},
      time_frames: [{
        text: "5y",
        resolution: "W"
      }, {
        text: "1y",
        resolution: "W"
      }, {
        text: "6m",
        resolution: "120"
      }, {
        text: "3m",
        resolution: "60"
      }, {
        text: "1m",
        resolution: "30"
      }, {
        text: "5d",
        resolution: "5"
      }, {
        text: "1d",
        resolution: "1"
      }],
      client_id: "0",
      user_id: "0",
      charts_storage_api_version: "1.0",
      favorites: {
        intervals: [],
        chartTypes: []
      }
    }

  window.TradingView = window.TradingView || {};
  window.TradingView.version = version;
  window.TradingView.onready = i;
  window.TradingView.widget = function () {
      function w(options) {
          this._id = "tradingview_" + (1048576 * (1 + Math.random()) | 0).toString(16).substring(1);
          this._ready = false;
          this._readyHandlers = []
          this._onWindowResize = this._autoResizeChart.bind(this)
          if (!options.datafeed){
              throw new Error("Datafeed is not defined");
          }
          this._options = e(r, options)
          if (options.preset) {
              var o = s[options.preset];
              o ? (void 0 !== this._options.disabled_features ? this._options.disabled_features = this._options.disabled_features.concat(o.disabled_features) : this._options.disabled_features = o.disabled_features, void 0 !== this._options.enabled_features ? this._options.enabled_features = this._options.enabled_features.concat(o.enabled_features) : this._options.enabled_features = o.enabled_features) : console.warn("Unknown preset: `" + t.preset + "`")
          }
          this._create()
      }
      w.prototype.onChartReady = function (t) {
          this._ready ? t.call(this) : this._readyHandlers.push(t)
      }
      w.prototype.onGrayedObjectClicked = function (t) {
          this._innerAPI().onGrayedObjectClicked(t)
      }
      w.prototype.onShortcut = function (t, e) {
          this._innerWindow().createShortcutAction(t, e)
      }
      w.prototype.subscribe = function (t, e) {
          this._innerAPI().subscribe(t, e)
      }
      w.prototype.unsubscribe = function (t, e) {
          this._innerAPI().unsubscribe(t, e)
      }
      w.prototype.chart = function (t) {
          return this._innerAPI().chart(t)
      }
      w.prototype.setLanguage = function (t) {
          this.remove(), this._options.locale = t, this._create()
      }
      w.prototype.setSymbol = function (t, e, o) {
          this._innerAPI().changeSymbol(t, e + "", o)
      }
      w.prototype.remove = function () {
          window.removeEventListener("resize", this._onWindowResize), this._readyHandlers.splice(0, this._readyHandlers.length), delete window[this._id];
          var t = this._getIFrameElement();
          t.contentWindow.destroyChart(), t.parentNode && t.parentNode.removeChild(t)
      }
      w.prototype.closePopupsAndDialogs = function () {
          this._innerAPI().closePopupsAndDialogs()
      }
      w.prototype.selectLineTool = function (t) {
          this._innerAPI().selectLineTool(t)
      }
      w.prototype.selectedLineTool = function () {
          return this._innerAPI().selectedLineTool()
      }
      w.prototype.save = function (t) {
          this._innerAPI().saveChart(t)
      }
      w.prototype.load = function (t, e) {
          this._innerAPI().loadChart({
              json: t,
              extendedData: e
          })
      }
      w.prototype.getSavedCharts = function (t) {
          this._innerAPI().getSavedCharts(t)
      }
      w.prototype.loadChartFromServer = function (t) {
          this._innerAPI().loadChartFromServer(t)
      }
      w.prototype.saveChartToServer = function (t, e, o, i) {
          this._innerAPI().saveChartToServer(t, e, o, i)
      }
      w.prototype.removeChartFromServer = function (t, e) {
          this._innerAPI().removeChartFromServer(t, e)
      }
      w.prototype.onContextMenu = function (t) {
          this._innerAPI().onContextMenu(t)
      }
      w.prototype.createButton = function (t) {
          return this._innerWindow().createButton(t)
      }
      w.prototype.showNoticeDialog = function (t) {
          this._innerAPI().showNoticeDialog(t)
      }
      w.prototype.showConfirmDialog = function (t) {
          this._innerAPI().showConfirmDialog(t)
      }
      w.prototype.showLoadChartDialog = function () {
          this._innerAPI().showLoadChartDialog()
      }
      w.prototype.showSaveAsChartDialog = function () {
          this._innerAPI().showSaveAsChartDialog()
      }
      w.prototype.symbolInterval = function () {
          return this._innerAPI().getSymbolInterval()
      }
      w.prototype.mainSeriesPriceFormatter = function () {
          return this._innerAPI().mainSeriesPriceFormatter()
      }
      w.prototype.getIntervals = function () {
          return this._innerAPI().getIntervals()
      }
      w.prototype.getStudiesList = function () {
          return this._innerAPI().getStudiesList()
      }
      w.prototype.addCustomCSSFile = function (t) {
          this._innerWindow().addCustomCSSFile(t)
      }
      w.prototype.applyOverrides = function (t) {
          this._options = e(this._options, {
              overrides: t
          }), this._innerWindow().applyOverrides(t)
      }
      w.prototype.applyStudiesOverrides = function (t) {
          this._innerWindow().applyStudiesOverrides(t)
      }
      w.prototype.watchList = function () {
          return this._innerAPI().watchlist()
      }
      w.prototype.activeChart = function () {
          return this._innerAPI().activeChart()
      }
      w.prototype.chartsCount = function () {
          return this._innerAPI().chartsCount()
      }
      w.prototype.layout = function () {
          return this._innerAPI().layout()
      }
      w.prototype.setLayout = function (t) {
          this._innerAPI().setLayout(t)
      }
      w.prototype._getIFrameElement = function () {
          var t = document.getElementById(this._id);
          if (null === t) throw new Error("There is no such iframe");
          return t
      }
      w.prototype._innerAPI = function () {
          return this._getIFrameElement().contentWindow.tradingViewApi
      }
      w.prototype._innerWindow = function () {
          return this._getIFrameElement().contentWindow
      }
      w.prototype._autoResizeChart = function () {
          this._options.fullscreen && (this._getIFrameElement().style.height = window.innerHeight + "px")
      }
      w.prototype._create = function () {
          var t = this,
              e = this._render(),
              o = document.getElementById(this._options.container_id);
          if (null === o) throw new Error("There is no such element - #" + this._options.container_id);
          o.innerHTML = e;
          var i = this._getIFrameElement();
          (this._options.autosize || this._options.fullscreen) && (i.style.width = "100%", this._options.fullscreen || (i.style.height = "100%")), window.addEventListener("resize", this._onWindowResize), this._onWindowResize();
          var n = function () {
              i.removeEventListener("load", n, !1), i.contentWindow.widgetReady(function () {
                  t._ready = !0;
                  for (var e = 0, o = t._readyHandlers; e < o.length; e++) {
                      o[e].call(t)
                  }
                  i.contentWindow.initializationFinished()
              })
          };
          i.addEventListener("load", n, !1)
        //   alert(11111)
      }
      w.prototype._render = function () {
          var t = window;
          t[this._id] = {
              datafeed: this._options.datafeed,
              customFormatters: this._options.customFormatters,
              brokerFactory: this._options.brokerFactory,
              overrides: this._options.overrides,
              studiesOverrides: this._options.studies_overrides,
              disabledFeatures: this._options.disabled_features,
              enabledFeatures: this._options.enabled_features,
              brokerConfig: this._options.brokerConfig,
              restConfig: this._options.restConfig,
              favorites: this._options.favorites,
              logo: this._options.logo,
              numeric_formatting: this._options.numeric_formatting,
              rss_news_feed: this._options.rss_news_feed,
              newsProvider: this._options.news_provider,
              loadLastChart: this._options.load_last_chart,
              saveLoadAdapter: this._options.save_load_adapter,
              loading_screen: this._options.loading_screen,
              settingsAdapter: this._options.settings_adapter
          }, this._options.saved_data && (t[this._id].chartContent = {
              json: this._options.saved_data
          });
          var e = (this._options.library_path || "") + "static/tv-chart.html#localserver=1&symbol=" + encodeURIComponent(this._options.symbol) + "&interval=" + encodeURIComponent(this._options.interval) + (this._options.timeframe ? "&timeframe=" + encodeURIComponent(this._options.timeframe) : "") + (this._options.toolbar_bg ? "&toolbarbg=" + this._options.toolbar_bg.replace("#", "") : "") + (this._options.studies_access ? "&studiesAccess=" + encodeURIComponent(JSON.stringify(this._options.studies_access)) : "") + "&widgetbar=" + encodeURIComponent(JSON.stringify(this._options.widgetbar)) + (this._options.drawings_access ? "&drawingsAccess=" + encodeURIComponent(JSON.stringify(this._options.drawings_access)) : "") + "&timeFrames=" + encodeURIComponent(JSON.stringify(this._options.time_frames)) + "&locale=" + encodeURIComponent(this._options.locale) + "&uid=" + encodeURIComponent(this._id) + "&clientId=" + encodeURIComponent(String(this._options.client_id)) + "&userId=" + encodeURIComponent(String(this._options.user_id)) + (this._options.charts_storage_url ? "&chartsStorageUrl=" + encodeURIComponent(this._options.charts_storage_url) : "") + (this._options.charts_storage_api_version ? "&chartsStorageVer=" + encodeURIComponent(this._options.charts_storage_api_version) : "") + (this._options.indicators_file_name ? "&indicatorsFile=" + encodeURIComponent(this._options.indicators_file_name) : "") + (this._options.custom_css_url ? "&customCSS=" + encodeURIComponent(this._options.custom_css_url) : "") + (this._options.auto_save_delay ? "&autoSaveDelay=" + encodeURIComponent(String(this._options.auto_save_delay)) : "") + "&debug=" + this._options.debug + (this._options.snapshot_url ? "&snapshotUrl=" + encodeURIComponent(this._options.snapshot_url) : "") + (this._options.timezone ? "&timezone=" + encodeURIComponent(this._options.timezone) : "") + (this._options.study_count_limit ? "&studyCountLimit=" + encodeURIComponent(String(this._options.study_count_limit)) : "") + (this._options.symbol_search_request_delay ? "&ssreqdelay=" + encodeURIComponent(String(this._options.symbol_search_request_delay)) : "");
          return '<iframe id="' + this._id + '" name="' + this._id + '"  src="' + e + '"' + (this._options.autosize || this._options.fullscreen ? "" : ' width="' + this._options.width + '" height="' + this._options.height + '"') + ' frameborder="0" allowTransparency="true" scrolling="no" allowfullscreen style="display:block;"></iframe>'
      }
      return w
  }();
}
initTradingView(window);