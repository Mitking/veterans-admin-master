const module = '/bms'
import request from '@/utils/request'
// 零售明细
export function SaleCompare(data = {}) {
  return request({
    url: module + '/report/getSaleCompare',
    method: 'post',
    data
  })
}
