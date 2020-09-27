## v-verify
一个基于 vue 的表单验证指令 可以方便的验证常用表单，并且提供了完美的密码相等验证

## 适用范围

* html 原生 input 框
* 其他 vue UI 框架的常用 input 组件

## 语法

```html
<input v-verify:命名空间.规则1.规则2.equal="当前标签验证状态">
```

其中 `.equal` 表示多个输入级联判断相等性

**注意标签的验证状态需要在 data 中定义一个对象类型**

## 正则规则扩展

暂未开放API

## 使用方式

* 提供自动化验证，并访问动态的验证结果，在任意支持组件上使用指令 `v-verify.email="当前组件data中的变量"` 在当前组件中的 data 格式为:

  ```javascript
  {
          verify: false, // 保存整体验证的结果，该结果根据 regVerify equalVerify emptyVerify 的值变化而变化
          regVerify: false, // 保存正则验证的结果
          equalVerify: false, // 保存对等验证的结果
          emptyVerify: true, // 保存空验证的结果,这里默认设置为 true 是因为通常用到这个状态的输入框，第一次加载不会让这个状态对应的提示信息显示出来
          equal: verifyEqual, // 当前是否包含 equal 修饰符
          isFirst: true,// 是否是第一次验证
          value: '' // 默认input 值为空字符串
  }
  ```
  以上的值可以设置也可以不设置，不全部设置的情况下会在指令加载的时候动态创建

* 访问当前组件所有的状态与是否全部通过验证：全部验证结果：this.$verify  是否全部通过this.$verify.default.verify
  
## 手动校验
  
  有些时候用户在未填写任何信息的时候点击了提交，我们这个时候需要手动校验，这里提供了一个手动校验的 API
  
  ```javascript
  this.$verify.doVerify(命名空间) 。 参数命名空间不传默认就是 default 命名空间
  ```