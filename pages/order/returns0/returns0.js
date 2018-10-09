import { back } from '../../../utils/util.js'
const app = getApp()
var mta = require('../../../statistics/mta_analysis.js')
Page({
  data: {
    id: '',//退款退货id
    refundType: 1, //1为仅退款，2为退货退款
    detail: {},//退款退货详情
    SellerAuditStatus: 1, //退款退货当前状态
    RefundAuditStatus: 0,
  },
  onLoad(options) {
    mta.Page.init()
    console.log(options.id)
    this.setData({
      id: options.id,
      refundType: options.refundType
    })
  },
  onShow() {
    this.getDetail()
  },
  onUnload() {
    let pages = getCurrentPages();
    if (pages[pages.length - 2].route != "pages/user/payment/payment") {
      pages[pages.length - 3].setData({
        currentTab: 5
      })
      wx.navigateBack({
        delta: 1,
      })
    }
  },
  //获取退款详情
  getDetail() {
    wx.ajax({
      method: 'POST',
      url: 'api/ordertefund/detail',
      data: {
        Id: this.data.id,
        UserId: app.globalData.userid
      }
    }).then((res) => {
      this.setData({
        detail: res.Value,
        SellerAuditStatus: res.Value.SellerAuditStatus,
        RefundAuditStatus: res.Value.RefundAuditStatus
      })
    })
  },
  //取消退款/退货
  cancel() {
    wx.ajax({
      method: 'POST',
      url: 'api/ordertefund/cancel',
      data: {
        Id: this.data.id,
        UserId: app.globalData.userid
      }
    }).then(() => {
      this.getDetail()
    })
  },
  //重新提交申请
  resubmit() {
    let detail = this.data.detail;
    wx.redirectTo({
      url: '../apply/apply?refundType=' + this.data.refundType + '&maxAmount=' + detail.MaxRefundAmount + '&orderId=' + detail.OrderId + '&orderItemId=' + detail.OrderItemId + '&maxNum=' + detail.MaxRefundGoodsAmount,
    })
  },
  //申请仲裁
  arbitration() {
    wx.ajax({
      method: 'POST',
      url: 'api/ordercomplaint/addarbitration',
      data: {
        OrderItemId: this.data.id,
        ShopId: '',
        OrderId: '',
        UserPhone: '',
        ComplaintReason: '',
        Type: '',
        OrderRetundId: this.data.id,
        UserId: app.globalData.userid
      }
    }).then(() => {

    })
  },
  //填写物流
  openLogistics() {
    wx.navigateTo({
      url: '../addLogistics/addLogistics?id=' + this.data.id
    })
  }
})