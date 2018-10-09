// 缓存服务器地址时长（分钟）
const _TIMEOUT = 15;

class BasicSdk {
  constructor() {

    // 记录当前是否为第一次登陆
    this.loginState = false;
    this.urls = {};

    // 存储pcid
    this.resultStr = '';

    // 用户的信息
    this.userInfo = {};

    // action 的值
    this.action = 'save';

    // 配置信息
    this.config = {

      // 地址服务器地址
      serverUrl: 'https://downt.ntalker.com/t2d',

      // 企业标识
      siteId: 'kf_1000'
    }

  }

  //访问downt 或 轨迹的地址
  getAgentServerUrl() {
    let that = this;
    return new Promise((resolve, reject) => {
      let url = this.config.serverUrl + '/func/getflashserver.php';

      wx.request({
        url: url,
        data: {
          siteid: this.config.siteId,
          form: 'weChat',
          resulttype: 'json'
        },
        success: function (res, envent) {
          let ret = res.data;
          if (ret === '' || res.statusCode !== 200) {
            reject(new Error('BasicSdk.getAgentServerUrl flashserver is null'), res);
          }

          console.log('BasicSdk.getAgentServerUrl ', url, res);

          that.trailserver = that.replaceProtocol.bind(that, ret.trailserver)();
          that.agentserver = that.replaceProtocol.bind(that, ret.agentserver)();

          that.agentserver = that.trailserver;

          console.log('BasicSdk.getAgentServerUrl', 'agentserver', that.agentserver);

          try {
            wx.setStorageSync('agentserver', that.agentserver);
            wx.setStorageSync('cacheTime', that._getTime());

          } catch (e) {
          }

          resolve(that.agentserver);
        },
        fail: function (err) {

          console.log('BasicSdk.getAgentServerUrl ', url, 'flashserver is null');

          reject(err)
        }
      })
    });
  }

  //判断当前的请求地址 如果不是https 请求需要转换为https 请求
  replaceProtocol(serverUrl = null, toHttps = true) {

    if (!serverUrl) {
      return '';
    }

    return serverUrl.replace(/^https?:\/\//gi, toHttps ? 'https://' : 'http://');
  }

  //获取 siteid
  _getSiteId() {

    this.siteid = this.config.siteId;
  }

  //获取 action
  _getAction() {
    this.action = 'action';
  }

  //获取登陆状态
  _setLoginState(state = flase) {
    console.log('设置了登陆状态');
    this.loginState = true;
  }

  //获取当前调用文件的路径
  getCurrentPagesUrl() {
    let that = this;
    return new Promise(function (resolve, reject) {
      const __DEFAULT_URL = 'pages/default/index';
      let pages = getCurrentPages();

      if (pages.length == 0) {
        // reject(new Error('get current pages is null'));

        resolve(__DEFAULT_URL);
      } else {
        resolve(pages.shift());
      }
    })

  }

  //获取用户信息
  getUserInfo() {
    let that = this;
    return new Promise(function (resolve, reject) {

      console.log('BasicSdk.getUserInfo', '...');

      wx.login({
        success: function (res) {

          console.log('BasicSdk.getUserInfo', 'logind');

          if (res.code) {
            let code = res.code;
            that.code = res.code;

            wx.getUserInfo({
              withCredentials: true,
              lang: 'zh_CN',
              success: function (res) {
                let userInfo = res.userInfo;

                //加密信息
                that.encryptedData = res.encryptedData || res.signature || '';
                that.iv = res.iv;

                console.log('BasicSdk.getUserInfo', 'userInfo', res);
                that.uname = userInfo.nickName;
                that.userInfo = userInfo;

                resolve(res);
              },
              fail: function (res) {

                console.log('BasicSdk.getUserInfo', 'get user info fail!' + res.errMsg);

                that.uname = 'geust';

                reject('获取用户登录态失败！');
              }
            })
          } else {
            console.log('BasicSdk.getUserInfo', 'login fail!' + res.errMsg);

            reject('获取用户登录态失败！')
          }
        }

      });

    });

  }

  //获取 uid
  _getUid() {
    let pcid = this.pcid;
    let siteId = this.config.siteId;

    if (pcid && siteId) {
      this.uid = siteId + '_ISME9754_' + pcid.substr(0, 21)
    }

  }

  //获取固定长度的随机16进制字符串 
  //参数 字符串的长度
  _randomChar(strLength = 0) {
    if (!strLength) {
      return (new Error('strLength is null in _randomChar'));
    }

    let resultStr = '';
    for (let k = 0; k < strLength; k++) {
      let randomNum = parseInt(Math.random() * 15);
      resultStr += randomNum.toString(16);
    }

    return resultStr;

  }

  //获取当前的时间
  _getTime() {
    let date = new Date();

    return date.getTime();
  }

  _getTimestamp() {
    this.timeTamp = this._getTime()
  }
  //获取pcid
  _getPcid() {
    let pcid = [
      'guest' + this._randomChar(8),
      this._randomChar(4),
      this._randomChar(4),
      this._randomChar(4),
      this._getTime().toString(16).toUpperCase().substr(-8)
      + this._randomChar(4)
    ].join('');

    this.pcid = pcid;
  }

  //获取device 类型 设备类型：0:PC;1:微信;2:APP;3:WAP
  _getDevice() {
    this.device = 1;
  }

  //获取pageId
  _getPageId() {
    let timestamp = new Date().getTime();
    this.pageid = timestamp;
  }

  //获取sid 
  _getSid() {
    let timestamp = new Date().getTime();
    this.sid = timestamp + this._randomChar(6);
  }

  //获取屏幕分辨率
  _getScr() {
    let that = this;
    wx.getSystemInfo({
      success: function (res) {
        // console.log(res.model)
        // console.log(res.screenWidth)
        // console.log(res.screenHeight)
        // console.log(res.windowHeight)
        // console.log(res.language)
        // console.log(res.version)
        // console.log(res.platform)

        that.scr = res.screenWidth + '*' + res.screenHeight;
      },
      fail: function () {
        that.scr = null;
      }
    })
  }

  //获取 vip 等级
  _getIsVip() {
    this.isvip = 0;
  }

  //获取userlevel
  _getUserLevel() {
    this.userlevel = 0;
  }

  //object 转成 xml
  jsonToXML(theObject = null) {
    if (!theObject) {
      return;
    }
    let result = ['<xml>'];

    for (let key in theObject) {
      if (key === 'iv') {
        result.push('<IV><![CDATA[' + theObject[key] + ']]></IV>')
      }

      if (key === 'uid') {
        result.push('<FromUserName><![CDATA[' + theObject[key] + ']]></FromUserName>')
      }

      if (key === 'toUserName') {
        result.push(' <ToUserName><![CDATA[' + theObject[key] + ']]></ToUserName>')
      }

      if (key === 'createTime') {
        result.push('<CreateTime>' + theObject[key] + '</CreateTime>')
      }

      if (key === 'pcid') {
        result.push('<MsgId>' + theObject[key] + '</MsgId>')
      }


      if (key === 'encryptedData') {
        result.push('<EncryptedData><![CDATA[' + theObject[key] + ']]></EncryptedData>')
      }

      if (key === 'jscode') {
        result.push('<JsCode><![CDATA[' + theObject[key] + ']]></JsCode>')
      }

      if (key === 'msessgeType') {
        result.push('<MsgType><![CDATA[' + theObject[key] + ']]></MsgType>')
      }
    }
    result.push('</xml>');

    return result.join('');
  }

}

class TrackSDK extends BasicSdk {
  constructor() {
    super();

    //访问downt获取轨迹的地址
  }

