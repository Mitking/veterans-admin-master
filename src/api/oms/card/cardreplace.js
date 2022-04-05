const module = '/oms'
import request from '@/utils/request'
// 获取
export function getPage(data = {}) {
  return request({
    url: module + '/card/replace/log/getCardReplaceLog',
    method: 'post',
    data
  })
}
