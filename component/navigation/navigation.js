Component({
  data: {
    showNavs: false
  },
  methods: {
    showNav() {
      this.setData({
        showNavs: !this.data.showNavs
      })
    }
  }
})
