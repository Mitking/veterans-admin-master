const module = '/bms'
import request from '@/utils/request'
// 消费汇总
export function getCustomerAnalyze(data = {}) {
  return request({
    url: module + '/report/getCustomerAnalyze',
    method: 'post',
    data
  })
}
