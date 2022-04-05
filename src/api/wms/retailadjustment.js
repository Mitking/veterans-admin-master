const module = '/wms'
import request from '@/utils/request'

export function addOrSaveOrder(data = {}) {
  return request({
    url: module + '/price/adjustment/order/save',
    method: 'post',
    data
  })
}
export function getPage(data = {}) {
  return request({
    url: module + '/price/adjustment/order/getList',
    method: 'post',
    data
  })
}
export function deleteOrders(data = {}) {
  return request({
    url: module + '/price/adjustment/order/delete',
    method: 'post',
    data
  })
}

export function review(data = {}) {
  return request({
    url: module + '/price/adjustment/order/reviewer',
    method: 'post',
    data
  })
}
export function printAutoPriceDetails(data = {}) {
  return request({
    url: module + '/price/adjustment/order/printPriceAdjustmentDetails',
    method: 'post',
    data
  })
}
export function orderNo(data = {}) {
  return request({
    url: module + '/pur/generate/orderNo/get',
    method: 'post',
    data
  })
}
export function getSendNumber(data = {}) {
  return request({
    url: module + '/retail/order/getNo',
    method: 'post',
    data
  })
}
export function OrderInvalid(data = {}) {
  return request({
    url: module + '/price/adjustment/order/adjustPriceOrderInvalid',
    method: 'post',
    data
  })
}
export function broadcast(data = {}) { // 广播
  return request({
    url: module + '/price/adjustment/order/broadcast',
    method: 'post',
    data
  })
}
