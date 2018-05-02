import * as RecryptinfoAPI from '@/services/recryptinfo-api'

class Transaction {
  static get(id, options = {}) {
    if (Array.isArray(id)) {
      if (id.length === 0) {
        return []
      } else {
        return RecryptinfoAPI.get('/txs/' + id.join(','), options)
      }
    } else {
      return RecryptinfoAPI.get(`/tx/${id}`, options)
    }
  }
}

export default Transaction
