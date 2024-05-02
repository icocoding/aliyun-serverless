// ----- requires ----- //
const { default: Client } = require('@alicloud/ecs20140526');
const $OpenApi = require('@alicloud/openapi-client');
const $Util = require('@alicloud/tea-util')
const axios = require('axios')
const FormData = require('form-data')
const fs = require('fs')
const path = require('path')
var archiver = require("archiver");
const { setTimeout } = require('timers/promises');
// ----- consts ----- //
const cwd = process.cwd()
const cloudfunctionsDir = path.resolve(cwd, "cloudfunctions")
const tmpDir = path.resolve(cloudfunctionsDir, ".deploy")
const cloudConfig = {
  version: '1.0.0'
}

function readTpl(name) {
  return fs.readFileSync(path.resolve(__dirname, './tpls', name), {
    encoding: "utf8"
  })
}

function _init() {
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir)
  }
  let text = fs.readFileSync(path.resolve(cloudfunctionsDir, "config.json"), {
    encoding: "utf8"
  })
  let json = JSON.parse(text)
  Object.assign(cloudConfig, json)
  console.log(cloudConfig)
}
_init()
const client = _createClient();
function _createClient() {
  // 使用AK&SK初始化账号Client
  let config = new $OpenApi.Config({
    // 必填，您的 AccessKey ID
    accessKeyId: cloudConfig.accessKeyId,
    // 必填，您的 AccessKey Secret
    accessKeySecret: cloudConfig.accessKeySecret,
  });
  config.endpoint = "mpserverless.aliyuncs.com";
  // config.regionId = "cn-hangzhou";
  return new Client(config);
}
function createApiInfo(action) {
  let params = new $OpenApi.Params({
    action,
    // spaceId
    spaceId: cloudConfig.spaceId,
    // 接口版本
    version: "2019-06-15",
    // 接口协议
    protocol: "HTTPS",
    // 接口 HTTP 方法
    method: "POST",
    authType: "AK",
    style: "RPC",
    // 接口 PATH
    pathname: `/`,
    // 接口请求体内容格式
    reqBodyType: "formData",
    // 接口响应体内容格式
    bodyType: "json",
  });
  return params;
}

async function zipFunction(funcName) {
  const zipFilePath = path.resolve(tmpDir, funcName + '.zip');
  if (fs.existsSync(zipFilePath)) {
  }
  // create a file to stream archive data to.
  var output = fs.createWriteStream(zipFilePath);
  var archive = archiver("zip", {
    zlib: { level: 9 }, // Sets the compression level.
  });
  // pipe archive data to the file
  archive.pipe(output);
  const targerDir = path.resolve(cloudfunctionsDir, funcName)
  console.log('zip dir:' + targerDir)
  archive.glob('**', {
    cwd: targerDir,
    ignore: ['.tmp', 'package-lock.json', 'package.json', 'debug.js']
  })
  // append files from a sub-directory, putting its contents at the root of archive
  // archive.directory(targerDir, false);
  await archive.finalize();
  return Promise.resolve(path.resolve(tmpDir, zipFilePath))
}

async function createDeployment(funcName) {
  console.log("create deploy: " + funcName)
  let params = createApiInfo("CreateFunctionDeployment");
  // runtime options spaceId
  let runtime = new $Util.RuntimeOptions({});
  let request = new $OpenApi.OpenApiRequest({
    body: {
      Name: funcName,
      SpaceId: cloudConfig.spaceId
    }
  });
  // 返回值为 Map 类型，可从 Map 中获得三类数据：响应体 body、响应头 headers、HTTP 返回的状态码 statusCode。
  const res = await client.callApi(params, request, runtime);
  // console.log(res)
  return res.body
}

async function getLastestDeployment(funcName, DeploymentId) {
  console.log("find deployment: ")
  let params = createApiInfo("ListFunctionDeployment");
  let runtime = new $Util.RuntimeOptions({});
  let request = new $OpenApi.OpenApiRequest({
    body: {
      Name: funcName,
      SpaceId: cloudConfig.spaceId,
      // PageSize: 1,
    },
    query: {
      Status: ''
    }
  });
  // 复制代码运行请自行打印 API 的返回值
  // 返回值为 Map 类型，可从 Map 中获得三类数据：响应体 body、响应头 headers、HTTP 返回的状态码 statusCode。
  let res = await client.callApi(params, request, runtime);
  let list = res.body
  const deployment = list.DataList.find(d => d.Status.Status == 'DEPLOY_INIT' && d.DeploymentId == DeploymentId)
  return deployment
}
async function trigerDeployment(DeploymentId) {
  console.log("triger deploy: " + DeploymentId)
  let params = createApiInfo("DeployFunction");
  let runtime = new $Util.RuntimeOptions({});
  let request = new $OpenApi.OpenApiRequest({
    body: {
      DeploymentId,
      SpaceId: cloudConfig.spaceId
    }
  });
  // 复制代码运行请自行打印 API 的返回值
  // 返回值为 Map 类型，可从 Map 中获得三类数据：响应体 body、响应头 headers、HTTP 返回的状态码 statusCode。
  let res = await client.callApi(params, request, runtime);
  console.log(res)
  return res.body
}

