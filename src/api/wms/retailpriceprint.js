const module = '/wms'
import request from '@/utils/request'

export function pricePrint(data = {}) {
  return request({
    url: module + '/retail/price/print/add',
    method: 'post',
    data
  })
}
