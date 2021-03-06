
var SearchItem = require('../../models/SearchItem.js')

var MinuteData = require('../../models/MinuteData.js')
var KLineData = require('../../models/KLineData.js')
var NewsItem = require('../../pages/stock/NewsItem.js')
var PbUtil = require('../../utils/PbUtil.js')
var Util = require('../../utils/util.js')
var GoodsParams = require('../../models/GoodsParams.js')
var Quotation = require('../../models/Quotation.js')
var RelativeItem = require('../../pages/bk/RelativeItem.js')
var BkQuotation = require('../../pages/bk/BkQuotation.js')


// 解析搜索数据
function parseSearchData(array) {
    var results = []

    for (var i = 0; i < array.length; i++) {
        var item = new SearchItem(array[i].secuName, array[i].secuId)
        results.push(item)
    }

    return results
}

// 解析分时数据
function parseMinutesData(data) {
    var array = data.trend_line
    var minutes = []

    if (array != null && array.length > 0) {
        for (var i = 0; i < array.length; i++) {
            var item = new MinuteData(array[i].time, array[i].price, array[i].ave, array[i].volume, array[i].amount)
            minutes.push(item)
        }
    }

    var result = {
        close: data.close,
        goods_id: data.goods_id,
        market_date: data.market_date,
        minutes: minutes
    }

    return result
}

// 解析k线数据
function parseKLinesData(array) {
    var results = []
    var ma5sum = 0.0
    var ma10sum = 0.0
    var ma20sum = 0.0
    var day5 = 5
    var day10 = 10
    var day20 = 20
    var preclose= 0.0
    var realzdf = 0.0
    var datalen = array.length;
    /*
    for (var i = array.length - 1; i >= 0; i--) {
        var item = new KLineData(array[i].datetime, array[i].open, array[i].high, array[i].low, array[i].close, array[i].ma5, array[i].ma10, array[i].ma20, array[i].amount, array[i].price, array[i].volume)
        results.push(item)
    }*/
    //console.log('get kline result data ', array[0][0], array.length)
    //for (var i = array.length - 1; i >= 0; i--) {
    for (var i = 0; i < datalen; i++) {
      var data = array[i]
      var ma5 = 0.0
      var ma10 = 0.0
      var ma20 = 0.0
      ma5sum += data[2]
      ma10sum += data[2]
      ma20sum += data[2]
      realzdf = 0.0
      if (i >= day5)
      {
        ma5sum -= array[i - day5][2]
        ma5 = ma5sum/day5
      }
      if(i >= day10)
      {
        ma10sum -= array[i - day10][2]
        ma10 = ma10sum/day10        
      }
      if(i >= day20)
      {
        ma20sum -= array[i-day20][2]
        ma20 = ma20sum/day20
      }
      preclose = data[2]
      if (i < datalen - 1) {
        realzdf = 100.0 * (array[i+1][2] - preclose) / preclose
      }
      else{
        realzdf = 99999.9;
      }
      var item = new KLineData(data[0], data[1], data[3], data[4], data[2], ma5, ma10, ma20, data[5], data[2], data[5], data[6] == 99999.9 ? '--' : (100.0*data[6]).toFixed(2) + '%', realzdf == 99999.9 ? '--' :realzdf.toFixed(2)+'%')
      results.push(item)
    }
    //console.log(results)
    return results
}

// 解析新闻列表
function parseNewsData(data) {
    var news = data.news
    var array = []

    for (var i = 0; i < news.length; i++) {
        var item = news[i]
        var newsItem = new NewsItem(item.content_url, item.from, item.new_id, item.pt, item.sortid, item.title)
        array.push(newsItem)
    }

    var result = {}
    var cls = data.cls
    result.cls = cls
    result.stock = data.stock
    if (cls == '0') {
        result.news = array
    } else if (cls == '1') {
        result.notices = array
    } else if (cls == '2') {
        result.research = array
    }

    return result
}

