Page({
  data: {
    uploadImg: [],
    arr: [],
    reason_idx: -1,//退款原因下标
    isReason: true,//是否显示退款原因
    detail: {},//商品数据
    idx: 0,//商品下标
    reasonType: 1,//退款类型
    arr_refund: [
      '质量原因',
      '货物损坏',
      '未按约定时间发货',
      '其他',
    ],//仅退款
    arr_refundgoods: [
      '买多/不喜欢',
      '质量原因',
      '商品与描述不符',
      '卖家发错货物',
      '货物损坏',
      '未按约定时间发货',
      '其他'
    ],//退货退款
    refund_num: 1,//退款数量
    refund_money: 0,//退款金额
  },
  onLoad(options) {
    this.setData({
      detail: wx.getStorageSync('refund').data,
      idx: wx.getStorageSync('refund').index,
      reasonType: options.type
    })
  },
  updateImg(e) {
    this.setData({
      uploadImg: e.detail
    })
  },
  deteleImg(e) {
    this.setData({
      uploadImg: this.data.uploadImg.splice(e.detail, 1)
    })
  },
  //输入退款金额
  inputAmount(e) {
    console.log(this.data.detail.OrderItemInfo[this.data.idx].SalePrice)
    if (e.detail.value > this.data.detail.OrderItemInfo[this.data.idx].SalePrice) {
      this.setData({
        refund_money: this.data.detail.OrderItemInfo[this.data.idx].SalePrice
      })
    } else {
      this.setData({
        refund_money: e.detail.value
      })
    }
  },
  //关闭退款原因
  closerReason() {
    this.setData({
      isReason: true
    })
  },
  //显示退款原因
  showSelect() {
    this.setData({
      isReason: false
    })
  },
  //选择退款原因
  selectReason(e) {
    this.setData({
      reason_idx: e.currentTarget.dataset.idx == this.data.reason_idx ? -1 : e.currentTarget.dataset.idx
    })
  },
  min() {
    this.setData({
      refund_num: this.data.refund_num - 1
    })
  },
  add() {
    this.setData({
      refund_num: this.data.refund_num + 1
    })
  },
  //选择图片
  selectImg() {
    let that = this;
    wx.chooseImage({
      count: 3,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        that.setData({
          arr: res.tempFilePaths
        })
      }
    })
  },
  deleteImg(e) {
    this.data.arr.splice(e.currentTarget.dataset.idx, 1)
    this.setData({
      arr: this.data.arr
    })
  },
  //申请退款
  sad() {
    let oItem = this.data.detail.OrderItemInfo[this.data.idx];
    wx.ajax({
      method: 'POST',
      url: 'api/orderrefund/apply',
      data: {
        "OrderId": this.data.detail.Id,
        "OrderItemId": oItem.Id,
        "ShopId": this.data.detail.ShopId,
        "ShopName": this.data.detail.ShopName,
        "UserId": app.globalData.userid,
        "UserName": app.globalData.userInfo.nickName,
        "ProductAmount": this.data.refund_money,
        "ReturnQuantity": this.data.refund_num,
        "Amount": this.data.amount,
        "Freight": oItem.Freight,
        "ReasonId": 1,
        "Reason": this.data.reason,
        "RefundMode": refundType,
        "UploadImages": ""
      }
    }, 'AZT').then((res) => {
      wx.redirectTo({
        url: '../returns0/returns0?id=' + res.Code + '&refundType=' + refundType,
      })
    })
  }
})