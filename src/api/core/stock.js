const module = '/core'
import request from '@/utils/request'
// 获取列表
export function getStockPage(data = {}) {
  return request({
    url: module + '/stock/getStockPage',
    method: 'post',
    data
  })
}
// 获取列表
export function addStock(data = {}) {
  return request({
    url: module + '/stock/addStock',
    method: 'post',
    data
  })
}
// 获取列表
export function deleteStockById(data = {}) {
  return request({
    url: module + '/stock/deleteStockById',
    method: 'post',
    data
  })
}
// 获取列表
export function updateStock(data = {}) {
  return request({
    url: module + '/stock/updateStock',
    method: 'post',
    data
  })
}
// 分组
export function getStockGroupPage(data = {}) {
  return request({
    url: module + '/stock/group/getStockGroupPage',
    method: 'post',
    data
  })
}

export function addStockGroup(data = {}) {
  return request({
    url: module + '/stock/group/addStockGroup',
    method: 'post',
    data
  })
}
export function deleteStockGroupById(data = {}) {
  return request({
    url: module + '/stock/group/deleteStockGroupById',
    method: 'post',
    data
  })
}
export function updateStockGroup(data = {}) {
  return request({
    url: module + '/stock/group/updateStockGroup',
    method: 'post',
    data
  })
}
export function getStockGroupList() {
  return request({
    url: module + '/stock/group/getStockGroupList',
    method: 'post'
  })
}
// 库位
export function addStockLocation(data = {}) {
  return request({
    url: module + '/stock/location/addStockLocation',
    method: 'post',
    data
  })
}
export function deleteStockLocationById(data = {}) {
  return request({
    url: module + '/stock/location/deleteStockLocationById',
    method: 'post',
    data
  })
}
export function updateStockLocation(data = {}) {
  return request({
    url: module + '/stock/location/updateStockLocation',
    method: 'post',
    data
  })
}
export function getStockLocationPage(data = {}) {
  return request({
    url: module + '/stock/location/getStockLocationPage',
    method: 'post',
    data
  })
}
export function getStockList(data = {}) {
  return request({
    url: module + '/stock/getStockList',
    method: 'post',
    data
  })
}

