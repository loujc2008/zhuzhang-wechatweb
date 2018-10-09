const app = getApp()
var mta = require('../../../statistics/mta_analysis.js')
Page({
  data: {
    page: 1,
    shopData: [],
  },
  onLoad() {
    mta.Page.init()
  },
  onShow() {
    this.getShop();
  },
  //获取店铺
  getShop(page = 1) {
    wx.ajax({
      url: 'api/shop/concern/wechatapp/list',
      data: {
        userid: app.globalData.userid,
        pageno: page,
        pagesize: 10,
        sign: app.globalData.sign,
        SessionKeyL: ''
      },
      method: 'POST'
    }).then((res) => {
      console.log(res)
      if (page > 1 && res.Data.length > 0) {
        this.setData({
          shopData: this.data.shopData.concat(res.Data),
          page: page
        })
      }
      if (page == 1) {
        this.setData({
          shopData: res.Data
        })
      }
    })
  },
  onReachBottom() {
    this.getShop(this.data.page + 1)
  }
})