const app = getApp()
var mta = require('../../../statistics/mta_analysis.js')
Page({
  data: {
    twoifydata: [],
    id1: '',
    id2: '',
    pageNo: 1,
    also: true
  },
  onLoad(options) {
    wx.setNavigationBarTitle({
      title: options.tittle
    })
    
    this.setData({
      id1: options.id1
    })
    this.setData({
      id2: options.id2
    })
    this.getList(1);
    mta.Page.init()
  },
  onShow() {
    
  },
  //获取列表
  getList(page) {
    wx.showLoading({
      title: '加载中',
    })
    wx.ajax({ 
      url: 'api/wechatapp/video/SearchVideo',
      data: {
        CategoryL1: this.data.id1,
        CategoryL2: this.data.id2,
        pageNo: page,
        pageSize: "10",
        sign: app.globalData.sign
      },
      method: 'POST'
    }).then((res) => {
      wx.hideLoading()
      console.log(res)
      if (page == 1) {
        this.setData({
          twoifydata: res.Data
        })
      }
      if (page > 1 ) {
        this.setData({
          twoifydata: this.data.twoifydata.concat(res.Data),
          pageNo: page
        })
      }
      if (res.Data.length > 0) {
        this.setData({
          also: true
        })
      } else if (res.Data.length == 0) {
        this.setData({
          also: false
        })
      }
    })
  },
  onReachBottom() {
    this.getList(this.data.pageNo + 1)
  }
})