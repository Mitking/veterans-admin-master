const module = '/wms'
import request from '@/utils/request'
// 获取配送
export function getSendCallPage(data = {}) {
  return request({
    url: module + '/send/call/getSendCallPage',
    method: 'post',
    data
  })
}
export function addSendCall(data = {}) {
  return request({
    url: module + '/send/call/addSendCall',
    method: 'post',
    data
  })
}
export function deleteSendCall(data = {}) {
  return request({
    url: module + '/send/call/deleteSendCall',
    method: 'post',
    data
  })
}
export function deleteDetailById(data = {}) {
  return request({
    url: module + '/send/call/details/deleteDetailById',
    method: 'post',
    data
  })
}
export function getCallDetails(data = {}) {
  return request({
    url: module + '/send/call/details/getCallDetails',
    method: 'post',
    data
  })
}
export function reviewSendCall(data = {}) {
  return request({
    url: module + '/send/call/reviewSendCall',
    method: 'post',
    data
  })
}
export function updateSendCall(data = {}) {
  return request({
    url: module + '/send/call/updateSendCall',
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
export function generateOrder(data = {}) {
  return request({
    url: module + '/send/call/generateOrder',
    method: 'post',
    data
  })
}
export function getSendCallPrint(data = {}) {
  return request({
    url: module + '/send/call/getSendCallPrint',
    method: 'post',
    data
  })
}
// 三合一
export function batchDeal(data = {}) {
  return request({
    url: module + '/sto/center/batchDeal',
    method: 'post',
    data
  })
}
