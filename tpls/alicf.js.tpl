const __alicf = {}


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

__alicf.log = function() {
    const {logger} = __alicf.getContext()
    if (logger && logger.info) {
        logger.info(...arguments)
    } else {
        console.log(...arguments)
    }
}

module.exports = __alicf