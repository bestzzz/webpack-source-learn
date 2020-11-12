# webpack打包功能的实现

1. 首先拿到需要打包项目的webpack.config.js配置文件。

2. 通过配置文件拿到配置的入口路径，开始构建入口模块以及递归构建所有相关依赖模块。

3. 构建模块：拿到入口模块路径后，通过fs.readFileSync拿到文件源码字符串。然后解析模块，拿到解析后的源码和对应的依赖数组。将路径名和源码通过key/value的形式存储起来，然后递归构建依赖数组。最后得到的是一个key(./src/index.js)/value(源码)的modules对象。

``` javascript
// 构建出来的文件数据如下
this.modules = {
  './src/index.js': 'const str = __webpack_require__("./src/a.js");\n\nconsole.log(str);',

  './src/a.js': 'const b = __webpack_require__("./src/base/b.js");\n\nconst str = \'a\' + b;\nmodule.exports = str;',

  './src/base/b.js': 'module.exports = \'b\';' 
};
```

4. 解析模块：通过`babylon.parse`将源码字符串解析成AST语法树。通过`@babel/traverse`遍历AST语法树节点，在AST语法树中将所有'require'改为'__webpack_require__'，同样所有的模块依赖的引用路径改为相对路径'./src/a.js'，并将依赖模块路径名存储起来返回。最后通过`@babel/generator`将语法树转为源码字符串返回。

5. 发布文件：搞一个webpack的模版，以ejs模版引擎的形式存起来，然后将的modules对象填充进去。最后拿到出口文件路径(output.path)，使用fs.writeFileSync写入。
