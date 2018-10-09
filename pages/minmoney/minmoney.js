const app = getApp();
export default {
  data: {
    sIdx: -1,
    fororder: [],
    showFororder: false
  },
  method: {
    getFororder(ShopOrderItemList, money = this.data.totalAmount) {
      wx.ajax({
        url: 'api/coupon/wechatapp/fororder',
        data: {
          UserId: app.globalData.userid,
          sign: app.globalData.sign,
          Sort: 1,
          ShopOrderItemList: ShopOrderItemList,
          SessionKey: ''
        },
        method: 'POST'
      }).then((res) => {
        var arr2 = this.sort(res.Data);
        this.setData({
          fororder: arr2,
          money
        })
        for (let i = 0; i < this.data.fororder.length; i++) {
          if (money > this.data.fororder[i].Amount && money >= this.data.fororder[i].Limitation) {
            this.setData({
              sIdx: i
            })
            break;
          }
        }
      })
    },
    //排序  
    sort(a) {
      var i = 0, j = 0, t = 0;
      for (i = 0; i < a.length; i++) {
        for (j = 0; j < a.length; j++) {
          if (a[i].Amount >= a[j].Amount) {
            t = a[i];
            a[i] = a[j];
            a[j] = t;
          }
        }
      }
      return a;
    },
    //选择优惠券
    selectFororder(e) {
      let money;
      if (this.data.money > this.data.fororder[e.currentTarget.dataset.idx].Amount && this.data.money >= this.data.fororder[e.currentTarget.dataset.idx].Limitation) {
        this.setData({
          sIdx: e.currentTarget.dataset.idx
        })
      }
    },
    //打开优惠券列表
    openFororder() {
      this.setData({
        showFororder: true
      })
    },
    //关闭优惠券列表
    closeFororder() {
      this.setData({
        showFororder: false
      })
    }
  }
}