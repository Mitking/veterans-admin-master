const module = '/core'
import request from '@/utils/request'
// 获取关于我们
export function getAbout(data = {}) {
  return request({
    url: module + '/about/getText',
    method: 'post',
    data
  })
}
