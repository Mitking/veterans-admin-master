const module = '/core'
import request from '@/utils/request'

export function addAchiveImg(data = {}) {
  return request({
    url: module + '/product/archive/img/addAchiveImg',
    method: 'post',
    data
  })
}
export function deleteAchiveImg(data = {}) {
  return request({
    url: module + '/product/archive/img/deleteAchiveImg',
    method: 'post',
    data
  })
}
export function queryImgByGoodsCode(data = {}) {
  return request({
    url: module + '/product/archive/img/queryImgByGoodsCode',
    method: 'post',
    data
  })
}
export function updateAchiveFirstImg(data = {}) {
  return request({
    url: module + '/product/archive/img/updateAchiveFirstImg',
    method: 'post',
    data
  })
}
export function fileUpload(data = {}) {
  return request({
    url: module + '/file/fileUpload',
    method: 'post',
    data
  })
}
