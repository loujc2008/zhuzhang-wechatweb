const app = getApp();
var mta = require('../../statistics/mta_analysis.js')
Page({
  data: {
    ifydata: [],
    productdata:[]
  },
  onLoad(){
    mta.Page.init()
  },
  onShow(){
    // 视屏分类
    wx.ajax({
      url: 'api/videocategory/getbyparentid',
      data: {
        ParentId: 0,
        sign: app.globalData.sign
      },
      method: 'POST'
    }).then((res) => {
      console.log(res)
      this.setData({
        ifydata: res.Data
      })
    })
    // 商品分类查找
    wx.ajax({
      url: 'api/productcategory/topten',
      data: {
        sign: app.globalData.sign
      },
      method: 'POST'
    }).then((res) => {
      console.log(res)
      this.setData({
        productdata: res.Data
      })
    })
  },
  onShareAppMessage(res) {
    return {
      title: '视霓分类',
      path: 'pages/classify/classify'
    }
  }
})