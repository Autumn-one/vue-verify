/*
 created by czh
 created time 2020/9/10
 description: 全局自定义指令
 */

import { regExpConfig } from './regExpConfig'
import mergeOptions from './util/mergeOptions'
import installDirective from './installDirective'

export default {
  install (Vue, options = {}) {
    let defaultOptions = {
      regExp: regExpConfig,
      defaultStyle: true
    }
    options = mergeOptions(defaultOptions, options)

    Vue.directive('verify', {
      inserted (el, binding, vnode) {
        installDirective(el, binding, vnode, options)
      }
    })

  }
}
