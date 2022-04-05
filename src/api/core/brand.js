const module = '/core'
import request from '@/utils/request'
// 获取品牌列表
export function brandselect(data = {}) {
  return request({
    url: module + '/brand/selectBrand',
    method: 'post',
    data
  })
}

// 获取品牌列表
export function branddelete(data = {}) {
  return request({
    url: module + '/brand/deleteBrand',
    method: 'post',
    data
  })
}
// 获取品牌列表
export function brandadd(data = {}) {
  return request({
    url: module + '/brand/addBrand',
    method: 'post',
    data
  })
}
// 获取品牌列表
export function brandupdate(data = {}) {
  return request({
    url: module + '/brand/updateBrand',
    method: 'post',
    data
  })
}
// 获取品牌列表
export function getBrandList(data = {}) {
  return request({
    url: module + '/brand/getBrandList',
    method: 'post',
    data
  })
}
