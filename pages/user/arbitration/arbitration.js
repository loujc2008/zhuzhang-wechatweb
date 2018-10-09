const app = getApp()
Page({
  data: {
    title: 1
  },
  onLoad(options) {
    this.getComplaint(1);
    this.getArbitration(1);
  },
  getComplaint(page) {
    wx.ajax({
      url: 'api/complaint/list',
      method: 'POST',
      data: {
        "UserId": app.globalData.userid,
        "PageNo": page,
        "PageSize": 10
      }
    }, 'AZT').then((res) => {
      console.log(page)
      this.setData({
        Cpage: page
      })
      if (page == 1) {
        this.setData({
          complaint: res.Data
        })
      } else {
        this.setData({
          complaint: this.data.complaint.concat(res.Data)
        })
      }
    })
  },
  btnComplaint() {
    this.setData({
      title: 1
    })
  },
  //撤销投诉
  cancelComplaint(e) {
    wx.ajax({
      url: 'api/complaint/cancel',
      method: 'POST',
      data: {
        "Id": e.target.dataset.id
      }
    }, 'AZT').then((res) => {
      console.log(res)
    })
  },
  getArbitration(page) {
    wx.ajax({
      url: 'api/arbitration/list',
      method: 'POST',
      data: {
        "UserId": app.globalData.userid,
        "PageNo": page,
        "PageSize": 10
      }
    }, 'AZT').then((res) => {
      console.log(res)
      this.setData({
        Apage: page
      })
      if (page == 1) {
        this.setData({
          arbitration: res.Data
        })
      } else {
        this.setData({
          arbitration: this.data.arbitration.concat(res.Data)
        })
      }
    })
  },
  btnArbitration() {
    this.setData({
      title: 2
    })
  },
  //撤销仲裁
  cancelArbitration(e) {
    wx.ajax({
      url: 'api/arbitration/cancel',
      method: 'POST',
      data: {
        "Id": e.target.dataset.id
      }
    }, 'AZT').then((res) => {
      console.log(res)
    })
  },
  onReachBottom() {
    if (this.data.title==1){
      this.getComplaint(this.data.Cpage + 1)
    }else{
      this.getArbitration(this.data.Apage + 1)
    }
  }
})