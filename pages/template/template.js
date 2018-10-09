import { Prompt } from '../../utils/util.js'
const app = getApp()

Page({
  data: {
    max: 5,//库存
    detaildata: {
      freight: 0,//运费
      ShopName: '呵呵的店',
      OrderStatusDescription: '等待买家付款',
      ExpressCompanyName: '呵呵',
      CellPhone: '15616561651',
      Address: '深圳福田',
      time: '2天',
      OrderTotalAmount: 2000,
      msg: '哈哈哈哈哈哈哈',
      OrderItemList: [{
        ThumbnailsUrl: '/imgs/orders/goods01.jpg',
        ProductName: '西环路三环店',
        Quantity: '3',
        Color: '黑色',
        SalePrice: 1000,
        Size: 'M',
        TotalAmount: 2000
      }, {
        ThumbnailsUrl: '/imgs/orders/goods01.jpg',
        ProductName: '西环路三环店',
        Quantity: '3',
        Color: '黑色',
        SalePrice: 1000,
        Size: 'M',
        TotalAmount: 2000
      }]
    }
  },

  //减少
  reduce(e) {
    let detaildata = this.data.detaildata;
    let num = detaildata.OrderItemList[e.currentTarget.dataset.index];
    if (num.Quantity <= 1) {
      Prompt('最少数量为1')
    } else {
      detaildata.OrderItemList[e.currentTarget.dataset.index].Quantity = num.Quantity - 1;
      detaildata.OrderItemList[e.currentTarget.dataset.index].TotalAmount = num.Quantity * num.SalePrice;
      detaildata.OrderTotalAmount = detaildata.OrderTotalAmount - num.SalePrice;
      this.setData({
        detaildata: detaildata,
      })
    }
  },
  //增加
  plus(e) {
    let detaildata = this.data.detaildata;
    let num = detaildata.OrderItemList[e.currentTarget.dataset.index];
    if (num.Quantity >= this.data.max) {
      Prompt('库存不够了')
    } else {
      detaildata.OrderItemList[e.currentTarget.dataset.index].Quantity = num.Quantity + 1;
      detaildata.OrderItemList[e.currentTarget.dataset.index].TotalAmount = num.Quantity * num.SalePrice;
      detaildata.OrderTotalAmount = detaildata.OrderTotalAmount + num.SalePrice;
      this.setData({
        detaildata: detaildata
      })
    }
  }
})