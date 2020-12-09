## vue-better-verify

一个基于 vue 的表单验证指令 支持自定义扩展正则 临时跳过验证 并且提供了完美的密码相等性验证

## 安装

```javascript
yarn add vue-better-verify // 这是推荐的安装方式使用 yarn 来安装，或者使用下面的方法
npm install vue-better-verify --save // 不推荐
```

## 简述

这个包诞生的目的就是让表单类控件的验证更加的方便、清晰，没有过于复杂的规则，但是又提供了应对各种场景的高级功能，但是请放心这些高级功能也将是非常直观易用的，对于一些没有提供的功能，大多是因为这些功能应该由你自己来做，例如：验证失败的提示语，验证字符的长度等

## 视频教程

还没有。。。

## 适用范围

* html 原生 input 库
* 其他 ui 框架的 input 组件
* 前期的版本没有实现对 select checkbox 等的验证是因为这些验证主要是空验证，是可以自己在该插件的基础上进一步封装的功能，当然后续也可能逐渐支持这些元素

## 使用方式

```javascript
// main.js
import Vue from "vue"
import vueVerify from "vue-better-verify"

Vue.use(vueVerify)
```

```vue
// 组件内
<template>
	<div>
        <label>密码</label>
        <input v-verify.equal></input>
    </div>
	<div>
        <label>确认密码</label>
		<input v-verify.password.equal="passVerify"></input>
		<template v-if="!passVerify.isFirst">
            <div style="color:red;" v-if="!passVerify.regExp">密码格式错误</div>
            <div style="color:red;" v-if="!passVerify.equal">两次密码输入不一致</div>
		</template>	
    </div>
	
</template>

<script>
export default {
    data () {
        return {
            passVerify: { // 其实你也可以直接写个空对象，然后直接使用 empty equal regExp 这些值
                isFirst: true, // 是否是第一次加载 这个状态很重要用于控制页面加载的时候不显示你预设的提示语
                empty: "", // 空验证的结果
                equal: "", // 相等性验证的结果
                regExp: "" // 正则验证的结果
            }
        }
    }
}
</script>
```

## 语法解释

```html
<!-- 其中命名空间可以省略 equal 只在 2 个或以上输入框做相等性验证的时候才是必要的  -->
<input v-verify:命名空间.规则1.规则2.equal="当前标签验证状态"></input>
```

## 正则的扩展

默认插件已经提供了一些基本的正则：

```javascript
phone: /^1[2-9][0-9]{9}$/
email: /^\w+@\w+\.\w+$/
password: /^(?=.*\d)(?=.*[A-z])[\w_]{6,18}$/
sms: /^\d{6}$/ // 6位数字验证码验证
```

**规则可以被联合**

```html
<!-- 下面是一个可以输入手机号也可以输入邮箱的输入框 -->
<input v-verify.phone.email="verify"></input>
```

**规则可以被扩展**

```javascript
// 想扩展规则可以在入口处进行全局设置
import Vue from "vue"
import vueVerify from "vue-better-verify"

// 例如我要添加一个中文名的正则
Vue.use(vueVerify, {
    regExp: {
        cname: /^[\u4e00-\u9fa5]{2,4}$/ // 添加的自定义正则
    },
    defaultStyle: true // 这个值默认就是 true 验证框在验证失败的时候有一个默认的红色提醒，由这个属性来控制
})
```

扩展之后可以直接使用`<input v-verify.cname></input>`

## 获取组件所有的验证是否通过

```javascript
this.$verify.命名空间.all // 默认没有设置命名空间的情况下，命名空间为 default
```

## 手动验证

手动验证功能很重要，他的使用方式也很简单

```javascript
// 验证默认命名空间的所有输入框
this.$verify.doVerify()
// 验证所有命名空间
this.$verify.doVerify("all")
// 验证特定命名空间
this.$verify.doVerify("命名空间")
```

## 高级（动态跳过验证、动态切换必填状态、联合命名空间）

## 联合命名空间

你可能会遇到这样的场景，注册页面用户可以切换选择手机注册或者邮箱注册，这里的问题是密码框是可以共用的，手机和邮箱的框不公用，那么用户在手机注册的时候，你势必要连着未显示的邮箱一起验证了，我们想做的是在用户手机注册的时候跳过邮箱框的验证

在最开始是可以变通的通过命名空间来解决这个问题，他们之间冲突的原因就是默认都在一个叫做 default 的命名空间，但是如果将邮箱验证设定一个 email 命名空间，手机验证设定一个 phone 命名空间，密码可以使用默认的命名空间，那么手机注册的时候只需要联合判断 phone 和 default，邮箱雁阵则联合判断 email 和 default 

**动态跳过验证**

新的 api 可以在一个命名空间下解决上述的问题，在元素上加入 skip 值为布尔，则可以动态跳过当前框的验证，true 的时候表示要跳过 false 表示不跳过，默认为 false

```vue
<input v-verify.email="emailVerify" :skip="skip"></input>

export default {
	data () {
		return {
			emailVerify: {},
			skip: true
		}
	}
}
```

**动态切换必填状态**

在标签中添加 need 属性可以设置框为必填项，他也支持动态值，true 为必填 false 为非必填，并且你可以随时更改，这是有相应的应用场景的，有的表单在新增的时候个别输入框是必填项，但是如果编辑的时候则是非必填，此时就用到了这个功能。

注意：设为必填不影响 empty 空验证的结果，他只影响最终联合验证的结果，因为在联合验证的时候如果发现是非必填的那么就会忽略掉 empty 的值

## 注意事项

* **在使用的过程中请勿在输入框外层使用 v-if 而应该使用 v-show 这是因为 v-if 会清楚 input 的 html 结构 而验证是依赖于 dom 的**
* **可以在提示信息中使用 v-if**

