import {
	Bar,
	HistoryMetadata,
	LibrarySymbolInfo,
} from '../../../charting_library/datafeed-api';

import {
	getErrorMessage,
	RequestParams,
	UdfErrorResponse,
	UdfOkResponse,
	UdfResponse,
} from './helpers';

import { Requester } from './requester';
// tslint:disable: no-any
interface HistoryPartialDataResponse extends UdfOkResponse {
	t: any;
	c: any;
	o?: never;
	h?: never;
	l?: never;
	v?: never;
}

interface HistoryFullDataResponse extends UdfOkResponse {
	t: any;
	c: any;
	o: any;
	h: any;
	l: any;
	v: any;
}
// tslint:enable: no-any
interface HistoryNoDataResponse extends UdfResponse {
	s: 'no_data';
	nextTime?: number;
}

type HistoryResponse = HistoryFullDataResponse | HistoryPartialDataResponse | HistoryNoDataResponse;

export interface GetBarsResult {
	bars: Bar[];
	meta: HistoryMetadata;
}

export class HistoryProvider {
	private _datafeedUrl: string;
	private readonly _requester: Requester;

	public constructor(datafeedUrl: string, requester: Requester) {
		this._datafeedUrl = datafeedUrl;
		this._requester = requester;
	}

	public getBars(symbolInfo: LibrarySymbolInfo, resolution: string, rangeStartDate: number, rangeEndDate: number): Promise<GetBarsResult> {
		const requestParams: RequestParams = {
			symbol: symbolInfo.ticker || '',
			resolution: resolution == '1D'? 'D':resolution,
			from: rangeStartDate,
			to: rangeEndDate,
		};

		if (symbolInfo.currency_code !== undefined) {
			requestParams.currencyCode = symbolInfo.currency_code;
		}

		return new Promise((resolve: (result: GetBarsResult) => void, reject: (reason: string) => void) => {
			this._requester.sendRequest<HistoryResponse>(this._datafeedUrl, 'history', requestParams)
				.then((response: HistoryResponse | UdfErrorResponse) => {
					const bars: Bar[] = [];
					const meta: HistoryMetadata = {
						noData: false,
					};
					if (response.s !== 'ok' && response.s !== 'no_data') {
						// reject(response.errmsg);
						meta.noData = true;
						resolve({
							bars: bars,
							meta: meta,
						});
						return;
					}

					if (response.s === 'no_data') {
						meta.noData = true;
						meta.nextTime = response.nextTime;
					} else {
						const volumePresent = response.v !== undefined;
						const ohlPresent = response.o !== undefined;

						for (let i = 0; i < response.t.length; ++i) {
							/**
							* 这里先把开高低收都用收赋值
							*/
							const barValue: Bar = {
								// time: response.t[i] * 1000,
								time: resolution == '1D' && symbolInfo.ticker?.indexOf('HOLD') == -1 ? (response.t[i] + 86400) * 1000: response.t[i] * 1000,//fix bug
								close: symbolInfo.ticker?.indexOf('HOLD') == -1? parseFloat(response.c[i]) : (0-parseFloat(response.c[i])),
								open: symbolInfo.ticker?.indexOf('HOLD') == -1? parseFloat(response.c[i]) : (0-parseFloat(response.c[i])),
								high: symbolInfo.ticker?.indexOf('HOLD') == -1? parseFloat(response.c[i]) : (0-parseFloat(response.c[i])),
								low: symbolInfo.ticker?.indexOf('HOLD') == -1? parseFloat(response.c[i]) : (0-parseFloat(response.c[i])),
							};

                            /**
							 * 如果有open数据，再重新复制开高低
							 */
							if (ohlPresent) {
								barValue.open = symbolInfo.ticker?.indexOf('HOLD') == -1? parseFloat((response as HistoryFullDataResponse).o[i]) : (0-parseFloat((response as HistoryFullDataResponse).o[i]));
								barValue.high = symbolInfo.ticker?.indexOf('HOLD') == -1? parseFloat((response as HistoryFullDataResponse).h[i]) : (0-parseFloat((response as HistoryFullDataResponse).h[i]));
								barValue.low = symbolInfo.ticker?.indexOf('HOLD') == -1? parseFloat((response as HistoryFullDataResponse).l[i]) : (0-parseFloat((response as HistoryFullDataResponse).l[i]));

							}

							if (volumePresent) {
								barValue.volume = symbolInfo.ticker?.indexOf('HOLD') == -1? parseFloat((response as HistoryFullDataResponse).v[i]) : (0-parseFloat((response as HistoryFullDataResponse).v[i]));
							}

							bars.push(barValue);
						}
					}

					resolve({
						bars: bars,
						meta: meta,
					});
				})
				.catch((reason?: string | Error) => {
					const reasonString = getErrorMessage(reason);
					// tslint:disable-next-line:no-console
					console.warn(`HistoryProvider: getBars() failed, error=${reasonString}`);
					reject(reasonString);
				});
		});
	}
}
