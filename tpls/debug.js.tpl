const index = require('./index')
const args = process.argv[2] || '{}'
new Promise(async function(resolve, reject) {
    const res = await index({
        args: JSON.parse(args),
        mpserverless: {
            db: {},
            file: {},
            function: {}
        }
    })
    console.log(res)
})