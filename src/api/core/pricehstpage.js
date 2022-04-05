const module = '/core'
import request from '@/utils/request'
// 获取价格
export function getPriceHstPage(data = {}) {
  return request({
    url: module + '/product/archive/price/hst/getPriceHstPage',
    method: 'post',
    data
  })
}
