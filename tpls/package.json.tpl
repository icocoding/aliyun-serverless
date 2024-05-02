{
    "name": "${funcName}",
    "version": "1.0.0",
    "description": "",
    "main": "index.js",
    "scripts": {
      "debug": "node debug.js",
      "deploy": "npm run cf deploy ${funcName} --prefix ../../",
      "invoke": "npm run cf invoke ${funcName} --prefix ../../",
      "trigger": "npm run cf trigger ${funcName} --prefix ../../"
    },
    "author": "alicf@iCoCoding",
    "license": "ISC"
  }