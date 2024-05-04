const index = require('./index')
const args = process.argv[2] || '{}'
new Promise(function(resolve, reject) {
    index({
        args: JSON.parse(args),
        mpserverless: {
            db: {},
            file: {},
            function: {}
        }
    }).then(res => {
        console.log('执行结果：', JSON.stringify(res))
        resolve()
    }).catch(err => {
        console.log('执行错误：', err)
        reject()
    })
})