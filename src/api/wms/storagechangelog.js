const module = '/core'
import request from '@/utils/request'
// 单新增
export function getStockStorageChangeLog(data = {}) {
  return request({
    url: module + '/stock/storage/getStockStorageChangeLog',
    method: 'post',
    data
  })
}
