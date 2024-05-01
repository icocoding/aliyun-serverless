const fs = require('fs');

const cwd = process.cwd()
const cloudfunctionsDir = path.resolve(cwd, "cloudfunctions")

if (!fs.existsSync(cloudfunctionsDir)) {
  fs.mkdirSync(cloudfunctionsDir)
}

// 读取 package.json 文件
fs.readFile('package.json', 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading package.json:', err);
    return;
  }

  try {
    // 解析 JSON 数据
    const packageJson = JSON.parse(data);

    // "cf": "run-func ./node_modules/aliserverless/index.js"
    // 添加自定义脚本
    packageJson.scripts['cf'] = 'run-func ./node_modules/aliserverless/index.js';

    // 将修改后的 package.json 数据写回文件
    fs.writeFile('package.json', JSON.stringify(packageJson, null, 2), 'utf8', (err) => {
      if (err) {
        console.error('Error writing package.json:', err);
        return;
      }
      console.log('Added [cf] to package.json');
    });
  } catch (parseError) {
    console.error('Error parsing package.json:', parseError);
  }
});