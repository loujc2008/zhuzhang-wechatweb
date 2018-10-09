const app = getApp()
Page({
  data: {
    arr: [],
    arr_refundgoods: [
      { text: '买家\n提交申请', checke: false, time: '' },
      { text: '待卖家\n处理', checke: false, time: '' },
      { text: '待买家\n寄货', checke: false, time: '' },
      { text: '待卖家\n确认收货', checke: false, time: '' },
      { text: '银行\n处理中', checke: false, time: '' },
      { text: '处理\n完毕', checke: false, time: '' }],
    arr_refund: [
      { text: '买家\n提交申请', checke: false, time: '' },
      { text: '待卖家\n处理', checke: false, time: '' },
      { text: '银行\n处理中', checke: false, time: '' },
      { text: '处理\n完毕', checke: false, time: '' }],
    arr_refuse: [
      { text: '买家\n提交申请', checke: false, time: '' },
      { text: '待卖家\n处理', checke: false, time: '' },
      { text: '处理\n完毕', checke: false, time: '' }],
    arr_refusegoods: [
      { text: '买家\n提交申请', checke: false, time: '' },
      { text: '待卖家\n处理', checke: false, time: '' },
      { text: '待买家\n寄货', checke: false, time: '' },
      { text: '待卖家\n确认收货', checke: false, time: '' },
      { text: '处理\n完毕', checke: false, time: '' }],
    arr2: [true, true, false]
  },
  onLoad(options) {
    this.setData({
      pType: options.type
    })
    if (options.type == 0) {
      //退款
      this.getRefundDetail()
    } else if (options.type == 1) {
      //投诉
      this.getComplaintDetail(options.id);
    } else if (options.type == 2) {
      //仲裁
      this.getArbitrationDetail(options.id);
    }
  },
  //投诉详情
  getComplaintDetail(id) {
    wx.ajax({
      method: 'POST',
      url: 'api/complaint/detail',
      data: {
        "Id": id
      }
    }, 'AZT').then((res) => {
      this.setData({
        detail: res.Data
      })
      let arr;
      if ([1, 2].indexOf(res.Data.OrderStatus) > -1) {
        arr = [
          { text: '提交交易投诉', checke: true, time: '' },
          { text: '平台介入处理', checke: false, time: '' },
          { text: '投诉完成', checke: false, time: '' }];
        arr[0].time = res.Data.ComplaintDateString;
        arr[1].time = res.Data.ManageDateString;
      }
      if ([4].indexOf(res.Data.OrderStatus) > -4) {
        arr = [
          { text: '提交交易投诉', checke: false, time: '' },
          { text: '投诉关闭', checke: false, time: '' }];
        arr[0].time = res.Data.ComplaintDateString;
        arr[1].time = res.Data.Withdraw;
      }
      if ([5].indexOf(res.Data.OrderStatus) > -1) {
        arr = [
          { text: '提交交易投诉', checke: true, time: '' },
          { text: '平台介入处理', checke: true, time: '' },
          { text: '投诉完成', checke: true, time: '' }];
        arr[0].time = res.Data.ComplaintDateString;
        arr[1].time = res.Data.ManageDateString;
        arr[2].time = res.Data.ManageDateString;
      }
      this.setData({
        arr
      })
    })
  },
  //撤销投诉
  cancelComplaint() {
    wx.ajax({
      url: 'api/complaint/cancel',
      method: 'POST',
      data: {
        "Id": this.data.detail.Id
      }
    }, 'AZT').then((res) => {
      console.log(res)
      this.getComplaintDetail(this.data.detail.Id);
    })
  },
  //仲裁详情
  getArbitrationDetail(id) {
    wx.ajax({
      method: 'POST',
      url: 'api/arbitration/detail',
      data: {
        "Id": id
      }
    }, 'AZT').then((res) => {
      this.setData({
        detail: res.Data
      })
      let arr;
      if ([1, 2].indexOf(res.Data.OrderStatus) > -1) {
        arr = [
          { text: '提交交易仲裁', checke: true, time: '' },
          { text: '平台介入处理', checke: false, time: '' },
          { text: '仲裁结束', checke: false, time: '' }];
        arr[0].time = res.Data.ArbitrationtDate;
        arr[1].time = res.Data.ManageDateString;
      }
      if ([4].indexOf(res.Data.OrderStatus) > -4) {
        arr = [
          { text: '提交交易仲裁', checke: false, time: '' },
          { text: '仲裁关闭', checke: false, time: '' }];
        arr[0].time = res.Data.ArbitrationtDate;
        arr[1].time = res.Data.Withdraw;
      }
      if ([5].indexOf(res.Data.OrderStatus) > -1) {
        arr = [
          { text: '提交交易仲裁', checke: true, time: '' },
          { text: '平台介入处理', checke: true, time: '' },
          { text: '仲裁结束', checke: true, time: '' }];
        arr[0].time = res.Data.ArbitrationtDate;
        arr[1].time = res.Data.ManageDateString;
      }
      this.setData({
        arr
      })
    })
  },
  //撤销仲裁
  cancelArbitration(e) {
    wx.ajax({
      url: 'api/arbitration/cancel',
      method: 'POST',
      data: {
        "Id": this.data.detail.Id
      }
    }, 'AZT').then((res) => {
      console.log(res)
      this.getArbitrationDetail(this.data.detail.Id);
    })
  },
  //退款详情
  getRefundDetail(id) {
    wx.ajax({
      method: 'POST',
      url: 'api/orderrefund/detail',
      data: {
        "Id": 1904
      }
    }, 'AZT').then((res) => {
      console.log(res)
      this.setData({
        detail: res.Data
      })
      let arr;
      if (res.Data.RefundMode == 1) {
        if (res.Data.SellerAuditStatus == 4) {
          arr = this.data.arr_refuse;
          arr[1].time = res.Data.SellerAuditDateString;
          arr[2].time = res.Data.UpdateDateString;
        } else {
          arr = this.data.arr_refund;
        }
      } else if (res.Data.RefundMode == 2) {
        if (res.Data.SellerAuditStatus == 4) {
          arr = this.data.arr_refusegoods;
          arr[1].time = res.Data.SellerAuditDateString;
          arr[2].time = res.Data.BuyerDeliverDateString;
          arr[3].time = res.Data.SellerConfirmArrivalDate;
          arr[4].time = res.Data.UpdateDateString;
        } else {
          arr = this.data.arr_refundgoods;
        }
      }
      arr[0].time = res.Data.ApplyDateString;
      for (let i in arr) {
        if (res.Data.SellerAuditStatus == 1 && i < 1) {
          arr[i].checke = true;
        }
        if (res.Data.SellerAuditStatus == 2 && i < 2) {
          arr[i].checke = true;
          arr[1].time = res.Data.SellerAuditDateString;
        }
        if (res.Data.SellerAuditStatus == 3 && i < 3) {
          arr[i].checke = true;
          arr[1].time = res.Data.SellerAuditDateString;
          arr[2].time = res.Data.BuyerDeliverDateString;
        }
        if (res.Data.SellerAuditStatus == 4) {
          arr[i].checke = true;
        }
      }
      this.setData({
        arr
      })
    })
  },
  //撤销退款
  closeApply() {
    wx.ajax({
      method: 'POST',
      url: 'api/orderrefund/cancel',
      data: {
        "MemberId": app.globalData.userid,
        "MemberName": app.globalData.userInfo.nickName,
        "Id": this.data.detail.Id
      }
    }, 'AZT').then((res) => {
      console.log(res)
      this.getRefundDetail(this.data.detail.Id);
    })
  },
  //物流填写
  addLogistics() {
    wx.setStorageSync('logistics', this.data.detail);
    wx.navigateTo({
      url: '../addLogistics/addLogistics',
    })
  }
})