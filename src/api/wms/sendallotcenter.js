const module = '/wms'
import request from '@/utils/request'
// 获取配送
export function addOrder(data = {}) {
  return request({
    url: module + '/send/accept/addSendAccept',
    method: 'post',
    data
  })
}
export function deleteOrder(data = {}) {
  return request({
    url: module + '/send/accept/deleteAccept',
    method: 'post',
    data
  })
}
export function deleteDetails(data = {}) {
  return request({
    url: module + '/send/accept/details/deleteDetailById',
    method: 'post',
    data
  })
}
export function getDetails(data = {}) {
  return request({
    url: module + '/send/accept/details/getAcceptDetails',
    method: 'post',
    data
  })
}
export function getPage(data = {}) {
  return request({
    url: module + '/send/accept/getSendAcceptPage',
    method: 'post',
    data
  })
}
export function review(data = {}) {
  return request({
    url: module + '/send/accept/reviewAccept',
    method: 'post',
    data
  })
}
export function updateOrder(data = {}) {
  return request({
    url: module + '/send/accept/updateSendAccept',
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
