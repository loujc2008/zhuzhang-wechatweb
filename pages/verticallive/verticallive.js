import { Prompt, showModal, getregionid, compatible, GetFreight, pay, install, back } from '../../utils/util.js'
import shopCart from '../../utils/shopCart.js'
import sku from '../../utils/sku.js'
import freight from '../../utils/freight.js'
import minmoney from '../minmoney/minmoney.js'
const app = getApp()
let apppppp = 1;
var mta = require('../../statistics/mta_analysis.js')
let page = {
  data: {
    arr: [],//聊天框文字信息
    cardList: [],//购物车操作
    cardIdx: 0,//下标
    isBubble: false,//是否显示气泡
    shelf: {},//下架商品
    idx: -2,// 商品下标
    shopBag: false,//购物袋是否显示
    shopDetail: {},//商品详情
    isSku: true,//sku界面end
    id: 0,//直播间Id
    LiveInfo: {},//直播间信息
    height: '',//sroll高度
    chat: false,//聊天框是否显示
    isDetail: true,//立即购买
    isSteam: false,//是否有流
    isSwitch: false,//是否观看
    isHere: false,//是否在直播间
    no_show: true,
    //交互
    inputValue: '',//留言
    promition: null,//活动信息
  },
  onLoad(options) {
    this.setData({
      isSteam: false,
      isHere: false
    })
    mta.Page.init()
    this.setData({
      id: options.Id
    })
    let that = this;
    if (wx.getStorageSync('address')) {
      this.setData({
        isAddress: true,
        choosedAddressInfo: wx.getStorageSync('address')
      })
      this.addAddress();
    }
    wx.getSystemInfo({
      success(res) {
        that.setData({
          height: res.windowHeight,
          scrollHeight: res.windowHeight * 0.65 - 113
        })
      }
    });
  },
  onShow() {
    this.Video = wx.createVideoContext('myVideo');
    this.getLiveInfo();
    this.showBubble();
  },
  onHide() {
    this.setData({
      isSteam: false,
      isHere: false
    })
    wx.closeSocket();
  },
  onUnload() {
    this.setData({
      isSteam: false,
      isHere: false
    })
    wx.closeSocket();
    wx.ajax({
      url: 'api/liveroom/wechatapp/leaveliveroom',
      data: {
        sign: app.globalData.sign,
        liveroomid: this.data.id
      },
      method: 'POST'
    })
  },
  onShareAppMessage(res) {
    return {
      title: this.data.LiveInfo.LiveRoomTitle + ' 直播间',
      path: 'pages/verticallive/verticallive?Id=' + this.data.id
    }
  },
  //是否在wifi状态下
  wifiWatch() {
    let that = this;
    wx.getNetworkType({
      success(res) {
        if (res.networkType == 'wifi') {
          setTimeout(() => {
            that.setData({
              isSwitch: true,
            })
            that.Video.play()
          }, 100)
        } else {
          wx.showModal({
            title: '提示',
            content: '确认在无WIFI情况下观看',
            success(res) {
              if (res.confirm) {
                that.setData({
                  isSwitch: true,
                })
                that.Video.play()
              } else if (res.cancel) {
                that.setData({
                  isSwitch: false
                })
              }
            }
          })
        }
      }
    })
  },
  //是否有流
  videoPause(e) {
    if (!this.data.isSteam) {
      this.setData({
        isSteam: true
      })
    }
  },
  //获取直播间信息
  getLiveInfo() {
    let that = this;
    wx.ajax({
      url: 'api/liveroom/wechatapp/detail',
      method: 'POST',
      data: {
        liveroomid: this.data.id,
        userid: app.globalData.userid,
        sign: app.globalData.sign
      }
    }).then((res) => {
      wx.setNavigationBarTitle({
        title: res.Value.LiveRoomTitle
      })
      if (res.Value.IsNewAudience) {
        this.data.arr.push({ NickName: '', MessageContent: '宝宝，喜欢主播点赞哦，加购直播间的宝贝！视霓绿色直播，禁止低俗，引诱，暴露等一切黄赌毒内容，警察先生24小时巡逻哦~', MessageType: 0 })
        this.setData({
          arr: this.data.arr
        })
      }
      this.setData({
        LiveInfo: res.Value
      })
      if (res.Value.LiveRoomStatus != 3 && !this.data.isHere) {
        this.wifiWatch();
        this.setData({
          isHere: true
        })
        if (res.Value.LiveRoomStatus == 1) {
          this.openSocket();
        }
      }
    })
  },
  //关注
  concerned(e) {
    console.log(this.Video)
    this.Video.play();
    console.log(this.Video)
    let that = this;
    function callback() {
      let aciton = 'add';
      if (e.currentTarget.dataset.state) aciton = 'cancel';
      wx.ajax({
        url: 'api/shop/concern/' + aciton,
        method: 'POST',
        data: {
          userId: app.globalData.userid,
          shopId: that.data.LiveInfo.ShopId,
          shopName: that.data.LiveInfo.LiveRoomName
        }
      }).then((res) => {
        let LiveInfo = that.data.LiveInfo;
        LiveInfo.IsConcernedShop = !that.data.LiveInfo.IsConcernedShop;
        if (aciton == 'add') {
          that.socketSend('关注了主播', 6, 1)
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
        that.setData({
          LiveInfo
        })
      })
    }
    showModal(function () {
      app.userLogin().then(() => {
        callback();
      })
    }, function () {
      callback()
    })
  },
  //点赞
  appreciation() {
    let that = this;
    function callback() {
      wx.ajax({
        url: 'api/liveroom/wechatapp/addpraised',
        method: 'POST',
        data: {
          MemberId: app.globalData.userid,
          SourceId: that.data.LiveInfo.Id,
          sign: app.globalData.sign
        }
      }).then((res) => {
        let LiveInfo = that.data.LiveInfo;
        LiveInfo.AlreadyPraised = true;
        that.setData({
          LiveInfo
        })
      })
    }
    showModal(() => {
      app.userLogin().then(() => {
        callback()
      })
    }, () => { callback() })
  },

  /**直播互动start */
  //打开连接
  openSocket() {
    let that = this;
    wx.connectSocket({
      url: 'wss://' + app.globalData.mallApiUrl + 'api/wechatapp/liveroom/chat/connect?nickName=wx_user_' + app.globalData.userid + '_' + this.data.id,
      method: 'GET'
    })
    //监听打开
    wx.onSocketOpen(function (res) {
      console.log(res)
      console.log('WebSocket连接已打开！')
      that.socketSend('进入直播间', 1)
    })
    wx.onSocketError(function (res) {
      console.log(res)
      console.log('WebSocket连接打开失败，请检查！')
    })
    //监听服务器消息
    wx.onSocketMessage(function (res) {
      if (res.data != '') {
        let data = JSON.parse(res.data)
        console.log(data)
        if (that.data.LiveInfo.Id == data.LiveRoomId) {
          if ([0, 1, 2, 4, 8, 10, 11].indexOf(data.OperationType) == -1) {
            that.data.arr.push({ Rank: data.Rank, MessageType: data.MessageType, MessageContent: data.MessageContent, NickName: data.NickName })
            that.setData({
              arr: that.data.arr
            })
          }
          if ([3, 4, 6, 7].indexOf(data.OperationType) != -1) {
            that.data.LiveInfo.Ranking = data.Ranking
            that.setData({
              LiveInfo: that.data.LiveInfo
            })
          }
          switch (data.OperationType) {
            case 1:
              if (app.globalData.userid == data.UserId) {
                // that.socketSend('进入了直播间', 1);
              } else {
                that.data.arr.push({ MessageType: 1, MessageContent: '进入了直播间', NickName: data.NickName })
                that.data.LiveInfo.Ranking = data.Ranking
                that.setData({
                  arr: that.data.arr,
                  LiveInfo: that.data.LiveInfo
                })
              }
              break;
            case 2:
              if (app.globalData.userid == data.UserId) {
                wx.showModal({
                  title: '提示',
                  content: '你被主播踢出了直播间！',
                  showCancel: false,
                  success(res) {
                    if (res.confirm) {
                      wx.navigateBack({
                        delta: 1
                      })
                    }
                  }
                })
              } else {
                that.data.arr.push({ MessageType: 1, MessageContent: data.MessageContent, NickName: data.NickName })
                that.setData({
                  arr: that.data.arr
                })
              }
              break;
            case 4:
              let List = that.data.cardList;
              List.push({ img: data.UserPhoto, MessageContent: data.MessageContent, NickName: data.NickName })
              that.setData({
                cardList: List
              })
              break;
            case 5:
              let v = that.data.LiveInfo.LiveProductList[data.LiveSequence - 1];
              that.data.LiveInfo.CurrentLiveProduct = v
              that.setData({
                LiveInfo: that.data.LiveInfo
              })
              break;
            case 6:
              that.data.LiveInfo.ConcernNumber = data.ShopConcernNumber
              that.setData({
                LiveInfo: that.data.LiveInfo
              })
              break;
            case 8:
              that.data.shelf[data.ProductId] = data.ProductId
              that.setData({
                shelf: that.data.shelf
              })
              break;
            case 10:
              that.data.LiveInfo.LiveRoomStatus = data.LiveRoomStatus
              that.setData({
                LiveInfo: that.data.LiveInfo
              })
              break;
            case 11:
              that.data.LiveInfo.Ranking = data.Ranking
              that.setData({
                LiveInfo: that.data.LiveInfo
              })
              break;
            case 13:
              Prompt('直播间已被删除！', function () {
                wx.redirectTo({
                  url: `../live/live`,
                })
              })
              break;
          }
        }
      }
    })
    wx.onSocketClose(function (res) {
      console.log(res)
      console.log('WebSocket 已关闭！')
    })
  },
  //显示气泡
  showBubble() {
    // this.setData({
    //   no_show: false
    // })
    setInterval(() => {
      this.data.cardList.splice(0, 1);
      this.setData({
        cardList: this.data.cardList
      })
      // if (this.data.cardList.length == 0) {
      //   this.setData({
      //     no_show: true
      //   })
      //   clearInterval(setInt);
      // }
    }, 5000)
  },
  //socket发送
  socketSend(msg, OperationType, msgType = 0, img = '', orderid = 0) {
    let data = {
      LiveRoomId: this.data.id,
      UserId: app.globalData.userid,
      ShopId: this.data.LiveInfo.ShopId,
      NickName: app.globalData.userInfo ? app.globalData.userInfo.nickName : '',
      MessageType: msgType,
      MessageContent: app.globalData.userInfo ? msg : '游客' + msg,
      OperationType: OperationType,
      UserPhoto: img,
      OrderId: orderid
    }
    wx.sendSocketMessage({
      data: JSON.stringify(data)
    })
  },
  //直播交互发送
  msgSend() {
    let that = this;
    function callback() {
      if (that.data.inputValue.replace(/(^\s*)|(\s*$)/g, "")) {
        that.socketSend(that.data.inputValue, 7)
        that.setData({
          chat: false,
          inputValue: ''
        })
      } else {
        Prompt('评论不能为空！')
      }
    }
    showModal(function () {
      app.userLogin().then(() => {
        callback();
      })
    }, function () {
      callback()
    })
  },
  //输入框
  inputMsg(e) {
    this.setData({
      inputValue: e.detail.value
    })
  },
  //显示聊天框
  msgBox() {
    if (this.data.LiveInfo.LiveRoomStatus == 2) {
      Prompt('回放直播不可评论');
    } else {
      this.setData({
        chat: !this.data.chat
      })
    }
  },
  /**直播互动end */

  /** sku界面方法start */
  //购物袋
  openShopBag() {
    let that = this;
    function callback() {
      that.setData({
        shopBag: true
      })
      that.getCartList();
    }
    showModal(function () {
      app.userLogin().then(() => {
        callback();
      })
    }, function () {
      callback();
    })
  },
  //关闭购物袋
  shopBagclose() {
    this.setData({
      shopBag: false
    })
  },
  //弹出sku
  Eject(e) {
    if (e.currentTarget.dataset.idx == this.data.idx) {
      this.setData({
        isSku: true,
        idx: -2
      })
      return;
    }
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
      console.log(res)
      this.setData({
        shopDetail: res.Value.Product,
        promition: res.Value.ShopPromotion,
        isSku: false,
        idx: e.currentTarget.dataset.idx,
        sIndex: e.currentTarget.dataset.idx = -1 ? e.currentTarget.dataset.idx : e.currentTarget.dataset.idx
      })
      this.getSelectionType();
      this.judge();
    })
  },
  //关闭sku
  close() {
    this.setData({
      isSku: true,
      idx: -2
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
          storeId: that.data.shopDetail.StoreId,
          sourceId: 0,
          sourceType: 0
        }
      }).then((res) => {
        let num = (that.data.idx + 1) + '号';
        if ((parseInt(that.data.idx) + 1) == 0) {
          num = '直播中的'
        }
        that.socketSend('将' + num + '商品加入了购物车', 3, 1)
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
  //初始化
  initi() {
    let promition = this.data.promition, total = 0;
    if (promition && promition.PromotionType == 4) {
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
  rapid() {
    if (this.data.isOperation) {
      if (this.data.sku.Stock == 0) {
        Prompt('该商品没有库存了!');
      } else {
        this.initi();
        let promotion = this.data.promotion;
        if (promotion) {
          if (promotion.PromotionType == 1) {
            this.setData({
              discount: promotion.PromotionDiscount
            })
            this.getFororder([{ 'ShopId': this.data.LiveInfo.ShopId, 'OrderItemAmount': -1 }], this.data.total * this.data.discount)
          }
          if (promotion.PromotionType == 2) {
            if (this.data.total >= promotion.OrderCredit) {
              this.setData({
                reductionAmount: promotion.ReductionAmount
              })
              this.getFororder([{ 'ShopId': this.data.LiveInfo.ShopId, 'OrderItemAmount': -1 }], this.data.total - promotion.ReductionAmount)
            } else {
              this.getFororder([{ 'ShopId': this.data.LiveInfo.ShopId, 'OrderItemAmount': -1 }], this.data.total)
            }
          }
          if (promotion.PromotionType == 4) {
            this.getFororder([{ 'ShopId': this.data.LiveInfo.ShopId, 'OrderItemAmount': -1 }], this.data.total)
          }
        } else {
          this.getFororder([{ 'ShopId': this.data.LiveInfo.ShopId, 'OrderItemAmount': -1 }], this.data.total)
        }
        this.setData({
          isDetail: false
        })
        if (this.data.choosedAddressInfo.cityName) {
          this.getFreight()
        }
      }
    } else {
      Prompt('请选择商品属性');
    }
  },
  // 关闭立即购买
  rapidclose() {
    this.setData({
      isDetail: true
    })
  },
  /** sku界面方法end */

  //微信支付
  payment() {
    if (!this.data.addressId) {
      Prompt('请选择地址！')
      return;
    }
    let orderid, fororder;
    if (this.data.fororder.length == 0) {
      fororder = 0;
    } else {
      fororder = this.data.fororder[0].Id;
    }
    wx.ajax({
      method: 'POST',
      url: 'api/Order/SubmitOrderPost',
      data: {
        userId: app.globalData.userid,
        sign: app.globalData.sign,
        addressId: this.data.addressId,
        storeId: this.data.shopDetail.StoreId,
        skuItemIds: this.data.sku.Id,
        counts: this.data.num,
        cartItemIds: '',
        sourceType: 0,
        sourceId: '',
        videoId: '',
        invoiceType: '', invoiceTitle: '', invoiceContext: '', integral: '', couponIds: '',
        SessionKey: '',
        platformType: 1,
        website: 0,
        jsonStrMessageForShop: '',
        PlatformCouponId: fororder
      }
    }).then((res) => {
      console.log(res)
      orderid = res.orderIds[0];
      this.setData({
        isDetail: true
      })
      return pay(res.orderIds, this.data.total * this.data.discount - this.data.sale - this.data.reductionAmount + this.data.Freight, [this.data.shopDetail.name])
    }).then((res) => {
      if (res == 2) {
        let num = (this.data.idx + 1) + '号';
        if (num == 0) {
          num = '直播中的'
        }
        this.socketSend('剁手' + num + '商品', 4, 1, app.globalData.userInfo.avatarUrl, orderid)
        wx.showModal({
          title: '提示',
          content: '购买成功，您可在个人中心查看！',
          showCancel: false,
          success() { }
        })
      } else {
        wx.showModal({
          title: '提示',
          content: '请您尽快完成付款，库存不足时订单将被取消',
          showCancel: false,
          success() { }
        })
      }
    }).catch((err) => {
      Prompt(err.data.Message)
    })
  },
  //进入列表页
  openLive() {
    this.close();
    this.shopBagclose();
    this.rapidclose();
    wx.ajax({
      url: 'api/liveroom/wechatapp/leaveliveroom',
      data: {
        sign: app.globalData.sign,
        liveroomid: this.data.id
      },
      method: 'POST'
    })
    let pages = getCurrentPages(), isExit = true;
    for (let i in pages) {
      if (pages[i].route == "pages/live/live") {
        back(pages.length - 1 - i)
        isExit = false;
        break;
      }
    }
    if (isExit) {
      wx.navigateTo({
        url: `../live/live`,
      })
    }
  },
  openDetail(e) {
    wx.navigateTo({
      url: '../commoditydetail/commoditydetail?id=' + e.currentTarget.dataset.id,
    })
  }
}
install(page, shopCart)
install(page, sku)
install(page, freight)
install(page, minmoney)
Page(page)