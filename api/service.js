import Promise from './lib/es6-promise-min';

let StaticStrings = require('../utils/StaticStrings.js')

//let BaseUrl = "http://libaishuogu.cn:8000/"//自己的接口
let BaseUrl = "https://libaishuogu.cn/"//自己的接口

let BaseInfoUrl = BaseUrl + "info" + "?X-Protocol-Id="          // 新闻
//let BaseQuotaUrl = BaseUrl + "quota" + "?X-Protocol-Id="        // 行情
let BaseQuotaUrl = BaseUrl       // 行情
let BaseHaoGuUrl = BaseUrl + "biz" + "?X-Protocol-Id="          // 好股
//let BaseOptionalUrl = BaseUrl + "web/usertransfer" + "?X-Protocol-Id="      // 自选

let BaseOptionalUrl = BaseUrl     // 自选
let ZXG_TJ = "ZXG_TJ" //请求自选股
let REAL_QUOTATION = "OneQuotation" //实时行情信息

function request(options) {
    var opts = Object.assign({
        method: 'POST',
        //method: 'GET',
        header: {
          // 'X-Protocol-Id': '20400',
          'X-Request-Id': '2016-12-15',
          'Content-Type': 'application/json'
        },
        showLoading: true,
        showFailMsg: true
    }, options);
    console.log('1=====request opts', opts)

    var promise = new Promise(function (resolve, reject) {
        opts.success = function (res) {
            //console.log("====request sucess:" + opts.url, res)
            resolve(res);
        }
        opts.fail = function (res) {
            // console.log("====request fail:", opts.url, res)

            opts.showFailMsg && wx.showToast({
                title: '请求失败',
                icon: 'warn',
                duration: 10000
            });
            reject(res);
        }
        opts.complete = function (res) {
            opts.showLoading && wx.hideToast();
            // typeof options.complete === 'function' && options.complete(res);
        }
    
        opts.showLoading && wx.showToast({
            title: '加载中',
            icon: 'loading',
            duration: 100000
        });
        wx.request(opts);
    });
    return promise;
}

function requestOfTag(options,tag) {
    var opts = assign({
        method: 'POST',
        header: {
            // 'X-Protocol-Id': '20400',
            'X-Request-Id': '2016-12-15',
            'Content-Type': 'application/json'
        },
        showLoading: true,
        showFailMsg: true
    }, options);
    var promise = new Promise(function (resolve, reject) {
        var tempTag = tag;
        opts.success = function (res) {
            resolve({res_tag:tempTag,res_data:res});
        }
        opts.fail = function (res) {
            opts.showFailMsg && wx.showToast({
                title: '请求失败',
                icon: 'warn',
                duration: 10000
            });
            reject(res);
        }
        opts.complete = function (res) {
            opts.showLoading && wx.hideToast();
            // typeof options.complete === 'function' && options.complete(res);
        }
    
        opts.showLoading && wx.showToast({
            title: '加载中',
            icon: 'loading',
            duration: 100000
        });
        wx.request(opts);
    });

    return promise;
}

function assign(target, source) {
	for (var param in source) {
      target[param] = source[param]
    }

    return target
}

module.exports = {
    request: request,
    Promise: Promise,
    StaticStrings: StaticStrings,
    BaseUrl: BaseUrl,
    BaseInfoUrl: BaseInfoUrl,
    BaseQuotaUrl: BaseQuotaUrl,
    BaseHaoGuUrl: BaseHaoGuUrl,
    BaseOptionalUrl: BaseOptionalUrl,
    requestOfTag:requestOfTag,
}