import urlConfig from "./urlConfig"
import axios from "axios"

const searchConfig = {
    getSymbolListBySearch:(params)=>{
        return axios({
            method:'get',
            url:urlConfig.getSymbolListBySearch,
            params
        })
    }
}

export default searchConfig 