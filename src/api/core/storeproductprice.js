const module = '/core'
import request from '@/utils/request'
// 门店商品
export function getPage(data = {}) {
  return request({
    // url: module + '/store/product/getRetailPrice',
    url: module + '/store/product/getStoreProductForMobile',
    method: 'post',
    data
  })
}
export function deleteById(data = {}) {
  return request({
    url: module + '/store/product/price/deleteById',
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
export function getPriceDetails(data = {}) {
  return request({
    url: module + '/store/product/price/getPrice',
    method: 'post',
    data
  })
}

