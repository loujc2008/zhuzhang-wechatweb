import { Prompt, showModal, deepCopy } from '../../utils/util.js'
const app = getApp();
var mta = require('../../statistics/mta_analysis.js')
Page({
  data: {
    inpcount: 1, //聊天框点击次数判断
    rapid: false,//立即购买
    rapidaddres: false, //立即购买地址
    addressMsg: {},//收货地址信息
    startX: 0, //开始坐标
    startY: 0,
    Products: [], //购物车列表
    allRadio: false, //全选
    totalCount: 0,//总数
    totalAmount: 0,//总价
    //购物袋end
    idx: -2,// 商品下标
    shopBag: false,//购物袋是否显示
    shopDetail: {},//商品详情
    colors: [],//颜色库
    sizes: [],//尺寸库
    versions: [],//版本库
    color: null,//颜色下标
    size: null,//尺寸下标
    version: null,//版本下标
    isOperation: false,//是否有选中的sku
    sku: {},//选中的sku
    num: 1,//数量
    isSku: true,
    //sku界面end
    inpcount: 1,//聊天框点击次数判断
    height: 0,//页面高度
    LiveInfo: {},//直播信息
  },
  onLoad(options) {
    this.setData({
      id: options.Id
    })
    mta.Page.init()
    this.getLiveInfo();
    let that = this;
    wx.getSystemInfo({
      success(res) {
        that.setData({
          height: res.windowHeight,
        })
      }
    });
  },
  // 聊天框显示隐藏
  vlbottomimg() {
    this.setData({
      inpcount: this.data.inpcount + 1
    })
  },
  //立即购买
  rapid() {
    if (this.data.isOperation){
      this.setData({
        rapid: true
      })
    }
  },
  // 关闭立即购买
  rapidclose() {
    this.setData({
      rapid: false
    })
  },
  // 添加地址
  adddizhi() {
    var that = this
    wx.chooseAddress({
      success: function (res) {
        var addressmsg = {
          userName: res.userName,
          telNumber: res.telNumber,
          address: res.provinceName + res.cityName + res.countyName + res.detailInfo
        }
        that.setData({
          addressMsg: addressmsg,
          rapidaddres: true
        })
      }
    })
  },
  //获取直播间信息
  getLiveInfo() {
    wx.ajax({
      url: 'api/liveroom/wechatapp/detail',
      method: 'POST',
      data: {
        // liveroomid: this.data.id,
        liveroomid: 4,
        userid: app.globalData.userid
      }
    }).then((res) => {
      console.log(res)
      this.setData({
        LiveInfo: res.Value
      })
    })
  },
  /** sku界面方法start */
  //购物袋
  openShopBag() {
    this.setData({
      shopBag: true
    })
    this.getCartList();
  },
  //关闭购物袋
  shopBagclose() {
    this.setData({
      shopBag: false
    })
  },
  //弹出sku
  Eject(e) {
    wx.ajax({
      method: 'POST',
      url: 'api/product/wechatapp/detail/',
      data: {
        productid: e.currentTarget.dataset.id,
        userid: app.globalData.userid,
        sign: app.globalData.sign,
        SessionKey: ''
      }
    }).then((res) => {
      if (e.currentTarget.dataset.idx != this.data.idx) {
        this.setData({
          num: 1,
          color: null,
          size: null,
          version: null
        })
      }
      this.setData({
        shopDetail: res.Value.Product,
        isSku: false,
        idx: e.currentTarget.dataset.idx
      })
      this.getSelectionType();
      this.judge();
    })
  },
  //关闭sku
  close() {
    this.setData({
      isSku: true
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
      console.log(that.data.sku.Id)
      console.log(that.data.num)
      console.log(that.data.shopDetail.StoreId)
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
      }).catch((err) => {

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
  /** sku界面方法end */
  /** 购物袋方法start */
  //手指触摸动作开始 记录起点X坐标
  touchstart(e) {
    this.setData({
      startX: e.changedTouches[0].clientX,
      startY: e.changedTouches[0].clientY
    })
  },

  //手指触摸结束
  touchend(e) {
    let fIdx = e.currentTarget.dataset.fIdx,//当前索引
      index = e.currentTarget.dataset.idx,//当前索引
      startX = this.data.startX,//开始X坐标
      startY = this.data.startY,//开始Y坐标
      endX = e.changedTouches[0].clientX,//滑动变化坐标
      endY = e.changedTouches[0].clientY,//滑动变化坐标
      //获取滑动角度
      angle = this.angle({ X: startX, Y: startY }, { X: endX, Y: endY }),
      that = this;
    this.data.Products.forEach(function (v, i) {
      v.CartViewModelList.forEach(function (x, j) {
        if (Math.abs(angle) > 30) return;
        if (j == index && i == fIdx) {
          if (endX - startX > 200) {
            setTimeout(function () {
              that.remove(x.SkuId);
              that.getAllRadio();
            }, 500)
          }
        }
      })
    })
  },

  //滑动事件处理
  touchmove(e) {
    let fIdx = e.currentTarget.dataset.fIdx,//当前索引
      index = e.currentTarget.dataset.idx,//当前索引
      startX = this.data.startX,//开始X坐标
      startY = this.data.startY,//开始Y坐标
      touchMoveX = e.changedTouches[0].clientX,//滑动变化坐标
      touchMoveY = e.changedTouches[0].clientY,//滑动变化坐标
      //获取滑动角度
      angle = this.angle({ X: startX, Y: startY }, { X: touchMoveX, Y: touchMoveY });
    this.data.Products.forEach(function (v, i) {
      v.CartViewModelList.forEach(function (x, j) {
        x.isTouchMove = false
        //滑动超过30度角 return
        if (Math.abs(angle) > 30) return;
        if (j == index && i == fIdx) {
          if (touchMoveX - startX > 200) {//右滑200
            x.isTouchMove = true
          }
        }
      })
    })
    this.setData({
      Products: this.data.Products
    })
  },

  //计算滑动角度
  angle(start, end) {
    let _X = end.X - start.X,
      _Y = end.Y - start.Y
    //返回角度 /Math.atan()返回数字的反正切值
    return 360 * Math.atan(_Y / _X) / (2 * Math.PI);
  },

  //获取购物车列表
  getCartList() {
    wx.ajax({
      method: 'POST',
      url: 'api/cart/list',
      data: {
        userId: app.globalData.userid,
        sign: app.globalData.sign
      }
    }).then((res) => {
      this.setData({
        Products: res.Value.Products,
        totalCount: res.Value.TotalCount,
        totalAmount: res.Value.TotalAmount
      })
      this.getTotalPrice();
      this.getTotalCount();
      this.getAllRadio();
    })
  },

  //获取总价
  getTotalPrice() {
    let Products = this.data.Products;
    let total = 0;
    for (let i = 0; i < Products.length; i++) {
      for (let j = 0; j < Products[i].CartViewModelList.length; j++) {
        if (Products[i].CartViewModelList[j].IsChecked) {
          total = total + Products[i].CartViewModelList[j].Price * Products[i].CartViewModelList[j].Quantity;
        }
      }
    }
    this.setData({
      totalAmount: total.toFixed(2)
    });
  },

  //获取总数
  getTotalCount() {
    let Products = this.data.Products;
    let count = 0;
    for (let i = 0; i < Products.length; i++) {
      for (let j = 0; j < Products[i].CartViewModelList.length; j++) {
        if (Products[i].CartViewModelList[j].IsChecked) {
          count = count + Products[i].CartViewModelList[j].Quantity;
        }
      }
    }
    this.setData({
      totalCount: count
    });
  },

  //获取全选状态
  getAllRadio() {
    let Products = this.data.Products;
    let allRadio = this.data.allRadio;
    allRadio = true;
    for (let i = 0; i < Products.length; i++) {
      for (let j = 0; j < Products[i].CartViewModelList.length; j++) {
        if (!Products[i].CartViewModelList[j].IsChecked) {
          allRadio = false
        }
      }
    }
    this.setData({
      allRadio
    });
  },

  //单选
  listRadio(e) {
    let Products = this.data.Products;
    let radioList = Products[e.currentTarget.dataset.fIdx].CartViewModelList;
    let radio = radioList[e.currentTarget.dataset.idx].IsChecked;
    Products[e.currentTarget.dataset.fIdx].CartViewModelList[e.currentTarget.dataset.idx].IsChecked = !radio;
    if (radio) {
      Products[e.currentTarget.dataset.fIdx].IsChecked = !radio;
      this.setData({
        Products
      })
    } else {
      Products[e.currentTarget.dataset.fIdx].IsChecked = true;
      for (let i in radioList) {
        if (i != e.currentTarget.dataset.idx && !radioList[i].IsChecked) {
          Products[e.currentTarget.dataset.fIdx].IsChecked = false;
        }
      }
      this.setData({
        Products
      })
    }
    this.getTotalPrice();
    this.getAllRadio();
    this.getTotalCount();
  },

  //店铺全选
  FRadio(e) {
    let Products = this.data.Products;
    let allRadio = this.data.allRadio;
    if (Products[e.currentTarget.dataset.fIdx].IsChecked) {
      Products[e.currentTarget.dataset.fIdx].IsChecked = false;
      for (let i in Products[e.currentTarget.dataset.fIdx].CartViewModelList) {
        Products[e.currentTarget.dataset.fIdx].CartViewModelList[i].IsChecked = false;
      }
    } else {
      Products[e.currentTarget.dataset.fIdx].IsChecked = true;
      for (let i in Products[e.currentTarget.dataset.fIdx].CartViewModelList) {
        Products[e.currentTarget.dataset.fIdx].CartViewModelList[i].IsChecked = true;
      }
    }
    this.setData({
      Products
    })
    this.getTotalPrice();
    this.getAllRadio();
    this.getTotalCount();
  },

  //全选
  allRadio() {
    let Products = this.data.Products;
    let allRadio = this.data.allRadio;
    if (allRadio) {
      allRadio = false;
      for (let i in Products) {
        Products[i].IsChecked = false;
        for (let j in Products[i].CartViewModelList) {
          Products[i].CartViewModelList[j].IsChecked = false;
        }
      }
    } else {
      allRadio = true;
      for (let i in Products) {
        Products[i].IsChecked = true;
        for (let j in Products[i].CartViewModelList) {
          Products[i].CartViewModelList[j].IsChecked = true;
        }
      }
    }
    this.setData({
      Products,
      allRadio
    })
    this.getTotalPrice();
    this.getTotalCount();
  },

  //商品减少
  minusQuantity(e) {
    let Products = this.data.Products;
    let Quantity = Products[e.currentTarget.dataset.fIdx].CartViewModelList[e.currentTarget.dataset.idx].Quantity;
    if (Quantity > 1) {
      Products[e.currentTarget.dataset.fIdx].CartViewModelList[e.currentTarget.dataset.idx].Quantity = Quantity - 1;
      this.setData({
        Products
      })
    }
    this.getTotalPrice();
    this.getTotalCount();
    this.updatecount(e.currentTarget.dataset.fIdx, e.currentTarget.dataset.idx);
  },

  //商品增加
  addQuantity(e) {
    let Products = this.data.Products;
    let Quantity = Products[e.currentTarget.dataset.fIdx].CartViewModelList[e.currentTarget.dataset.idx].Quantity;
    let Stock = Products[e.currentTarget.dataset.fIdx].CartViewModelList[e.currentTarget.dataset.idx].Stock;
    if (Quantity < Stock) {
      Products[e.currentTarget.dataset.fIdx].CartViewModelList[e.currentTarget.dataset.idx].Quantity = Quantity + 1;
      this.setData({
        Products
      })
    }
    this.getTotalPrice();
    this.getTotalCount();
    this.updatecount(e.currentTarget.dataset.fIdx, e.currentTarget.dataset.idx);
  },

  //购物车更新数量
  updatecount(fidx, idx) {
    let product = this.data.Products[fidx].CartViewModelList[idx];
    wx.ajax({
      url: 'api/cart/updatecount',
      method: 'POST',
      data: {
        userId: app.globalData.userid,
        sign: app.globalData.sign,
        count: product.Quantity,
        skuId: product.SkuId,
        storeId: product.StoreId
      }
    })
  },

  //店铺删除
  removeCart(e) {
    let skus = [],
      list = this.data.Products[e.currentTarget.dataset.fIdx].CartViewModelList;
    for (let i in list) {
      skus.push(list[i].SkuId)
    }
    this.remove(skus.join(','))
  },

  //购物车删除
  remove(id) {
    wx.ajax({
      url: 'api/cart/remove',
      method: 'POST',
      data: {
        userId: app.globalData.userid,
        sign: app.globalData.sign,
        skuIds: id
      }
    }).then(() => {
      this.getCartList();
    })
  },

  //结算
  openConfirmorder() {
    if (this.data.totalCount < 1) {
      Prompt('请选择宝贝')
    } else {
      let Products = deepCopy(this.data.Products);
      for (let i = 0; i < Products.length; i++) {
        for (let j = 0; j < Products[i].CartViewModelList.length; j++) {
          if (!Products[i].CartViewModelList[j].IsChecked) {
            Products[i].CartViewModelList.splice(j, 1);
            j = j - 1;
          }
        }
        if (Products[i].CartViewModelList.length == 0) {
          Products.splice(i, 1);
          i = i - 1;
        }
      }
      wx.setStorageSync('OrderStorage', Products)
      wx.navigateTo({
        url: '../confirmorder/confirmorder?status=1',
      })
    }
  },
  /** 购物袋方法end */
})