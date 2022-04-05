const module = '/oms'
import request from '@/utils/request'
// 获取
export function getPage(data = {}) {
  return request({
    url: module + '/card/issue/getIssuePage',
    method: 'post',
    data
  })
}
export function addOrder(data = {}) {
  return request({
    url: module + '/card/issue/addIssue',
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
    url: module + '/card/issue/detail/getIssueDetails',
    method: 'post',
    data
  })
}
export function reviews(data = {}) {
  return request({
    url: module + '/card/issue/reviewIssue',
    method: 'post',
    data
  })
}
export function deleteOrder(data = {}) {
  return request({
    url: module + '/card/issue/deleteIssue',
    method: 'post',
    data
  })
}
export function updateOrder(data = {}) {
  return request({
    url: module + '/card/issue/updateIssue',
    method: 'post',
    data
  })
}
