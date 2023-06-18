'use strict';
/* ------------------ 自定义函数 ------------------ */
// functionA

/* ------------------ 自定义函数 ------------------ */
// 主函数
const main = async (args, context) => {
    console.log(args)
    const {db, file, cloudfunction, httpclient} = alicf.get()
    return { code: 0, msg: 'success', data: args };
}
const alicf = {}
// 云函数入口函数
module.exports = async (ctx) => {
    console.log(ctx)
    alicf.getContext = () => {
        return ctx
    }
    alicf.get = () => {
        return {
          ...ctx.mpserverless,
          cloudfunction: ctx.mpserverless.function,
          httpclient: ctx.httpclient
        }
    }
    let db = ctx.mpserverless.db;
    let file = ctx.mpserverless.file;
    // urllib ctx.httpclient.request
    const args = ctx.args;
    return await main(args, ctx)
}
