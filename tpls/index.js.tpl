'use strict';
// require
const alicf = require('./alicf.js.tpl')

/* ------------------ 自定义函数 ------------------ */
// functionA

/* ------------------ 自定义函数 ------------------ */
// 主函数
const main = async (args, context) => {
  alicf.log("输入参数", args)
  const {db, file, cloudfunction, httpclient} = alicf.get()
  return { code: 0, msg: 'success', data: alicf.getContext().args };
}
// 云函数入口函数
module.exports = async (ctx) => {
  alicf.bind(ctx)
  const args = ctx.args;
  return await main(args, ctx)
}