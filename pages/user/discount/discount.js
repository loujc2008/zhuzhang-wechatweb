import { install, compatible, showModal } from '../../../utils/util.js'
import discounttan from '../../discounttan/discounttan.js'
const app = getApp()
var mta = require('../../../statistics/mta_analysis.js')
let page ={
  data: {
    currentTab: 0,// tab切换 
    unused: [],//未使用
    used: [],//已使用
    past: []//已过期
  },
  onLoad: function (options) {
    mta.Page.init()
    // 未使用
    wx.ajax({
      url: 'api/coupon/wechatapp/list',
      data: {
        userId: app.globalData.userid,
        // UserId: 665,
        Status: 2,
        SessionKey: '',
        sign: app.globalData.sign
      },
      method: 'POST'
    }).then((res) => {
      this.setData({
        unused: res.Data
      })
    })
    //已使用
    wx.ajax({
      url: 'api/coupon/wechatapp/list',
      data: {
        userId: app.globalData.userid,
        // UserId: 665,
        Status: 3,
        SessionKey: '',
        sign: app.globalData.sign
      },
      method: 'POST'
    }).then((res) => {
      this.setData({
        used: res.Data
      })
    })
    //已过期
    wx.ajax({
      url: 'api/coupon/wechatapp/list',
      data: {
        userId: app.globalData.userid,
        // UserId: 665,
        Status: 4,
        SessionKey: '',
        sign: app.globalData.sign
      },
      method: 'POST'
    }).then((res) => {
      this.setData({
        past: res.Data
      })
    })
  },
  onShow() {
    let that = this
    showModal(function () {
      app.userLogin().then(() => {
        that.getNoCoupon()
      })
    }, function () {
      if (app.globalData.userInfo) {
        that.getNoCoupon()
      } else {
        app.callback = () => {
          that.getNoCoupon()
        }
      }
    })
  },
  // 未领取优惠券
  getNoCoupon() {
    wx.ajax({
      url: 'api/coupon/wechatapp/popup',
      data: {
        userId: app.globalData.userid,
        SessionKey: '',
        sign: app.globalData.sign
      },
      method: 'POST'
    }).then((res) => {
      console.log(res)
      if (res.Data.length > 0) {
        this.setData({
          discount: res.Data,
          istan: true
        })
      } else {
        this.setData({
          istan: false
        })
      }
    })
  },
  //领取优惠券
  clickget() {
    let that = this;
    let idarr = [];
    for (let i = 0; i < this.data.discount.length; i++) {
      idarr.push(this.data.discount[i].Id)
    }
    function callback() {
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
        that.setData({
          istan: false
        })
        wx.showToast({
          title: res.Message,
          icon: 'success',
          duration: 2000
        })
      }).catch((err) => {
        console.log(err.data.Message)
      })
    }
    showModal(() => {
      app.userLogin().then(() => {
        callback()
      })
    }, () => {
      callback()
    })
  },
  //点击tab切换 
  swichNav(e) {
    if (this.data.currentTab != e.target.dataset.current) {
      this.setData({
        currentTab: e.target.dataset.current
      })
    }
  },
  //滑动切换 
  bindChange(e) {
    this.setData({
      currentTab: e.detail.current
    })
  },
}
install(page, discounttan)
Page(page)