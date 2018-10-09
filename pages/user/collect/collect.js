const app = getApp()
var mta = require('../../../statistics/mta_analysis.js')
Page({
  data: {
    productData: [],
    pageNum1: 1,
  },
  onLoad() {
    mta.Page.init()
  },
  onShow() {
    this.getProduct();

  },

  //获取商品
  getProduct(page = 1) {
    wx.ajax({
      url: 'api/product/favorite/wechatapp/pageList',
      data: {
        userId: app.globalData.userid,
        pageno: page,
        pagesize: 10,
        SessionKey: '',
        sign: app.globalData.sign
      },
      method: 'POST'
    }).then((res) => {
      if (page > 1 && res.Data.length > 0) {
        this.setData({
          productData: this.data.productData.concat(res.Data),
          pageNum1: page
        })
      }
      if (page == 1) {
        this.setData({
          productData: res.Data
        })
      }
    })
  },
  //logo错误
  logoError(e) {
    let data = this.data.shopData;
    data[e.currentTarget.dataset.idx].ShopLogo = '/imgs/default.jpg';
    this.setData({
      shopData: data
    })
  },
  onReachBottom() {
    this.getProduct(this.data.pageNum1 + 1)
  }
})