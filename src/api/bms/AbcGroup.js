const module = '/bms'
import request from '@/utils/request'
// 消费汇总
export function AbcGroup(data = {}) {
  return request({
    url: module + '/report/getAbcGroup',
    method: 'post',
    data
  })
}
