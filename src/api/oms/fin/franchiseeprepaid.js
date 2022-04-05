const module = '/oms'
import request from '@/utils/request'
// 获取配送
export function addOrder(data = {}) {
  return request({
    url: module + '/fin/franchisee/prepaid/addFranchiseePrepaid',
    method: 'post',
    data
  })
}
export function deleteOrder(data = {}) {
  return request({
    url: module + '/fin/franchisee/prepaid/deleteFranchiseePrepaid',
    method: 'post',
    data
  })
}

export function getPage(data = {}) {
  return request({
    url: module + '/fin/franchisee/prepaid/getFranchiseePrepaidPage',
    method: 'post',
    data
  })
}
export function review(data = {}) {
  return request({
    url: module + '/fin/franchisee/prepaid/reviewFranchiseePrepaid',
    method: 'post',
    data
  })
}
export function updateOrder(data = {}) {
  return request({
    url: module + '/fin/franchisee/prepaid/updateFranchiseePrepaid',
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
