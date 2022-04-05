const module = '/bms'
import request from '@/utils/request'
// 获取
export function getPage(data = {}) {
  return request({
    url: module + '/report/getMonthlySalesGroup',
    method: 'post',
    data
  })
}
