 import {
  Prompt, getregionid, GetFreight, compatible, pay, install, showModal, getAccessToken,
  getTemplateList,
  sendTemplateInfo
} from '../../utils/util.js'
import trackSDK from '../../utils/index.js'
import minmoney from '../minmoney/minmoney.js'
import freight from '../../utils/freight.js'
const app = getApp()
var mta = require('../../statistics/mta_analysis.js')
let page = {
  data: {
    isAddress: false,
    choosedAddressInfo: null,//收货地址
    Products: [],//订单列表
    totalAmount: 0,//总价
    addressId: null,//地址id
    status: 1,//入口状态 1为购物车入口 2为立即购买入口
  },

  onLoad(options) {
    mta.Page.init()
    console.log(wx.getStorageSync('OrderStorage'))
    this.setData({
      Products: wx.getStorageSync('OrderStorage'),
      status: options.status
    })
    this.initi();
    if (wx.getStorageSync('address')) {
      this.setData({
        isAddress: true,
        choosedAddressInfo: wx.getStorageSync('address')
      })
      this.addAddress();
      this.getFreight();
    }
  },
  //初始化
  initi() {
    let products = this.data.Products, shopList = [];
    for (let i in products) {
      products[i].discountMoney = 0;
      products[i].reductionAmount = 0;
      products[i].miaoshaMoney=0;
      products[i].total = 0;
      products[i].Freight = 0;
      let total = 0;
      for (let j in products[i].CartViewModelList) {
        products[i].CartViewModelList[j].Price = parseFloat(products[i].CartViewModelList[j].Price).toFixed(2);
        total += products[i].CartViewModelList[j].Price * products[i].CartViewModelList[j].Quantity;
      }
      products[i].total = total;
      console.log(products[i].total)
      let dMoney = 0, dtotal = 0, isCredit = false;
      for (let j in products[i].CartViewModelList) {
        if (products[i].CartViewModelList[j].Promotion) {
          //折扣活动 
          if (products[i].CartViewModelList[j].Promotion.PromotionType == 1) {
            products[i].discountMoney += (products[i].CartViewModelList[j].CostPrice - products[i].CartViewModelList[j].Price) * products[i].CartViewModelList[j].Quantity;
            dtotal += products[i].CartViewModelList[j].Price * products[i].CartViewModelList[j].Quantity;
          }
          //秒杀活动
          if (products[i].CartViewModelList[j].Promotion.PromotionType == 4) {
            products[i].miaoshaMoney += (products[i].CartViewModelList[j].CostPrice - products[i].CartViewModelList[j].Price) * products[i].CartViewModelList[j].Quantity;
            console.log(products[i].miaoshaMoney)
            dtotal += products[i].CartViewModelList[j].Price * products[i].CartViewModelList[j].Quantity;
          }
          //满减活动
          if (products[i].CartViewModelList[j].Promotion.PromotionType == 2) {
            dtotal += products[i].CartViewModelList[j].CostPrice * products[i].CartViewModelList[j].Quantity;
            if (dtotal >= products[i].CartViewModelList[0].Promotion.OrderCredit) {
              isCredit = true;
            }
          }
        } else {
          dtotal += products[i].CartViewModelList[j].Price * products[i].CartViewModelList[j].Quantity;
        }
      }
      if (isCredit) {
        products[i].reductionAmount = products[i].CartViewModelList[0].Promotion.ReductionAmount;//满减金
        dtotal = dtotal - products[i].CartViewModelList[0].Promotion.ReductionAmount;
      }
      products[i].total = dtotal;
      shopList.push({ 'ShopId': products[i].ShopId, 'OrderItemAmount': -1 });
    }
    this.getAllMoney();
    this.getFororder(shopList, this.data.totalAmount);
    this.setData({
      Products: products
    })
  },
  //获取总价
  getAllMoney() {
    let money = 0, products = this.data.Products;
    for (let i in products) {
      money += products[i].total + products[i].Freight;
    }
    this.setData({
      totalAmount: money
    })
  },

  //留言
  inputMsg(e) {
    let Products = this.data.Products;
    Products[e.currentTarget.dataset.idx].msg = e.detail.value;
    this.setData({
      Products
    })
  },

  //提交订单——立即购买
  insertAddress() {
    if (!this.data.addressId) {
      Prompt('请填写收货地址')
    } else {
      let data = this.data.Products, skuItemIds = [], counts = [], msg = [], storeId = [], fororder, names = [];
      for (let i in data) {
        if (data[i].msg) {
          msg.push(JSON.stringify({ ShopId: data[i].ShopId, Message: data[i].msg }))
        }
        for (let j in data[i].CartViewModelList) {
          names.push(data[i].CartViewModelList[j].ProductName)
          counts.push(data[i].CartViewModelList[j].Quantity)
          skuItemIds.push(data[i].CartViewModelList[j].SkuId)
          storeId.push(data[i].CartViewModelList[j].StoreId)
        }
      }
      if (this.data.sIdx == -1) {
        fororder = null;
      } else {
        fororder = this.data.fororder[this.data.sIdx];
      }
      wx.ajax({
        method: 'POST',
        url: 'api/Order/SubmitOrderPost',
        data: {
          userId: app.globalData.userid,
          sign: app.globalData.sign,
          addressId: this.data.addressId,
          storeId: storeId[0],
          skuItemIds: skuItemIds.join(','),
          counts: counts.join(','),
          cartItemIds: '',
          sourceType: 0,
          sourceId: '',
          videoId: '',
          invoiceType: '', invoiceTitle: '', invoiceContext: '', integral: '', couponIds: '',
          SessionKey: '',
          platformType: 5,
          website: 0,
          PlatformCouponId: fororder ? fororder.Id : 0,
          PlatformCouponAmount: fororder ? fororder.Amount : 0,
          jsonStrMessageForShop: '[' + msg.join(',') + ']'
        }
      }).then((res) => {
        return pay(res.orderIds, (this.data.sIdx == -1 ? this.data.totalAmount : this.data.totalAmount - this.data.fororder[this.data.sIdx].Amount).toFixed(2), names);
      }).then((res) => {
        if (res == 2) {
          wx.redirectTo({
            url: '/pages/user/payment/payment?highlight=' + res,
          })
        } else {
          wx.showModal({
            title: '提示',
            content: '请您尽快完成付款，库存不足时订单将被取消',
            showCancel: false,
            success(res1) {
              if (res1.confirm) {
                wx.redirectTo({
                  url: '/pages/user/payment/payment?highlight=' + res,
                })
              }
            }
          })
        }
      }).catch((err) => {
        console.log(err)
        Prompt(err.data.Message)
      })
    }
  },

  //提交订单——购物车
  submitOrderByCart() {
    if (!this.data.addressId) {
      Prompt('请填写收货地址')
    } else {
      let data = this.data.Products, skuItemIds = [], counts = [], cartItemIds = [], msg = [], storeId = [], fororder, names = [];
      for (let i in data) {
        if (data[i].msg) {
          msg.push(JSON.stringify({ ShopId: data[i].ShopId, Message: data[i].msg }))
        }
        for (let j in data[i].CartViewModelList) {
          names.push(data[i].CartViewModelList[j].ProductName)
          counts.push(data[i].CartViewModelList[j].Quantity)
          skuItemIds.push(data[i].CartViewModelList[j].SkuId)
          cartItemIds.push(data[i].CartViewModelList[j].CartItemId)
          storeId.push(data[i].CartViewModelList[j].StoreId)
        }
      }
      if (this.data.sIdx == -1) {
        fororder = null;
      } else {
        fororder = this.data.fororder[this.data.sIdx];
      }
      wx.ajax({
        method: 'POST',
        url: 'api/Order/SubmitOrderByCart',
        data: {
          userId: app.globalData.userid,
          sign: app.globalData.sign,
          addressId: this.data.addressId,
          storeId: storeId[0],
          skuItemIds: skuItemIds.join(','),
          counts: counts.join(','),
          cartItemIds: cartItemIds.join(','),
          sourceType: 0,
          sourceId: 0,
          videoId: 0,
          invoiceType: 0, invoiceTitle: '', invoiceContext: '', integral: '', couponIds: '',
          SessionKey: '',
          platformType: 5,
          website: 1,
          PlatformCouponId: fororder ? fororder.Id : 0,
          PlatformCouponAmount: fororder ? fororder.Amount : 0,
          jsonStrMessageForShop: '[' + msg.join(',') + ']'
        }
      }).then((res) => {
        return pay(res.orderIds, (this.data.sIdx == -1 ? this.data.totalAmount : this.data.totalAmount - this.data.fororder[this.data.sIdx].Amount).toFixed(2), names);
      }).then((res) => {
        if (res == 2) {
          wx.redirectTo({
            url: '/pages/user/payment/payment?highlight=' + res,
          })
        } else {
          wx.showModal({
            title: '提示',
            content: '请您尽快完成付款，库存不足时订单将被取消',
            showCancel: false,
            success(res1) {
              if (res1.confirm) {
                wx.redirectTo({
                  url: '/pages/user/payment/payment?highlight=' + res,
                })
              }
            }
          })
        }
      }).catch((err) => {
        console.log(err)
        Prompt(err.data.Message)
      })
    }
  },
  // 客服
  openXiaoneng() {
    trackSDK.callTrail({ originId: 'gh_993eccb045cd' });
  }
}
install(page, minmoney)
install(page, freight)
let method = {
  method: {
    //获取运费
    getFreight() {
      let Products = this.data.Products, that = this, fns = [];
      getregionid(this.data.choosedAddressInfo.cityName)
        .then((res) => {
          for (let i in Products) {
            let skus = [];
            for (let j in Products[i].CartViewModelList) {
              skus.push(Products[i].CartViewModelList[j].SkuId + ',' + Products[i].CartViewModelList[j].Quantity)
            }
            fns[i] = GetFreight(skus.join(';'), res.Value).then((res) => {
              Products[i].Freight = res.Value.Freight
              that.setData({
                Products
              })
              return res.Value.Freight;
            })
          }
          Promise.all(fns).then((res) => {
            that.getAllMoney();
          })
        })
    }
  }
}
install(page, method)
Page(page)