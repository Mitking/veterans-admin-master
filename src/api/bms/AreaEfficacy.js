const module = '/bms'
import request from '@/utils/request'
// 消费汇总
export function AreaEfficacy(data = {}) {
  return request({
    url: module + '/report/getAreaEfficacy',
    method: 'post',
    data
  })
}
