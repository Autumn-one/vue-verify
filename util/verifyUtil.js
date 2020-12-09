export function bindEventFirstAndLater (dom, eventName, firstFn, laterFn) {
  let tempFn = function () {
    firstFn.apply(this, arguments)
    dom.removeEventListener(eventName, tempFn, false)
    dom.addEventListener(eventName, laterFn, false)
  }
  dom.addEventListener(eventName, tempFn, false)
}

export function getResponseDataByPath (vm, pathArr) {
  let len = pathArr.length
  for (let i = 0; i < len; i++) {
    vm = vm[pathArr[i]]
  }
  return vm
}

export function setVerifyToResData (vm, resVerify, verify) {
  Object.keys(verify).forEach(key => {
    if (resVerify[key]) {
      resVerify[key] = verify[key]
    } else {
      vm.$set(resVerify, key, verify[key])
    }
  })
}

export const triggerBlur = el => {
  let e = document.createEvent('UIEvents')
  e.initUIEvent('blur')
  el.dispatchEvent(e)
}

export const verifyInit = (vm, el, verifyNamespace) => {
  if (!vm.$verify) {
    vm.$verify = {
      doVerify (namespace = 'default') { 
        if (namespace === 'all') {
          Object.keys(vm.$verify).forEach(key => {
            if (key.endsWith('El')) {
              vm.$verify[key].forEach(el => triggerBlur(el))
            }
          })
        } else {
         
          vm.$verify[namespace + 'El'].forEach(el => triggerBlur(el))
        }
      }
    }
  }

  if (!vm.$verify[verifyNamespace]) {
    vm.$verify[verifyNamespace] = []
    vm.$verify[verifyNamespace].all = false 
  }
 
  if (!vm.$verify['res_' + verifyNamespace]) {
    vm.$verify['res_' + verifyNamespace] = []
  }

  if (!vm.$verify[verifyNamespace + 'El']) {
    vm.$verify[verifyNamespace + 'El'] = []
  }

  vm.$verify[verifyNamespace + 'El'].push(el)
}
