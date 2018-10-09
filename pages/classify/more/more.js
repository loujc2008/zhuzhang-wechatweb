const app = getApp();
var mta = require('../../../statistics/mta_analysis.js')
Page({
  data: {
    ifydata:[],
    id:''
  },

  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: options.tittle
    })
    mta.Page.init()
    this.setData({
      id: options.id
    })
  },
  onShow: function () {
    wx.ajax({
      url: 'api/videocategory/getbyparentid',
      data: {
        ParentId: this.data.id,
        // ParentId: 0,
        sign: app.globalData.sign
      },
      method: 'POST'
    }).then((res) => {
      console.log(res)
      this.setData({
        ifydata: res.Data
      })
    })
  }
})