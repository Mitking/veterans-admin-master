const module = '/bms'
import request from '@/utils/request'
// 零售明细
export function getRetailPage(data = {}) {
  return request({
    url: module + '/report/getRetailPage',
    method: 'post',
    data
  })
}
