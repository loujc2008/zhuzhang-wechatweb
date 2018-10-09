import { install, showModal } from '../../utils/util.js'
const app = getApp()
var mta = require('../../statistics/mta_analysis.js')
Page({
  data: {
    activethree: [],
    id: '',
  },
  onLoad: function (options) {
    this.setData({
      id: options.id
    })
    mta.Page.init()
  },
  onShow: function () {
    wx.ajax({
      url: 'api/wechatapp/special/getspecial',
      data: {
        SpecialId: this.data.id,
        // SpecialId: 38,
        UserId: app.globalData.userid,
        SessionKey: '',
        sign: app.globalData.sign
      },
      method: 'POST'
    }).then((res) => {
      this.setData({
        activethree: res.Value
      })
    })
  }
})