  getCurrentPath() {

    return super.getCurrentPagesUrl();
  }

  getTrackData(params) {
    //合并参数 发送请求
    let data = Object(
      {
        toUserName: this.originId,
        action: this.action,
        msessgeType: 'userinfo',
        url: this.currentUrl,
        iv: this.iv,
        jscode: this.code,
        siteid: this.siteid,
        uid: this.uid,
        createTime: this.timeTamp,
        uname: this.uname,
        device: this.device,
        isvip: this.isvip,
        userlevel: this.userlevel,
        sid: this.sid,
        pcid: this.pcid,
        pageid: this.pageid,
        scr: this.scr,
        encryptedData: this.encryptedData
      },
      params
    )

    let strXML = this.jsonToXML(data);

    console.log('TrackSDK.callTrail data: ', data);

    return strXML;
  }

  /**
   * 调用轨迹服务
   * @param {Object} params 
   */
  callTrail(params = {}) {

    console.log('TrackSDK.callTrail', ' params:', params);

    //验证原始id
    if (!params.originId || params.originId === '') {

      console.log('TrackSDK.callTrail', 'originId is null');

      return;
    } else {

      this.originId = params.originId;
    }

    //获取 参数 （pageUrl 动态的）
    this.getCurrentPath()
      .then((currentUrl) => {

        this.currentUrl = currentUrl;

        console.log('TrackSDK.callTrail', ' getCurrentPath', this.currentUrl);

        // let app = getApp();
        let agentserver, timeout, difference;
        try {
          agentserver = wx.getStorageSync('agentserver');
          timeout = wx.getStorageSync('cacheTime');
          difference = this._getTime() - timeout;
        } catch (e) {
          console.error(e);
        }

        if (agentserver && difference <= _TIMEOUT * 60 * 1000) {

          console.info('TrackSDK.callTrail', ' agentserver:', agentserver, 'timeout:', Math.round(difference / 1000 / 60));

          return agentserver;
        } else {
          console.info('TrackSDK.callTrail', ' getAgentServerUrl');

          return this.getAgentServerUrl();
        }

      })
      .then((serverUrl) => {
        this._getAction();
        this._getSiteId();
        this._getDevice();
        this._getIsVip();
        this._getUserLevel();
        this._getSid();
        this._getPcid();
        this._getPageId();
        this._getScr();
        this._getTimestamp();
        this._getUid();

        this.agentserver = this.replaceProtocol(serverUrl) + '/agent/xcx';
        if (!this.agentserver) {
          console.error('TrackSDK.callTrail', 'agentserver is null!');
          return;
        }

        if (super.userInfo && super.userInfo.nickName) {
          return super.userInfo;
        }

        if (!this.useInfoPromise) {

          this.useInfoPromise = this.getUserInfo();
        }

        return this.useInfoPromise;
      })
      .then((userInfo) => {

        let strXML = this.getTrackData(params);

        wx.request({
          url: this.agentserver,
          data: c,
          method: 'POST',
          success: function (data) {
            console.log('TrackSDK.callTrail', 'complete', data);
          },
          fail: function () {
            console.error('TrackSDK.callTrail', 'fail');
          }
        })

      })
      .catch(function (err) {

        console.error(err);
      });
    return '上传轨迹信息';
  }
}

let trackSDK = new TrackSDK();
module.exports = trackSDK