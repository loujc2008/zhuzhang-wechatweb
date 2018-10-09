import { Prompt, compatible, getregionid, GetFreight, showModal, back, install } from '../../../../utils/util.js'
import freight from '../../../../utils/freight.js'
import minmoney from '../../../minmoney/minmoney.js'
const app = getApp()
var mta = require('../../../../statistics/mta_analysis.js')
let page = {
  data: {
    addressId: 0,//收货地址id
    index: 0,//点击购买的下标
    storeid: '',
    choosedAddressInfo: {},//收货地址
    isAddress: false,
    Freight: 0,//运费
    isShow: true,//SKU是否显示
    isvertical: true,//竖屏sku是否显示
    isDetail: true,//订单详情是否显示
    isverticalDetail: true,//竖屏订单详情是否显示
    shopdata: {},
    shopDetail: {},//商品详情
    colors: [],//颜色库
    sizes: [],//尺寸库
    versions: [],//版本库
    color: null,//颜色下标
    size: null,//尺寸下标
    version: null,//版本下标
    num: 1,//数量
    isOperation: false, //是否可操作
    sku: null, //当前选中的sku
    total: 0,//总价
    videoWidth: 0,//视屏宽度
    videoHeight: 0,//视屏高度
    videourl: '',//视屏路径
    srollHeight: 400,
    zczc: false,//控制竖屏视频隐藏显示商品购买
    shuxian: false,//控制竖屏显示
    controls: false//视频控件显示
  },
  onLoad(options) {
    mta.Page.init()
    console.log('a' + options.storeid)
    wx.setNavigationBarTitle({
      title: options.title
    })
    if (wx.getStorageSync('address')) {
      console.log(wx.getStorageSync('address'))
      this.setData({
        isAddress: true,
        choosedAddressInfo: wx.getStorageSync('address')
      })
      this.addAddress();
    }
    this.setData({
      storeid: options.storeid
    })
    wx.ajax({
      url: 'api/store/getstorevideopostapi',
      data: {
        storeId: this.data.storeid,
        // storeId: '162',
        sign: app.globalData.sign
      },
      method: 'POST'
    }).then((res) => {
      this.setData({
        videourl: res.Value.h5Video
      })
    });
  },
  onShow() {
    if (this.data.videoWidth < this.data.videoHeight) {
      wx.setNavigationBarColor({
        frontColor: '#ffffff',
        backgroundColor: '#213244',
      })
    }
    this.getDetail();
  },
  onReady() {
    console.log(wx.getSystemInfoSync().windowHeight)
    let res = wx.getSystemInfoSync()
    let px = res.windowWidth / 750;
    this.setData({
      srollHeight: res.windowHeight - px * 600
    })
    console.log(px)
    console.log(res.windowHeight - px * 600)
  },
  //获取详情
  getDetail() {
    wx.ajax({
      url: 'api/video/wechatapp/detail',
      data: {
        storeId: this.data.storeid,
        // storeId: '162',
        userId: app.globalData.userid
      },
      method: 'POST'
    }).then((res) => {
      console.log(res)
      this.setData({
        shopdata: res
      });
      this.setData({
        videoWidth: res.VideoWidth
      });
      this.setData({
        videoHeight: res.VideoHeight
      });
    })
  },
  //获取商品信息
  Eject(e) {
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
  //获取竖屏商品信息
  shuEject(e) {
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
      console.log(res)
      this.setData({
        shopDetail: res.Value.Product,
        isvertical: false,
        zczc: true
      })
      this.getSelectionType();
      this.judge();
    })
  },
  //获取选择类型
  getSelectionType() {
    let list = this.data.shopDetail.skus, colors = new Set(), sizes = new Set(), versions = new Set();
    for (let i in list) {
      if (list[i].Color) colors.add(list[i].Color);
      if (list[i].Size) sizes.add(list[i].Size);
      if (list[i].Version) versions.add(list[i].Version);
    }
    this.setData({
      colors: Array.from(colors),
      sizes: Array.from(sizes),
      versions: Array.from(versions)
    })
  },
  //判断是否有当前的skuId
  judge() {
    let list = this.data.shopDetail.skus;
    for (let i in list) {
      if ((this.data.colors.length <= 0 || this.data.colors[this.data.color] == list[i].Color) && (this.data.sizes.length <= 0 || this.data.sizes[this.data.size] == list[i].Size) && (this.data.versions.length <= 0 || this.data.versions[this.data.version] == list[i].Version)) {
        this.setData({
          isOperation: true,
          sku: list[i]
        })
        return;
      } else {
        this.setData({
          sku: {}
        })
      }
    }
    this.setData({
      isOperation: false
    })
  },
  //选择颜色
  btnColor(e) {
    this.setData({
      color: e.currentTarget.dataset.idx
    })
    if (this.data.sizes.length > 0 && this.data.size === null) return;
    if (this.data.versions.length > 0 && this.data.version === null) return;
    this.judge();
  },
  //选择尺寸
  btnSize(e) {
    this.setData({
      size: e.currentTarget.dataset.idx
    })
    if (this.data.colors.length > 0 && this.data.color === null) return;
    if (this.data.versions.length > 0 && this.data.version === null) return;
    this.judge();
  },
  //选择版本
  btnVersion(e) {
    this.setData({
      version: e.currentTarget.dataset.idx
    })
    if (this.data.colors.length > 0 && this.data.color === null) return;
    if (this.data.sizes.length > 0 && this.data.size === null) return;
    this.judge();
  },
  //关闭
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
    console.log(111111111)
    this.setData({
      isDetail: true
    })
  },
  //减少
  min() {
    if (this.data.isOperation) {
      if (this.data.num <= 1) {
        Prompt('数量最少为1')
      } else {
        this.setData({
          num: this.data.num - 1
        })
      }
    }
  },
  //增加
  add() {
    if (this.data.isOperation) {
      if (this.data.num >= this.data.sku.Stock) {
        Prompt('没有库存了')
      } else {
        this.setData({
          num: this.data.num + 1
        })
      }
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
          storeId: that.data.shopdata.storeId,
          sourceId: 0,
          sourceType: 0
        }
      }).then((res) => {
        console.log(res)
        wx.showToast({
          title: '成功加入购物车',
          icon: 'loading',
          mask: true,
          duration: 800
        })
        that.setData({
          isOperation: true
        })
      }).catch(() => {
        that.setData({
          isOperation: true
        })
      })
    }
    if (this.data.isOperation) {
      if (this.data.sku.Stock == 0) {
        Prompt('该商品没有库存了!');
      } else {
        that.setData({
          isOperation: false
        })
        showModal(function () {
          app.userLogin().then(() => {
            callback();
          })
        }, function () {
          callback();
        })
      }
    } else {
      Prompt('请选择商品属性');
    }
  },
  //立即购买
  nowBuy() {
    this.getFororder([this.data.shopdata.shopInfo.shopId], this.data.sku.SalePrice * this.data.num + this.data.Freight);
    let that = this;
    function callback() {
      that.setData({
        isDetail: false,
        isverticalDetail: false
      })
      if (that.data.choosedAddressInfo) {
        that.getFreight();
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
      Prompt('请选择商品属性');
    }
  },
  //选择收货地址
  chooseAddress() {
    compatible(wx.chooseAddress)
      .then((res) => {
        this.setData({
          choosedAddressInfo: res,
          isAddress: true
        })
        wx.setStorageSync('address', res)
        this.addAddress();
        this.getFreight();
      })
  },
  //获取运费
  getFreight() {
    getregionid(this.data.choosedAddressInfo.cityName)
      .then((res) => {
        GetFreight(this.data.sku.Id + ',' + this.data.num, res.Value).then((res) => {
          console.log(res)
          this.setData({
            Freight: res.Value.Freight,
            total: this.data.num * this.data.sku.SalePrice + res.Value.Freight
          })
        })
      })
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
    }
    showModal(function () {
      app.userLogin().then(() => {
        callback();
      })
    }, function () {
      callback();
    })
  },
  //竖屏关闭订单信息
  shudetailClose() {
    this.setData({
      isverticalDetail: true
    })
  },
  // 竖屏
  videoplay() {
    if (this.data.videoWidth > this.data.videoHeight) {
      this.setData({
        shuxian: false
      })
    } else if (this.data.videoHeight > this.data.videoWidth) {
      this.setData({
        shuxian: true
      })
    }
  },
  // 竖屏弹窗显示
  playwindow() {
    this.setData({
      isvertical: false
    })
  },
  verticalclose() {
    this.setData({
      isvertical: true,
      zczc: false
    })
  },
  verticalnowBuy() {
    this.setData({
      isverticalDetail: false
    })
    if (this.data.choosedAddressInfo) {
      this.getFreight();
    }
  },
  //关注
  concerned(e) {
    let that = this;
    wx.getSetting({
      success: (res) => {
        if (!res.authSetting['scope.userInfo']) {
          //提示授权
          showModal(function () {
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
              } else {
                wx.showToast({
                  title: '取消关注',
                  icon: 'success',
                  duration: 2000
                })
              }
              that.getDetail();
            })
          })
        } else {
          let aciton = 'add';
          if (e.currentTarget.dataset.state) aciton = 'cancel';
          wx.ajax({
            url: 'api/shop/concern/' + aciton,
            method: 'POST',
            data: {
              userId: app.globalData.userid,
              shopId: this.data.shopdata.shopInfo.shopId,
              shopName: this.data.shopdata.shopInfo.shopName
            }
          }).then((res) => {
            if (aciton == 'add') {
              wx.showToast({
                title: '关注成功',
                icon: 'success',
                duration: 2000
              })
            } else {
              wx.showToast({
                title: '取消关注',
                icon: 'success',
                duration: 2000
              })
            }
            this.getDetail();
          })
        }
      }
    })
  },
  //微信支付
  payment() {
    console.log('a' + this.data.shopdata.storeId)
    console.log('a' + this.data.sku.Id)
    console.log('a' + this.data.num)
    console.log('a' + this.data.addressId)
    // console.log(this.data.num)
    // console.log(this.data.num)
    if (!this.data.addressId) {
      Prompt('请选择地址！')
      return;
    }
    let fororder;
    if (this.data.fororder.length == this.data.sIdx) {
      fororder = 0;
    } else {
      fororder = this.data.fororder[this.data.sIdx].Id;
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
        counts: this.data.num,
        PlatformCouponId: fororder,
        cartItemIds: '',
        sourceType: 0,
        sourceId: '',
        videoId: '',
        invoiceType: '', invoiceTitle: '', invoiceContext: '', integral: '', couponIds: '',
        SessionKey: '',
        platformType: 1,
        website: 0,
        jsonStrMessageForShop: ''
      }
    }).then((res) => {
      console.log(res)
      wx.ajax({
        method: 'POST',
        url: 'api/wechatapp/pay',
        data: {
          openId: app.globalData.openid,
          IdList: '',
          Ids: res.orderIds[0],
          sign: app.globalData.sign,
          SessionKey: '',
        }
      }).then((res) => {
        // console.log(res)
        wx.requestPayment({
          'timeStamp': res.Value.timestamp,
          'nonceStr': res.Value.noncestr,
          'package': res.Value.package,
          'signType': 'MD5',
          'paySign': res.Value.sign,
          'success': function (res) {
            wx.redirectTo({
              url: '/pages/user/payment/payment?highlight=2',
            })
          },
          'fail': function (res) {
            wx.redirectTo({
              url: '/pages/user/payment/payment?highlight=1',
            })
          }
        })
      })
    })
  },
  //新增收货地址
  addAddress() {
    let info = this.data.choosedAddressInfo;
    console.log('b' + info)
    wx.ajax({
      url: 'api/address/wechatapp/add',
      method: 'POST',
      data: {
        userId: app.globalData.userid,
        sign: app.globalData.sign,
        Address: info.provinceName + '|' + info.cityName + '|' + info.countyName + '|' + info.detailInfo,
        Phone: info.telNumber,
        ShipTo: info.userName,
        IsDefault: '',
        SessionKey: ''
      }
    }).then((res) => {
      console.log(res)
      this.setData({
        addressId: res.Message
      })
    })
  },
  minmoneytan() {
    console.log(111111111111)
    this.setData({
      showFororder: true
    })
  }
}
install(page, freight)
install(page, minmoney)
Page(page)