const path = require('path');
const fs = require('fs');
const ejs = require('ejs');

// babellon 把源码转为AST
// @babel/types 将节点替换
// @babel/traverse 遍历节点
// @babel/generator 将替换好的节点生成
const babylon = require('babylon');
const t = require('@babel/types');
const traverse = require('@babel/traverse').default;
const generator = require('@babel/generator').default;

class Compiler {
  constructor(config) {
    // entry output
    this.config = config;
    // 需要保存入口文件的路径
    this.entryId; // ./src/index.js
    // 需要保存所有的模块依赖
    this.modules = {};

    // 入口路径
    this.entry = config.entry;
    // 工作路径
    this.root = process.cwd();
  }

  // 读取源码
  getSource(modulePath) {
    const content = fs.readFileSync(modulePath, 'utf8');
    return content;
  }

  // https://astexplorer.net/
  // 解析源码 source: 源代码 parentPath: ./src
  parse(source, parentPath) { // AST解析语法树
    const ast = babylon.parse(source);
    const dependencies = []; // 依赖的数组
    traverse(ast, {
      CallExpression(p) {
        const node = p.node; // 对应的节点
        if (node.callee.name === 'require') {
          // 将 require 改为 __webpack_require__
          node.callee.name = '__webpack_require__';
          let moduleName = node.arguments[0].value; // 取到的就是模块的引用名字 ./a
          moduleName = moduleName + (path.extname(moduleName) ? '' : '.js'); // ./a.js
          moduleName = './' + path.join(parentPath, moduleName); // ./src/a.js
          dependencies.push(moduleName);

          // 将ast树中的./a也改为./src/a.js
          node.arguments = [t.stringLiteral(moduleName)];
        }
      }
    });

    // 将新的ast树重新生成源代码
    const sourceCode = generator(ast).code;

    return {sourceCode, dependencies};
  }

  // 构建模块
  // 目的：1.将相对路径和相对路径文件中的内容 以key/value的形式存入this.modules中。 2.将require改为__webpack_require__。
  buildModule(modulePath, isEntry) {
    // 拿到模块的内容
    const source = this.getSource(modulePath);

    // 模块id  modulePath = modulePath - this.root  src/index.js 将绝对路径转为相对路径
    const moduleName = './' + path.relative(this.root, modulePath); // ./src/index.js

    // 如果是主入口模块的话 保存入口名字
    if (isEntry) {
      this.entryId = moduleName;
    }

    // 解析需要把source源码进行改造 返回一个依赖列表
    const {sourceCode, dependencies} = this.parse(source, path.dirname(moduleName)); // ./src

    // 把相对路径和模块中的内容对应起来
    this.modules[moduleName] = sourceCode;

    // 递归依赖模块
    dependencies.forEach(dep => {
      this.buildModule(path.join(this.root, dep), false);
    });
  }

  // 发布一个文件
  emitFile() {
    // 拿到输出的目录
    const main = path.join(this.config.output.path, this.config.output.filename);

    // 读取ejs模版
    const templateStr = this.getSource(path.join(__dirname, 'main.ejs'));

    // 将ejs数据填充 拿到打包后的代码
    const code = ejs.render(templateStr, {entryId: this.entryId, modules: this.modules});

    // 将打包后的代码字符串以key(输出路径)/value(打包后的代码) 的形式存储起来，便于打包多个文件。
    this.assets = {};
    this.assets[main] = code;

    // 将打包后的代码字符串写入出口文件中
    fs.writeFileSync(main, this.assets[main]);
  }

  run() {
    // 入口文件的绝对路径 /Users/zuozhao/Documents/webpack-learn/webpack-dev/src/index.js
    const modulePath = path.resolve(this.root, this.entry);

    // 执行
    this.buildModule(modulePath, true);

    console.log(this.modules, 'modules');

    // 发射一个文件 打包后的文件
    this.emitFile();

    console.log('打包成功hhhhhh');
  }
}

module.exports = Compiler;