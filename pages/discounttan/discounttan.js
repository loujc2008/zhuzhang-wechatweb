// pages/discounttan/discounttan.js
export default {
  data: {
    istan: ''//关闭弹窗
  },
  method: {
    // 关闭优惠券领取窗
    closetan() {
      this.setData({
        istan: false
      })
    }
  }
}