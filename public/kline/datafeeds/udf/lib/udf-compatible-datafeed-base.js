import { getErrorMessage, logMessage, } from './helpers';
import { HistoryProvider, } from './history-provider';
import { DataPulseProvider } from './data-pulse-provider';
import { QuotesPulseProvider } from './quotes-pulse-provider';
import { SymbolsStorage } from './symbols-storage';
function extractField(data, field, arrayIndex) {
    var value = data[field];
    if (field == 'color' && Array.isArray(value)) {
        value[arrayIndex] = {
            background: value[arrayIndex]
        };
    }
    return Array.isArray(value) ? value[arrayIndex] : value;
}
//这个是提供给图表库的数据库实例的类
var UDFCompatibleDatafeedBase = /** @class */ (function () {
    //构造函数，传入url，周期
    function UDFCompatibleDatafeedBase(datafeedURL, quotesProvider, requester, updateFrequency) {
        var _this = this;
        if (updateFrequency === void 0) { updateFrequency = 10 * 1000; }
        this._configuration = defaultConfiguration();
        this._symbolsStorage = null;
        this._datafeedURL = datafeedURL;
        this._quotesProvider = quotesProvider;
        this._requester = requester;
        this._historyProvider = new HistoryProvider(datafeedURL, this._requester); //这里面有底层的getbar函数，请求数据通过他来实现
        this._dataPulseProvider = new DataPulseProvider(this._historyProvider, updateFrequency); //有底层的数据订阅和更新函数，但实际的数据请求还是通过historyprovider的getbar来实现
        this._quotesPulseProvider = new QuotesPulseProvider(this._quotesProvider);
        this._configurationReadyPromise = this._requestConfiguration()
            .then(function (configuration) {
            if (configuration === null) {
                configuration = defaultConfiguration();
            }
            _this._setupWithConfiguration(configuration);
        });
    }
    //图表库会自己调用下列函数
    UDFCompatibleDatafeedBase.prototype.onReady = function (callback) {
        var _this = this;
        this._configurationReadyPromise.then(function () {
            callback(_this._configuration);
        });
    };
    /**
     * 查询币种时，图表库调用的函数
     */
    UDFCompatibleDatafeedBase.prototype.searchSymbols = function (userInput, exchange, symbolType, onResult) {
        if (this._configuration.supports_search) {
            var params = {
                limit: 30 /* SearchItemsLimit */,
                query: userInput.toUpperCase(),
                type: symbolType,
                exchange: exchange,
            };
            this._send('search', params)
                .then(function (response) {
                if (response.s !== undefined) {
                    logMessage("UdfCompatibleDatafeed: search symbols error=" + response.errmsg);
                    onResult([]);
                    return;
                }
                onResult(response); //这是把请求的结果传递给图表库
            })
                .catch(function (reason) {
                logMessage("UdfCompatibleDatafeed: Search symbols for '" + userInput + "' failed. Error=" + getErrorMessage(reason));
                onResult([]);
            });
        }
        else {
            if (this._symbolsStorage === null) {
                throw new Error('UdfCompatibleDatafeed: inconsistent configuration (symbols storage)');
            }
            this._symbolsStorage.searchSymbols(userInput, exchange, symbolType, 30 /* SearchItemsLimit */)
                .then(onResult)
                .catch(onResult.bind(null, []));
        }
    };
    /**
     * 通过币种获取币种信息时图表库调用的函数
     */
    UDFCompatibleDatafeedBase.prototype.resolveSymbol = function (symbolName, onResolve, onError, extension) {
        logMessage('Resolve requested');
        var currencyCode = extension && extension.currencyCode;
        var resolveRequestStartTime = Date.now();
        function onResultReady(symbolInfo) {
            logMessage("Symbol resolved: " + (Date.now() - resolveRequestStartTime) + "ms");
            onResolve(symbolInfo); //将获取到的币种信息传递给图表库
        }
        if (!this._configuration.supports_group_request) {
            var params = {
                symbol: symbolName,
            };
            if (currencyCode !== undefined) {
                params.currencyCode = currencyCode;
            }
            this._send('symbols', params)
                .then(function (response) {
                if (response.s !== undefined) {
                    onError('unknown_symbol');
                }
                else {
                    if (response.exchange == 'dydx') {
                        response.ticker = 'dydx_' + response.ticker;
                    }
                    if (response.exchange == 'okcoin') {
                        response.ticker = 'okcoin_' + response.ticker;
                    }
                    onResultReady(response); //将获取到的币种信息传递给图表库
                }
            })
                .catch(function (reason) {
                logMessage("UdfCompatibleDatafeed: Error resolving symbol: " + getErrorMessage(reason));
                onError('unknown_symbol');
            });
        }
        else {
            if (this._symbolsStorage === null) {
                throw new Error('UdfCompatibleDatafeed: inconsistent configuration (symbols storage)');
            }
            this._symbolsStorage.resolveSymbol(symbolName, currencyCode).then(onResultReady).catch(onError);
        }
    };
    /**
     * 这个是获取币种历史数据时调用的函数，但其实底层的数据获取函数和订阅时调用的getbar是同一个
     */
    UDFCompatibleDatafeedBase.prototype.getBars = function (symbolInfo, resolution, rangeStartDate, rangeEndDate, onResult, onError) {
        this._historyProvider.getBars(symbolInfo, resolution, rangeStartDate, rangeEndDate)
            .then(function (result) {
            onResult(result.bars, result.meta);
        })
            .catch(onError);
    };
    /**
     * 订阅数据更新的函数，图表库只是主动调用一次这个函数，底层实现在另外的文件，底层会循环调用回调，返回数据给图表库，如果用websocket，那么就是当服务器返回数据时才调用回调
     */
    UDFCompatibleDatafeedBase.prototype.subscribeBars = function (symbolInfo, resolution, onTick, listenerGuid, onResetCacheNeededCallback) {
        this._dataPulseProvider.subscribeBars(symbolInfo, resolution, onTick, listenerGuid);
    };
    /**
     * 取消订阅数据更新的函数，底层实现在另外的文件
     */
    UDFCompatibleDatafeedBase.prototype.unsubscribeBars = function (listenerGuid) {
        this._dataPulseProvider.unsubscribeBars(listenerGuid);
    };
    /**
     * 下面几个先不管
     */
    UDFCompatibleDatafeedBase.prototype.getQuotes = function (symbols, onDataCallback, onErrorCallback) {
        this._quotesProvider.getQuotes(symbols).then(onDataCallback).catch(onErrorCallback);
    };
    UDFCompatibleDatafeedBase.prototype.subscribeQuotes = function (symbols, fastSymbols, onRealtimeCallback, listenerGuid) {
        this._quotesPulseProvider.subscribeQuotes(symbols, fastSymbols, onRealtimeCallback, listenerGuid);
    };
    UDFCompatibleDatafeedBase.prototype.unsubscribeQuotes = function (listenerGuid) {
        this._quotesPulseProvider.unsubscribeQuotes(listenerGuid);
    };
    UDFCompatibleDatafeedBase.prototype.calculateHistoryDepth = function (resolution, resolutionBack, intervalBack) {
        return undefined;
    };
    /**
     * 获取K线标记点
     */
    UDFCompatibleDatafeedBase.prototype.getMarks = function (symbolInfo, from, to, onDataCallback, resolution) {
        // return
        if (this._configuration.supports_marks) {
            return;
        }
        var requestParams = {
            symbol: symbolInfo.ticker || '',
            from: from,
            to: to,
            resolution: resolution,
        };
        this._send('marks', requestParams).then(function (response) {
            var num = 0;
            switch (resolution) {
                case '1':
                    num = 60;
                    break;
                case '5':
                    num = 300;
                    break;
                default:
                    break;
            }
            if (!Array.isArray(response)) {
                // const result: Mark[] = [];
                var result = [];
                for (var i = 0; i < response.id.length; ++i) {
                    result.push({
                        id: extractField(response, 'id', i),
                        time: extractField(response, 'time', i) - num,
                        color: extractField(response, 'color', i),
                        text: extractField(response, 'text', i),
                        label: extractField(response, 'label', i),
                        // label: "↓",
                        labelFontColor: extractField(response, 'labelFontColor', i),
                        // labelFontColor: "#333333",
                        minSize: extractField(response, 'minSize', i),
                    });
                }
                response = result;
            }
            onDataCallback(response);
        })
            .catch(function (error) {
            logMessage("UdfCompatibleDatafeed: Request marks failed: " + getErrorMessage(error));
            onDataCallback([]);
        });
    };
    UDFCompatibleDatafeedBase.prototype.getTimescaleMarks = function (symbolInfo, from, to, onDataCallback, resolution) {
        if (!this._configuration.supports_timescale_marks) {
            return;
        }
        var requestParams = {
            symbol: symbolInfo.ticker || '',
            from: from,
            to: to,
            resolution: resolution,
        };
        this._send('timescale_marks', requestParams)
            .then(function (response) {
            if (!Array.isArray(response)) {
                var result = [];
                for (var i = 0; i < response.id.length; ++i) {
                    result.push({
                        id: extractField(response, 'id', i),
                        time: extractField(response, 'time', i),
                        color: extractField(response, 'color', i),
                        label: extractField(response, 'label', i),
                        tooltip: extractField(response, 'tooltip', i),
                    });
                }
                response = result;
            }
            onDataCallback(response);
        })
            .catch(function (error) {
            logMessage("UdfCompatibleDatafeed: Request timescale marks failed: " + getErrorMessage(error));
            onDataCallback([]);
        });
    };
    UDFCompatibleDatafeedBase.prototype.getServerTime = function (callback) {
        if (!this._configuration.supports_time) {
            return;
        }
        this._send('time')
            .then(function (response) {
            var time = parseInt(response);
            if (!isNaN(time)) {
                callback(time);
            }
        })
            .catch(function (error) {
            logMessage("UdfCompatibleDatafeed: Fail to load server time, error=" + getErrorMessage(error));
        });
    };
    UDFCompatibleDatafeedBase.prototype._requestConfiguration = function () {
        return this._send('config')
            .catch(function (reason) {
            logMessage("UdfCompatibleDatafeed: Cannot get datafeed configuration - use default, error=" + getErrorMessage(reason));
            return null;
        });
    };
    //发送数据请求,其实所有的请求都是由同一个函数发送，只是调用的位置和参数不同
    UDFCompatibleDatafeedBase.prototype._send = function (urlPath, params) {
        return this._requester.sendRequest(this._datafeedURL, urlPath, params);
    };
    UDFCompatibleDatafeedBase.prototype._setupWithConfiguration = function (configurationData) {
        this._configuration = configurationData;
        if (configurationData.exchanges === undefined) {
            configurationData.exchanges = [];
        }
        if (!configurationData.supports_search && !configurationData.supports_group_request) {
            throw new Error('Unsupported datafeed configuration. Must either support search, or support group request');
        }
        if (configurationData.supports_group_request || !configurationData.supports_search) {
            this._symbolsStorage = new SymbolsStorage(this._datafeedURL, configurationData.supported_resolutions || [], this._requester);
        }
        logMessage("UdfCompatibleDatafeed: Initialized with " + JSON.stringify(configurationData));
    };
    return UDFCompatibleDatafeedBase;
}());
export { UDFCompatibleDatafeedBase };
function defaultConfiguration() {
    return {
        supports_search: false,
        supports_group_request: true,
        supported_resolutions: [
            '1',
            '5',
            '15',
            '30',
            '60',
            // 'D' as ResolutionString,
            '1D',
            '1W',
            '1M',
        ],
        supports_marks: false,
        supports_timescale_marks: false,
    };
}
