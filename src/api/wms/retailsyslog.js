const module = '/wms'
import request from '@/utils/request'

export function getPage(data = {}) {
  return request({
    url: module + '/retail/sys/log/getList',
    method: 'post',
    data
  })
}
