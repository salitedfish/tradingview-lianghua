import {
	DatafeedConfiguration,
	ErrorCallback,
	GetMarksCallback,
	HistoryCallback,
	HistoryDepth,
	IDatafeedChartApi,
	IDatafeedQuotesApi,
	IExternalDatafeed,
	LibrarySymbolInfo,
	Mark,
	OnReadyCallback,
	QuotesCallback,
	ResolutionBackValues,
	ResolutionString,
	ResolveCallback,
	SearchSymbolResultItem,
	SearchSymbolsCallback,
	ServerTimeCallback,
	SubscribeBarsCallback,
	TimescaleMark,
	SymbolResolveExtension,
} from '../../../charting_library/datafeed-api';

import {
	getErrorMessage,
	logMessage,
	RequestParams,
	UdfErrorResponse,
} from './helpers';

import {
	GetBarsResult,
	HistoryProvider,
} from './history-provider';

import { IQuotesProvider } from './iquotes-provider';
import { DataPulseProvider } from './data-pulse-provider';
import { QuotesPulseProvider } from './quotes-pulse-provider';
import { SymbolsStorage } from './symbols-storage';
import { Requester } from './requester';

export interface UdfCompatibleConfiguration extends DatafeedConfiguration {
	// tslint:disable:tv-variable-name
	supports_search?: boolean;
	supports_group_request?: boolean;
	// tslint:enable:tv-variable-name
}

export interface ResolveSymbolResponse extends LibrarySymbolInfo {
	s: undefined;
}

// it is hack to let's TypeScript make code flow analysis
export interface UdfSearchSymbolsResponse extends Array<SearchSymbolResultItem> {
	s?: undefined;
}

export const enum Constants {
	SearchItemsLimit = 30,
}

type UdfDatafeedMarkType<T extends TimescaleMark | Mark> = {
	[K in keyof T]: T[K] | T[K][];
} & {
	id: (string | number)[];
};

type UdfDatafeedMark = UdfDatafeedMarkType<Mark>;
type UdfDatafeedTimescaleMark = UdfDatafeedMarkType<TimescaleMark>;

function extractField<Field extends keyof Mark>(data: UdfDatafeedMark, field: Field, arrayIndex: number): Mark[Field];
function extractField<Field extends keyof TimescaleMark>(data: UdfDatafeedTimescaleMark, field: Field, arrayIndex: number): TimescaleMark[Field];
function extractField<Field extends keyof (TimescaleMark | Mark)>(data: UdfDatafeedMark | UdfDatafeedTimescaleMark, field: Field, arrayIndex: number): (TimescaleMark | Mark)[Field] {
	const value = data[field];
	if(field == 'color'&&Array.isArray(value)){
		value[arrayIndex]  = {
			background:value[arrayIndex] 
		}
	}
	return Array.isArray(value) ? value[arrayIndex] : value;
}

//这个是提供给图表库的数据库实例的类
export class UDFCompatibleDatafeedBase implements IExternalDatafeed, IDatafeedQuotesApi, IDatafeedChartApi {
	protected _configuration: UdfCompatibleConfiguration = defaultConfiguration();
	private readonly _datafeedURL: string;
	private readonly _configurationReadyPromise: Promise<void>;

	private _symbolsStorage: SymbolsStorage | null = null;

	private readonly _historyProvider: HistoryProvider;
	private readonly _dataPulseProvider: DataPulseProvider;

	private readonly _quotesProvider: IQuotesProvider;
	private readonly _quotesPulseProvider: QuotesPulseProvider;

	private readonly _requester: Requester;

	//构造函数，传入url，周期
	protected constructor(datafeedURL: string, quotesProvider: IQuotesProvider, requester: Requester, updateFrequency: number = 10 * 1000) {
		this._datafeedURL = datafeedURL;
		this._quotesProvider = quotesProvider;
		this._requester = requester;

		this._historyProvider = new HistoryProvider(datafeedURL, this._requester);//这里面有底层的getbar函数，请求数据通过他来实现
		this._dataPulseProvider = new DataPulseProvider(this._historyProvider, updateFrequency);//有底层的数据订阅和更新函数，但实际的数据请求还是通过historyprovider的getbar来实现
		this._quotesPulseProvider = new QuotesPulseProvider(this._quotesProvider);

		this._configurationReadyPromise = this._requestConfiguration()
			.then((configuration: UdfCompatibleConfiguration | null) => {
				if (configuration === null) {
					configuration = defaultConfiguration();
				}

				this._setupWithConfiguration(configuration);
			});
	}

