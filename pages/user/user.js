import { compatible, showModal } from '../../utils/util.js'
const app = getApp()
var mta = require('../../statistics/mta_analysis.js')
Page({
  data: {
    userInfo: {},
    info: {},
    discount:[]
  },
  onLoad(){
    mta.Page.init()
  },
  onShow() {
    let that = this
    showModal(function () {
      app.userLogin().then(() => {
        that.setData({
          userInfo: app.globalData.userInfo,
        })
        that.userInfo();
      })
    }, function () {
      that.setData({
        userInfo: app.globalData.userInfo,
      })
      that.userInfo();
    })
  },
  userInfo() {
    wx.ajax({
      url: 'api/Order/wechatapp/myordertotal',
      method: 'POST',
      data: {
        userid: app.globalData.userid
      }
    }).then((res) => {
      console.log(res)
      this.setData({
        info: res.Value
      })
    })
  },
  // 收货地址
  reciveaddress() {
    compatible(wx.chooseAddress)
      .then((res) => {
        wx.setStorageSync('address', res)
      })
  }
})