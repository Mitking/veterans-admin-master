const module = '/wms'
import request from '@/utils/request'
// addOrder  deleteOrder  deleteDetails  getDetails  getPage  review  updateOrder  getSendNumber
// 获取配送
export function addOrder(data = {}) {
  return request({
    url: module + '/send/storage/addStorage',
    method: 'post',
    data
  })
}
export function deleteOrder(data = {}) {
  return request({
    url: module + '/send/storage/deleteSendStorage',
    method: 'post',
    data
  })
}
export function deleteDetails(data = {}) {
  return request({
    url: module + '/send/storage/details/deleteDetailById',
    method: 'post',
    data
  })
}
export function getDetails(data = {}) {
  return request({
    url: module + '/send/storage/details/getStorageDetails',
    method: 'post',
    data
  })
}
export function getPage(data = {}) {
  return request({
    url: module + '/send/storage/getSendRejectPage',
    method: 'post',
    data
  })
}
export function review(data = {}) {
  return request({
    url: module + '/send/storage/reviewStorage',
    method: 'post',
    data
  })
}
export function updateOrder(data = {}) {
  return request({
    url: module + '/send/storage/updateStorage',
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
