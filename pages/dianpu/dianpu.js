import { Prompt, showModal, back } from '../../utils/util.js'
const app = getApp()
var mta = require('../../statistics/mta_analysis.js')
Page({
  data: {
    isAuto: false,
    choice: 'video',//选择
    shopId: 0,//店铺id
    baseinfo: {},//基本信息
    videos: [],//视频
    products: [],//商品
  },
  onLoad(options) {
    this.setData({
      shopId: options.shopId
    })
    mta.Page.init()
  },
  onShow() {
    this.setData({
      isAuto: true
    })
    this.getBaseInfo();
    this.getVideos();
  },
  onHide() {
    this.setData({
      isAuto: false
    })
  },
  //选择
  btnChoice(e) {
    if (e.currentTarget.dataset.choice == 'goods' && this.data.products.length <= 0) {
      this.getProducts();
    }
    if (e.currentTarget.dataset.choice == 'video' && this.data.videos.length <= 0) {
      this.getVideos();
    }
    this.setData({
      choice: e.currentTarget.dataset.choice
    })
  },
  //获取店铺基本信息
  getBaseInfo() {
    wx.ajax({
      url: 'api/shop/baseinfo',
      method: 'POST',
      data: {
        shopId: this.data.shopId,
        userId: app.globalData.userid,
        sign: app.globalData.sign,
      }
    }).then((res) => {
      console.log(res)
      this.setData({
        baseinfo: res.Value
      })
    })
  },
  //获取店铺视频
  getVideos() {
    wx.ajax({
      url: 'api/shop/videos',
      method: 'POST',
      data: {
        shopId: this.data.shopId,
        keyWord: '',
        orderBy: 1,
        isAsc: 0,
        sign: app.globalData.sign,
      }
    }).then((res) => {
      this.setData({
        videos: res.Data
      })
    })
  },
  //获取店铺商品
  getProducts() {
    wx.ajax({
      url: 'api/shop/products',
      method: 'POST',
      data: {
        shopId: this.data.shopId,
        keyWord: '',
        orderBy: 1,
        isAsc: 0,
        sign: app.globalData.sign,
      }
    }).then((res) => {
      console.log(res)
      this.setData({
        products: res.Data
      })
    })
  },
  //关注
  Concern() {
    let that = this;
    function callback() {
      let aciton = 'add', title = '关注成功';
      if (that.data.baseinfo.Concernedshop) {
        aciton = 'cancel';
        title = '取消关注';
      }
      wx.ajax({
        method: 'POST',
        url: 'api/shop/concern/' + aciton,
        data: {
          shopId: that.data.shopId,
          shopName: that.data.baseinfo.ShopName,
          userId: app.globalData.userid
        }
      }).then((res) => {
        wx.showToast({
          title,
          mask: true,
          icon: 'success',
          duration: 2000
        })
        that.getBaseInfo();
      })
    }
    showModal(() => {
      app.userLogin().then(() => {
        callback();
      })
    }, () => {
      callback();
    })
  },
  //logo错误
  logoError(e) {
    let data = this.data.baseinfo;
    data.ShopLogo = '/imgs/default.jpg';
    this.setData({
      baseinfo: data
    })
  },
  //进入商品页
  openCommoditydetail(e) {
    let id = this.data.products[e.currentTarget.dataset.idx].Id;
    let pages = getCurrentPages(), isExit = true;
    for (let i in pages) {
      if (pages[i].route == "pages/commoditydetail/commoditydetail") {
        back(pages.length - 1 - i).then((page) => {
          page.setData({
            productid: id
          })
        })
        isExit = false;
        break;
      }
    }
    if (isExit) {
      wx.navigateTo({
        url: `../commoditydetail/commoditydetail?id=${id}`,
      })
    }
  },
  //进入视频页
  openVideo(e) {
    let video = this.data.videos[e.currentTarget.dataset.idx];
    let pages = getCurrentPages(), isExit = true;
    console.log(video)
    for (let i in pages) {
      if (pages[i].route == "pages/classify/inside/video/video") {
        back(pages.length - 1 - i).then(
          (page) => {
            page.setData({
              storeid: video.Id,
              title: video.Name
            })
          })
        isExit = false;
        break;
      }
    }
    if (isExit) {
      wx.navigateTo({
        url: `../classify/inside/video/video?storeid=${video.Id}&title=${video.Name}`,
      })
    }
  },
  onShareAppMessage(res) {
    return {
      title: this.data.baseinfo.ShopName,
      path: 'pages/dianpu/dianpu?shopId=' + this.data.shopId
    }
  }
})