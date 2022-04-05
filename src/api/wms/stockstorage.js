const module = '/core'
import request from '@/utils/request'
// 查询
export function getStockStoragePage(data = {}) {
  return request({
    url: module + '/stock/storage/getStockStoragePage',
    method: 'post',
    data
  })
}
export function printStockStorage(data = {}) {
  return request({
    url: module + '/stock/storage/printStockStorage',
    method: 'post',
    data
  })
}
export function syncLemengStockByStoreId(data = {}) {
  return request({
    url: module + '/api/lemeng/syncLemengStockByStoreId',
    method: 'post',
    data
  })
}
