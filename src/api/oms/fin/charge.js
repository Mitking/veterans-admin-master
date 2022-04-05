const module = '/oms'
import request from '@/utils/request'
// 获取配送
export function addOrder(data = {}) {
  return request({
    url: module + '/fin/charge/slip/addChargeSlip',
    method: 'post',
    data
  })
}
export function deleteOrder(data = {}) {
  return request({
    url: module + '/fin/charge/slip/deleteChargeSlip',
    method: 'post',
    data
  })
}
export function deleteDetails(data = {}) {
  return request({
    url: module + '/fin/charge/slip/details/deleteDetailById',
    method: 'post',
    data
  })
}
export function getDetails(data = {}) {
  return request({
    url: module + '/fin/charge/slip/details/getChargeSlipDetails',
    method: 'post',
    data
  })
}
export function getTotalFranchiseePrePaid(data = {}) {
  return request({
    url: module + '/fin/franchisee/prepaid/getTotalFranchiseePrePaid',
    method: 'post',
    data
  })
}

export function getPage(data = {}) {
  return request({
    url: module + '/fin/charge/slip/getChargeSlipPage',
    method: 'post',
    data
  })
}
export function review(data = {}) {
  return request({
    url: module + '/fin/charge/slip/reviewChargeSlip',
    method: 'post',
    data
  })
}
export function updateOrder(data = {}) {
  return request({
    url: module + '/fin/charge/slip/updateChargeSlip',
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
