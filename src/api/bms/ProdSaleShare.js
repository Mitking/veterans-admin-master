const module = '/bms'
import request from '@/utils/request'
// 消费汇总
export function prodSaleShare(data = {}) {
  return request({
    url: module + '/product/statis/prodSaleShare',
    method: 'post',
    data
  })
}
