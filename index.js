const fs = require('fs').promises;
const path = require('path');

const args = process.argv.slice(2);

if (args.length === 0) {
    console.log("Usage: node createFiles.js <fileName>");
    process.exit(1);
}

// 定义要创建的文件名和内容
const mkdirName = args[0];
const fileName = args[0] + ".js";

const folders = [
    { folderPath: "src/components", isFolder: true, tag: "table" },
    { folderPath: "src/models", isFolder: false, tag: "models" },
    { folderPath: "src/services", isFolder: false, tag: "services" },
    { folderPath: "src/configs", isFolder: false, tag: "configs" },
];

//统一读取文件
const readFile = async (filePath) => {
    try {
        return await fs.readFile(filePath, 'utf8');
    } catch (error) {
        console.error(`Error reading file ${filePath}:`, error);
        throw error;
    }
};

//统一写入文件
const writeFile = async (filePath, content) => {
    try {
        await fs.writeFile(filePath, content, 'utf8');
        console.log(`File written successfully: ${filePath}`);
    } catch (error) {
        console.error(`Error writing file ${filePath}:`, error);
        throw error;
    }
};

// 创建文件夹
const createFolder = async (folderPath, folderName, tag) => {
    const mkdirPath = path.join(folderPath, folderName);

    try {
        await fs.mkdir(mkdirPath);
        console.log(`Created ${folderName} folder in ${mkdirPath}`);
        
        const indexPath = path.join(mkdirPath, "index.js");
        const currentPath = path.join(mkdirPath, `${folderName}.js`);
        const lessPath = path.join(mkdirPath, "index.less");
        const addTemPath = path.join(mkdirPath, "addForm.js");
        const addTemModalPath = path.join(mkdirPath, "addFormModal.js");

        const [text, addTem, addTemModal, lessContent] = await Promise.all([
            readFile(__dirname + `/${tag}.js`),
            readFile(__dirname + '/addForm.js'),
            readFile(__dirname + '/addFormModal.js'),
            readFile(__dirname + '/index.less'),
        ]);

        await Promise.all([
            writeFile(currentPath, text.replace(/example/g, folderName)),
            writeFile(addTemPath, addTem.replace(/example/g, folderName)),
            writeFile(addTemModalPath, addTemModal.replace(/example/g, folderName)),
            writeFile(indexPath, `import ${folderName} from './${folderName}';\nexport default ${folderName}`),
            writeFile(lessPath, lessContent),
        ]);

        console.log("Files created successfully.");
    } catch (error) {
        console.error(`Error creating folder ${folderName}:`, error);
        throw error;
    }
};

// 更新api.js
const updateConfigsFile = async (folderPath, text) => {
    const filePath = path.join(folderPath, "api.js");

    try {
        let list = await readFile(filePath);
        const hasTrailingWhitespace = /\s+$/.test(list);
        let trimmedData, lines;

        if (hasTrailingWhitespace) {
            trimmedData = list.replace(/\s+$/, '');
            lines = trimmedData.split('\n');
        } else {
            lines = list.split('\n');
        }

        const insertPosition = lines.length - 1;
        lines.splice(insertPosition, 0, text);
        const newData = lines.join('\n');

        await writeFile(filePath, newData);
    } catch (error) {
        console.error(`Error updating api.js:`, error);
        throw error;
    }
};

//更新index.js文件
const updateModelsIndex = async () => {
    try {
        const data = await readFile('./src/index.js');
        const insertText = `app.model(require('./models/${mkdirName}').default);\n`;
        const index = data.indexOf('app.start');

        if (index !== -1) {
            const newData = [data.slice(0, index), insertText, data.slice(index)].join('');
            await writeFile('./src/index.js', newData, 'utf8');
        } else {
            console.error("Can't find 'app.start' in the file.");
        }
    } catch (error) {
        console.error(`Error updating index.js:`, error);
        throw error;
    }
};

//更新models.js文件
const updateModelsFile = async (filePath, text) => {
    try {
        await writeFile(filePath, text);
    } catch (error) {
        console.error(`Error updating ${filePath}:`, error);
        throw error;
    }
};

//更新router.js组件部分
const updateRouterComponentsFile = async () => {
    try {
        let data = await readFile('./src/Router.js');
        const insertText = `
  const ${mkdirName} = dynamic({
    app,
    component: () => import('./components/${mkdirName}'),
  });

  const ${mkdirName}Add = dynamic({
    app,
    component: () => import('./components/${mkdirName}/addForm'),
  });
`;
        let  index = data.indexOf('const RouterWrapper') || data.indexOf('return (');

        if (index !== -1) {
            index = data.indexOf('\n', index);

            if (index === -1) {
                index += 'const RouterWrapper'.length;
            } else {
                index++;
            }

            const newData = [data.slice(0, index), insertText, data.slice(index)].join('');
            await writeFile('./src/Router.js', newData, 'utf8');
        } else {
            console.error("Can't find 'const RouterWrapper' in the file.");
        }
    } catch (error) {
        console.error(`Error updating Router.js components:`, error);
        throw error;
    }
};

//更新router.js路由部分
const updateRouterLastFile = async () => {
    try {
        let data = await readFile('./src/Router.js');
        const lastIndex = data.indexOf('</Switch>');
        const insertText = `
          <Route exact path="/${mkdirName}" render={(props) => WraperRouter(props, ${mkdirName})} />
          <Route exact path="/${mkdirName}/${mkdirName}Add" render={(props) => WraperRouter(props, ${mkdirName}Add)} />
    `;

        const lastData = [data.slice(0, lastIndex), insertText, data.slice(lastIndex)].join('');
        await writeFile('./src/Router.js', lastData, 'utf8');
    } catch (error) {
        console.error(`Error updating Router.js last file:`, error);
        throw error;
    }
};

// 循环遍历每个文件夹，创建文件
const createFn = async () => {
    for (const folder of folders) {
        try {
            if (folder.isFolder) {
                await createFolder(folder.folderPath, mkdirName, folder.tag);
                await updateRouterComponentsFile();
                setTimeout(async () => {
                    await updateRouterLastFile();
                }, 500);
            } else {
                const filePath = path.join(folder.folderPath, fileName);
                const text = await readFile(__dirname + `/${folder.tag}.js`);
                const updatedText = text.replace(/example/g, mkdirName);

                if (folder.tag === "configs") {
                    await updateConfigsFile(folder.folderPath, updatedText);
                } else if (folder.tag === "models") {
                    await updateModelsFile(filePath, updatedText);
                    await updateModelsIndex();
                } else {
                    await writeFile(filePath, updatedText);
                }

                console.log(`Successfully created ${filePath}.`);
            }
        } catch (error) {
            console.error(`Error processing ${folder.folderPath}:`, error);
        }
    }

    console.log('Template creation completed. Adjust your API interfaces in api.js.');
};

createFn();
