const module = '/wms'
import request from '@/utils/request'

export function getPage(data = {}) {
  return request({
    url: module + '/retail/adjust/price/log/getList',
    method: 'post',
    data
  })
}
