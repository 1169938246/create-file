const fs = require('fs')
const path = require('path')

const args = process.argv.slice(2); //获取命令行传参
if (args.length === 0) {
    console.log("Usage: node createFiles.js <fileName>");
    process.exit(1);
}
// 定义要创建的文件名和内容
const mkdirName = args[0];
const fileName = args[0] + ".js";

// 定义要创建文件的文件夹路径
const folders = [
    {
        folderPath: "src/components",
        isFolder: true,
        tag:"table"
    },
    {
        folderPath: "src/models",
        isFolder: false,
        tag:"models"
    },
    {
        folderPath: "src/services",
        isFolder: false,
        tag:"services"
    },
    {
        folderPath: "src/configs",
        isFolder: false,
        tag:"configs"
    },
];

// 创建文件夹
const createFolder = (folderPath, folderName, tag) => {
    const mkdirPath = path.join(folderPath, folderName);
    fs.mkdirSync(mkdirPath);
    console.log(`在 ${mkdirPath} 中创建 ${folderName} 文件夹成功, ${__dirname}`);

    const indexPath = path.join(mkdirPath, "index.js");
    const currentPath = path.join(mkdirPath, `${folderName}.js`);
    const lessPath = path.join(mkdirPath, "index.less");
    const addTemPath = path.join(mkdirPath, "addForm.js");
    const addTemModalPath = path.join(mkdirPath, "addFormModal.js");

    // 读取模板文件
    let text = fs.readFileSync(__dirname + `/${tag}.js`, 'utf8'); //列表模板
    let addTem = fs.readFileSync(__dirname + '/addForm.js', 'utf8');   //新增form模板
    let addTemModal = fs.readFileSync(__dirname + '/addFormModal.js', 'utf8');   //新增form模板-模态框
    let lessContent = fs.readFileSync(__dirname + '/index.less', 'utf8');   //新增form模板-模态框
    // 替换模板中的占位符
    fs.writeFileSync(currentPath, `${text.replace(/example/g, folderName)}`);
    console.log(`创建 ${addTemPath} 成功`);

    fs.writeFileSync(addTemPath, `${addTem.replace(/example/g, folderName)}`);
    console.log(`创建 ${addTemPath} 成功`);

    fs.writeFileSync(addTemModalPath, `${addTemModal.replace(/example/g, folderName)}`);
    console.log(`创建 ${addTemModalPath} 成功`);

    fs.writeFileSync(indexPath, `import ${folderName} from './${folderName}';\nexport default ${folderName}`);
    console.log("创建 index.js 成功, 自动添加引用");

    fs.writeFileSync(lessPath, lessContent);
    console.log("创建 index.less 成功");
};


// 更新api.js
const updateConfigsFile = (folderPath,text) => {
    const filePath = path.join(folderPath, "api.js"); //读取文件路径      
    let list =  fs.readFileSync(filePath, 'utf8');
    const hasTrailingWhitespace = /\s+$/.test(list);
    let trimmedData,lines;
    if(hasTrailingWhitespace){
        trimmedData  = list.replace(/\s+$/, '');
        lines = trimmedData.split('\n');
    }else{
        lines = list.split('\n');
    }
    let insertPosition = lines.length - 1;
    lines.splice(insertPosition, 0, text);
    const newData = lines.join('\n');
    fs.writeFileSync(filePath,`${newData}`);
};

//更新index.js文件
const updateModelsIndex = () => {
    let data = fs.readFileSync('./src/index.js', 'utf8');
    let insertText = `app.model(require('./models/${mkdirName}').default);\n`
    let index = data.indexOf('app.start') ; 
    const newData = [data.slice(0, index), insertText, data.slice(index)].join('');
    fs.writeFileSync('./src/index.js', newData, 'utf8');
    console.log(`在index.js中插入models成功`);

};

//更新models.js文件
const updateModelsFile = (filePath,text) => {
    fs.writeFileSync(filePath,`${text}`);
    console.log(`在 ${filePath} 中创建文件成功, ${__dirname}`);
};


//更新router.js组件部分
const updateRouterComponetnsFile = () => {
    let data = fs.readFileSync('./src/Router.js', 'utf8');
    let insertText = ` 
  const ${mkdirName} = dynamic({
    app,
    component: () => import('./components/${mkdirName}'),
  });\n
  const ${mkdirName}Add = dynamic({
    app,
    component: () => import('./components/${mkdirName}/addForm'),
  });\n\n`
    let index = data.indexOf('const RouterWrapper') || data.indexOf('return (');
    if (index !== -1) {
        // 找到 'const RouterWrapper' 后面的换行符或分号的位置
        index = data.indexOf('\n', index); // 如果预期它后面是换行符
        // 如果没有找到换行符或分号，则默认在当前索引位置插入
        if (index === -1) {
          index += 'const RouterWrapper'.length;
        } else {
          index++; // 移动到换行符或分号之后的位置
        }
        const newData = [data.slice(0, index), insertText, data.slice(index)].join('');
        fs.writeFileSync('./src/Router.js', newData, 'utf8');
      } else {
        console.error("Can't find 'const RouterWrapper' in the file.");
      }``
}

//更新router.js路由部分
const updateRouterlastFile = () =>{
    let data = fs.readFileSync('./src/Router.js', 'utf8');
    const lastIndex = data.indexOf('</Switch>')
    const insertText = `
          <Route exact path="/${mkdirName}" render={(props) => WraperRouter(props, ${mkdirName})} />
          <Route exact path="/${mkdirName}/${mkdirName}Add" render={(props) => WraperRouter(props, ${mkdirName}Add)} />
    `
    const lastData = [data.slice(0, lastIndex), insertText, data.slice(lastIndex)].join('');
     fs.writeFileSync('./src/Router.js', lastData, 'utf8');
}

// 循环遍历每个文件夹，创建文件

const createFn = async() =>{
    folders.forEach(async(folder) => {
        if (folder.isFolder) {
           createFolder(folder.folderPath, mkdirName, folder.tag);
           updateRouterComponetnsFile()
           setTimeout(()=>{
            updateRouterlastFile()
           },500)
        }else {
            const filePath = path.join(folder.folderPath, fileName); //读取文件路径
            let text = fs.readFileSync(__dirname+`/${folder.tag}.js`, 'utf8') //读取文件
            text = text.replace(/example/g, mkdirName);
            if(folder.tag === "configs"){
                 updateConfigsFile(folder.folderPath,text)
            }else if(folder.tag === "models"){
                 updateModelsFile(filePath,text)
                 updateModelsIndex()
            }else{
                 fs.writeFileSync(filePath,`${text}`);
            }
            
            // console.log(`在${filePath}中创建成功js`)
        }
    });
    
}

createFn()
console.log('模板已经创建完成,请去api.js中调整自己的aip接口...');

