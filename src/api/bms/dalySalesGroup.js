const module = '/bms'
import request from '@/utils/request'
// 消费汇总
export function dalySalesGroup(data = {}) {
  return request({
    url: module + '/report/getDalySalesGroup',
    method: 'post',
    data
  })
}
