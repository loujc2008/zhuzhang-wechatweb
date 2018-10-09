import { Prompt, compatible, getregionid, GetFreight, showModal, back, install, pay } from '../../../../utils/util.js'
import freight from '../../../../utils/freight.js'
import minmoney from '../../../minmoney/minmoney.js'
import sku from '../../../../utils/sku.js'
const app = getApp()
var mta = require('../../../../statistics/mta_analysis.js')
let page = {
  data: {
    isPlay: false,//视频播放
    index: 0,//点击购买的下标
    storeid: '',//播放器id
    title: '',//播放器标题
    isShow: true,//SKU是否显示
    isDetail: true,//订单详情是否显示
    shopdata: {},//商品列表
    shopDetail: {},//商品详情
    videourl: '',//视频路径
    videoImg: '',//视频图片
    srollHeight: 400,//sku弹窗高度
    showNavs: false,//控制快捷导航
    currentTime: 0,//当前播放时间
    onOff: true, //操作开关
  },
  onLoad(options) {
    mta.Page.init()
    this.setData({
      title: options.title,
      storeid: options.storeid
    })
    if (wx.getStorageSync('address')) {
      this.setData({
        isAddress: true,
        choosedAddressInfo: wx.getStorageSync('address')
      })
      this.addAddress();
    }
    let that = this;
    wx.getSystemInfo({
      success(res) {
        that.setData({
          srollHeight: ((750 / res.windowWidth) * res.windowHeight - 420) / (750 / res.windowWidth),
          mainHeight: ((750 / res.windowWidth) * res.windowHeight - 650) / (750 / res.windowWidth)
        })
      }
    });
  },
  onShow() {
    this.getDetail();
    this.getVideo();
    this.videoContext = wx.createVideoContext('myVideo');
  },
  onHide() {
    this.setData({
      isPlay: false
    })
    this.videoContext.pause();
  },
  //获取视频内容
  getVideo() {
    wx.ajax({
      url: 'api/store/getstorevideopostapi',
      data: {
        storeid: this.data.storeid,
        sign: app.globalData.sign
      },
      method: 'POST'
    }).then((res) => {
      this.setData({
        videourl: res.Value.h5Video_High,
        videoImg: res.Value.imgMax
      })
    });
  },
  //获取视频当前播放时间
  getCurrentTime(e) {
    if (e.detail != this.data.currentTime) {
      this.setData({
        currentTime: e.detail.currentTime
      })
    }
  },
  //获取视频详情
  getDetail() {
    let that = this;
    function callback() {
      wx.ajax({
        url: 'api/video/wechatapp/detail',
        data: {
          storeId: that.data.storeid,
          userId: app.globalData.userid
        },
        method: 'POST'
      }).then((res) => {
        that.setData({
          shopdata: res
        })
      })
    }
    showModal(() => {
      app.userLogin().then(() => {
        callback();
      })
    }, () => {
      callback()
    })
  },
  //获取商品信息
  Eject(e) {
    if (this.data.shopdata.ProductList[e.currentTarget.dataset.index].stock <= 0) {
      Prompt('该商品没有库存了！');
      return;
    }
    wx.ajax({
      method: 'POST',
      url: 'api/product/wechatapp/detail/',
      data: {
        productid: e.currentTarget.dataset.idx,
        userid: app.globalData.userid,
        sign: app.globalData.sign,
        SessionKey: ''
      }
    }).then((res) => {
      if (e.currentTarget.dataset.index != this.data.index) {
        this.setData({
          num: 1
        })
      }
      this.setData({
        shopDetail: res.Value.Product,
        isShow: false,
        index: e.currentTarget.dataset.index
      })
      this.getSelectionType();
      this.judge();
    })
  },
  //sku选择统计
  skuClick(sku, id, name) {
    wx.ajax({
      url: 'api/report/AddProductSkuClickNum',
      data: {
        ProductId: id,
        ProductName: name,
        ClickNum: 1,
        Sku: sku,
        ShopId: this.data.shopdata.shopInfo.shopId,
        ShopName: this.data.shopdata.shopInfo.shopName,
        StoreId: this.data.shopdata.storeId,
        StoreName: this.data.shopdata.storeName,
        VideoId: this.data.shopdata.videoId,
        VideoName: this.data.shopdata.videoName,
        UserId: app.globalData.userid,
        PlaySeconds: this.data.currentTime,
        PlatForm: 5,
        SourceId: this.data.shopdata.storeId,
        SourceType: 0,
      },
      method: 'POST'
    })
  },
  //关闭sku
  close() {
    this.setData({
      isShow: true,
      sku: null,
      color: null,
      size: null,
      version: null
    })
  },
  //订单信息关闭
  detailClose() {
    this.setData({
      isDetail: true
    })
  },
  //加入购物车
  addCart() {
    let that = this;
    function callback() {
      wx.ajax({
        url: 'api/cart/add',
        method: 'POST',
        data: {
          userId: app.globalData.userid,
          skuId: that.data.sku.Id,
          count: that.data.num,
          sign: app.globalData.sign,
          storeId: that.data.shopdata.storeId,
          sourceId: 0,
          sourceType: 0
        }
      }).then((res) => {
        wx.showToast({
          title: '成功加入购物车',
          icon: 'loading',
          mask: true,
          duration: 800
        })
        that.setData({
          onOff: true
        })
        let product = that.data.shopdata.ProductList[that.data.index];
        wx.ajax({
          url: 'api/report/AddBuyCarClickNum',
          data: {
            CarNum: 1,
            SkuId: that.data.sku.Id,
            ProductId: product.id,
            ProductName: product.name,
            ShopId: that.data.shopdata.shopInfo.shopId,
            ShopName: that.data.shopdata.shopInfo.shopName,
            StoreId: that.data.shopdata.storeId,
            StoreName: that.data.shopdata.storeName,
            VideoId: that.data.shopdata.videoId,
            VideoName: that.data.shopdata.videoName,
            UserId: app.globalData.userid,
            PlaySeconds: that.data.currentTime,
            PlatForm: 5,
            SourceId: that.data.shopdata.storeId,
            SourceType: 0,
          },
          method: 'POST'
        })
      }).catch(() => {
        that.setData({
          onOff: true
        })
      })
    }
    if (this.data.isOperation) {
      if (this.data.onOff) {
        if (this.data.sku.Stock == 0) {
          Prompt('该商品没有库存了!');
        } else {
          that.setData({
            onOff: false
          })
          showModal(function () {
            app.userLogin().then(() => {
              callback();
            })
          }, function () {
            callback();
          })
        }
      }
    } else {
      Prompt('请选择商品属性');
    }
  },
  //初始化
  initi() {
    let promotion = this.data.shopdata.ProductList[this.data.index].Promotion, total = 0;
    if (promotion && promotion.PromotionType == 4) {
      total = this.data.sku.SeckillPrice * this.data.num;
    } else {
      total = this.data.sku.SalePrice * this.data.num;
    }
    this.setData({
      total: total,//商品价格
      discount: 1,//折扣
      reductionAmount: 0,//满减金额
      sale: 0,//平台优惠金额
      Freight: null //运费
    })
  },
  //立即购买
  nowBuy() {
    this.initi();
    let promotion = this.data.shopdata.ProductList[this.data.index].Promotion, that = this;
    if (promotion) {
      if (promotion.PromotionType == 1) {
        this.setData({
          discount: promotion.PromotionDiscount
        })
        this.getFororder([{ 'ShopId': this.data.shopdata.shopInfo.shopId, 'OrderItemAmount': -1 }], this.data.total * this.data.discount);
      }
      if (promotion.PromotionType == 2) {
        if (this.data.total >= promotion.OrderCredit) {
          this.setData({
            reductionAmount: promotion.ReductionAmount
          })
          this.getFororder([{ 'ShopId': this.data.shopdata.shopInfo.shopId, 'OrderItemAmount': -1 }], this.data.total - promotion.ReductionAmount)
        } else {
          this.getFororder([{ 'ShopId': this.data.shopdata.shopInfo.shopId, 'OrderItemAmount': -1 }], this.data.total)
        }
      }
      if (promotion.PromotionType == 4) {
        this.getFororder([{ 'ShopId': this.data.shopdata.shopInfo.shopId, 'OrderItemAmount': -1 }], this.data.total);
      }
    } else {
      this.getFororder([{ 'ShopId': this.data.shopdata.shopInfo.shopId, 'OrderItemAmount': -1 }], this.data.total)
    }
    function callback() {
      let product = that.data.shopdata.ProductList[that.data.index];
      wx.ajax({
        url: 'api/report/AddBuyImmediatelyNum',
        data: {
          BuyNum: 1,
          SkuId: that.data.sku.Id,
          ProductId: product.id,
          ProductName: product.name,
          ShopId: that.data.shopdata.shopInfo.shopId,
          ShopName: that.data.shopdata.shopInfo.shopName,
          StoreId: that.data.shopdata.storeId,
          StoreName: that.data.shopdata.storeName,
          VideoId: that.data.shopdata.videoId,
          VideoName: that.data.shopdata.videoName,
          UserId: app.globalData.userid,
          PlaySeconds: that.data.currentTime,
          PlatForm: 5,
          SourceId: that.data.shopdata.storeId,
          SourceType: 0,
        },
        method: 'POST'
      })
      that.setData({
        isDetail: false
      })
      if (that.data.choosedAddressInfo.cityName) {
        that.getFreight()
      }
    }
    if (this.data.isOperation) {
      if (this.data.sku.Stock == 0) {
        Prompt('该商品没有库存了!');
      } else {
        showModal(function () {
          app.userLogin().then(() => {
            callback();
          })
        }, function () {
          callback();
        })
      }
    } else {
      Prompt('请选择商品属性!');
    }
  },
  //点赞
  appreciation() {
    let that = this;
    function callback() {
      wx.ajax({
        url: 'api/video/praise/add',
        method: 'POST',
        data: {
          userId: app.globalData.userid,
          shopId: that.data.shopdata.shopInfo.shopId,
          shopName: that.data.shopdata.shopInfo.shopName,
          storeId: that.data.shopdata.storeId,
          storeName: that.data.shopdata.storeName,
          videoId: that.data.shopdata.videoId,
          videoName: that.data.shopdata.videoName,
          SourceType: 0,
          SourceId: '',
          SourceName: '',
          PraisedIp: ''
        }
      }).then((res) => {
        that.getDetail();
      })
      wx.ajax({
        url: 'api/report/AddPraiseCountItem',
        data: {
          PlatForm: 5,
          ShopId: that.data.shopdata.shopInfo.shopId,
          ShopName: that.data.shopdata.shopInfo.shopName,
          StoreId: that.data.shopdata.storeId,
          StoreName: that.data.shopdata.storeName,
          VideoId: that.data.shopdata.videoId,
          VideoName: that.data.shopdata.videoName,
          UserId: app.globalData.userid,
          SourceId: that.data.shopdata.storeId,
          SourceType: 0
        },
        method: 'POST'
      })
    }
    showModal(function () {
      app.userLogin().then(() => {
        callback();
      })
    }, function () {
      callback();
    })
  },
  // 竖屏
  toshu() {
    wx.ajax({
      method: 'POST',
      url: 'api/wechatapp/video/updateplaycount',
      data: {
        storeid: this.data.shopdata.storeId,
        SessionKey: '',
        sign: app.globalData.sign
      }
    })
    wx.ajax({
      url: 'api/report/AddOnePlayItem',
      data: {
        PlatForm: 5,
        ShopId: this.data.shopdata.shopInfo.shopId,
        ShopName: this.data.shopdata.shopInfo.shopName,
        StoreId: this.data.shopdata.storeId,
        StoreName: this.data.shopdata.storeName,
        VideoId: this.data.shopdata.videoId,
        VideoName: this.data.shopdata.videoName,
        UserId: app.globalData.userid,
        SourceId: this.data.shopdata.storeId,
        SourceType: 0,
        Play: 1
      },
      method: 'POST'
    })
    if (this.data.shopdata.VideoHeight > this.data.shopdata.VideoWidth) {
      this.videoContext.pause();
      wx.navigateTo({
        url: '../shuvideo/shuvideo?storeid=' + this.data.storeid + '&title=' + this.data.title,
      })
    } else {
      this.setData({
        isPlay: true
      })
      this.videoContext.play();
    }
  },
  //关注
  concerned(e) {
    let that = this;
    function callback() {
      let aciton = 'add';
      if (e.currentTarget.dataset.state) aciton = 'cancel';
      wx.ajax({
        url: 'api/shop/concern/' + aciton,
        method: 'POST',
        data: {
          userId: app.globalData.userid,
          shopId: that.data.shopdata.shopInfo.shopId,
          shopName: that.data.shopdata.shopInfo.shopName
        }
      }).then((res) => {
        if (aciton == 'add') {
          wx.showToast({
            title: '关注成功',
            icon: 'success',
            duration: 2000
          })
          wx.ajax({
            url: 'api/report/AddConcernShopItem',
            data: {
              'type': 1,
              PlatForm: 5,
              SourceId: that.data.shopdata.storeId,
              ShopId: that.data.shopdata.shopInfo.shopId,
              ShopName: that.data.shopdata.shopInfo.shopName,
              StoreId: that.data.shopdata.storeId,
              StoreName: that.data.shopdata.storeName,
              VideoId: that.data.shopdata.videoId,
              VideoName: that.data.shopdata.videoName,
              UserId: app.globalData.userid,
              SourceType: 0,
              PlaySeconds: that.data.currentTime
            },
            method: 'POST'
          })
        } else {
          wx.showToast({
            title: '取消关注',
            icon: 'success',
            duration: 2000
          })
          wx.ajax({
            url: 'api/report/AddConcernShopItem',
            data: {
              'type': 0,
              PlatForm: 5,
              SourceId: that.data.shopdata.storeId,
              ShopId: that.data.shopdata.shopInfo.shopId,
              ShopName: that.data.shopdata.shopInfo.shopName,
              StoreId: that.data.shopdata.storeId,
              StoreName: that.data.shopdata.storeName,
              VideoId: that.data.shopdata.videoId,
              VideoName: that.data.shopdata.videoName,
              UserId: app.globalData.userid,
              SourceType: 0,
              PlaySeconds: that.data.currentTime
            },
            method: 'POST'
          })
        }
        let shopdata = that.data.shopdata;
        shopdata.shopInfo.isBeenConcerned = !that.data.shopdata.shopInfo.isBeenConcerned;
        that.setData({
          shopdata
        })
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
  //微信支付
  payment() {
    if (!this.data.addressId) {
      Prompt('请选择地址！')
      return;
    }
    let fororder;
    if (this.data.fororder.length == this.data.sIdx) {
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
        storeId: this.data.shopdata.storeId,
        skuItemIds: this.data.sku.Id,
        PlatformCouponId: fororder ? fororder.Id : 0,
        PlatformCouponAmount: fororder ? fororder.Amount : 0,
        counts: this.data.num,
        cartItemIds: '',
        sourceType: 0,
        sourceId: '',
        videoId: '',
        invoiceType: '', invoiceTitle: '', invoiceContext: '', integral: '', couponIds: '',
        SessionKey: '',
        platformType: 5,
        PlaySeconds: this.data.currentTime,
        website: 1,
        jsonStrMessageForShop: ''
      }
    }).then((res) => {
      return pay(res.orderIds, this.data.total * this.data.discount - this.data.sale - this.data.reductionAmount + this.data.Freight, [this.data.shopDetail.name]);
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
      Prompt(err.data.Message)
    })
  },
  //点击快捷导航
  showNav() {
    this.setData({
      showNavs: !this.data.showNavs
    })
  },
  //logo错误
  logoError() {
    this.data.shopdata.shopInfo.shopHeadImage = '/imgs/default.jpg';
    this.setData({
      shopdata: this.data.shopdata
    })
  },
  //进入店铺页
  openDianpu() {
    let id = this.data.shopdata.shopInfo.shopId;
    let pages = getCurrentPages(), isExit = true;
    let product = this.data.shopdata.ProductList[this.data.index];
    wx.ajax({
      url: 'api/report/AddClickToShopItem',
      data: {
        PlatForm: 5,
        SourceId: this.data.shopdata.storeId,
        ProductId: product.id,
        ProductName: product.name,
        ShopId: this.data.shopdata.shopInfo.shopId,
        ShopName: this.data.shopdata.shopInfo.shopName,
        StoreId: this.data.shopdata.storeId,
        StoreName: this.data.shopdata.storeName,
        VideoId: this.data.shopdata.videoId,
        VideoName: this.data.shopdata.videoName,
        UserId: app.globalData.userid,
        SourceType: 0,
        ClickTimes: 1,
        PlaySeconds: this.data.currentTime
      },
      method: 'POST'
    })
    for (let i in pages) {
      if (pages[i].route == "pages/dianpu/dianpu") {
        back(pages.length - 1 - i).then((page) => {
          page.setData({
            shopId: id
          })
        })
        isExit = false;
        break;
      }
    }
    if (isExit) {
      wx.navigateTo({
        url: `../../../dianpu/dianpu?shopId=${id}`,
      })
    }
  },
  //进入商品页
  openCommoditydetail(e) {
    let id = this.data.shopdata.ProductList[e.currentTarget.dataset.idx].id;
    let pages = getCurrentPages(), isExit = true;
    let product = this.data.shopdata.ProductList[e.currentTarget.dataset.idx];
    wx.ajax({
      url: 'api/report/AddProductClickNum',
      data: {
        PlatForm: 5,
        ProductId: product.id,
        ProductName: product.name,
        ShopId: this.data.shopdata.shopInfo.shopId,
        ShopName: this.data.shopdata.shopInfo.shopName,
        StoreId: this.data.shopdata.storeId,
        StoreName: this.data.shopdata.storeName,
        VideoId: this.data.shopdata.videoId,
        VideoName: this.data.shopdata.videoName,
        UserId: app.globalData.userid,
        SourceId: this.data.shopdata.storeId,
        SourceType: 0,
        ClickNum: 1,
        PlaySeconds: this.data.currentTime
      },
      method: 'POST'
    })
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
        url: `/pages/commoditydetail/commoditydetail?id=${id}`,
      })
    }
  },
  //转发
  onShareAppMessage(res) {
    return {
      title: this.data.title,
      path: 'pages/classify/inside/video/video?title=' + this.data.title + '&storeid=' + this.data.shopdata.storeId
    }
  }
}
install(page, freight)
install(page, minmoney)
install(page, sku)
Page(page)





