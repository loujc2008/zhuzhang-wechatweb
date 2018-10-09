import { Prompt, showModal, back, install } from '../../utils/util.js'
import trackSDK from '../../utils/index.js'
import sku from '../../utils/sku.js'
const app = getApp()
var mta = require('../../statistics/mta_analysis.js')
let page = {
  data: {
    isShow: false,//sku界面是否显示
    productid: '',//商品id
    shopDetail: {},//详情
    status: '',// 状态
    IsFavorite: true, //是否收藏
    showNavs: false, //快捷导航是否显示
    ProductDescriptionAllImages: '',
    CanUsePlatformCoupon: '',//参与平台优惠券活动状态
    HasPromotion: false,//是否有活动
    ShopPromotion: {},//活动
    discount: 1, //折扣
    value: '',
    ishuodong: false,
    quanData: '',//优惠券
    date: {},
    sellingData: [],//推荐商品
  },
  onLoad(options) {
    this.setData({
      productid: options.id
    })
    mta.Page.init()
  },
  onShow() {
    this.Eject();
  },
  //获取推荐商品
  getRecommend(id) {
    wx.ajax({
      method: 'POST',
      url: 'api/shop/products',
      data: {
        orderby: 2,
        shopid: id,
        isasc: 0,
        pageno: 1,
        pagesize: 6
      }
    }).then((res) => {
      console.log(res)
      this.setData({
        sellingData: res.Data
      })
    })
  },
  //获取商品信息
  Eject() {
    wx.ajax({
      method: 'POST',
      url: 'api/product/wechatapp/detail/',
      data: {
        productid: this.data.productid,
        userid: app.globalData.userid,
        sign: app.globalData.sign,
        SessionKey: ''
      }
    }).then((res) => {
      this.setData({
        CanUsePlatformCoupon: res.Value.CanUsePlatformCoupon,
        shopDetail: res.Value.Product,
        IsFavorite: res.Value.IsFavorite,
        ProductDescriptionAllImages: res.Value.Product.ProductDescriptionAllImages,
        HasPromotion: res.Value.HasPromotion,
        ShopPromotion: res.Value.ShopPromotion,
        value: res.Value
      })
      if (res.Value.ShopPromotion) {
        if (res.Value.ShopPromotion.PromotionType == 1) {
          this.setData({
            discount: res.Value.discount
          })
        }
        if (res.Value.ShopPromotion.PromotionType == 4) {
          let nDate = Date.parse(new Date().toUTCString()), eDate = Date.parse(res.Value.ShopPromotion.EndTime), date = {
            day: 0,
            hour: 0,
            minute: 0
          };

          let d = eDate - nDate - (3600 * 8 * 1000);
          date.day = (Math.floor(d / (24 * 3600 * 1000))) < 10 ? '0' + Math.floor(d / (24 * 3600 * 1000)) : Math.floor(d / (24 * 3600 * 1000));
          date.hour = (Math.floor(d / (3600 * 1000)) % 24) < 10 ? '0' + Math.floor(d / (3600 * 1000)) % 24 : Math.floor(d / (3600 * 1000)) % 24;
          date.minute = (Math.floor(d / (60 * 1000)) % 60) < 10 ? '0' + Math.floor(d / (60 * 1000)) % 60 : Math.floor(d / (60 * 1000)) % 60;
          console.log(date)
          this.setData({
            date
          })
        }
      }
      this.getRecommend(res.Value.Product.shopId);
      this.getSelectionType();
      this.judge();
      showModal(() => {
        app.userLogin().then(() => {
          this.noCoupon()
        })
      }, () => {
        if (app.globalData.userInfo) {
          this.noCoupon()
        } else {
          app.callback = () => {
            this.noCoupon()
          }
        }
      })
    })
  },
  // 未领取优惠券
  noCoupon() {
    let shopIdList = [this.data.shopDetail.shopId]
    let that = this;
    wx.ajax({
      url: 'api/coupon/wechatapp/forshop',
      data: {
        userId: app.globalData.userid,
        ShopIdList: shopIdList,
        SessionKey: '',
        sign: app.globalData.sign
      },
      method: 'POST'
    }).then((res) => {
      that.setData({
        quanData: res.Data
      })
    })
  },
  //领取优惠券
  getyouhui(e) {
    let index = e.currentTarget.dataset.index;
    let idarr = [this.data.quanData[index].Id];
    let that = this;
    function callback() {
      wx.ajax({
        url: 'api/coupon/wechatapp/get',
        data: {
          userId: app.globalData.userid,
          CouponIdList: idarr,
          SessionKey: '',
          sign: app.globalData.sign
        },
        method: 'POST'
      }).then((res) => {
        that.noCoupon()
      }).catch((err) => {
        console.log(err)
        if (err.data.Success === false && err.data.Message === "该优惠券已被终止!") {
          wx.showModal({
            title: '提示',
            content: '抱歉，该优惠券已停止发放',
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                that.noCoupon()
              }
            }
          })
        } else if (err.data.Success === false && err.data.Message === "优惠券已达到领用限制!") {
          wx.showModal({
            title: '提示',
            content: '优惠券已被领完',
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                that.noCoupon()
              }
            }
          })
        }
      })
    }
    showModal(() => {
      app.userLogin().then(() => {
        callback()
      })
    }, () => {
      callback()
    })
  },
  // 关闭
  close() {
    this.setData({
      isShow: false
    })
  },
  //点击属性选择
  changesize() {
    this.setData({
      isShow: true,
      status: 2
    })
  },
  //点击加入购物车
  btnCart() {
    this.setData({
      status: 0
    })
    if (this.data.isOperation) {
      if (this.data.sku.Stock > 0) {
        this.addCart();
      } else {
        Prompt('没有库存了！')
      }
    } else {
      this.setData({
        isShow: true
      })
    }
  },
  // 点击立即购买
  nowbuy() {
    this.setData({
      status: 1
    })
    if (this.data.isOperation) {
      if (this.data.sku.Stock > 0) {
        this.navigateToConfirmOrder();
      } else {
        Prompt('没有库存了！')
      }
    } else {
      this.setData({
        isShow: true
      })
    }
  },
  // 选择sku里面的确认
  affirm() {
    if (this.data.isOperation) {
      if (this.data.sku.Stock > 0) {
        // 状态status：加入购物车是0，立即购买是1，选择尺寸是2
        if (this.data.status == 0) {
          this.addCart();
        } else if (this.data.status == 1) {
          this.navigateToConfirmOrder();
        } else if (this.data.status == 2) {
          this.setData({
            isShow: false
          })
        }
      } else {
        Prompt('没有库存了！')
      }
    } else {
      Prompt('请选择商品属性!')
    }
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
          storeId: that.data.shopDetail.StoreId,
          sourceId: 0,
          sourceType: 0
        }
      }).then((res) => {
        wx.showToast({
          title: '加入购物车成功',
          icon: 'loading',
          mask: true,
          duration: 800
        })
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
  //跳转至确认订单界面
  navigateToConfirmOrder() {
    let that = this;
    function callback() {
      let OrderStorage = [], product = that.data.shopDetail;
      let data = [{
        Ischecked: true,
        ShopId: product.shopId,
        ShopLogo: product.shopLogo,
        ShopName: product.shopName,
        CartViewModelList: []
      }];
      data[0].CartViewModelList.push({
        ImageUrl: product.imgUrl,
        IsApplyMemberDiscount: product.IsApplyMemberDiscount,
        IsChecked: true,
        ProductId: product.id,
        ProductName: product.name,
        Productcode: product.productCode,
        Quantity: that.data.num,
        ShopId: product.shopId,
        ShopLogo: product.shopLogo,
        ShopName: product.shopName,
        Price: that.data.ShopPromotion && that.data.ShopPromotion.PromotionType == 4 ? that.data.sku.SeckillPrice : (that.data.sku.SalePrice * that.data.discount).toFixed(2),
        Color: that.data.sku.Color,
        CostPrice: that.data.sku.SalePrice,
        Size: that.data.sku.Size,
        SkuId: that.data.sku.Id,
        Status: product.state,
        Stock: that.data.sku.Stock,
        StoreId: product.StoreId,
        VShopId: product.VideoId,
        Promotion: that.data.ShopPromotion
      })
      wx.setStorageSync('OrderStorage', data)
      wx.redirectTo({
        url: '../confirmorder/confirmorder?status=2',
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
  // 点击收藏
  collect() {
    let that = this;
    function callback() {
      let aciton = 'add';
      if (that.data.IsFavorite) {
        aciton = 'cancel'
      }
      wx.ajax({
        method: 'POST',
        url: 'api/product/favorite/' + aciton,
        data: {
          productIds: that.data.productid,
          userId: app.globalData.userid,
          website: '1'
        }
      }).then((res) => {
        that.setData({
          IsFavorite: !that.data.IsFavorite
        })
        if (that.data.IsFavorite) {
          wx.showToast({
            title: '收藏成功',
            icon: 'success',
            duration: 2000
          })
        } else {
          wx.showToast({
            title: '取消收藏',
            icon: 'success',
            duration: 2000
          })
        }
        // that.Eject(that.data.productid);
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
  //点击快捷导航
  showNav() {
    this.setData({
      showNavs: !this.data.showNavs
    })
  },
  // 图片宽高小于1的删除
  imageLoad(e) {
    var width = e.detail.width;
    var height = e.detail.height;
    if (width < 10 && height < 10) {
      this.data.ProductDescriptionAllImages.splice(e.currentTarget.dataset.idx, 1)
      this.setData({
        ProductDescriptionAllImages: this.data.ProductDescriptionAllImages
      })
    }
  },
  // 图片错误的删除
  imgerror(e) {
    if (e.detail.errMsg) {
      this.data.ProductDescriptionAllImages.splice(e.currentTarget.dataset.idx, 1)
      this.setData({
        ProductDescriptionAllImages: this.data.ProductDescriptionAllImages
      })
    }
  },
  //进入店铺页
  openDianpu() {
    let id = this.data.shopDetail.shopId;
    let pages = getCurrentPages(), isExit = true;
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
      wx.redirectTo({
        url: `../dianpu/dianpu?shopId=${id}`,
      })
    }
  },
  //进入视频页
  openVideo(e) {
    let video = this.data.shopDetail;
    let pages = getCurrentPages(), isExit = true;
    for (let i in pages) {
      if (pages[i].route == "pages/classify/inside/video/video") {
        back(pages.length - 1 - i).then((page) => {
          page.setData({
            storeid: video.StoreId,
            title: video.name
          })
        })
        isExit = false;
        break;
      }
    }
    if (isExit) {
      wx.redirectTo({
        url: `../classify/inside/video/video?storeid=${video.StoreId}&title=${video.name}`,
      })
    }
  },
  onShareAppMessage(res) {
    return {
      title: this.data.shopDetail.name,
      path: 'pages/commoditydetail/commoditydetail?id=' + this.data.shopDetail.id
    }
  },
  coupon() {
    this.setData({
      ishuodong: true
    })
  },
  closesku() {
    this.setData({
      isShow: false,
      ishuodong: false
    })
  },
  hdclose() {
    this.setData({
      ishuodong: false
    })
  },
  openXiaoneng() {
    trackSDK.callTrail({ originId: 'gh_993eccb045cd' });
  },
  openBannerPreview(e) {
    wx.previewImage({
      current: this.data.shopDetail.imgUrlList[e.currentTarget.dataset.idx],
      urls: this.data.shopDetail.imgUrlList
    })
  },
  openDetailPreview(e) {
    wx.previewImage({
      current: this.data.ProductDescriptionAllImages[e.currentTarget.dataset.idx],
      urls: [this.data.ProductDescriptionAllImages[e.currentTarget.dataset.idx]]
    })
  }
}
install(page, sku)
Page(page)  
