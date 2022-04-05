const module = '/core'
import request from '@/utils/request'
// 获取价格计算列表
export function getPriceAlgPage(data = {}) {
  return request({
    url: module + '/price/alg/getPriceAlgPage',
    method: 'post',
    data
  })
}
// 更新价格计算列表
export function updatePriceAlg(data = {}) {
  return request({
    url: module + '/price/alg/updatePriceAlg',
    method: 'post',
    data
  })
}

// 新增价格计算列表
export function addPriceAlg(data = {}) {
  return request({
    url: module + '/price/alg/addPriceAlg',
    method: 'post',
    data
  })
}
// 新增价格计算列表
export function deletePriceAlg(data = {}) {
  return request({
    url: module + '/price/alg/deletePriceAlg',
    method: 'post',
    data
  })
}

