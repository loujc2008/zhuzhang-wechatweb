const app = getApp()
var mta = require('../../../statistics/mta_analysis.js')
Page({
  data: {
    id: '',//退款退货id
    refundType: 1, //1为仅退款，2为退货退款
    detail: {},//退款退货详情
    SellerAuditStatus: 1 //退款退货当前状态
  },
  onLoad: function (options) {
    mta.Page.init()
    this.setData({
      id: options.id,
      refundType: options.refundType
    })
    this.getDetail()
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
      console.log(res)
      if (res.Value.SellerAuditStatus == 5) {

      }
      this.setData({
        detail: res.Value
        // SellerAuditStatus: res.Value.SellerAuditStatus
      })
    })
  },
  //确认寄货
  confirmrefundgood() {
    wx.ajax({
      method: 'POST',
      url: 'api/ordertefund/confirmrefundgood',
      data: {
        Id: this.data.id,
        UserId: app.globalData.userid,
        ExpressCompanyName: '',
        ShipOrderNumber: ''
      }
    }).then((res) => {
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
  openLogistics(){
    wx.navigateTo({
      url: '../addLogistics/addLogistics',
    })
  }
})