	//图表库会自己调用下列函数
	public onReady(callback: OnReadyCallback): void {
		this._configurationReadyPromise.then(() => {
			callback(this._configuration);
		});
	}

	/**
	 * 查询币种时，图表库调用的函数
	 */
	public searchSymbols(userInput: string, exchange: string, symbolType: string, onResult: SearchSymbolsCallback): void {
		if (this._configuration.supports_search) {
			const params: RequestParams = {
				limit: Constants.SearchItemsLimit,
				query: userInput.toUpperCase(),
				type: symbolType,
				exchange: exchange,
			};

			this._send<UdfSearchSymbolsResponse | UdfErrorResponse>('search', params)
				.then((response: UdfSearchSymbolsResponse | UdfErrorResponse) => {
					if (response.s !== undefined) {
						logMessage(`UdfCompatibleDatafeed: search symbols error=${response.errmsg}`);
						onResult([]);
						return;
					}

					onResult(response);//这是把请求的结果传递给图表库
				})
				.catch((reason?: string | Error) => {
					logMessage(`UdfCompatibleDatafeed: Search symbols for '${userInput}' failed. Error=${getErrorMessage(reason)}`);
					onResult([]);
				});
		} else {
			if (this._symbolsStorage === null) {
				throw new Error('UdfCompatibleDatafeed: inconsistent configuration (symbols storage)');
			}

			this._symbolsStorage.searchSymbols(userInput, exchange, symbolType, Constants.SearchItemsLimit)
				.then(onResult)
				.catch(onResult.bind(null, []));
		}
	}

	/**
	 * 通过币种获取币种信息时图表库调用的函数
	 */
	public resolveSymbol(symbolName: string, onResolve: ResolveCallback, onError: ErrorCallback, extension?: SymbolResolveExtension): void {
		logMessage('Resolve requested');

		const currencyCode = extension && extension.currencyCode;

		const resolveRequestStartTime = Date.now();
		function onResultReady(symbolInfo: LibrarySymbolInfo): void {
			logMessage(`Symbol resolved: ${Date.now() - resolveRequestStartTime}ms`);
			onResolve(symbolInfo);//将获取到的币种信息传递给图表库
		}

		if (!this._configuration.supports_group_request) {
			const params: RequestParams = {
				symbol: symbolName,
			};
			if (currencyCode !== undefined) {
				params.currencyCode = currencyCode;
			}

			this._send<ResolveSymbolResponse | UdfErrorResponse>('symbols', params)
				.then((response: ResolveSymbolResponse | UdfErrorResponse) => {
					if (response.s !== undefined) {
						onError('unknown_symbol');
					} else {
						onResultReady(response);//将获取到的币种信息传递给图表库
					}
				})
				.catch((reason?: string | Error) => {
					logMessage(`UdfCompatibleDatafeed: Error resolving symbol: ${getErrorMessage(reason)}`);
					onError('unknown_symbol');
				});
		} else {
			if (this._symbolsStorage === null) {
				throw new Error('UdfCompatibleDatafeed: inconsistent configuration (symbols storage)');
			}

			this._symbolsStorage.resolveSymbol(symbolName, currencyCode).then(onResultReady).catch(onError);
		}
	}

	/**
	 * 这个是获取币种历史数据时调用的函数，但其实底层的数据获取函数和订阅时调用的getbar是同一个
	 */
	public getBars(symbolInfo: LibrarySymbolInfo, resolution: ResolutionString, rangeStartDate: number, rangeEndDate: number, onResult: HistoryCallback, onError: ErrorCallback): void {
		this._historyProvider.getBars(symbolInfo, resolution, rangeStartDate, rangeEndDate)
			.then((result: GetBarsResult) => {
				onResult(result.bars, result.meta);
			})
			.catch(onError);
	}

	/**
	 * 订阅数据更新的函数，图表库只是主动调用一次这个函数，底层实现在另外的文件，底层会循环调用回调，返回数据给图表库，如果用websocket，那么就是当服务器返回数据时才调用回调
	 */
	public subscribeBars(symbolInfo: LibrarySymbolInfo, resolution: ResolutionString, onTick: SubscribeBarsCallback, listenerGuid: string, onResetCacheNeededCallback: () => void): void {
		this._dataPulseProvider.subscribeBars(symbolInfo, resolution, onTick, listenerGuid);
	}

	/**
	 * 取消订阅数据更新的函数，底层实现在另外的文件
	 */
	public unsubscribeBars(listenerGuid: string): void {
		this._dataPulseProvider.unsubscribeBars(listenerGuid);
	}
	
	/**
	 * 下面几个先不管
	 */
	public getQuotes(symbols: string[], onDataCallback: QuotesCallback, onErrorCallback: (msg: string) => void): void {
		this._quotesProvider.getQuotes(symbols).then(onDataCallback).catch(onErrorCallback);
	}

