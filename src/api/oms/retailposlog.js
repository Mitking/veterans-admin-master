const module = '/oms'
import request from '@/utils/request'
// 获取
export function getPage(data = {}) {
  return request({
    url: module + '/pos/log/getPosLogPage',
    method: 'post',
    data
  })
}
