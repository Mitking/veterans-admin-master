const module = '/oms'
import request from '@/utils/request'
// 获取
export function getPage(data = {}) {
  return request({
    url: module + '/card/make/getMakePage',
    method: 'post',
    data
  })
}
export function addOrder(data = {}) {
  return request({
    url: module + '/card/make/addMakeCard',
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
    url: module + '/card/make/detail/getMakeCardDetails',
    method: 'post',
    data
  })
}
export function reviews(data = {}) {
  return request({
    url: module + '/card/make/reviewMakeCard',
    method: 'post',
    data
  })
}
export function deleteOrder(data = {}) {
  return request({
    url: module + '/card/make/deleteMakeCard',
    method: 'post',
    data
  })
}
export function updateOrder(data = {}) {
  return request({
    url: module + '/card/make/updateMakeCard',
    method: 'post',
    data
  })
}
