const module = '/wms'
import request from '@/utils/request'
// 获取配送
export function addOrder(data = {}) {
  return request({
    url: module + '/send/delivery/addDelivery',
    method: 'post',
    data
  })
}
export function deleteOrder(data = {}) {
  return request({
    url: module + '/send/delivery/deleteDelivery',
    method: 'post',
    data
  })
}
export function deleteDetails(data = {}) {
  return request({
    url: module + '/send/delivery/details/deleteDetailById',
    method: 'post',
    data
  })
}
export function getDetails(data = {}) {
  return request({
    url: module + '/send/delivery/details/getDeliveryDetails',
    method: 'post',
    data
  })
}
export function getPage(data = {}) {
  return request({
    url: module + '/send/delivery/getDeliveryPage',
    method: 'post',
    data
  })
}
export function review(data = {}) {
  return request({
    url: module + '/send/delivery/reviewDelivery',
    method: 'post',
    data
  })
}
export function updateOrder(data = {}) {
  return request({
    url: module + '/send/delivery/updateDelivery',
    method: 'post',
    data
  })
}
export function getSendNumber(data = {}) {
  return request({
    url: module + '/send/number/getSendNumber',
    method: 'post',
    data
  })
}
export function getDeliveryFeeDetails(data = {}) {
  return request({
    url: module + '/send/delivery/fee/getDeliveryFeeDetails',
    method: 'post',
    data
  })
}
export function deleteDeliveryFee(data = {}) {
  return request({
    url: module + '/send/delivery/fee/deleteDeliveryFee',
    method: 'post',
    data
  })
}
export function updateDeliveryFee(data = {}) {
  return request({
    url: module + '/send/delivery/fee/updateDeliveryFee',
    method: 'post',
    data
  })
}
