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
    },
    reAnalyse_getCountList:() => {
        return axios({
            method: 'get',
            url: urlConfig.reAnalyse_getCountList
        })
    },
    reAnalyse_getOrderList:(params) => {
        return axios({
            method: 'get',
            url: urlConfig.reAnalyse_getOrderList,
            params
        })
    },
    reAnalyse_clear:() => {
        return axios({
            method: 'post',
            url: urlConfig.reAnalyse_clear
        })
    }
}

export default searchConfig