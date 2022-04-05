const module = '/bms'
import request from '@/utils/request'
// 消费汇总
export function GrossAnalysis(data = {}) {
  return request({
    url: module + '/report/getGrossAnalysis',
    method: 'post',
    data
  })
}
