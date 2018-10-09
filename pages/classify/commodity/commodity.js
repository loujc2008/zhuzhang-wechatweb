const app = getApp();
var mta = require('../../../statistics/mta_analysis.js')
Page({
  data: {
    id: "",
    isAsc: false,
    sort: 2,
    sale: true,
    price: false,
    commodity: [],
    pageNo: 1,
    also: true ,
    scrollTop: {
      scroll_top: 0
    }  
  },
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: options.title
    })
    this.setData({
      id: options.id
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
      url: 'api/wechatapp/product/SearchProduct',
      data: {
        CategoryL3: this.data.id,
        pageNo: page,
        pageSize: "10",
        Sort: this.data.sort,
        IsAsc: this.data.isAsc,
        sign: app.globalData.sign
      },
      method: 'POST'
    }).then((res) => {
      console.log(res)
      wx.hideLoading()
      if (page == 1) {
        this.setData({
          commodity: res.Data,
          pageNo: 1
        })
      }
      if (page > 1) {
        this.setData({
          commodity: this.data.commodity.concat(res.Data),
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
  binddown() {
    this.getList(this.data.pageNo + 1)
  },
  sale() {
    var _top = this.data.scrollTop.scroll_top;//发现设置scroll-top值不能和上一次的值一样，否则无效，所以这里加了个判断  
    if (_top == 1) {
      _top = 0;
    } else {
      _top = 1;
    }
    this.setData({
      sort: 2,
      isAsc: !this.data.isAsc,
      'scrollTop.scroll_top': _top
    })
    this.getList(1)
  },
  price() {
    var _top = this.data.scrollTop.scroll_top;//发现设置scroll-top值不能和上一次的值一样，否则无效，所以这里加了个判断  
    if (_top == 1) {
      _top = 0;
    } else {
      _top = 1;
    }
    this.setData({
      sort: 3,
      isAsc: !this.data.isAsc,
      'scrollTop.scroll_top': _top
    })
    this.getList(1)
  }
})