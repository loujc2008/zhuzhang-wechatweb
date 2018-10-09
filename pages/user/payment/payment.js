import { pay, sendTemplateInfo } from '../../../utils/util.js'
const app = getApp()
var mta = require('../../../statistics/mta_analysis.js')
Page({
  data: {
    winWidth: 0,
    winHeight: 0,
    // tab切换 
    currentTab: 0,
    //订单数据
    orderData: [],
    // 待付款订单数据
    toPayOrderData: [],
    // 待发货订单数据
    toSendOrderData: [],
    // 待收货订单数据
    toReceiveOrderData: [],
    // 已完成订单数据
    completedOrderData: [],
    // 退款/货订单数据
    drawBackOrderData: [],
    userid: '',
    PageNo: 1,
    num: 0,//代付款总件
    total: 0,//代付款总金
  },

  onLoad(options) {
    mta.Page.init()
    var that = this;
    this.setData({
      currentTab: options.highlight
    })
    if (options.highlight == 0) {
      this.paymentconnector(0);
    }
    //获取系统信息 
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          winWidth: res.windowWidth,
          winHeight: res.windowHeight
        });
      }
    })
  },
  onShow() {
    this.userInfo();
  },
  userInfo() {
    wx.ajax({
      url: 'api/Order/wechatapp/myordertotal',
      method: 'POST',
      data: {
        userid: app.globalData.userid
      }
    }).then((res) => {
      this.setData({
        info: res.Value
      })
    })
  },
  //滑动切换 
  bindChange(e) {
    this.paymentconnector(e.detail.current);
    this.setData({
      currentTab: e.detail.current,
      PageNo: 1
    })
  },
  //点击tab切换 
  swichNav(e) {
    if (this.data.currentTab != e.target.dataset.current) {
      this.setData({
        currentTab: e.target.dataset.current
      })
    }
  },
  // 接口方法
  paymentconnector(status, page = 1) {
    let that = this, statu = status, url = 'api/Order/List';
    if (status == 4) statu = 5;
    if (status == 5) {
      statu = 6;
      url = 'api/ordertefund/list';
    }
    wx.ajax({
      url: url,
      data: {
        OrderId: 0,
        UserId: app.globalData.userid,
        Status: statu,
        PageNo: page,
        PageSize: 10,
        sign: app.globalData.sign,
        SessionKey: app.globalData.sessionKey
      },
      method: 'POST'
    }).then((res) => {
      console.log(res)
      if (page > 1 && res.Data.length > 0) {
        this.setData({
          PageNo: page
        })
      }
      if (page > 1 && res.Data.length > 0) {
        if (status == 0) {
          that.setData({
            orderData: that.data.orderData.concat(res.Data)
          })
        } else if (status == 1) {
          for (let i in res.Data) {
            let num = 0;
            for (let j in res.Data[i].OrderItemList) {
              num = num + res.Data[i].OrderItemList[j].Quantity;
            }
            res.Data[i]['num'] = num;
          }
          that.setData({
            toPayOrderData: that.data.toPayOrderData.concat(res.Data)
          })
        } else if (status == 2) {
          that.setData({
            toSendOrderData: that.data.toSendOrderData.concat(res.Data)
          })
        } else if (status == 3) {
          that.setData({
            toReceiveOrderData: that.data.toReceiveOrderData.concat(res.Data)
          })
        } else if (status == 4) {
          this.setData({
            completedOrderData: that.data.completedOrderData.concat(res.Data)
          })
        } else if (status == 5) {
          this.setData({
            drawBackOrderData: that.data.drawBackOrderData.concat(res.Data)
          })
        }
      } else if (page == 1) {
        if (status == 0) {
          that.setData({
            orderData: res.Data
          })
        } else if (status == 1) {
          for (let i in res.Data) {
            let num = 0;
            for (let j in res.Data[i].OrderItemList) {
              num = num + res.Data[i].OrderItemList[j].Quantity;
            }
            res.Data[i]['num'] = num;
          }
          that.setData({
            toPayOrderData: res.Data
          })
        } else if (status == 2) {
          that.setData({
            toSendOrderData: res.Data
          })
        } else if (status == 3) {
          that.setData({
            toReceiveOrderData: res.Data
          })
        } else if (status == 4) {
          this.setData({
            completedOrderData: res.Data
          })
        } else if (status == 5) {
          this.setData({
            drawBackOrderData: res.Data
          })
        }
      }
    })
  },
  //取消订单
  cancel(e) {
    let that = this, data, names = [];
    if (e.target.dataset.name == 'all') {
      data = that.data.orderData[e.target.dataset.idx];
    } else {
      data = that.data.toPayOrderData[e.target.dataset.idx];
    }
    for (let i in data.OrderItemList) {
      names.push(data.OrderItemList[i].ProductName)
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
              OrderIdList: [e.target.dataset.cancel],
              UserId: app.globalData.userid,
              formId: e.detail.formId
            },
            method: 'POST'
          }).then((res) => {
            if (e.target.dataset.name == 'all') {
              that.data.orderData.splice(e.target.dataset.idx, 1)
              that.setData({
                orderData: that.data.orderData
              })
            } else {
              that.data.toPayOrderData.splice(e.target.dataset.idx, 1)
              that.setData({
                toPayOrderData: that.data.toPayOrderData
              })
            }
            console.log(app.globalData.userid)
            console.log(e.detail.formId)
            console.log([e.target.dataset.cancel])
            console.log(data.OrderTotalAmount)
            console.log(names.join('\n'))
            that.userInfo();
            sendTemplateInfo(app.globalData.userid, e.detail.formId, [e.target.dataset.cancel], 3, data.OrderTotalAmount, names.join('\n'));
          })
        }
      }
    })
  },
  //确认收货
  confirmReceipt(e) {
    let that = this;
    wx.showModal({
      title: '提示',
      content: '你确认收货了吗？',
      success: function (res) {
        if (res.confirm) {
          wx.ajax({
            method: 'POST',
            url: 'api/Order/ConfirmReceipt',
            data: {
              OrderId: that.data.toReceiveOrderData[e.currentTarget.dataset.index].OrderId,
              UserId: app.globalData.userid,
              Status: that.data.toReceiveOrderData[e.currentTarget.dataset.index].OrderStatus,
              sign: app.globalData.sign,
              SessionKey: app.globalData.sessionKey
            }
          }).then((res) => {
            if (!res.Success) {
              Prompt(res.Message);
            }
            that.setData({
              currentTab: 4
            })
          })
        }
      }
    })
  },
  //微信支付
  payment(e) {
    let order = this.data.toPayOrderData[e.target.dataset.idx], names = [], total = this.data.toPayOrderData[e.target.dataset.idx].OrderTotalAmount;
    if (e.target.dataset.name == 'all') {
      order = this.data.orderData[e.target.dataset.idx];
      total = this.data.orderData[e.target.dataset.idx].OrderTotalAmount;
    }
    for (let i in order.OrderItemList) {
      names.push(order.OrderItemList[i].ProductName)
    }
    pay([order.OrderId], total, names).then((res) => {
      if (res == 2) {
        this.userInfo();
      }
    })
  },

  //上拉加载
  upref() {
    this.paymentconnector(this.data.currentTab, this.data.PageNo + 1)
  }
})