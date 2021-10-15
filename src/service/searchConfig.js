import urlConfig from "./urlConfig"
import axios from "axios"

const searchConfig = {
    getSymbolListBySearch: (params) => {
        return axios({
            method: 'get',
            url: urlConfig.getSymbolListBySearch,
            params
        })
    },
    getZhaobiSymbolListBySearch: (params) => {
        return axios({
            method: 'get',
            url: urlConfig.getZhaobiSymbolListBySearch,
            params
        })
    },
    getSymbolListByRank: (params) => {
        return axios({
            method: 'get',
            url: 'rank/market/vol_sort',
            params
        })
    },
    reAnalyse_getSymbolConfig: (params={}) => {
        return axios({
            method: 'get',
            url: urlConfig.reAnalyse_getSymbolConfig,
            params
        })
    },
    reAnalyse_getStudyConfig:() => {
        return axios({
            method: 'get',
            url: urlConfig.reAnalyse_getStudyConfig,
        })
    }
}

export default searchConfig