Component({
  properties: {
    productList: {
      type: Array, // 类型（必填），目前接受的类型包括：String, Number, Boolean, Object, Array, null（表示任意类型）
      value: []
    },
    pageType: {
      type: Number,
      value: 0
    }
  }
})
