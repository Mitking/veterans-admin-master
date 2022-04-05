const module = '/oms'
import request from '@/utils/request'
// 获取
export function addOrSaveOrder(data = {}) {
  return request({
    url: module + '/fin/auto/price/updateAutoPrice',
    method: 'post',
    data
  })
}

export function getPage(data = {}) {
  return request({
    url: module + '/fin/auto/price/getAutoPricePage',
    method: 'post',
    data
  })
}
export function getDetails(data = {}) {
  return request({
    url: module + '/fin/auto/price/details/getAutoPriceDetails',
    method: 'post',
    data
  })
}

export function deleteOrders(data = {}) {
  return request({
    url: module + '/pur/price/order/delete',
    method: 'post',
    data
  })
}

export function review(data = {}) {
  return request({
    url: module + '/fin/auto/price/reviewAutoPrice',
    method: 'post',
    data
  })
}
export function copyAutoPrice(data = {}) {
  return request({
    url: module + '/fin/auto/price/copyAutoPrice',
    method: 'post',
    data
  })
}
export function printAutoPriceDetails(data = {}) {
  return request({
    url: module + '/fin/auto/price/details/printAutoPriceDetails',
    method: 'post',
    data
  })
}

