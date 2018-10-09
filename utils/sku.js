import { Prompt } from './util.js'
export default {
  data: {
    colors: [],//颜色库
    sizes: [],//尺寸库
    versions: [],//版本库
    color: null,//颜色下标
    size: null,//尺寸下标
    version: null,//版本下标
    isOperation: false,//是否有选中的sku
    sku: {},//选中的sku
    num: 1,//数量
  },
  method: {
    //获取选择类型
    getSelectionType() {
      let list = this.data.shopDetail.skus, colors = new Set(), sizes = new Set(), versions = new Set();
      for (let i in list) {
        if (list[i].Color) colors.add(list[i].Color);
        if (list[i].Size) sizes.add(list[i].Size);
        if (list[i].Version) versions.add(list[i].Version);
      }
      this.setData({
        colors: Array.from(colors),
        sizes: Array.from(sizes),
        versions: Array.from(versions)
      })
    },
    //判断是否有当前的skuId
    judge() {
      let list = this.data.shopDetail.skus;
      for (let i in list) {
        if ((this.data.colors.length <= 0 || this.data.colors[this.data.color] == list[i].Color) && (this.data.sizes.length <= 0 || this.data.sizes[this.data.size] == list[i].Size) && (this.data.versions.length <= 0 || this.data.versions[this.data.version] == list[i].Version)) {
          this.setData({
            isOperation: true,
            sku: list[i],
          })
          return;
        } else {
          this.setData({
            sku: {}
          })
        }
      }
      this.setData({
        isOperation: false
      })
    },
    //选择颜色
    btnColor(e) {
      this.setData({
        color: e.currentTarget.dataset.idx,
        num: 1
      })
      if (this.skuClick) {
        let data = this.data.shopdata.ProductList[this.data.index];
        this.skuClick(this.data.colors[e.currentTarget.dataset.idx], data.id, data.name);
      }
      if (this.data.sizes.length > 0 && this.data.size === null) return;
      if (this.data.versions.length > 0 && this.data.version === null) return;
      this.judge();
    },
    //选择尺寸
    btnSize(e) {
      this.setData({
        size: e.currentTarget.dataset.idx,
        num: 1
      })
      if (this.skuClick) {
        let data = this.data.shopdata.ProductList[this.data.index];
        this.skuClick(this.data.colors[e.currentTarget.dataset.idx], data.id, data.name);
      }
      if (this.data.colors.length > 0 && this.data.color === null) return;
      if (this.data.versions.length > 0 && this.data.version === null) return;
      this.judge();
    },
    //选择版本
    btnVersion(e) {
      this.setData({
        version: e.currentTarget.dataset.idx,
        num: 1
      })
      if (this.skuClick) {
        let data = this.data.shopdata.ProductList[this.data.index];
        this.skuClick(this.data.colors[e.currentTarget.dataset.idx], data.id, data.name);
      }
      if (this.data.colors.length > 0 && this.data.color === null) return;
      if (this.data.sizes.length > 0 && this.data.size === null) return;
      this.judge();
    },
    //减少
    min() {
      if (this.data.isOperation) {
        if (this.data.num <= 1) {
          Prompt('数量最少为1')
        } else {
          this.setData({
            num: this.data.num - 1
          })
        }
      }
    },
    //增加
    add() {
      if (this.data.isOperation) {
        if (this.data.num >= this.data.sku.Stock) {
          Prompt('没有库存了')
        } else {
          this.setData({
            num: this.data.num + 1
          })
        }
      }
    },
  }
}