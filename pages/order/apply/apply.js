import { Prompt } from '../../../utils/util.js'
const app = getApp()
var mta = require('../../../statistics/mta_analysis.js')
Page({
  data: {
    array: ['仅退款', '退货退款'],
    index: 0,
    refundType: 1, //1为仅退款，2为退货退款
    maxAmount: 1000,//最大金额
    maxRefundGoodsAmount: 5,//最大数量
    orderId: '',//订单id
    orderItemId: '',//订单明细id
    reason: '', //退款说明
    amount: null,//退款金额
    returned: null //退货数量
  },
  onLoad(options) {
    mta.Page.init()
    if (options.maxNum) {
      this.setData({
        maxRefundGoodsAmount: options.maxNum
      })
    }
    this.setData({
      refundType: options.refundType,
      maxAmount: options.maxAmount,
      orderId: options.orderId,
      orderItemId: options.orderItemId
    })
  },
  bindPickerChange(e) {
    this.setData({
      index: e.detail.value
    })
  },
  //退款金额
  amount(e) {
    if (this.data.maxAmount - e.detail.value < 0) {
      this.setData({
        amount: null
      })
      Prompt('金额输入错误');
    } else {
      this.setData({
        amount: e.detail.value
      })
    }
  },
  //退款数量
  returned(e) {
    if (e.detail.value > this.data.maxRefundGoodsAmount) {
      this.setData({
        returned: null
      })
      Prompt('数量输入错误');
    } else {
      this.setData({
        returned: e.detail.value
      })
    }
  },
  //退款说明
  explain(e) {
    this.setData({
      reason: e.detail.value
    })
  },

  //下一步
  nextStep() {
    if (this.data.refundType == 2 && this.data.index == 1 && (this.data.returned == null || this.data.returned == 0)) {
      Prompt('请输入退货数量');
      return;
    }
    if (this.data.reason.length < 6) {
      Prompt('退款说明请输入不少于6个字');
    } else if (this.data.amount == null || this.data.amount == 0) {
      Prompt('请输入退款金额');
    } else {
      let refundType = 1, returned = null;
      if (this.data.refundType == 2 && this.data.index == 1) {
        refundType = 2;
        returned = this.data.returned;
      }
      wx.ajax({
        method: 'POST',
        url: 'api/ordertefund/add',
        data: {
          OrderId: this.data.orderId,
          OrderItemId: this.data.orderItemId,
          UserId: app.globalData.userid,
          RefundType: refundType,
          Amount: this.data.amount,
          Reason: this.data.reason,
          ReturnQuantity: returned,

        }
      }).then((res) => {
        wx.redirectTo({
          url: '../returns0/returns0?id=' + res.Value.Id + '&refundType=' + refundType,
        })
      })
    }
  }
})