import { install, showModal } from '../../utils/util.js'
const app = getApp()
var mta = require('../../statistics/mta_analysis.js')
Page({
  data: {
    activetwo: [],
    id: '',
    getstate:true
  },
  onLoad: function (options) {
    this.setData({
      id: options.id
    })
    mta.Page.init()
  },
  onShow: function () {
    this.noget()
  },
  // 未领取优惠券
  noget(){
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
      console.log(res)
      this.setData({
        activetwo: res.Value
      })
      wx.setNavigationBarTitle({
        title: res.Value.SpecialName
      })
    })
  },
  // 领取优惠券
  getcoupon(e){
    let index = e.currentTarget.dataset.index;
    let idarr = [this.data.activetwo.CouponList[index].Id];
    let that = this;
    wx.ajax({
      url: 'api/coupon/wechatapp/get',
      data: {
        userId: app.globalData.userid,
        CouponIdList: idarr,
        SessionKey: '',
        sign: app.globalData.sign
      },
      method: 'POST'
    }).then((res) => {
      that.noget()
      }).catch((err) => {
        console.log(err)
        if (err.data.Success === false && err.data.Message === "该优惠券已被终止!") {
          wx.showModal({
            title: '提示',
            content: '抱歉，该优惠券已停止发放',
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                that.noget()
              }
            }
          })
        } else if (err.data.Success === false && err.data.Message === "优惠券已达到领用限制!") {
          wx.showModal({
            title: '提示',
            content: '优惠券已被领完',
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                that.noget()
              }
            }
          })
        }
      })
  }
})