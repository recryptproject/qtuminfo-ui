import * as RecryptinfoAPI from '@/services/recryptinfo-api'

class Address {
  static get(id, options = {}) {
    return RecryptinfoAPI.get(`/address/${id}`, options)
  }

  static getBalance(id, options = {}) {
    return RecryptinfoAPI.get(`/address/${id}/balance`, options)
  }

  static getUtxo(id, options = {}) {
    return RecryptinfoAPI.get(`/address/${id}/utxo`, options)
  }

  static getTransactions(id, {from, to}, options = {}) {
    return RecryptinfoAPI.get(`/address/${id}/full-txs`, {params: {from, to}, ...options})
  }

  static getBalanceTransactions(id, {from, to}, options = {}) {
    return RecryptinfoAPI.get(`/address/${id}/txs`, {params: {from, to}, ...options})
  }

  static getTokenBalanceTransactions(id, {tokens, from, to}, options = {}) {
    return RecryptinfoAPI.get(`/address/${id}/token-txs`, {params: {tokens, from, to}, ...options})
  }
}

export default Address
