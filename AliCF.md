
# 一、Aliyun EMAS Serverless介绍
> 移动研发平台EMAS云函数管理，如果你使用[EMAS云函数](https://help.aliyun.com/document_detail/2584808.html?spm=a2c4g.435821.0.0.71ac6999W1B4Hx)，可以参考本文档。阿里云管理后台比较难用，使用本项目更方便。

GitHub: [https://github.com/CoCodingOrg/aliyun-serverless](https://github.com/CoCodingOrg/aliyun-serverless)

# 二、云函数开发工具 alicf 功能
## 1. 设置阿里云调用参数 
[./cloudfunctions/config.json](https://github.com/CoCodingOrg/aliyun-serverless/blob/master/cloudfunctions/config.json)
```json
{
    "accessKeyId": "Your Aliyun AccessKeyId",
    "accessKeySecret": "Your Aliyun AccessKeySecret",
    "spaceId": "Your Aliyun Serverless SpaceId"
}
```
## 2. 创建云函数
> 会在Serverless空间创建函数

Command:
```shell
npm run cf create test-demo
```

## 3. 部署云函数
> 将云函数部署部署到Serverless空间

Command:
```shell
npm run cf deploy test-demo
```

## 4. 运行云函数
> 运行Serverless空间云函数

Command:
```shell
npm run cf invoke test-demo [参数, 默认为{}]
```

## 5. 添加触发器
> 给Serverless云函数添加触发器

- 1. 参考: <https://help.aliyun.com/document_detail/435821.html?spm=a2c4g.435907.0.0.7a8a1fc7WTaC6O>
- 2. 编辑触发器参数
[./cloudfunctions/config.json](https://github.com/CoCodingOrg/aliyun-serverless/blob/master/cloudfunctions/config.json)
    ```json
    "triggers": {
            "test-demo": { // 函数名
                "cron": "0 */20 7-16 * 4-6 *",
                "payload": ""
            }
        }
    ```
    + test-demo: 函数名
    + cron: 触发表达式
    + payload: 定时触发传入参数

Command:
```shell
npm run cf trigger test-demo 
```

## 6. 变量说明

- `alicf`: 对象存储
    - `db`: 云数据库操作对象
    - `file`: 云文件操作对象
    - `cloudfunction`: 云函数操作对象, 调用其他云函数 `cloudfunction.invoke(funcName)` 
    - `httpclient`: HTTP请求工具, <https://help.aliyun.com/document_detail/435817.html>

- `alicf.get`
```js
const {db, file, cloudfunction, httpclient} = alicf.get()
```
# 三、db 补充文档
## 1. 查询集合数量 `count`

Command:
```js
db.collection('user').count({_id:{$exists:true}})
```
Response:
```json
{"success":true,"affectedDocs":0,"result":0}
```

## 2. 更新一条记录 `updateOne`
Command:
```js
db.collection('user').updateOne({_id}, {
            $set: {
                ...data,
                time: Date.now()
            }
        })
```
Response:
```json
{"success":true,"affectedDocs":0,"result":{"ok":1,"n":0,"nModified":0,"upserted":null}}
```

## 3. 插入记录 `insertOne`
Command:
```js
db.collection('user').insertOne({
            ...data,
            time: Date.now()
        })
```
Response:
```json
{"success":true,"affectedDocs":1,"result":{"insertedId":"648d9cc80c801c4baaa5266a","ok":1,"n":1}}
```

## 4. 查询一条记录 `findOne`

Response:
```json
{"success":true,"affectedDocs":1,"result":{"_id":1234567890,"name":"test"}}
```