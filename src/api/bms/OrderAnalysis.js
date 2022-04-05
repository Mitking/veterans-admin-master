const module = '/bms'
import request from '@/utils/request'
// 消费汇总
export function OrderAnalysis(data = {}) {
  return request({
    url: module + '/report/getOrderAnalysis',
    method: 'post',
    data
  })
}
