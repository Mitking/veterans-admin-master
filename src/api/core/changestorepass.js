const module = '/core'
import request from '@/utils/request'
// 修改密码
export function changeStorePasswd(data = {}) {
  return request({
    url: module + '/store/changeStorePasswd',
    method: 'post',
    data
  })
}
