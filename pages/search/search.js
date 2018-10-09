import { Prompt, back } from '../../utils/util.js'
var mta = require('../../statistics/mta_analysis.js')
Page({
  data: {
    text: '',
    list: []
  },
  onLoad(){
    mta.Page.init()
  },
  onShow() {
    if (wx.getStorageSync('searchList')) {
      this.setData({
        list: wx.getStorageSync('searchList')
      })
    }
  },
  searchConfirm(e) {
    this.setData({
      text: e.detail.value
    })
  },
  deleteList() {
    wx.removeStorageSync('searchList')
    this.setData({
      list: []
    })
  },
  openResult(e) {
    let arr = [], text;
    text = e.currentTarget.dataset.text ? e.currentTarget.dataset.text : this.data.text.replace(/(^\s*)|(\s*$)/g, "");
    if (text == '') {
      Prompt('请输入正确的关键词！')
      return;
    }
    if (wx.getStorageSync('searchList')) {
      arr = wx.getStorageSync('searchList');
    }
    if (arr.indexOf(text) >= 0) {
      arr.splice(arr.indexOf(text), 1)
    }
    if (arr.length >= 10) {
      arr.splice(9, 1);
      arr.unshift(text);
    } else {
      arr.unshift(text);
    }
    wx.setStorageSync('searchList', arr)
    this.setData({
      text: ''
    })
    let pages = getCurrentPages(), isExit = true;
    for (let i in pages) {
      if (pages[i].route == "pages/search/result/result") {
        back(pages.length - 1 - i).then((page) => {
          page.setData({
            text
          })
        })
        isExit = false;
        break;
      }
    }
    if (isExit) {
      wx.navigateTo({
        url: `/pages/search/result/result?text=${text}`,
      })
    }
  },
  empty() {
    this.setData({
      text: ''
    })
  }
})