import axios from 'axios'
import { Message } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  timeout: 5000, // request timeout
  responseType: 'blob'
})

// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent
    if (store.getters.token) {
      // let each request carry token
      // ['X-Token'] is a custom headers key
      // please modify it according to the actual situation
      config.headers['Authorization'] = getToken()
    }
    return config
  },
  error => {
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  response => {
    const res = response
    if (response.status !== 200) {
      Message.alert('文件下载错误，错误码：', response.status)
      return
    }
    const blob = new Blob([res.data], {
      type: 'application/xlsx;charset=utf-8'
    })
    // 后端需要在请求头里加filename 把文件名.后缀 返回
    let fileName = res.headers['filename']

    fileName = decodeURIComponent(fileName)

    const eleLink = document.createElement('a')
    eleLink.download = fileName
    eleLink.style.display = 'none'
    // 字符内容转变成blob地址
    // URL.createObjectURL(blob)会创建URL对象，返回一个下载文件的地址
    eleLink.href = URL.createObjectURL(blob)
    // 触发点击
    document.body.appendChild(eleLink)
    eleLink.click()
    // 释放URL对象
    URL.revokeObjectURL(eleLink.href)
    // 然后移除
    document.body.removeChild(eleLink)
    // }
  }
  // error => {
  //   // console.log(error)
  //   // const response = error.response.data
  //   // if (response.status === 503) {
  //   //   Message({
  //   //     message: `「${getServiceName(response.path)}」已下线`,
  //   //     type: 'error',
  //   //     duration: 5 * 1000
  //   //   })
  //   // } else {
  //   //   console.log('err' + error) // for debug
  //   Message({
  //     message: error,
  //     type: 'error',
  //     duration: 5 * 1000
  //   })
  //   // }
  //   return Promise.reject(error)
  // }
)

export default service
