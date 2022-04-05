const module = '/core'
import request from '@/utils/request'
// 获取价格计算列表
export function getUnitPage(data = {}) {
  return request({
    url: module + '/product/archive/unit/getUnitPage',
    method: 'post',
    data
  })
}
// 获取价格计算列表
export function addUnit(data = {}) {
  return request({
    url: module + '/product/archive/unit/addUnit',
    method: 'post',
    data
  })
}
// 获取价格计算列表
export function deleteUnitById(data = {}) {
  return request({
    url: module + '/product/archive/unit/deleteUnitById',
    method: 'post',
    data
  })
}
// 获取价格计算列表
export function updateUnitEnable(data = {}) {
  return request({
    url: module + '/product/archive/unit/updateUnitEnable',
    method: 'post',
    data
  })
}
