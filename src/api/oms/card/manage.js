const module = '/oms'
import request from '@/utils/request'
// 获取
export function getPage(data = {}) {
  return request({
    url: module + '/card/create/getCreatePage',
    method: 'post',
    data
  })
}
export function addOrder(data = {}) {
  return request({
    url: module + '/card/create/appendCreate',
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
    url: module + '/card/create/detail/getCreateDetails',
    method: 'post',
    data
  })
}
export function reviews(data = {}) {
  return request({
    url: module + '/card/create/reviewCreate',
    method: 'post',
    data
  })
}
export function deleteOrder(data = {}) {
  return request({
    url: module + '/card/create/deleteCreate',
    method: 'post',
    data
  })
}
export function updateOrder(data = {}) {
  return request({
    url: module + '/card/create/updateCreate',
    method: 'post',
    data
  })
}
