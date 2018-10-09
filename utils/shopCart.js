import { Prompt, deepCopy } from './util.js'
const app = getApp()
export default {
  data: {
    scrollHeight: 0,//购物袋高度
    startX: 0, //开始坐标
    startY: 0,
    Products: [], //购物车列表
    browseData: [],//浏览列表
    sellingData: [],//热销列表
    allRadio: false, //全选
    totalCount: 0,//总数
    totalAmount: 0//总价
  },
  method: {
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
            if (startX - endX > 200) {//左滑200
              setTimeout(function () {
                // that.remove(x.SkuId, fIdx, index);
                // that.getAllRadio();
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
        angle = this.angle({ X: startX, Y: startY }, { X: touchMoveX, Y: touchMoveY }),
        that = this;
      this.data.Products.forEach(function (v, i) {
        v.CartViewModelList.forEach(function (x, j) {
          if (Math.abs(angle) > 30) return;
          if (j == index && i == fIdx) {
            if (startX - touchMoveX > 100 && x.isTouchMove != 1) {//左滑100
              x.isTouchMove = 1
              that.setData({
                Products: that.data.Products
              })
            }
            if (startX - touchMoveX < 0 && x.isTouchMove != 2) {
              x.isTouchMove = 2
              that.setData({
                Products: that.data.Products
              })
            }
          }
        })
      })
    },

    //计算滑动角度
    angle(start, end) {
      let _X = end.X - start.X,
        _Y = end.Y - start.Y
      return 360 * Math.atan(_Y / _X) / (2 * Math.PI);
    },

    //点击删除
    cartDelete(e) {
      this.remove(e.currentTarget.dataset.skuId, e.currentTarget.dataset.fIdx, e.currentTarget.dataset.idx);
      this.getAllRadio();
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
          Products: res.Value.Products
        })
        this.getTotalPrice();
        this.getTotalCount();
        this.getAllRadio();
      })
    },

    //获取推荐商品
    getRecommend(qType) {
      wx.ajax({
        method: 'POST',
        url: 'api/product/list/special',
        data: {
          isasc: 0,
          pageno: 1,
          pagesize: 16,
          querytype: qType,
          userid: app.globalData.userid,
          sign: app.globalData.sign
        }
      }).then((res) => {
        console.log(res)
        if (qType == 1) {
          this.setData({
            browseData: res.Data
          })
        }
        if (qType == 2) {
          this.setData({
            sellingData: res.Data
          })
        }
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
        this.updatecount(e.currentTarget.dataset.fIdx, e.currentTarget.dataset.idx);
      } else {
        Prompt('数量不能小于1!')
      }
      this.getTotalPrice();
      this.getTotalCount();
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
        this.updatecount(e.currentTarget.dataset.fIdx, e.currentTarget.dataset.idx);
      } else {
        Prompt('没有库存了!')
      }
      this.getTotalPrice();
      this.getTotalCount();
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
        list = this.data.Products[e.currentTarget.dataset.fIdx].CartViewModelList,
        that = this;
      for (let i in list) {
        if (list[i].IsChecked) {
          skus.push(list[i].SkuId)
        }
      }
      if (skus.length > 0) {
        wx.showModal({
          title: '提示',
          content: '确认是否删除',
          success: function (res) {
            if (res.confirm) {
              that.remove(skus.join(','))
            }
          }
        })
      }
    },

    //购物车删除
    remove(id, fidx = null, idx = null) {
      let that = this;
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
    }
  }
}