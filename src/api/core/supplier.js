const module = '/core'
import request from '@/utils/request'
// 市场档案
export function getSupplierPage(data = {}) {
  return request({
    url: module + '/supplier/getSupplierPage',
    method: 'post',
    data
  })
}
export function addSupplier(data = {}) {
  return request({
    url: module + '/supplier/addSupplier',
    method: 'post',
    data
  })
}
export function deleteSupplierById(data = {}) {
  return request({
    url: module + '/supplier/deleteSupplierById',
    method: 'post',
    data
  })
}
export function updateSupplier(data = {}) {
  return request({
    url: module + '/supplier/updateSupplier',
    method: 'post',
    data
  })
}

// 分组列表
export function addSupplierGroup(data = {}) {
  return request({
    url: module + '/supplier/group/addSupplierGroup',
    method: 'post',
    data
  })
}
export function deleteSupplierGroup(data = {}) {
  return request({
    url: module + '/supplier/group/deleteSupplierGroup',
    method: 'post',
    data
  })
}
export function getSupplierGroupPage(data = {}) {
  return request({
    url: module + '/supplier/group/getSupplierGroupPage',
    method: 'post',
    data
  })
}
export function updateSupplierGroup(data = {}) {
  return request({
    url: module + '/supplier/group/updateSupplierGroup',
    method: 'post',
    data
  })
}
export function getSupplierGroupList(data = {}) {
  return request({
    url: module + '/supplier/group/getSupplierGroupList',
    method: 'post',
    data
  })
}
export function changeSupplierEnable(data = {}) {
  return request({
    url: module + '/supplier/changeSupplierEnable',
    method: 'post',
    data
  })
}
