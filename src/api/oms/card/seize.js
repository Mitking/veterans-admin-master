const module = '/oms'
import request from '@/utils/request'
// 获取
export function getPage(data = {}) {
  return request({
    url: module + '/card/seize/getSeizePage',
    method: 'post',
    data
  })
}
export function addOrder(data = {}) {
  return request({
    url: module + '/card/seize/addSeize',
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
    url: module + '/card/seize/detail/getSeizeDetails',
    method: 'post',
    data
  })
}
export function reviews(data = {}) {
  return request({
    url: module + '/card/seize/reviewSeize',
    method: 'post',
    data
  })
}
export function deleteOrder(data = {}) {
  return request({
    url: module + '/card/seize/deleteSeize',
    method: 'post',
    data
  })
}
export function updateOrder(data = {}) {
  return request({
    url: module + '/card/seize/updateSeize',
    method: 'post',
    data
  })
}
