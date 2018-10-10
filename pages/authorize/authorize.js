import {
  Prompt, getregionid, GetFreight, compatible, pay, install, showModal, getAccessToken,
  getTemplateList,
  sendTemplateInfo
} from '../../utils/util.js'
import trackSDK from '../../utils/index.js'
import minmoney from '../minmoney/minmoney.js'
import freight from '../../utils/freight.js'
const app = getApp()
var mta = require('../../statistics/mta_analysis.js')

// pages/authorize/authorize.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //判断小程序的API，回调，参数，组件等是否在当前版本可用。
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    // 查看是否授权
    wx.getSetting({
      success: function (res) {
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: function (res) {
              //用户已经授权过
              let app = getApp();
              app.wxLogin();
              app.toChoiceness();
              console.log("用户已经授权过" + JSON.stringify(res.userInfo));
              app.globalData.userInfo = res.userInfo;
            },
          })
        }
      }
    })
  },

  bindGetUserInfo: function (e) {
    console.log(e.detail.userInfo)
    if (e.detail.userInfo) {
      //用户按了允许按钮
      app.globalData.userInfo = e.detail.userInfo;
      app.wxLogin();
    } else {
      //用户按了拒绝按钮
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  onGotUserInfo: function (e) {
    console.log(e.detail.errMsg)
    console.log(e.detail.userInfo)
    console.log(e.detail.rawData)
    let app = getApp();
    app.globalData.userInfo = e.detail.userInfo;
    app.toChoiceness();
  }
})