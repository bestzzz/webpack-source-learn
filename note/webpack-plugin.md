# webpack plugin功能的实现

**plugin与loader的不同的一点是plugin可以运行在整个编译的各个生命周期**

- 所以实现plugin的主要思想是，通过tapable，在plugin中订阅生命周期的事件。然后在webpack对应的生命周期阶段发布。

1. 首先通过tapable依赖，在构造函数中定义一些生命周期钩子。
``` javascript
    // 生命周期
    this.hooks = {
      entryOption: new SyncHook(),
      compile: new SyncHook(),
      afterCompile: new SyncHook(),
      afterPlugins: new SyncHook(),
      run: new SyncHook(),
      emit: new SyncHook(),
      done: new SyncHook()
    };
```

2. 在构造函数中取出`config.plugins`，遍历执行每一个plugin实例的apply方法，并传入this(compiler实例)进去。
``` javascript
    // 拿到配置文件中的插件并订阅事件
    const plugins = config.plugins;
    if (plugins && Array.isArray(plugins)) {
      plugins.forEach(plugin => {
        plugin.apply(this);
      });
    }
```