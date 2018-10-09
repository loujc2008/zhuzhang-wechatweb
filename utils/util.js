const app = getApp();

const formatTime = (date, dtype) => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getUTCHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  if (dtype == 'date') {
    return year + '年' + month + '月' + day + '日 ' + hour + '时' + minute + '分'
  }

  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

const showModal = (successFunc, alreadyFunc, scope = 'scope.userInfo') => {
  wx.getSetting({
    success: (res) => {
      if (scope in res.authSetting) {
        if (res.authSetting[scope]) {
          alreadyFunc()
        } else {
          wx.showModal({
            title: '提示',
            content: '您暂未授权！',
            success: (res) => {
              if (res.confirm) {
                wx.openSetting({
                  success: res => {
                    if (res.authSetting['scope.userInfo'] && !app.globalData.userInfo) {
                      successFunc();
                    }
                    if (res.authSetting[scope] && scope != 'scope.userInfo') {
                      successFunc();
                    }
                  }
                });
              }
            }
          })
        }
      } else {
        wx.authorize({
          scope: scope,
          success() {
            successFunc()
          }
        })
      }
    }
  })
}

wx.ajax = function ({ method = 'GET', url, data, header }) {
  let mData = {
    sign: app.globalData.sign
  };
  Object.assign(mData, data)
  return new Promise((resolve, reject) => {
    wx.request({
      method,
      url: 'https://' + app.globalData.mallApiUrl + url,
      data: mData,
      header,
      success(res) {
        if (res.data.Success) {
          return resolve(res.data)
        } else {
          console.log(url)
          console.log(res)
          return reject(res)
        }
      },
      fail(err) {
        return reject(res.data.Message)
      }
    })
  })
}

function Prompt(content, fn = function () { }) {
  wx.showModal({
    title: '提示',
    content: content,
    showCancel: false,
    confirmColor: '#fa6e84',
    success: (res) => {
      if (res.confirm) {
        fn();
      }
    }
  })
}

// 获取城市id
function getregionid(name) {
  return wx.ajax({
    url: 'api/order/getregionid',
    method: 'POST',
    data: {
      "regionname": name
    }
  })
}

//获取运费信息
function GetFreight(skuId, id) {
  return wx.ajax({
    url: 'api/Order/GetFreight/' + skuId + '/' + id
  })
}

//深拷贝
function deepCopy(o) {
  if (o instanceof Array) {
    var n = [];
    for (var i = 0; i < o.length; ++i) {
      n[i] = deepCopy(o[i]);
    }
    return n;
  } else if (o instanceof Object) {
    var n = {}
    for (var i in o) {
      n[i] = deepCopy(o[i]);
    }
    return n;
  } else {
    return o;
  }
}

//兼容
function compatible(obj) {
  return new Promise((resolve, reject) => {
    if (!obj) {
      Prompt('当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。')
    } else {
      obj({
        success(res) {
          resolve(res)
        },
        fail(err) {
          Prompt(err)
        }
      })
    }
  })
}

//微信支付
function pay(ids, money, names) {
  return new Promise((resolve, reject) => {
    wx.ajax({
      method: 'POST',
      url: 'api/wechatapp/pay',
      data: {
        openId: app.globalData.openid,
        IdList: '',
        Ids: ids.join(','),
        sign: app.globalData.sign,
        SessionKey: '',
      }
    }).then((res) => {
      wx.requestPayment({
        'timeStamp': res.Value.timestamp,
        'nonceStr': res.Value.noncestr,
        'package': res.Value.package,
        'signType': 'MD5',
        'paySign': res.Value.sign,
        success(res1) {
          sendTemplateInfo(app.globalData.userid, res.Value.package.substring(10), ids, 1, money, names.join('\n'));
          resolve(2)
        },
        fail(res1) {
          resolve(1)
        },
        complete() {
          console.log(app.globalData.userid)
          console.log(res.Value.package.substring(10))
          console.log(ids)
          console.log(money)
          console.log(names.join('\n'))
        }
      })
    })
  })
}

//页面回退
function back(num) {
  return new Promise((resolve, reject) => {
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - (num + 1)];
    resolve(prevPage)
    wx.navigateBack({
      delta: num,
    })
  })
}

//加载组件
function install(target, sources) {
  Object.assign(target.data, sources.data)
  Object.assign(target, sources.method)
}

//获取模板token
function getAccessToken() {
  return new Promise((resolve, reject) => {
    wx.request({
      url: 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wx9e620b872145f4b6&secret=a4302645bc36970f46fbad56fec51289',
      success(res) {
        app.globalData.accesstoken = res.data.access_token;
        resolve();
      }
    })
  })
}

//获取模板列表
function getTemplateList() {
  wx.request({
    url: `https://api.weixin.qq.com/cgi-bin/wxopen/template/list?access_token=${app.globalData.accesstoken}`,
    method: 'POST',
    data: {
      offset: 0,
      count: 5
    },
    success(res) {
      console.log(res)
      app.globalData.templateList = res.data.list
    }
  })
}

//发送模板消息
function sendTemplateInfo(id, fId, oId, mType, money = '', oDetail = '') {
  wx.ajax({
    url: 'api/wechatapp/sendmessage',
    data: {
      "userid": id,
      "formId": fId,
      "OrderIds": oId,
      "MessageType": mType,
      "totalAmount": money,
      "OrderDetails": oDetail,
      "SessionKey": ""
    },
    method: 'POST'
  }).then((res) => {
    console.log(res)
  })
}



module.exports = {
  formatTime,
  showModal,
  Prompt,
  getregionid,
  GetFreight,
  deepCopy,
  compatible,
  pay,
  back,
  install,
  getAccessToken,
  getTemplateList,
  sendTemplateInfo
}

