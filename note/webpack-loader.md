# loader
1. webpack loader功能的实现。
2. loader的实现思路。

## loader的实现思路
**由于webpack只能打包符合commonjs规范的js文件，所以对于css/图片等格式的文件无法打包(无法解析成ast语法树)，这时就需要用到loader来将无法打包的文件转译成可打包的js文件**

- loader其实就是个函数。他接受一个参数source源码，返回的是经过解析/包装后的源码。这个函数的目的其实就是去解析源代码。

## webpack loader功能的实现
1. 由于我们在解析源码的时候要将源码转为ast语法树，而某些类型的文件无法转为ast语法树。所以我们要在拿到源码之后，解析ast语法树之前去执行loader的解析功能。(在`this.getSource`方法中进行解析)
2. 拿到源码后我们也要拿到配置文件的rules规则(`this.config.module.rules`)。然后我们去遍历规则数组，取出每一个规则。
3. 从每项规则中拿出test去匹配文件路径。如果当前路径符合匹配规则，则我们针对当前路径的文件去递归执行loader.
4. 执行完所有loader后，将解析后的源码返回。
