const module = '/oms'
import request from '@/utils/request'
export function addOrder(data = {}) {
  return request({
    url: module + '/fin/onaccount/manage/appendOnaccount',
    method: 'post',
    data
  })
}
export function deleteOrder(data = {}) {
  return request({
    url: module + '/fin/onaccount/manage/deleteOnaccount',
    method: 'post',
    data
  })
}
export function getOnaccountRepayLog(data = {}) {
  return request({
    url: module + '/fin/onaccount/manage/getOnaccountRepayLog',
    method: 'post',
    data
  })
}
export function getOnaccountLog(data = {}) {
  return request({
    url: module + '/fin/onaccount/manage/getOnaccountLog',
    method: 'post',
    data
  })
}
export function getPage(data = {}) {
  return request({
    url: module + '/fin/onaccount/manage/getOnaccountPage',
    method: 'post',
    data
  })
}
export function repay(data = {}) {
  return request({
    url: module + '/fin/onaccount/manage/repay',
    method: 'post',
    data
  })
}
export function updateOrder(data = {}) {
  return request({
    url: module + '/fin/onaccount/manage/updateOnaccount',
    method: 'post',
    data
  })
}
// export function getSendNumber(data = {}) {
//   return request({
//     url: module + '/fin/serial/number/getFinSerialNumber',
//     method: 'post',
//     data
//   })
// }
