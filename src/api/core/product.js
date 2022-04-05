const module = '/core'
import request from '@/utils/request'
// 获取商品档案列表
export function getProductPage(data = {}) {
  return request({
    url: module + '/product/archive/getProductPage',
    method: 'post',
    data
  })
}
// 获取商品详情
export function getProductDetail(data = {}) {
  return request({
    url: module + '/product/archive/getProductDetail',
    method: 'post',
    data
  })
}
// 获取商品详情
export function addProduct(data = {}) {
  return request({
    url: module + '/product/archive/addProduct',
    method: 'post',
    data
  })
}
// 商品修改
export function updateProduct(data = {}) {
  return request({
    url: module + '/product/archive/updateProduct',
    method: 'post',
    data
  })
}
// 商品删除
export function deleteProduct(data = {}) {
  return request({
    url: module + '/product/archive/deleteProduct',
    method: 'post',
    data
  })
}
// 商品价格
export function getProductPrice(data = {}) {
  return request({
    url: module + '/product/archive/price/getProductPrice',
    method: 'post',
    data
  })
}
// 商品组合
export function getComboList(data = {}) {
  return request({
    url: module + '/product/combo/getComboList',
    method: 'post',
    data
  })
}
// 商品删除组合
export function deleteCombo(data = {}) {
  return request({
    url: module + '/product/combo/deleteCombo',
    method: 'post',
    data
  })
}
// 商品删除组合
export function deleteById(data = {}) {
  return request({
    url: module + '/product/archive/price/deleteById',
    method: 'post',
    data
  })
}
// 获取商品编号
export function generateGoodsCode(data = {}) {
  return request({
    url: module + '/product/archive/generateGoodsCode',
    method: 'post',
    data
  })
}
// 算法列表
export function getAlgJson(data = {}) {
  return request({
    url: module + '/price/alg/getAlgJson',
    method: 'post',
    data
  })
}
// 算法计算
export function calculatePrice(data = {}) {
  return request({
    url: module + '/price/alg/calculatePrice',
    method: 'post',
    data
  })
}
// 获取条码号
export function getProductWeightingBarcode(data = {}) {
  return request({
    url: module + '/product/archive/getProductWeightingBarcode',
    method: 'post',
    data
  })
}
// 查询商城新品
export function NewProdList(data = {}) {
  return request({
    url: module + '/generate/product/getNewProdList',
    method: 'post',
    data
  })
}
// 查询商城新品
export function importProduct(data = {}) {
  return request({
    url: module + '/archive/importProductArchive',
    method: 'post',
    data,
    timeout: 15000
  })
}
