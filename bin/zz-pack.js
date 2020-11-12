#! /usr/bin/env node

// 1.需要找到当前执行命令的路径 拿到webpack.config.js;

const path = require('path');

// webpack.config.js 配置文件
const config = require(path.resolve('webpack.config.js'));

const Compiler = require('../lib/Compiler');
const compiler = new Compiler(config);

// 执行入口生命周期
compiler.hooks.entryOption.call();

// 标示运行编译
compiler.run();