	public subscribeQuotes(symbols: string[], fastSymbols: string[], onRealtimeCallback: QuotesCallback, listenerGuid: string): void {
		this._quotesPulseProvider.subscribeQuotes(symbols, fastSymbols, onRealtimeCallback, listenerGuid);
	}

	public unsubscribeQuotes(listenerGuid: string): void {
		this._quotesPulseProvider.unsubscribeQuotes(listenerGuid);
	}

	public calculateHistoryDepth(resolution: ResolutionString, resolutionBack: ResolutionBackValues, intervalBack: number): HistoryDepth | undefined {
		return undefined;
	}

    /**
	 * 获取K线标记点
	 */
	public getMarks(symbolInfo: LibrarySymbolInfo, from: number, to: number, onDataCallback: GetMarksCallback<Mark>, resolution: ResolutionString): void {
		// return
		if (this._configuration.supports_marks) {
			return;
		}

		const requestParams: RequestParams = {
			symbol: symbolInfo.ticker || '',
			from: from,
			to: to,
			resolution: resolution,
		};

		this._send<Mark[] | UdfDatafeedMark>('marks', requestParams).then((response: Mark[] | UdfDatafeedMark) => {
			let num = 0
			switch(resolution){
				case '1':
					num = 60;
					break
				case '5':
					num = 300;
					break
				default:
					break
			}

				if (!Array.isArray(response)) {
					// const result: Mark[] = [];
					const result = [];
					for (let i = 0; i < response.id.length; ++i) {
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
			.catch((error?: string | Error) => {
				logMessage(`UdfCompatibleDatafeed: Request marks failed: ${getErrorMessage(error)}`);
				onDataCallback([]);
			});
	}

	public getTimescaleMarks(symbolInfo: LibrarySymbolInfo, from: number, to: number, onDataCallback: GetMarksCallback<TimescaleMark>, resolution: ResolutionString): void {
		if (!this._configuration.supports_timescale_marks) {
			return;
		}

		const requestParams: RequestParams = {
			symbol: symbolInfo.ticker || '',
			from: from,
			to: to,
			resolution: resolution,
		};

		this._send<TimescaleMark[] | UdfDatafeedTimescaleMark>('timescale_marks', requestParams)
			.then((response: TimescaleMark[] | UdfDatafeedTimescaleMark) => {
				if (!Array.isArray(response)) {
					const result: TimescaleMark[] = [];
					for (let i = 0; i < response.id.length; ++i) {
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
			.catch((error?: string | Error) => {
				logMessage(`UdfCompatibleDatafeed: Request timescale marks failed: ${getErrorMessage(error)}`);
				onDataCallback([]);
			});
	}

	public getServerTime(callback: ServerTimeCallback): void {
		if (!this._configuration.supports_time) {
			return;
		}

		this._send<string>('time')
			.then((response: string) => {
				const time = parseInt(response);
				if (!isNaN(time)) {
					callback(time);
				}
			})
			.catch((error?: string | Error) => {
				logMessage(`UdfCompatibleDatafeed: Fail to load server time, error=${getErrorMessage(error)}`);
			});
	}

	protected _requestConfiguration(): Promise<UdfCompatibleConfiguration | null> {
		return this._send<UdfCompatibleConfiguration>('config')
			.catch((reason?: string | Error) => {
				logMessage(`UdfCompatibleDatafeed: Cannot get datafeed configuration - use default, error=${getErrorMessage(reason)}`);
				return null;
			});
	}

	//发送数据请求,其实所有的请求都是由同一个函数发送，只是调用的位置和参数不同
	private _send<T>(urlPath: string, params?: RequestParams): Promise<T> {
		return this._requester.sendRequest<T>(this._datafeedURL, urlPath, params);
	}

	private _setupWithConfiguration(configurationData: UdfCompatibleConfiguration): void {
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

		logMessage(`UdfCompatibleDatafeed: Initialized with ${JSON.stringify(configurationData)}`);
	}
}

function defaultConfiguration(): UdfCompatibleConfiguration {
	return {
		supports_search: false,
		supports_group_request: true,
		supported_resolutions: [
			'1' as ResolutionString,
			'5' as ResolutionString,
			'15' as ResolutionString,
			'30' as ResolutionString,
			'60' as ResolutionString,
			// 'D' as ResolutionString,
			'1D' as ResolutionString,
			'1W' as ResolutionString,
			'1M' as ResolutionString,
		],
		supports_marks: false,
		supports_timescale_marks: false,
	};
}
