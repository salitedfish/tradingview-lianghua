import { getErrorMessage, } from './helpers';
var HistoryProvider = /** @class */ (function () {
    function HistoryProvider(datafeedUrl, requester) {
        this._datafeedUrl = datafeedUrl;
        this._requester = requester;
    }
    HistoryProvider.prototype.getBars = function (symbolInfo, resolution, rangeStartDate, rangeEndDate) {
        var _this = this;
        var requestParams = {
            symbol: symbolInfo.ticker || '',
            resolution: resolution == '1D' ? 'D' : resolution,
            from: rangeStartDate,
            to: rangeEndDate,
        };
        if (symbolInfo.currency_code !== undefined) {
            requestParams.currencyCode = symbolInfo.currency_code;
        }
        return new Promise(function (resolve, reject) {
            _this._requester.sendRequest(_this._datafeedUrl, 'history', requestParams)
                .then(function (response) {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j;
                if (response.s !== 'ok' && response.s !== 'no_data') {
                    reject(response.errmsg);
                    return;
                }
                var bars = [];
                var meta = {
                    noData: false,
                };
                if (response.s === 'no_data') {
                    meta.noData = true;
                    meta.nextTime = response.nextTime;
                }
                else {
                    var volumePresent = response.v !== undefined;
                    var ohlPresent = response.o !== undefined;
                    for (var i = 0; i < response.t.length; ++i) {
                        var barValue = {
                            // time: response.t[i] * 1000,
                            time: resolution == '1D' && ((_a = symbolInfo.ticker) === null || _a === void 0 ? void 0 : _a.indexOf('HOLD')) == -1 ? (response.t[i] + 86400) * 1000 : response.t[i] * 1000,
                            close: ((_b = symbolInfo.ticker) === null || _b === void 0 ? void 0 : _b.indexOf('HOLD')) == -1 ? parseFloat(response.c[i]) : (0 - parseFloat(response.c[i])),
                            open: ((_c = symbolInfo.ticker) === null || _c === void 0 ? void 0 : _c.indexOf('HOLD')) == -1 ? parseFloat(response.c[i]) : (0 - parseFloat(response.c[i])),
                            high: ((_d = symbolInfo.ticker) === null || _d === void 0 ? void 0 : _d.indexOf('HOLD')) == -1 ? parseFloat(response.c[i]) : (0 - parseFloat(response.c[i])),
                            low: ((_e = symbolInfo.ticker) === null || _e === void 0 ? void 0 : _e.indexOf('HOLD')) == -1 ? parseFloat(response.c[i]) : (0 - parseFloat(response.c[i])),
                        };
                        if (ohlPresent) {
                            barValue.open = ((_f = symbolInfo.ticker) === null || _f === void 0 ? void 0 : _f.indexOf('HOLD')) == -1 ? parseFloat(response.o[i]) : (0 - parseFloat(response.o[i]));
                            barValue.high = ((_g = symbolInfo.ticker) === null || _g === void 0 ? void 0 : _g.indexOf('HOLD')) == -1 ? parseFloat(response.h[i]) : (0 - parseFloat(response.h[i]));
                            barValue.low = ((_h = symbolInfo.ticker) === null || _h === void 0 ? void 0 : _h.indexOf('HOLD')) == -1 ? parseFloat(response.l[i]) : (0 - parseFloat(response.l[i]));
                        }
                        if (volumePresent) {
                            barValue.volume = ((_j = symbolInfo.ticker) === null || _j === void 0 ? void 0 : _j.indexOf('HOLD')) == -1 ? parseFloat(response.v[i]) : (0 - parseFloat(response.v[i]));
                        }
                        bars.push(barValue);
                    }
                }
                resolve({
                    bars: bars,
                    meta: meta,
                });
            })
                .catch(function (reason) {
                var reasonString = getErrorMessage(reason);
                // tslint:disable-next-line:no-console
                console.warn("HistoryProvider: getBars() failed, error=" + reasonString);
                reject(reasonString);
            });
        });
    };
    return HistoryProvider;
}());
export { HistoryProvider };
