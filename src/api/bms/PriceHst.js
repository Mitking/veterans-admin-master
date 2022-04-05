const module = '/bms'
import request from '@/utils/request'
// 消费汇总
export function PriceHst(data = {}) {
  return request({
    url: module + '/report/getPriceHst',
    method: 'post',
    data
  })
}
