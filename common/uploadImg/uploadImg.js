Component({
  properties: {
    // arr: {
    //   type: Array,
    //   value: []
    // }
  },

  data: {
    arr: []
  },

  methods: {
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
          // that.triggerEvent('selectImg', res.tempFilePaths)
        }
      })
    },
    deleteImg(e) {
      console.log()
      this.triggerEvent('deleteImg', e.currentTarget.dataset.idx)
    }
  }
})