// 解析个股行情数据
function parseStockQuotationValue(data) {
    var quotas = data.quota_value
    if (quotas != null && quotas.length > 0) {
        var ids = data.rep_fields
        var values = data.quota_value[0].rep_field_value
        //console.log("values=", values)

        var price = Util.formatPrice(PbUtil.getPbValue(ids, values, GoodsParams.ZXJ))
        var zd = Util.formatZd(PbUtil.getPbValue(ids, values, GoodsParams.ZHANGDIE))
        var zdf = Util.formatZdf(PbUtil.getPbValue(ids, values, GoodsParams.ZDF))
        var zdColor = Util.getColorByZd(PbUtil.getPbValue(ids, values, GoodsParams.ZHANGDIE))
        //console.log(price,zd,zdf, zdColor)

        var open = Util.formatPrice(PbUtil.getPbValue(ids, values, GoodsParams.OPEN))
        var high = Util.formatPrice(PbUtil.getPbValue(ids, values, GoodsParams.HiGH))
        var low = Util.formatPrice(PbUtil.getPbValue(ids, values, GoodsParams.LOW))
        //console.log(open,high,low)

        var hsl = Util.formatHsl(PbUtil.getPbValue(ids, values, GoodsParams.HSL))
        var syl = Util.formatSyl(PbUtil.getPbValue(ids, values, GoodsParams.SYL))
        var sjl = Util.formatSyl(PbUtil.getPbValue(ids, values, GoodsParams.SJL))
        //console.log(hsl, syl, sjl)

        var cjl = Util.formatVolumn(PbUtil.getPbValue(ids, values, GoodsParams.VOLUME) / 100)
        var jl = Util.formatJl(PbUtil.getPbValue(ids, values, GoodsParams.JL))
        var zsz = Util.formatAmount(PbUtil.getPbValue(ids, values, GoodsParams.ZSZ))
        //console.log(cjl, jl, zsz)

        var amount = Util.formatAmount(PbUtil.getPbValue(ids, values, GoodsParams.AMOUNT))
        var lb = Util.formatSyl(PbUtil.getPbValue(ids, values, GoodsParams.LB))
        var ltsz = Util.formatAmount(PbUtil.getPbValue(ids, values, GoodsParams.LTSZ))
        //console.log(amount, lb, ltsz)

        var date = data.cur_update_market_date
        var time = data.cur_update_market_time
        var id = data.quota_value[0].goods_Id

        //  Quotation(price, zd, zdf, open, high, low, hsl, syl, sjl, cjl, jl, zsz, amount, lb, ltsz, date, time, color, goodsId) 
        return new Quotation(price, zd, zdf, open, high, low, hsl, syl, sjl, cjl, jl, zsz, amount, lb, ltsz, date, time, zdColor, id)
    }

    return null
}

// 解析版块行情数据
function parseBkQuotationValue(data) {
    var quotas = data.quota_value
    if (quotas != null && quotas.length > 0) {
        var ids = data.rep_fields
        var values = data.quota_value[0].rep_field_value

        var price = Util.formatPrice(PbUtil.getPbValue(ids, values, GoodsParams.ZXJ))
        var zd = Util.formatZd(PbUtil.getPbValue(ids, values, GoodsParams.ZHANGDIE))
        var zdf = Util.formatZdf(PbUtil.getPbValue(ids, values, GoodsParams.ZDF))
        var zdColor = Util.getColorByZd(PbUtil.getPbValue(ids, values, GoodsParams.ZHANGDIE))
        // console.log(price,zd,zdf, zdColor)

        var open = Util.formatPrice(PbUtil.getPbValue(ids, values, GoodsParams.OPEN))
        var high = Util.formatPrice(PbUtil.getPbValue(ids, values, GoodsParams.HiGH))
        var low = Util.formatPrice(PbUtil.getPbValue(ids, values, GoodsParams.LOW))
        // console.log(open,high,low)

        var hsl = Util.formatHsl(PbUtil.getPbValue(ids, values, GoodsParams.HSL))
        var zs = PbUtil.getPbValue(ids, values, GoodsParams.RISE)
        var ds = PbUtil.getPbValue(ids, values, GoodsParams.FALL)
        // console.log(hsl, zs, ds)

        var cjl = Util.formatVolumn(PbUtil.getPbValue(ids, values, GoodsParams.VOLUME) / 100)
        var jl = Util.formatJl(PbUtil.getPbValue(ids, values, GoodsParams.JL))
        var pj = PbUtil.getPbValue(ids, values, GoodsParams.EQUAL)
        // console.log(cjl, jl, pj)

        var amount = Util.formatAmount(PbUtil.getPbValue(ids, values, GoodsParams.AMOUNT))
        var lb = Util.formatSyl(PbUtil.getPbValue(ids, values, GoodsParams.LB))
        var zf = Util.formatZdf(PbUtil.getPbValue(ids, values, GoodsParams.ZHENFU))
        // console.log(amount, lb, zf)

        var date = data.cur_update_market_date
        var time = data.cur_update_market_time
        var id = data.quota_value[0].goods_Id

        //  BkQuotation(price, zd, zdf, open, high, low, hsl, syl, sjl, cjl, jl, zsz, amount, lb, ltsz, date, time, color, goodsId) 
        return new BkQuotation(price, zd, zdf, open, high, low, hsl, zs, ds, cjl, jl, pj, amount, lb, zf, date, time, zdColor, id)
    }

    return null
}

