import { getErrorMessage, logMessage, } from './helpers';
//datafeed实例
var DataPulseProvider = /** @class */ (function () {
    function DataPulseProvider(historyProvider, updateFrequency) {
        this._subscribers = {}; //订阅者对象列表
        this._requestsPending = 0;
        this._historyProvider = historyProvider;
        setInterval(this._updateData.bind(this), updateFrequency); //定时调用数据更新(updateFrequency默认为10秒)
    }
    //订阅数据更新
    DataPulseProvider.prototype.subscribeBars = function (symbolInfo, resolution, newDataCallback, listenerGuid) {
        if (this._subscribers.hasOwnProperty(listenerGuid)) {
            logMessage("DataPulseProvider: already has subscriber with id=" + listenerGuid);
            return;
        }
        this._subscribers[listenerGuid] = {
            lastBarTime: null,
            listener: newDataCallback,
            resolution: resolution,
            symbolInfo: symbolInfo,
        };
        logMessage("DataPulseProvider: subscribed for #" + listenerGuid + " - {" + symbolInfo.name + ", " + resolution + "}");
    };
    DataPulseProvider.prototype.unsubscribeBars = function (listenerGuid) {
        delete this._subscribers[listenerGuid];
        logMessage("DataPulseProvider: unsubscribed for #" + listenerGuid);
    };
    //定时调用更新数据函数（10秒）
    DataPulseProvider.prototype._updateData = function () {
        var _this = this;
        if (this._requestsPending > 0) {
            return;
        }
        this._requestsPending = 0;
        var _loop_1 = function (listenerGuid) {
            this_1._requestsPending += 1;
            //给订阅者更新数据
            this_1._updateDataForSubscriber(listenerGuid)
                .then(function () {
                _this._requestsPending -= 1;
                logMessage("DataPulseProvider: data for #" + listenerGuid + " updated successfully, pending=" + _this._requestsPending);
            })
                .catch(function (reason) {
                _this._requestsPending -= 1;
                logMessage("DataPulseProvider: data for #" + listenerGuid + " updated with error=" + getErrorMessage(reason) + ", pending=" + _this._requestsPending);
            });
        };
        var this_1 = this;
        for (var listenerGuid in this._subscribers) {
            _loop_1(listenerGuid);
        }
    };
    DataPulseProvider.prototype._updateDataForSubscriber = function (listenerGuid) {
        var _this = this;
        var subscriptionRecord = this._subscribers[listenerGuid]; //根据订阅者的guid获取订阅对象
        var rangeEndTime = parseInt((Date.now() / 1000).toString());
        var rangeStartTime = rangeEndTime - periodLengthSeconds(subscriptionRecord.resolution, 10);
        return this._historyProvider.getBars(subscriptionRecord.symbolInfo, subscriptionRecord.resolution, rangeStartTime, rangeEndTime)
            .then(function (result) {
            _this._onSubscriberDataReceived(listenerGuid, result);
        });
    };
    DataPulseProvider.prototype._onSubscriberDataReceived = function (listenerGuid, result) {
        if (!this._subscribers.hasOwnProperty(listenerGuid)) {
            logMessage("DataPulseProvider: Data comes for already unsubscribed subscription #" + listenerGuid);
            return;
        }
        var bars = result.bars;
        if (bars.length === 0) {
            return;
        }
        var lastBar = bars[bars.length - 1];
        var subscriptionRecord = this._subscribers[listenerGuid];
        if (subscriptionRecord.lastBarTime !== null && lastBar.time < subscriptionRecord.lastBarTime) {
            return;
        }
        var isNewBar = subscriptionRecord.lastBarTime !== null && lastBar.time > subscriptionRecord.lastBarTime;
        if (isNewBar) {
            if (bars.length < 2) {
                throw new Error('Not enough bars in history for proper pulse update. Need at least 2.');
            }
            var previousBar = bars[bars.length - 2];
            subscriptionRecord.listener(previousBar);
        }
        subscriptionRecord.lastBarTime = lastBar.time;
        subscriptionRecord.listener(lastBar); //最终把最新的数据通过订阅对象上的回调函数更新
    };
    return DataPulseProvider;
}());
export { DataPulseProvider };
//这个函数是根据周期来获取starttime的
function periodLengthSeconds(resolution, requiredPeriodsCount) {
    var daysCount = 0;
    if (resolution === 'D' || resolution === '1D') {
        daysCount = requiredPeriodsCount;
    }
    else if (resolution === 'M' || resolution === '1M') {
        daysCount = 31 * requiredPeriodsCount;
    }
    else if (resolution === 'W' || resolution === '1W') {
        daysCount = 7 * requiredPeriodsCount;
    }
    else {
        daysCount = requiredPeriodsCount * parseInt(resolution) / (24 * 60);
    }
    return daysCount * 24 * 60 * 60;
}