async function uploadFile(uploadSignedUrl, filePath) {
  console.log("uploadFile: " + filePath)
  let formData = new FormData();
  formData.append('file', fs.createReadStream(filePath))
  try {
    let size = fs.statSync(filePath).size;
    let res = await axios({
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Length': size
      },
      url: uploadSignedUrl,
      data: fs.readFileSync(filePath, {}),
      method: 'PUT'
    })
    // console.log(res)
    return res.data
  } catch (e) {
    return Promise.reject(e.message)
  }
}

exports.deploy = async function (funcName) {
  console.log("deploy: " + funcName, cloudfunctionsDir)
  // 压缩
  const zipFilePath = await zipFunction(funcName)
  console.log('zip file', zipFilePath)
  // 创建
  const dm = await createDeployment(funcName)
  const { UploadSignedUrl, DeploymentId } = dm
  // 上传
  const up = await uploadFile(UploadSignedUrl, zipFilePath)
  console.log("uploadFile result", up)
  await setTimeout(1000)
  console.log('waiting 1s')
  await setTimeout(1000)
  console.log('waiting 2s')
  const deployment = await getLastestDeployment(funcName, DeploymentId)
  if (deployment) {
      // 触发
      const res = await trigerDeployment(DeploymentId)
      console.log('trigerDeployment', res)
  } else {
    console.log('deployment[%s] no init', DeploymentId)
    setTimeout(1000)
  }
}

exports.invoke = async function (funcName, args = {}) {
  console.log("invoke: " + funcName, args)
  let params = createApiInfo("RunFunction");
  // runtime options spaceId
  let body = {
    functionTarget: funcName, functionArgs: JSON.parse(args)
  }
  let runtime = new $Util.RuntimeOptions({
    readTimeout: 10*1000
  });
  let request = new $OpenApi.OpenApiRequest({
    body: {
      Body: JSON.stringify(body),
      SpaceId: cloudConfig.spaceId
    }
  });
  // 复制代码运行请自行打印 API 的返回值
  // 返回值为 Map 类型，可从 Map 中获得三类数据：响应体 body、响应头 headers、HTTP 返回的状态码 statusCode。
  let res = await client.callApi(params, request, runtime);
  // console.log(res.body)
  return res.body
}
function createDefaultFiles(funcName) {
  const funcDir = path.resolve(cloudfunctionsDir, funcName)
  if(fs.existsSync(funcDir)) {
    console.log('function exists')
    return funcDir
  }
  fs.mkdirSync(funcDir)

  // 添加index.js
  const indexJs = readTpl('index.js.tpl')
  fs.writeFileSync(path.resolve(funcDir, 'index.js'), indexJs)
  
  // 添加package.json
  let packageJson = readTpl('package.json.tpl')
  // const json = JSON.parse(packageJson)
  // 设置项目名称
  const _name = funcName.toLowerCase()
  packageJson = packageJson.replace(/\$\{funcName\}/g, _name)
  // json.name = funcName.toLowerCase()
  fs.writeFileSync(path.resolve(funcDir, 'package.json'), packageJson)

  // 添加alicf.js
  const alicfJs = readTpl('alicf.js.tpl')
  fs.writeFileSync(path.resolve(funcDir, 'alicf.js'), alicfJs)

  // 添加debug.js
  const debugJs = readTpl('debug.js.tpl')
  fs.writeFileSync(path.resolve(funcDir, 'debug.js'), debugJs)
}

exports.create = async function (funcName, args) {
  console.log("create: " + funcName)
  // 添加目录
  const funcDir = path.resolve(cloudfunctionsDir, funcName)

  createDefaultFiles(funcName)

  if (args == 'debug') {
    console.log('debug return')
    return
  }
  // 请求创建云函数
  let params = createApiInfo("CreateFunction");
  // runtime options spaceId
  let runtime = new $Util.RuntimeOptions({});
  let request = new $OpenApi.OpenApiRequest({
    body: {
      Name: funcName,
      SpaceId: cloudConfig.spaceId
    }
  });
  // 复制代码运行请自行打印 API 的返回值
  // 返回值为 Map 类型，可从 Map 中获得三类数据：响应体 body、响应头 headers、HTTP 返回的状态码 statusCode。
  let res = await client.callApi(params, request, runtime);
  // console.log(res.body)
  return res.body
}
exports.trigger = async function (funcName) {
  console.log("trigger: " + funcName)

  const trigger = cloudConfig.triggers[funcName]
  if (!trigger) {
    console.log('no trigger')
    return
  }
  const {cron, payload} = trigger
  // 请求更新云函数
  let params = createApiInfo("UpdateFunction");
  let runtime = new $Util.RuntimeOptions({});
  let request = new $OpenApi.OpenApiRequest({
    body: {
      TimingTriggerConfig: cron,
      TimingTriggerUserPayload: payload,
      Name: funcName,
      SpaceId: cloudConfig.spaceId
    }
  });
  // 返回值为 Map 类型，可从 Map 中获得三类数据：响应体 body、响应头 headers、HTTP 返回的状态码 statusCode。
  let res = await client.callApi(params, request, runtime);
  return res.body
}
