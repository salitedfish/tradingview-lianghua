import urlConfig from "./urlConfig"
import axios from "axios"

const searchConfig = {
    getSymbolListBySearch:(params)=>{
        return axios({
            method:'get',
            url:urlConfig.getSymbolListBySearch,
            params
        })
    },
    getSymbolListByRank:(params)=>{
        return axios({
            method:'get',
            url:'rank/market/vol_sort',
            params
        })
    }
}

export default searchConfig 