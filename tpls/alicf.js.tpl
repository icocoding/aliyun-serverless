const __alicf = {
  debug: false
}


__alicf.bind = (ctx) => {
    __alicf.ctx = ctx
}
__alicf.getContext = () => {
    if(!__alicf.ctx) {
        throw Error('no bind ctx')
    }
    return __alicf.ctx
}
/**
 * 获取云操作
 * @returns > { db, file, cloudfunction, httpclient }
 */
__alicf.get = () => {
    // let db = ctx.mpserverless.db;
    // let file = ctx.mpserverless.file;
    const ctx = __alicf.getContext()
    return {
      ...ctx.mpserverless,
      cloudfunction:ctx.mpserverless.function,
      // urllib ctx.httpclient.request
      httpclient: ctx.httpclient
    }
}

/**
 * 日志输出
 */
__alicf.log = function() {
    const {logger} = __alicf.getContext()
    if (logger && logger.info) {
        logger.info(...arguments)
    } else {
        console.log(...arguments)
    }
}


/**
 * 发送请求 request
 * @param {Object} options 请求参数
 */
__alicf.rp = options =>
new Promise((resolve, reject) => {
  const request = require('request');
  options.headers = options.headers || {
    'content-type': 'application/x-www-form-urlencoded' // 默认值 json
  };
  if(options.method == 'POST'){
    options.form = options.data;
  }
  else {
    options.qs = options.data;
  }
  delete options.data;
  // console.log('rp options:', options)
  request(options, (error, response, body) => {
    if (error) {
      reject(error);
      return
    }
    try {
      let rbody = (typeof body === 'object') ? body : JSON.parse(body);
      response.JSON = rbody;
    } catch (error) {
      console.log(options, error)
    }
    resolve(response);
  });
});

module.exports = __alicf