// 解析关联item
function parseRelativeItem(data) {
    var quotas = []

    var size = data.total_size
    if (size > 0) {
        for (var i = 0; i < size; i++) {
            var fields = data.rep_fields
            var values = data.quota_value[i].rep_field_value

            var goodsId = data.quota_value[i].goods_Id
            var goodsName = PbUtil.getPbValue(fields, values, GoodsParams.GOODS_NAME)
            var goodsCode = Util.formatCode(goodsId)
            var price = Util.formatPrice(PbUtil.getPbValue(fields, values, GoodsParams.ZXJ))
            var zdf = Util.formatZdf(PbUtil.getPbValue(fields, values, GoodsParams.ZDF))
            var zdfColor = Util.getColorByZd(PbUtil.getPbValue(fields, values, GoodsParams.ZHANGDIE))

            // RelativeItem(name, code, price, zdf, color)
            quotas.push(new RelativeItem(goodsId, goodsName, goodsCode, price, zdf, zdfColor))
        }
    }

    return {
        date: data.cur_update_market_date,
        time: data.cur_update_market_time,
        relatives: quotas
    };
}

//解析自选股详情
function parseCustomDetail(data) {
    var quotas = [];

    var size = data.total_size;
    //console.log('parseCustomDetail __enter__:size=', size)
    if (size > 0) {
        for (var i = 0; i < size; i++) {
            var fields = data.rep_fields;
            var values = data.quota_value[i].rep_field_value;

            var tGoodsId = data.quota_value[i].goods_Id;
            var tCode = Util.formatCode(tGoodsId);
            var tName = PbUtil.getPbValue(fields, values, GoodsParams.GOODS_NAME);
            var tZxj = Util.formatPrice(PbUtil.getPbValue(fields, values, GoodsParams.ZXJ));
            var tZdf =  Util.formatZdf(PbUtil.getPbValue(fields, values, GoodsParams.ZDF));
            var tZd_original = PbUtil.getPbValue(fields, values, GoodsParams.ZHANGDIE);
            var tIntZd = parseInt(tZd_original*1000);//这里为了先扩大1000倍，后续再缩小
            var tZd = Util.formatPrice(tZd_original);
            //console.log('data:', tGoodsId, tName, tZxj, tZdf, tZd_original, tIntZd, tZd)
            var tsuspension=PbUtil.getPbValue(fields, values, GoodsParams.SUSPENSION);
            if(tsuspension==1){
                tZd=0;
            }

            var tGoods = {
                goodsid: tGoodsId,
                name: tName,
                code: tCode,
                zxj: tZxj,
                zdf: tZdf,
                zd: tZd,
                intZd: tIntZd,
                suspension:tsuspension
            }


            quotas.push(tGoods);
        }
    }
    return {
        // date: data.cur_update_market_date,
        // time: data.cur_update_market_time,
        customDetail: quotas
    };
}

module.exports = {
    parseSearchData: parseSearchData,
    parseMinutesData: parseMinutesData,
    parseKLinesData: parseKLinesData,
    parseNewsData: parseNewsData,
    parseStockQuotationValue: parseStockQuotationValue,
    parseBkQuotationValue: parseBkQuotationValue,
    parseRelativeItem: parseRelativeItem,
    parseCustomDetail: parseCustomDetail
}
