const module = '/oms'
import request from '@/utils/request'
// 获取配送
export function addOrder(data = {}) {
  return request({
    url: module + '/fin/franchisee/settle/addFranchiseeSettle',
    method: 'post',
    data
  })
}
export function deleteOrder(data = {}) {
  return request({
    url: module + '/fin/franchisee/settle/deleteFranchiseeSettle',
    method: 'post',
    data
  })
}
export function deleteDetails(data = {}) {
  return request({
    url: module + '/fin/franchisee/settle/details/deleteDetailById',
    method: 'post',
    data
  })
}
export function getDetails(data = {}) {
  return request({
    url: module + '/fin/franchisee/settle/details/getFranchiseeSettleDetails',
    method: 'post',
    data
  })
}
export function getPage(data = {}) {
  return request({
    url: module + '/fin/franchisee/settle/getFranchiseeSettlePage',
    method: 'post',
    data
  })
}
export function getListForInvoicing(data = {}) {
  return request({
    url: module + '/fin/franchisee/settle/getListForInvoicing',
    method: 'post',
    data
  })
}

export function review(data = {}) {
  return request({
    url: module + '/fin/franchisee/settle/reviewFranchiseeSettle',
    method: 'post',
    data
  })
}
export function updateOrder(data = {}) {
  return request({
    url: module + '/fin/franchisee/settle/updateFranchiseeSettle',
    method: 'post',
    data
  })
}
export function getSendNumber(data = {}) {
  return request({
    url: module + '/fin/serial/number/getFinSerialNumber',
    method: 'post',
    data
  })
}
