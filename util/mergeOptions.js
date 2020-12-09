export default function mergeOptions () {
  let args = Array.prototype.slice.call(arguments, 0)
  let target = args.shift()
  for (let len = args.length - 1; len >= 0; len--) {
    let temp = args[len]
    Object.keys(temp).forEach(key => {
      if (target[key]) {
        // 如果已经有了采用合并策略
        if (Object.prototype.toString.call(temp[key]) === '[object Object]') { // 如果是对象递归调用
          target[key] = mergeOptions(target[key], temp[key])
        } else { // 非对象直接覆盖
          target[key] = temp[key]
        }

      } else {
        // 如果没有采用添加策略
        target[key] = temp[key]
      }
    })
  }
  return target
}
