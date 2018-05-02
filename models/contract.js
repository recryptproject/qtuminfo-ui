import * as RecryptinfoAPI from '@/services/recryptinfo-api'

class Contract {
  static get(id, options = {}) {
    return RecryptinfoAPI.get(`/contract/${id}`, options)
  }

  static getUtxo(id, options = {}) {
    return RecryptinfoAPI.get(`/contract/${id}/utxo`, options)
  }

  static getTransactions(id, {from, to}, options = {}) {
    return RecryptinfoAPI.get(`/contract/${id}/txs`, {params: {from, to}, ...options})
  }

  static listTokens({from, to}, options = {}) {
    return RecryptinfoAPI.get(`/contract/tokens`, {params: {from, to}, ...options})
  }

  static richList(id, {from, to}, options = {}) {
    return RecryptinfoAPI.get(`/contract/${id}/rich-list`, {params: {from, to}, ...options})
  }
}

export default Contract
