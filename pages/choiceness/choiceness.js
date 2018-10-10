import { install, showModal } from '../../utils/util.js'
const app = getApp()
var mta = require('../../statistics/mta_analysis.js')
let page = {
  data: {
    isAuto: true,
    shopdata: [],
    bannerData: [],
    current: 0,
    discount: [],
    page: 1,
  },
  onLoad() {
    mta.Page.init();
  },
  onShow() {
    this.setData({
      isAuto: true
    })
    this.getVideo();
    // wx.ajax({
    //   url: 'api/wechatapp/banner/getbannerlist',
    //   data: {
    //     sign: app.globalData.sign
    //   },
    //   method: 'POST'
    // }).then((res) => {
    //   this.setData({
    //     bannerData: res.Value
    //   })
    // })
  },
  onHide() {
    this.setData({
      isAuto: false
    })
  },
  //获取精选视频
  getVideo(page = 1) {
    wx.ajax({
      url: 'api/wechatapp/featuredpage/store',
      data: {
        sign: app.globalData.sign,
        Keyword: '',
        PageNo: page,
        PageSize: 5,
        Sort: 1,
        IsAsc: false
      },
      method: 'POST'
    }).then((res) => {
      if (page > 1 && res.Data.length > 0) {
        this.setData({
          shopdata: this.data.shopdata.concat(res.Data),
          page
        })
      }
      if (page == 1) {
        this.setData({
          shopdata: res.Data,
          page
        })
      }
    })
  },
  // 去店铺
  todianpu(e){
    wx.navigateTo({
      url: '/pages/dianpu/dianpu?shopId='+e.currentTarget.dataset.shopid,
    })
  },
  toproduct(e){
    console.log(e.currentTarget.dataset.id)
    wx.navigateTo({
      url: '/pages/commoditydetail/commoditydetail?id==' + e.currentTarget.dataset.id,
    })
  },
  //logo错误
  logoError(e) {
    let data = this.data.shopdata;
    data[e.currentTarget.dataset.idx].ShopLogo = '/imgs/default.jpg';
    this.setData({
      shopdata: data
    })
  },
  //转发
  onShareAppMessage(res) {
    return {
      title: '视霓精选',
      path: 'pages/choiceness/choiceness'
    }
  },
  bindChange(e) {
    this.setData({
      current: e.detail.current
    })
  },
  //上拉加载
  onReachBottom() {
    this.getVideo(this.data.page + 1)
  }
}
// install(page, discounttan)
Page(page)


