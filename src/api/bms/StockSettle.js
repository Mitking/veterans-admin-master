const module = '/bms'
import request from '@/utils/request'
export function getRetailPage(data = {}) {
  return request({
    url: module + '/report/getStockSettle',
    method: 'post',
    data
  })
}
export function getTotalStockSettle(data = {}) {
  return request({
    url: module + '/report/getTotalStockSettle',
    method: 'post',
    data
  })
}
