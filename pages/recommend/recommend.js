// pages/recommend/recommend.js
var api = require('../../api/api.js');
var optionalUtil = require('../../utils/optionalUtil.js');
var util = require('../../utils/util.js');

var mAryIndex = [
  {
    goodsid: 1,
    name: '上证指数',
    zd: '-',
    zdf: '-%',
    intZd: 0,
    zxj: 0
  },
  {
    goodsid: 1399001,
    name: '深证指数',
    zd: '-',
    zdf: '-%',
    intZd: 0,
    zxj: 0
  },
  {
    goodsid: 1399006,
    name: '创业指数',
    zd: '-',
    zdf: '-%',
    intZd: 0,
    zxj:0
  }
];


var intervalId = 0;

var isLongTaping = false;

Page({
  data: {
    aryIndexs: [],
    sortType: 1,
    aryGoods: [],
    displayDelIndex: -1
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    this.setData({
      aryIndexs: mAryIndex,
    });


  },
  onReady: function () {
    // 页面渲染完成

  },
  onShow: function () {
    // 页面显示
    startTimer(this);
    //指数和自选股一起请求
  },
  onHide: function () {
    stopTimer();
    // 页面隐藏
  },
  onUnload: function () {
    stopTimer();
    // 页面关闭
  },

  //下拉刷新
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh();
  },

  onShareAppMessage: function () {
    return {
      title: '智能选股',
      desc: `${getApp().globalData.shareDesc}`,
      path: `pages/recommend/recommend`
    }
  },

  doChangeSort_zdf: function () {
    return;
    var tDel = this.data.displayDelIndex;
    if (tDel != -1) {
      this.setData({
        displayDelIndex: -1
      });
      return;
    }
    var tSortType = -this.data.sortType;
    var tAryGoods = this.data.aryGoods;

    sortAndSetGoods(this, tSortType, tAryGoods);

  },


  onLongTapOptionalItem: function (event) {
    var logTapIndex = event.currentTarget.dataset.tapIndex;
    console.log("sky optional item longTap:", logTapIndex)
    isLongTaping = true;
    this.setData({
      displayDelIndex: logTapIndex
    });
  },

  onTapOptionalItem: function (event) {

    if (isLongTaping) {
      isLongTaping = false;
      return;
    }
    var tDel = this.data.displayDelIndex;
    if (tDel != -1) {
      this.setData({
        displayDelIndex: -1
      });
      return;
    }


    var tapIndex = event.currentTarget.dataset.tapIndex;
    var tAryGoods = this.data.aryGoods;
    var tGoods = tAryGoods[tapIndex];

    util.gotoQuote(tGoods.goodsid, tGoods.name, tGoods.code)


    console.log("Touch optional item Tap:", tGoods.code, event.currentTarget.dataset.tapIndex);
  },

  onscreenTap: function (event) {
    console.log("sky onscreenTap Tap:", event.currentTarget.dataset.tapIndex);
    this.setData({
      displayDelIndex: -1
    });
  },

  onDelOtpional: function (event) {

    var tDelIndex = event.currentTarget.dataset.delIndex;
    console.log("sky onDelOtpional Tap:", event.currentTarget.dataset.delIndex);
    var tAryGoods = this.data.aryGoods;

    this.setData({
      displayDelIndex: -1
    });
    api.stock.commitOptionals(tAryGoods[tDelIndex].goodsid)
      .then(
      function (res) { },
      function (err) { }
      );


    tAryGoods.splice(tDelIndex, 1);


    this.setData({
      aryGoods: tAryGoods
    });
  },

  // 显示搜索股票
  onStockSearchEvent: function (e) {
    wx.navigateTo({
      url: '../search/search'
    })
  },

  // 点击指数，跳转到详情
  onIndexTap: function (e) {
    var data = e.currentTarget.dataset
    var code = util.formatCode(data.id)
    util.gotoQuote(data.id, data.name, code)
  },

  //点击加号,跳转到搜索
  onAddBtnTap: function (e) {
    wx.navigateTo({
      url: '../search/search'
    })
  }

})

function sortAndSetGoods(that, stype, ary) {
  ary.sort(function (goods1, goods2) {
    return stype * (goods2.zd - goods1.zd);
  })
  that.setData({
    sortType: stype,
    aryGoods: ary

  })
}
//请求指数行情和自选股的数据
function requestCustomGoodsInfo(that) {

  var tIndex = ['sh', 'sz', 'cyb'];
  var tOptional = getApp().globalData.optionals;
  var bIsShowTips = getApp().globalData.bisshowloadtips;
  var tCustom = tIndex.concat(tOptional);

  console.log("option::requestCustomGoodsInfo:sky optional 1", tCustom)

  api.stock.getCustomDetail(tCustom).then(
    function (res) {
      console.log("sky optional detail:", res);
      var tSortType = that.data.sortType;

      if (res.customDetail.length == tCustom.length) {
        var resIndexs = res.customDetail.slice(0, 3);
        console.log("get data detail:",resIndexs)
        that.setData({
          aryIndexs: resIndexs,

        });
        var resOptional = res.customDetail.slice(3);
        sortAndSetGoods(that, tSortType, resOptional);
        if (res.customDetail.length > 3 && 0 == bIsShowTips)
        {
          wx.hideToast();
          getApp().globalData.bisshowloadtips = 1;
        }
      }
    },
    function (err) {

    }
  );

}



//启动计时
function startTimer(that) {
  var myOptions = getApp().globalData.optionals;
  var bIsShowTips = getApp().globalData.bisshowloadtips;
  requestCustomGoodsInfo(that);
  if (0 == bIsShowTips){
    wx.showToast({ title: '玩命加载中...', icon: 'loading', duration: 10000 })
  }
  var interval = getApp().globalData.netWorkType == 'wifi' ? getApp().globalData.WIFI_REFRESH_INTERVAL : getApp().globalData.MOBILE_REFRESH_INTERVAL;
  intervalId = setInterval(function () {
    if(myOptions.length == 0){
      myOptions = getApp().globalData.optionals;
    }
    else{
      stopTimer()
      requestCustomGoodsInfo(that);
      intervalId = setInterval(function () {
        requestCustomGoodsInfo(that);
      }, interval);
    }
  }, 300);
};

//停止计时
function stopTimer() {
  clearInterval(intervalId)
};