const module = '/ums'
import request from '@/utils/request'
export function getCustomerManageRes(data = {}) {
  return request({
    url: module + '/customer/manage/getCustomerManageRes',
    method: 'post',
    data
  })
}
export function appendCustomerManage(data = {}) {
  return request({
    url: module + '/customer/manage/appendCustomerManage',
    method: 'post',
    data
  })
}
export function deleteCustomerManage(data = {}) {
  return request({
    url: module + '/customer/manage/deleteCustomerManage',
    method: 'post',
    data
  })
}
export function updateCustomerManage(data = {}) {
  return request({
    url: module + '/customer/manage/updateCustomerManage',
    method: 'post',
    data
  })
}
export function getCustomerTypeGroup(data = {}) {
  return request({
    url: module + '/customer/type/getCustomerTypeGroup',
    method: 'post',
    data
  })
}

// 类型相关
export function getCustomerTypeRes(data = {}) {
  return request({
    url: module + '/customer/type/getCustomerTypeRes',
    method: 'post',
    data
  })
}
export function appendCustomerType(data = {}) {
  return request({
    url: module + '/customer/type/appendCustomerType',
    method: 'post',
    data
  })
}
export function deleteCustomerType(data = {}) {
  return request({
    url: module + '/customer/type/deleteCustomerType',
    method: 'post',
    data
  })
}
export function updateCustomerType(data = {}) {
  return request({
    url: module + '/customer/type/updateCustomerType',
    method: 'post',
    data
  })
}
