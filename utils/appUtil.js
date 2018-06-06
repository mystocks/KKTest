
var Api = require('../api/api.js')

var Service = require('../api/service.js')
var Promise = Service.Promise
var StaticStrings = Service.StaticStrings

var newsUtil = require('newsUtil.js')

function getUid(app) {
    wx.login({
        success: function (res) {
            // success
            console.log("login sucesss", res)
            var code = res.code

            getUserId(code, "", "")
        },
        fail: function (res) {
            // fail
            console.log("login fail", res)
        },
        complete: function () {
            // complete
        }
    })
}


function getUserId(code, encrytedData, iv) {
    wx.request({
      //url: 'http://47.100.55.207:8000/getUserId',
      url: `${Service.BaseOptionalUrl}getUserId`,
        data: {
            jsCode: code,
            encryptedData: encrytedData,
            iv: iv
        },
        //method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
        method: 'GET',
        success: function (res) {
            console.log("===============get user id sucess=res", res)

            if (res.statusCode == 200) {
                if (res.data.result.code == 0) {
                    getApp().globalData.uid = res.data.detail
                    requestOptionals()
                    loadReadNews()
                } else {
                    console.log("=========获取UID失败", res)
                }
            } else {
                console.log("=========获取UID失败", res)
            }
        },
        fail: function (res) {
            console.log("=========获取UID失败", res)
        },
    })
}

//网络类型
function getNetWorkType() {
    wx.getNetworkType({
        success: function (res) {
            getApp().globalData.netWorkType = res.networkType
        }
    })
}

function requestOptionals() {
    Api.stock.requestOptionals({

    }).then(function (res) {
      console.log("------requestOptionals", res.GoodsId)
        getApp().globalData.optionals = res.GoodsId;
    }, function (res) {

    })
}

function loadReadNews() {
    newsUtil.loadReadNews()
}

module.exports = {
    getUid: getUid,
    getNetWorkType: getNetWorkType,
}