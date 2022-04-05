const module = '/core'
import request from '@/utils/request'
// 门店商品
export function getPage(data = {}) {
  return request({
    url: module + '/store/product/getStoreProductForMobile',
    method: 'post',
    data
  })
}
export function addStoreProduct(data = {}) {
  return request({
    url: module + '/store/product/addStoreProductBatch',
    method: 'post',
    data
  })
}
export function updateStoreProduct(data = {}) {
  return request({
    url: module + '/store/product/updateStoreProductBatch',
    method: 'post',
    data
  })
}
export function deleteOrder(data = {}) {
  return request({
    url: module + '/store/product/deleteById',
    method: 'post',
    data
  })
}
export function copyStoreProduct(data = {}) {
  return request({
    url: module + '/store/product/copyStoreProduct',
    method: 'post',
    data
  })
}
export function storeProductPricePull(data = {}) {
  return request({
    url: module + '/store/product/price/addStoreProductPriceBatch',
    method: 'post',
    data
  })
}
export function getPrice(data = {}) {
  return request({
    url: module + '/store/product/price/getPrice',
    method: 'post',
    data
  })
}
export function updateOrder(data = {}) {
  return request({
    url: module + '/store/product/price/updatePrice',
    method: 'post',
    data
  })
}
export function syncStock(data = {}) {
  return request({
    url: module + '/api/lemeng/syncStock',
    method: 'post',
    data
  })
}
