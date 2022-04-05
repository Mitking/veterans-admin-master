const module = '/core'
import request from '@/utils/request'
// 获取商品分类列表
export function getCategoryList(data = {}) {
  return request({
    url: module + '/product/category/getCategoryList',
    method: 'post',
    data
  })
}
// 新增商品分类列表
export function addCategory(data = {}) {
  return request({
    url: module + '/product/category/addCategory',
    method: 'post',
    data
  })
}
// 修改商品分类列表
export function updateCategory(data = {}) {
  return request({
    url: module + '/product/category/updateCategory',
    method: 'post',
    data
  })
}
// 删除商品分类列表
export function deleteCategoryById(data = {}) {
  return request({
    url: module + '/product/category/deleteCategoryById',
    method: 'post',
    data
  })
}
// 删除商品分类列表Tree
export function getCategoryTree(data = {}) {
  return request({
    url: module + '/product/category/getCategoryTree',
    method: 'post',
    data
  })
}
