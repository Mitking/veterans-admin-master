const module = '/oms'
import request from '@/utils/request'
// 获取
export function getPage(data = {}) {
  return request({
    url: module + '/card/sale/getSalePage',
    method: 'post',
    data
  })
}
export function addOrder(data = {}) {
  return request({
    url: module + '/card/sale/addSale',
    method: 'post',
    data
  })
}
export function getSendNumber(data = {}) {
  return request({
    url: module + '/card/serial/number/getCardSerialNumber',
    method: 'post',
    data
  })
}
export function getDetails(data = {}) {
  return request({
    url: module + '/card/sale/detail/getSaleDetails',
    method: 'post',
    data
  })
}
export function reviews(data = {}) {
  return request({
    url: module + '/card/sale/reviewSale',
    method: 'post',
    data
  })
}
export function deleteOrder(data = {}) {
  return request({
    url: module + '/card/sale/deleteSale',
    method: 'post',
    data
  })
}
export function updateOrder(data = {}) {
  return request({
    url: module + '/card/sale/updateSale',
    method: 'post',
    data
  })
}
