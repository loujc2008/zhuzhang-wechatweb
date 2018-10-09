import { showModal, install } from '../../utils/util.js'
import shopCart from '../../utils/shopCart.js'
const app = getApp()
var mta = require('../../statistics/mta_analysis.js')
let page = {
  data: {},
  onLoad() {
    mta.Page.init()
  },
  onShow() {
    let that = this;
    //提示授权
    showModal(() => {
      app.userLogin().then(() => {
        that.getCartList();
        that.getRecommend(1);
      })
    }, () => {
      that.getCartList();
      that.getRecommend(1);
    })
    wx.getSystemInfo({
      success(res) {
        that.setData({
          scrollHeight: res.windowHeight - 55
        })
      }
    });
    this.getRecommend(2);
  },
  //进入商品详情
  openCommoditydetail(e) {
    wx.navigateTo({
      url: '../commoditydetail/commoditydetail?id=' + e.currentTarget.dataset.id,
    })
  }
}

install(page, shopCart)
Page(page)