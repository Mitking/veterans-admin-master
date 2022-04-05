const module = '/bms'
import request from '@/utils/request'
// 消费汇总
export function getPointLogPage(data = {}) {
  return request({
    url: module + '/report/getPointLogPage',
    method: 'post',
    data
  })
}
