const module = '/core'
import request from '@/utils/request'
// 单新增
export function addOrder(data = {}) {
  return request({
    url: module + '/expiration/remind/addExpirationRemind',
    method: 'post',
    data
  })
}
// 单删除
export function deleteOrder(data = {}) {
  return request({
    url: module + '/expiration/remind/deleteExpirationRemind',
    method: 'post',
    data
  })
}

// 单查询
export function getPage(data = {}) {
  return request({
    url: module + '/expiration/remind/expirationRemindList',
    method: 'post',
    data
  })
}
