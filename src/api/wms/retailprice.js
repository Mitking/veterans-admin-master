const module = '/wms'
import request from '@/utils/request'

export function getRetailPrice(data = {}) {
  return request({
    url: module + '/retail/getRetailPrice',
    method: 'post',
    data
  })
}
