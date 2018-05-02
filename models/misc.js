import * as RecryptinfoAPI from '@/services/recryptinfo-api'

class Misc {
  static info(options = {}) {
    return RecryptinfoAPI.get('/info', options)
  }

  static richList({from, to}, options = {}) {
    return RecryptinfoAPI.get(`/misc/rich-list`, {params: {from, to}, ...options})
  }

  static biggestMiners({from, to}, options = {}) {
    return RecryptinfoAPI.get(`/misc/biggest-miners`, {params: {from, to}, ...options})
  }
}

export default Misc
