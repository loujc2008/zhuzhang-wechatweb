import { back } from '../../../utils/util.js'
var mta = require('../../../statistics/mta_analysis.js')
Page({
  data: {
    text: '',//关键词
    products: {
      arr: [],
      page: 1,
      also: true
    },//商品
    videos: {
      arr: [],
      page: 1,
      also: true
    },//视频
    shops: {
      arr: [],
      page: 1,
      also: true
    },//店铺
    name: '商品',//选中的列表名
  },
  onLoad(options) {
    mta.Page.init()
    this.setData({
      text: options.text
    })
  },
  onShow() {
    this.productSearch(this.data.text, 1)
    this.videoSearch(this.data.text, 1)
    this.shopSearch(this.data.text, 1)
  },
  //商品搜索
  productSearch(key, page) {
    return wx.ajax({
      url: 'api/product/GetSearchProduct',
      method: 'POST',
      data: {
        "keywords": key,
        "orderType": "2_2",
        "pageno": page,
        "pagesize": "10"
      }
    }).then((res) => {
      console.log(res)
      let products = this.data.products;
      if (res.Data.length < 10) products.also = false;
      products.page = page;
      if (page == 1) {
        products.arr = res.Data;
        this.setData({
          products
        })
      }
      if (page > 1) {
        products.arr = products.arr.concat(res.Data);
        this.setData({
          products
        })
      }
    })
  },
  //视频搜索
  videoSearch(key, page) {
    return wx.ajax({
      url: 'api/Video/GetSearchVideo',
      method: 'POST',
      data: {
        "keywords": key,
        "orderType": "2_0",
        "pageno": page,
        "pagesize": "10"
      }
    }).then((res) => {
      console.log(res)
      let videos = this.data.videos;
      if (res.Data.length < 10) videos.also = false;
      videos.page = page;
      if (page == 1) {
        videos.arr = res.Data;
        this.setData({
          videos
        })
      }
      if (page > 1) {
        videos.arr = videos.arr.concat(res.Data);
        this.setData({
          videos
        })
      }
    })
  },
  //店铺搜索
  shopSearch(key, page) {
    return wx.ajax({
      url: 'api/Shop/GetSearchShop',
      method: 'POST',
      data: {
        "Keyword": key,
        "PageNo": page,
        "PageSize": 10,
        "Sort": 1,
        "Asc": true
      }
    }).then((res) => {
      console.log(res)
      let shops = this.data.shops;
      if (res.Data.length < 10) shops.also = false;
      shops.page = page;
      if (page == 1) {
        shops.arr = res.Data;
        this.setData({
          shops
        })
      }
      if (page > 1) {
        shops.arr = shops.arr.concat(res.Data);
        this.setData({
          shops
        })
      }
    })
  },
  //上拉
  onReachBottom() {
    if (this.data.name == '商品' && this.data.products.also) {
      wx.showLoading({
        title: '正在加载中',
      })
      this.productSearch(this.data.text, this.data.products.page + 1).then(() => {
        wx.hideLoading()
      })
    }
    if (this.data.name == '视频' && this.data.videos.also) {
      wx.showLoading({
        title: '正在加载中',
      })
      this.videoSearch(this.data.text, this.data.videos.page + 1).then(() => {
        wx.hideLoading()
      })
    }
    if (this.data.name == '店铺' && this.data.shops.also) {
      wx.showLoading({
        title: '正在加载中',
      })
      this.shopSearch(this.data.text, this.data.shops.page + 1).then(() => {
        wx.hideLoading()
      })
    }
  },
  //切换
  telSwitch(e) {
    this.setData({
      name: e.currentTarget.dataset.name
    })
  },
  //打开搜索
  openSearch() {
    let pages = getCurrentPages(), isExit = true;
    for (let i in pages) {
      if (pages[i].route == "pages/search/search") {
        back(pages.length - 1 - i);
        isExit = false;
        break;
      }
    }
    if (isExit) {
      wx.navigateTo({
        url: `/pages/search/search`,
      })
    }
  }
})