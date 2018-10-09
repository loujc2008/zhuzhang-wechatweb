const app = getApp()
var mta = require('../../../statistics/mta_analysis.js')
Page({
  data: {
    logistics: {},
  },
  onLoad(options) {
    mta.Page.init()
    wx.ajax({
      url: 'api/order/wechatapp/Express',
      data: {
        OrderId: options.id,
        UserId: app.globalData.userid,
        sign: app.globalData.sign,
        SessionKey: ''
      },
      method: 'POST'
    }).then((res) => {
      console.log(res)
      this.setData({
        logistics: res.Value
      })
    })
  }
})