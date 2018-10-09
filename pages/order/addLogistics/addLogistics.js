import { Prompt } from '../../../utils/util.js'
const app = getApp()
var mta = require('../../../statistics/mta_analysis.js')
Page({
  data: {
    company: '',
    courierNumber: '',
    id: 0 //退货退款id
  },
  onLoad(options) {
    mta.Page.init()
    this.setData({
      id: options.id
    })
  },
  //选择物流
  inputCompany(e) {
    this.setData({
      company: e.detail.value
    })
  },
  //输入快递单号
  inputCourierNumber(e) {
    this.setData({
      courierNumber: e.detail.value
    })
  },
  //确定
  sure() {
    if (this.data.courierNumber && this.data.company) {
      wx.ajax({
        method: 'POST',
        url: 'api/ordertefund/confirmrefundgood',
        data: {
          id: this.data.id,
          ExpressCompanyName: this.data.company,
          ShipOrderNumber: this.data.courierNumber,
          UserId: app.globalData.userid
        }
      }).then((res) => {
        console.log(res)
        wx.navigateBack({
          delta:1
        })
      })
    } else {
      Prompt('请填写单号');
    }
  }
})