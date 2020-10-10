/*
 created by czh
 created time 2020/9/10
 description: 表单验证指令
 */
import { regExpConfig } from './regExpConfig'

// 创建应用于第一次与之后的事件绑定函数
function bindEventFirstAndLater (dom, eventName, firstFn, laterFn) {
    let tempFn = function () {
        firstFn.apply(this, arguments)
        // 取消事件绑定
        dom.removeEventListener(eventName, tempFn, false)
        // 重新绑定事件
        dom.addEventListener(eventName, laterFn, false)
    }
    dom.addEventListener(eventName, tempFn, false)
}

function getResponse (obj, pathArr) {
    let len = pathArr.length
    for (let i = 0; i < len; i++) {
        obj = obj[pathArr[i]]
    }
    return obj
}

/**
 * @fnName verifySet 在有表达式传入的时候用来设置当前组件的响应式验证结果
 * @param vm 当前组件实例
 * @param _data 响应式数据实例
 * @param statusObj 验证结果
 */
function verifySet (vm, _data, statusObj) {
    Object.keys(statusObj).forEach(key => {
        if (_data[key]) {
            _data[key] = statusObj[key]
        } else {
            vm.$set(_data, key, statusObj[key])
        }
    })

}

export default {
    verify: {
        inserted: function (el, binding, vnode) {

            // 判断el 是否是input
            if (el.nodeName.toLowerCase() !== 'input') {
                el = el.getElementsByTagName('input')[0]
            }
            // 获取组件实例
            let vm = vnode.context
            // 记录原本的样式
            let originBorderStyle = getComputedStyle(el).border
            // 获取检测标识(决定要级联那几个表单元素) 指令表达式(决定要将结果绑定到哪个变量,可选) 修饰符(决定应用那些正则表达式)
            let { expression, arg, modifiers } = binding

            // 判断是否传入标识参数，用于非响应式的外部组合验证
            if (!vm.$verify) {
                vm.$verify = {
                    doVerify (namespace = 'default') { // 手动验证的方法
                        // 在某个 dom 触发blur事件的方法
                        let triggerBlur = el => {
                            let e = document.createEvent('UIEvents')
                            e.initUIEvent('blur')
                            el.dispatchEvent(e)
                        }
                        if (namespace === 'all') { // 如果验证所有
                            Object.keys(vm.$verify).forEach(key => {
                                if (key.endsWith('El')) {
                                    vm.$verify[key].forEach(el => triggerBlur(el))
                                }
                            })
                        } else {
                            // 默认是 default
                            vm.$verify[namespace + 'El'].forEach(el => triggerBlur(el))
                        }

                        console.log('最终的验证结果')
                        console.log(vm.$verify)
                    }
                }
            }

            // 定义供内部使用的存放结果的数组
            let _verifyArr = null

            // 根据是否传入 arg 来创建命名空间
            let verifyNamespace = arg || 'default'

            if (!vm.$verify[verifyNamespace]) {
                vm.$verify[verifyNamespace] = []
                vm.$verify[verifyNamespace].verify = false // 绑定集合结果

            }
            // 如果根组件实例的 $verify 上没有对应 el 数组则添加
            if (!vm.$verify[verifyNamespace + 'El']) {
                vm.$verify[verifyNamespace + 'El'] = []
            }
            // 每次初始化添加 el 到自己的命名空间中的el数组
            vm.$verify[verifyNamespace + 'El'].push(el)

            _verifyArr = vm.$verify[verifyNamespace]
            let pathArr = []
            // 定义组件内响应式对象的引用，只在 expression 存在的时候才有
            let _data = null
            if (expression) {
                pathArr = expression.split('.')
                _data = getResponse(vm, pathArr)
                // 如果传入了表达式也就具备了 _data 需要将 _data 暴露出去，依托$verify 的命名空间
                _verifyArr._dataArr = _verifyArr._dataArr || []
                _verifyArr._dataArr.push(_data)
            }

            // 获取当前结果储存位置
            let _verifyIndex = _verifyArr.length

            // 将修饰符对象切割成数组用于正则验证
            let regExpArr = Object.keys(modifiers)
            // 判断数组中是否有 equal 修饰符，用于判断输入框内容是否相等 如果有则从数组中删除并且将 hasEqual 设置为true 没有则只将其设置 false
            let equalIndex = regExpArr.indexOf('equal')
            let hasEqual = equalIndex === -1 ? false : (regExpArr.splice(equalIndex, 1), true)

            // 设置当前状态的默认内容,这是全局的
            let defaultVerifyObj = _verifyArr[_verifyIndex] = {
                verify: false, // 保存整体验证的结果
                regVerify: false, // 保存正则验证的结果
                equalVerify: true, // 保存对等验证的结果
                emptyVerify: false, // 保存空验证的结果,这里默认设置为 true 是因为通常用到这个状态的输入框，第一次加载不会让这个状态对应的提示信息显示出来
                equal: hasEqual, // 当前是否包含 equal 修饰符
                isFirst: true, // 是否是第一次
                value: '' // 默认input 值为空字符串
            }

            // 如果有表达式设置初始化数据
            expression && verifySet(vm, _data, defaultVerifyObj)

            // 实际检测内容是否合法的函数
            function verifyInput (eventType) {
                // 立刻获取元素中的 value
                let inputValue = el.value
                // 输入框空验证
                let emptyVerifyFlag = true
                // 验证规则，获取最终正则验证的结果，此时还没有检验 equal 验证
                let regVerifyFlag = true

                if (inputValue === '') {
                    emptyVerifyFlag = false
                    regVerifyFlag = true
                } else {
                    emptyVerifyFlag = true
                    regVerifyFlag = regExpArr.some(key => regExpConfig[key].test(inputValue))
                }
                // 优先更新非响应式数据
                _verifyArr[_verifyIndex].isFirst = false // 更新非响应数据中的 isFirst

                _verifyArr[_verifyIndex].value = inputValue // 更新非响应数据中的 value

                _verifyArr[_verifyIndex].regVerify = regVerifyFlag // 更新非响应数据中的正则验证状态

                _verifyArr[_verifyIndex].emptyVerify = emptyVerifyFlag // 更新非响应数据中的空验证

                // 如果设置了响应数据则批量更新响应数据
                if (_data) {
                    _data.isFirst = false

                    _data.value = inputValue

                    _data.regVerify = regVerifyFlag

                    _data.emptyVerify = emptyVerifyFlag
                }

                // 验证相等性 equal, 这个验证失败需要更新所有的
                let equalVerifyFlag = true
                if (hasEqual) {
                    // 获取所有的包含equal属性的 value 然后将其放入数组做相等性对比
                    let valueArr = _verifyArr.filter(o => o.equal && o.value.trim() !== '').map(o => o.value)
                    if (valueArr.length > 0) {
                        let tempV = valueArr[0]
                        // 判断相等性
                        equalVerifyFlag = valueArr.every(v => v === tempV)
                    }
                    // 只要有一个相等性验证不通过，所有的相等性验证都要同步更新
                    _verifyArr.forEach(o => {
                        if (o.equal) o.equalVerify = equalVerifyFlag
                    })
                    _verifyArr._dataArr.forEach(o => {
                        if (o.equal) o.equalVerify = equalVerifyFlag
                    })

                }

                // 聚合计算所有的响应对象中的最终验证结果
                _verifyArr._dataArr.forEach(verifyObj => {
                    verifyObj.verify = [verifyObj.emptyVerify, verifyObj.equalVerify, verifyObj.regVerify].every(f => f)
                })
                // 集合计算所有的非响应式对象中的最终验证结果
                _verifyArr.forEach(verifyObj => {
                    verifyObj.verify = [verifyObj.emptyVerify, verifyObj.equalVerify, verifyObj.regVerify].every(f => f)
                })

                // 聚合计算所有的结果生成最终的结果
                _verifyArr.verify = _verifyArr.every(obj => obj.verify)

                console.log(`查看内部状态：元素 ${el.value} --- regVerifyFlag：${regVerifyFlag} --- equalVerifyFlag：${equalVerifyFlag} --- eventType：${eventType}`)

                // 所有的空input 不显示红
                // 正则验证失败一定为红 相等性验证失败的最后一个框
                let isLastEqualInput = false // 判断当前输入框是否为最后一个相等性输入框
                let lastEqualInputIndex = -1
                for (let i = _verifyArr.length - 1; i >= 0; i--) {
                    if (_verifyArr[i].equal) {
                        lastEqualInputIndex = i
                        break
                    }
                }
                if (lastEqualInputIndex === _verifyIndex) {
                    isLastEqualInput = true
                } else {
                    isLastEqualInput = false
                }

                if (el.value === '' || (regVerifyFlag && equalVerifyFlag) || (regVerifyFlag && (!equalVerifyFlag && !isLastEqualInput))) {
                    el.style.border = originBorderStyle
                } else {
                    el.style.border = '2px solid #ed4014'
                }

            }

            let firstFn = function () {
                verifyInput('blur')
                el.addEventListener('input', function () {
                    verifyInput()
                }, false)
            }
            let laterFn = function () {
                verifyInput('blur')
            }
            bindEventFirstAndLater(el, 'blur', firstFn, laterFn)
        }
    }
}
