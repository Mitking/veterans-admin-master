// addOrder, deleteOrder, deleteDetails, getDetails, getPage, review, updateOrder, getStoNumber
const module = '/wms'
import request from '@/utils/request'
// 获取配送
export function addOrder(data = {}) {
  return request({
    url: module + '/send/apply/addSendApply',
    method: 'post',
    data
  })
}
export function deleteOrder(data = {}) {
  return request({
    url: module + '/send/apply/deleteSendApply',
    method: 'post',
    data
  })
}
export function getPage(data = {}) {
  return request({
    url: module + '/send/apply/getSendApplyPage',
    method: 'post',
    data
  })
}
export function deleteDetails(data = {}) {
  return request({
    url: module + '/send/apply/item/deleteDetailById',
    method: 'post',
    data
  })
}
export function getDetails(data = {}) {
  return request({
    url: module + '/send/apply/item/getApplyItems',
    method: 'post',
    data
  })
}
export function review(data = {}) {
  return request({
    url: module + '/send/apply/reviewApply',
    method: 'post',
    data
  })
}
export function updateOrder(data = {}) {
  return request({
    url: module + '/send/apply/updateApply',
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
export function generate(data = {}) {
  return request({
    url: module + '/send/call/generateCallByApply',
    method: 'post',
    data
  })
}
// 调拨三合一
export function batchDeal(data = {}) {
  return request({
    url: module + '/send/center/batchDeal',
    method: 'post',
    data
  })
}
