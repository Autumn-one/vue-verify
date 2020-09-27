/*
 created by czh
 created time 2020/9/10
 description: 全局自定义指令
 */
import Vue from 'vue'
import verifyForm from './verifyForm'

const directive = Object.assign({}, verifyForm)

// 注册全局指令
Object.keys(directive).forEach(key => {
  Vue.directive(key, directive[key])
})
