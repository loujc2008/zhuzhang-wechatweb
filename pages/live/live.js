import { back } from '../../utils/util.js'
const app = getApp()
var mta = require('../../statistics/mta_analysis.js')
Page({
  data: {
    tab: 0, //tab切换判断
    hotData: {//热门数据
      list: [],
      page: 1
    },
    newsData: {//最新数据
      list: [],
      page: 1
    },
    backData: { //回放数据
      list: [],
      page: 1
    }
  },
  onLoad() {
    mta.Page.init()
    this.getHotLive(1)
  },
  //获取热门
  getHotLive(page) {
    return this.getLiveList(1, page).then((res) => {
      let hotData = this.data.hotData;
      if (page == 1) {
        hotData.list = res.Data
        this.setData({
          hotData
        })
      }
      if (page > 1 && res.Data.length > 0) {
        hotData.list = hotData.list.concat(res.Data);
        hotData.page = page;
        this.setData({
          hotData
        })
      }
    });
  },
  //获取最新
  getNewsLive(page) {
    return this.getLiveList(2, page).then((res) => {
      let newsData = this.data.newsData;
      if (page == 1) {
        newsData.list = res.Data
        this.setData({
          newsData
        })
      }
      if (page > 1 && res.Data.length > 0) {
        newsData.list = newsData.list.concat(res.Data);
        newsData.page = page;
        this.setData({
          newsData
        })
      }
    });
  },
  //获取回放
  getBackLive(page) {
    return this.getLiveList(3, page).then((res) => {
      let backData = this.data.backData;
      if (page == 1) {
        backData.list = res.Data
        this.setData({
          backData
        })
      }
      if (page > 1 && res.Data.length > 0) {
        backData.list = backData.list.concat(res.Data);
        backData.page = page;
        this.setData({
          backData
        })
      }
    });
  },
  //获取直播
  getLiveList(qType, page) {
    return wx.ajax({
      url: 'api/liveroom/wechatapp/list',
      data: {
        "QueryType": qType,
        "PageNo": page,
        "PageSize": 10,
        "IsAsc": false,
        "ReturnProductCount": 4,
        "sign": app.globalData.sign,
        "SessionKey": ""
      },
      method: 'POST'
    })
  },
  //下拉刷新
  onPullDownRefresh() {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    if (this.data.tab == 0) {
      this.getHotLive(1).then(() => {
        wx.stopPullDownRefresh()
        wx.hideLoading()
      })
    }
    if (this.data.tab == 1) {
      this.getNewsLive(1).then(() => {
        wx.stopPullDownRefresh()
        wx.hideLoading()
      })
    }
    if (this.data.tab == 2) {
      this.getBackLive(1).then(() => {
        wx.stopPullDownRefresh()
        wx.hideLoading()
      })
    }
  },
  //上拉
  onPull() {
    if (this.data.tab == 0) this.getHotLive(this.data.hotData.page + 1);
    if (this.data.tab == 1) this.getNewsLive(this.data.newsData.page + 1);
    if (this.data.tab == 2) this.getBackLive(this.data.backData.page + 1);
  },
  // tab切换
  swichNav(e) {
    if (this.data.tab != e.target.dataset.tab) {
      if (e.target.dataset.tab == 1 && this.data.newsData.list.length <= 0) {
        this.getNewsLive(1)
      }
      if (e.target.dataset.tab == 2 && this.data.backData.list.length <= 0) {
        this.getBackLive(1)
      }
      this.setData({
        tab: e.target.dataset.tab
      })
    }
  },
  //滑动切换 
  bindChange(e) {
    if (e.detail.current == 1 && this.data.newsData.list.length <= 0) {
      this.getNewsLive(1)
    }
    if (e.detail.current == 2 && this.data.backData.list.length <= 0) {
      this.getBackLive(1)
    }
    this.setData({
      tab: e.detail.current
    })
  },
  //进入列表页
  openVerticall(e) {
    let id = e.currentTarget.dataset.id;
    let pages = getCurrentPages(), isExit = true;
    for (let i in pages) {
      if (pages[i].route == "pages/verticallive/verticallive") {
        back(pages.length - 1 - i).then((page) => {
          page.setData({
            id
          })
        })
        isExit = false;
        break;
      }
    }
    if (isExit) {
      wx.navigateTo({
        url: `../verticallive/verticallive?Id=${id}`,
      })
    }
  },
})