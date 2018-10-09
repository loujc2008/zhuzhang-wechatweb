import { compatible, getregionid, GetFreight, showModal } from './util.js'
const app = getApp()
export default {
  data: {
    choosedAddressInfo: {},//收货地址信息
    isAddress: false, //立即购买地址
    Freight: 0,//运费
    addressId: null,//地址Id
  },
  method: {
    //选择收货地址
    chooseAddress() {
      let that = this;
      function callback() {
        compatible(wx.chooseAddress)
          .then((res) => {
            that.setData({
              choosedAddressInfo: res,
              isAddress: true
            })
            wx.setStorageSync('address', res)
            that.getFreight();
            that.addAddress();
          })
      }
      showModal(() => {
        callback()
      }, () => {
        callback()
      }, 'scope.address')
    },
    //获取运费
    getFreight() {
      return getregionid(this.data.choosedAddressInfo.cityName)
        .then((res) => {
          return GetFreight(this.data.sku.Id + ',' + this.data.num, res.Value)
        })
        .then((res) => {
          this.setData({
            Freight: res.Value.Freight,
            // total: this.data.num * this.data.sku.SalePrice + res.Value.Freight
          })
        })
        .catch((err) => {
          console.log(err)
        })
    },
    //新增收货地址
    addAddress() {
      let info = this.data.choosedAddressInfo;
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
        this.setData({
          addressId: res.Message
        })
      })
    },
  }
}