import axios from 'axios'
import router from '../router/index'
import { Message, Loading } from 'element-ui'
import qs from 'qs'

let loading
function startLoading () {
  loading = Loading.service({
    lock: true,
    text: '加载中……',
    ackground: 'rgba(0, 0, 0, 0.5)',
    target: document.querySelector('#app')
  })
}
let loadingCount = 0
export function showFullScreenLoading () {
  if (loadingCount === 0) {
    startLoading()
  }
  loadingCount++
}

// 创建一个axios实例
const instance = axios.create({
  timeout: 60000,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
  }
})

/**
 * 跳转登录页
 */
const toLogin = () => {
  router.push({ path: '/login' })
  localStorage.clear()
  information.warning('登录超时，请重新登录!')
  hideFullScreenLoading()
}

const showMessage = Symbol('showMessage')
class DoneMessage {
  [showMessage] (type, options, single) {
    if (single) {
      if (document.getElementsByClassName('el-message').length === 0) {
        Message[type](options)
      }
    } else {
      Message[type](options)
    }
  }
  warning (options, single = true) {
    this[showMessage]('warning', options, single)
  }
  error (options, single = true) {
    this[showMessage]('error', options, single)
  }
  success (options, single = true) {
    this[showMessage]('success', options, single)
  }
}

const information = new DoneMessage()

// 请求前拦截器
instance.interceptors.request.use(
  config => {
    if (localStorage.getItem('Authorization')) {
      config.headers.common['Authorization'] = localStorage.getItem('Authorization')
      config.headers.common['RefreshToken'] = localStorage.getItem('RefreshToken')
    }
    if (config.method === 'post') {
      // if (config.data != undefined && (config.data.toString().indexOf("&") != -1 || config.data.toString().indexOf("=") != -1)) {
      //     config.data = parseQueryString(config.data)
      // }
      if (!isRefreshing) {
        config.data = qs.stringify(config.data)
      }
    }
    if (config.showLoading !== false) {
      showFullScreenLoading()
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

let isRefreshing = false

// 请求成功后拦截
instance.interceptors.response.use(response => {
  const { state, message } = response.data
  if (response.config.showLoading !== false) {
    hideFullScreenLoading()
  }
  // 返回状态值为0，请求成功
  if (state === 0) {
    if (message !== '' && message !== null) {
      information.success(message)
    }
  }
  // 返回状态值为1，请求失败
  if (state === 1) {
    if (message !== '' && message !== null) {
      information.error(message)
    }
  }
  // 返回状态值为-1，登录超时
  if (state === -1) {
    toLogin()
    if (message !== '' && message !== null) {
      information.error(message)
    }
  }
  // 返回状态值为-99，登录验证码过期
  if (state === -99) {
    if (message !== '' && message !== null) {
      information.error(message)
    }
  }
  return Promise.resolve(response)
}, error => {
  hideFullScreenLoading()
  return Promise.reject(error)
})

export function hideFullScreenLoading () {
  if (loadingCount <= 0) return
  loadingCount--
  if (loadingCount === 0) {
    loading.close()
  }
}

export default instance
