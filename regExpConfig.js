// 表单验证正则
export const regExpConfig = {
  phone: /^1[2-9][0-9]{9}$/,
  email: /^\w+@\w+\.\w+$/,
  password: /^(?=.*\d)(?=.*[A-z])[\w_]{6,18}$/,
  sms: /^\d{6}$/ // 6位数字验证码验证
}
