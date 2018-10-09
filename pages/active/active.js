import { install, showModal } from '../../utils/util.js'
const app = getApp()
var mta = require('../../statistics/mta_analysis.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    active: [],
    id: ''
  },
  onLoad: function (options) {
    this.setData({
      id: options.id
    })
    mta.Page.init()
  },
  onShow: function () {
    console.log(this.data.id)
    wx.ajax({
      url: 'api/wechatapp/special/getspecial',
      data: {
        specialId: this.data.id,
        // specialId: 24,
        sign: app.globalData.sign
      },
      method: 'POST'
    }).then((res) => {
      console.log(res)
      this.setData({
        active: res.Value
      })
    })
  }
})