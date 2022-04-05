const module = '/core'
import request from '@/utils/request'
// 算法分组
export function addPriceAlg(data = {}) {
  return request({
    url: module + '/price/alg/team/addPriceAlg',
    method: 'post',
    data
  })
}
// 算法分组
export function deletePriceAlgTeam(data = {}) {
  return request({
    url: module + '/price/alg/team/deletePriceAlgTeam',
    method: 'post',
    data
  })
}
// 算法分组
export function getAlgTeamPage(data = {}) {
  return request({
    url: module + '/price/alg/team/getAlgTeamPage',
    method: 'post',
    data
  })
}
// 算法分组
export function getPriceAlgEntity(data = {}) {
  return request({
    url: module + '/price/alg/team/getPriceAlgEntity',
    method: 'post',
    data
  })
}
// 算法分组
export function getPriceAlgTeamEntity(data = {}) {
  return request({
    url: module + '/price/alg/team/getPriceAlgTeamEntity',
    method: 'post',
    data
  })
}
// 算法分组
export function updatePriceAlg(data = {}) {
  return request({
    url: module + '/price/alg/team/updatePriceAlg',
    method: 'post',
    data
  })
}
