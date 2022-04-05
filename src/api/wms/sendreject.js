const module = '/wms'
import request from '@/utils/request'

// 获取配送
export function addOrder(data = {}) {
  return request({
    url: module + '/send/reject/addSendReject',
    method: 'post',
    data
  })
}
export function deleteOrder(data = {}) {
  return request({
    url: module + '/send/reject/deleteSendReject',
    method: 'post',
    data
  })
}
export function deleteDetails(data = {}) {
  return request({
    url: module + '/send/reject/details/deleteDetailById',
    method: 'post',
    data
  })
}
export function getDetails(data = {}) {
  return request({
    url: module + '/send/reject/details/getRejectDetails',
    method: 'post',
    data
  })
}
export function getPage(data = {}) {
  return request({
    url: module + '/send/reject/getSendRejectPage',
    method: 'post',
    data
  })
}
export function review(data = {}) {
  return request({
    url: module + '/send/reject/reviewReject',
    method: 'post',
    data
  })
}
export function updateOrder(data = {}) {
  return request({
    url: module + '/send/reject/updateSendReject',
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
    url: module + '/send/storage/generateStorageByReject',
    method: 'post',
    data
  })
}
// 门店退货单生成仓储收货单
export function generateReceiveBySendReject(data = {}) {
  return request({
    url: module + '/sto/receive/order/generateReceiveBySendReject',
    method: 'post',
    data
  })
}
