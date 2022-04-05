const module = '/wms'
import request from '@/utils/request'

export function getPage(data = {}) {
  return request({
    url: module + '/retail/pos/register/getList',
    method: 'post',
    data
  })
}
export function addAndGetList(data = {}) {
  return request({
    url: module + '/retail/pos/register/getListForRegister',
    method: 'post',
    data
  })
}
export function save(data = {}) {
  return request({
    url: module + '/retail/pos/register/save',
    method: 'post',
    data
  })
}

export function deleteOrders(data = {}) {
  return request({
    url: module + '/retail/pos/register/delete',
    method: 'post',
    data
  })
}
// 禁用启用
export function swEnableState(data = {}) {
  return request({
    url: module + '/retail/pos/register/switchEnable',
    method: 'post',
    data
  })
}
