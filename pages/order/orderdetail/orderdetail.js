import {
  Prompt,
  getregionid,
  GetFreight,
  pay,
  back,
  sendTemplateInfo
} from '../../../utils/util.js'
import trackSDK from '../../../utils/index.js'
const app = getApp()
var mta = require('../../../statistics/mta_analysis.js')
Page({
  data: {
    orderStatus: 1,
    orderid: '',//订单id
    max: 5,//库存
    freight: 0,//运费
    detaildata: {} //订单详情
  },
  onLoad(options) {
    this.setData({
      orderid: options.orderid
    })
    mta.Page.init()
  },
  onShow() {
    this.getDetail();
  },
  // 客服
  openXiaoneng() {
    trackSDK.callTrail({ originId: 'gh_993eccb045cd' });
  },
  //获取订单详情
  getDetail() {
    wx.ajax({
      method: 'POST',
      url: 'api/Order/Detail',
      data: {
        OrderId: this.data.orderid,
        UserId: app.globalData.userid,
        Status: this.data.orderStatus,
        sign: app.globalData.sign,
        SessionKey: app.globalData.sessionKey
      }
    }).then((res) => {
      let shopMoney = 0, allMoney = 0;
      for (let i in res.Value.OrderItemList) {
        if (res.Value.OrderItemList[i].CurrentShopPromotion) {
          if (res.Value.OrderItemList[i].CurrentShopPromotion.PromotionType == 1) {
            shopMoney += (res.Value.OrderItemList[i].SalePrice / res.Value.OrderItemList[i].CurrentShopPromotion.PromotionDiscount - res.Value.OrderItemList[i].SalePrice) * res.Value.OrderItemList[i].Quantity;
          }
          if (res.Value.OrderItemList[i].CurrentShopPromotion.PromotionType == 4) {
            shopMoney += (res.Value.OrderItemList[i].CostPrice - res.Value.OrderItemList[i].SalePrice) * res.Value.OrderItemList[i].Quantity;
          }
          if (res.Value.OrderItemList[i].CurrentShopPromotion.PromotionType == 2) {
            allMoney += res.Value.OrderItemList[i].SalePrice;
          }
        }
      }
      if (res.Value.OrderItemList[0].CurrentShopPromotion && res.Value.OrderItemList[0].CurrentShopPromotion.PromotionType == 2 && allMoney >= res.Value.OrderItemList[0].CurrentShopPromotion.OrderCredit) {
        shopMoney = res.Value.OrderItemList[0].CurrentShopPromotion.ReductionAmount;
      }
      this.setData({
        detaildata: res.Value,
        orderStatus: res.Value.OrderStatus,
        reduction: shopMoney
      })
      this.getFreight();
    })
  },
  //获取运费
  getFreight() {
    let skus = [];
    let list = this.data.detaildata.OrderItemList;
    for (let i in list) {
      skus.push(list[i].SkuId + ',' + list[i].Quantity)
    }
    GetFreight(skus.join(';'), this.data.detaildata.CityId).then((res) => {
      this.setData({
        freight: res.Value.Freight
      })
    })
  },
  //确认收货
  confirmReceipt() {
    wx.ajax({
      method: 'POST',
      url: 'api/Order/ConfirmReceipt',
      data: {
        OrderId: this.data.orderid,
        UserId: app.globalData.userid,
        Status: this.data.orderStatus,
        sign: app.globalData.sign,
        SessionKey: app.globalData.sessionKey
      }
    }).then((res) => {
      if (!res.Success) {
        Prompt(res.Message);
      } else {
        back(1).then((page) => {
          page.setData({
            currentTab: 4
          })
        })
      }
    })
  },
  //查看物流
  openLogistics() {
    wx.redirectTo({
      url: '../logistics/logistics?id=' + this.data.orderid,
    })
  },
  //退款
  refund(e) {
    let rType = 1,
      list = this.data.detaildata.OrderItemList[e.currentTarget.dataset.index],
      url = '',
      that = this;
    if (list.RefundAuditStatus == 0) {
      wx.ajax({
        url: 'api/ordertefund/refundapply',
        method: 'POST',
        data: {
          UserId: app.globalData.userid,
          OrderId: this.data.detaildata.OrderId,
          OrderItemId: list.OrderItemId
        }
      }).then((res) => {
        if (this.data.orderStatus == 3 || this.data.orderStatus == 5) {
          rType = 2;
        }
        if (this.data.reduction > 0) {
          wx.showModal({
            title: '提示',
            content: '您已使用了店铺优惠，退款将不会返回优惠金额！',
            success(res1) {
              if (res1.confirm) {
                if (that.data.orderStatus == 3 || that.data.orderStatus == 5) {
                  url = '&maxAmount=' + res.Value.MaxRefundAmount + '&maxNum=' + list.Quantity
                } else {
                  url = '&maxAmount=' + res.Value.MaxRefundAmount;
                }
                wx.redirectTo({
                  url: '../apply/apply?refundType=' + rType + '&orderId=' + list.OrderId + '&orderItemId=' + list.OrderItemId + url
                })
              }
            }
          })
        } else {
          if (that.data.orderStatus == 3 || that.data.orderStatus == 5) {
            url = '&maxAmount=' + res.Value.MaxRefundAmount + '&maxNum=' + list.Quantity
          } else {
            url = '&maxAmount=' + res.Value.MaxRefundAmount;
          }
          wx.redirectTo({
            url: '../apply/apply?refundType=' + rType + '&orderId=' + list.OrderId + '&orderItemId=' + list.OrderItemId + url
          })
        }
      })
    } else {
      wx.redirectTo({
        url: '../returns0/returns0?refundType=' + rType + '&id=' + list.RefundId
      })
    }
  },
  //退款详情
  refundDetail(e) {
    let list = this.data.detaildata.OrderItemList[e.currentTarget.dataset.index];
    wx.redirectTo({
      url: '../returns0/returns0?refundType=1&id=' + list.RefundId
    })
  },
  // 取消订单
  cancel(e) {
    let orderIdList = [this.data.orderid], that = this, detail = this.data.detaildata, names = [];
    for (let i in detail.OrderItemList) {
      names.push(detail.OrderItemList[i].ProductName)
    }
    wx.showModal({
      title: '提示',
      content: '是否取消订单？',
      confirmText: '取消',
      cancelText: '不取消',
      success(res) {
        if (res.confirm) {
          wx.ajax({
            url: 'api/wechatapp/Order/Cancel',
            data: {
              OrderIdList: orderIdList,
              UserId: app.globalData.userid,
              Status: that.data.orderStatus,
              sign: app.globalData.sign,
              SessionKey: app.globalData.sessionKey,
              formId: e.detail.formId
            },
            method: 'POST'
          }).then((res) => {
            sendTemplateInfo(app.globalData.userid, e.detail.formId, orderIdList, 3, detail.OrderTotalAmount, names.join('\n'));
            wx.redirectTo({
              url: '/pages/user/payment/payment?highlight=1',
            })
          })
        }
      }
    })
  },
  payment(e) {
    let list = [this.data.orderid], names = [];
    for (let i in this.data.detaildata.OrderItemList) {
      names.push(this.data.detaildata.OrderItemList[i].ProductName)
    }
    pay(list, this.data.detaildata.OrderTotalAmount, names)
  },
})