const module = '/bms'
import request from '@/utils/request'
// 消费汇总
export function StockTurnover(data = {}) {
  return request({
    url: module + '/report/getStockTurnover',
    method: 'post',
    data
  })
}
