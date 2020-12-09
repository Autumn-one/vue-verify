import {
  bindEventFirstAndLater,
  setVerifyToResData,
  verifyInit
} from './util/verifyUtil'

export default function (el, binding, vnode, options) {
  if (el.nodeName.toLowerCase() !== 'input') {
    el = el.getElementsByTagName('input')[0]
  }
  let vm = vnode.context
  let originBorderStyle = getComputedStyle(el).border

  let {
    expression,
    arg,
    modifiers,
    value: resVerify
  } = binding

  let namespace = arg || 'default'

  verifyInit(vm, el, namespace)

  let verifyArr = vm.$verify[namespace]
  let resVerifyArr = vm.$verify['res_' + namespace]

  let index = verifyArr.length

  let regExpArr = Object.keys(modifiers)
  let equalIndex = regExpArr.indexOf('equal')
  let _hasEqual = equalIndex === -1 ? false : (regExpArr.splice(equalIndex, 1), true)

  let currVerify = verifyArr[index] = {
    all: true,
    regExp: true,
    equal: true,
    empty: true,
    isFirst: true,
    value: '',
    _hasEqual,
    _skip: el.getAttribute('skip') === '' || el.getAttribute('skip') === 'true',
    _need: el.getAttribute('need') === '' || el.getAttribute('need') === 'true'
  }

  if (expression) {
    setVerifyToResData(vm, resVerify, currVerify)
    resVerifyArr.push(resVerify)
  }

  function verifyInputHandle () {

    currVerify._skip = el.getAttribute('skip') === '' || el.getAttribute('skip') === 'true'
    currVerify._need = el.getAttribute('need') === '' || el.getAttribute('need') === 'true'
    if (resVerify) setVerifyToResData(vm, resVerify, currVerify)

    let inputValue = el.value

    let emptyVerify = true

    let regVerify = true

    if (inputValue.trim() === '') {
      emptyVerify = false
      regVerify = true
    } else {
      emptyVerify = true
      regVerify = regExpArr.some(key => options.regExp[key].test(inputValue))
    }

    currVerify.isFirst = false

    currVerify.value = inputValue

    currVerify.regExp = regVerify

    currVerify.empty = emptyVerify
    if (expression) {
      setVerifyToResData(vm, resVerify, currVerify)
    }

    
    let equalVerify = true
    if (_hasEqual) {
      
      let equalItems = verifyArr.filter(item => item._hasEqual) 
      let valueArr = equalItems.map(i => i.value)
      if (valueArr.length > 0) {
        let tempV = valueArr[0]
       
        equalVerify = valueArr.every(v => v === tempV)
      }
      
      equalItems.forEach(i => (i.equal = equalVerify))
      
      let resEqualItems = resVerifyArr.filter(i => i._hasEqual)
      resEqualItems.forEach(i => (i.equal = equalVerify))

      equalItems.forEach(item => {
        item.all = (v => {
          if (v._need) {
            return v.empty && v.regExp && v.equal
          } else {
            return v.regExp && v.equal
          }
        })(item)
      })

      resEqualItems.forEach(item => {
        item.all = (v => {
          if (v._need) {
            return v.empty && v.regExp && v.equal
          } else {
            return v.regExp && v.equal
          }
        })(item)
      })

    } else {
      
      currVerify.all = ((c) => {
        if (c._need) {
          return c.empty && c.regExp
        } else {
          return c.regExp
        }
      })(currVerify)
      if (resVerify) resVerify.all = currVerify.all

    }
    
    verifyArr.all = verifyArr.every(obj => {
      if (obj._skip) { 
        return true
      } else {
        return obj.all
      }
    })

   
    let isLastEqualInput = false
    let lastEqualInputIndex = -1
    for (let i = verifyArr.length - 1; i >= 0; i--) {
      if (verifyArr[i]._hasEqual) {
        lastEqualInputIndex = i
        break
      }
    }
    if (lastEqualInputIndex === index) {
      isLastEqualInput = true
    } else {
      isLastEqualInput = false
    }
    if (options.defaultStyle) {
      if (el.value === '' || currVerify._skip || (regVerify && equalVerify) || (regVerify && (!equalVerify && !isLastEqualInput))) {
        el.style.border = originBorderStyle
      } else {
        el.style.border = '2px solid #ed4014'
      }
    }

  }

  let firstFn = function () {
    verifyInputHandle()
    el.addEventListener('input', function () {
      verifyInputHandle()
    }, false)
  }
  let laterFn = function () {
    verifyInputHandle()
  }
  bindEventFirstAndLater(el, 'blur', firstFn, laterFn)
}
