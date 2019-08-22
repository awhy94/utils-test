/*
** Created by liangqi.miao on 19-02-19.

** 1. 为什么需要编写该模块:
**  由于客服端统计需要, 当用户滚动页面时, 用户在某个模块( 某个酒店/某个酒店的某个信息块等 )上停留一定的时间以后,
    向 Mes 统计系统'上报'该模块信息, 便于后期统计一个页面中不同模块的用户停留率, 绘制用户停留热力图等, 因此封装实现了该统计模块!

** 2. 如何使用该模块(基本使用):
**  2.1 在不涉及 Vue / React 的代码中使用:
      import { IoWatcher } from 'xxx/IoWatcher';
      在业务代码的初始化逻辑(app.js)中直接通过 new 调用 IoWatcher, 如下:
      const ioWatcher = new IoWatcher({exposedTime, callback, container, proportion});
      @param: exposedTime, 统计规定的曝光时间(ms), number类型
      @param: proportion, 开始曝光时,目标元素和容器元素的相交比例. float 类型, 值的范围为(0, 1)
      @param: container, 一个 Dom 元素, 指定目标元素所在的容器节点(即根元素), 如果未传入任何值或值为null, 则默认使用 viewport.
      @param: callback, 当用户在某个模块的停留时间超过 exposedTime 后, 会自动的调用该回调函数.
        其中回调函数会被传入一个参数, 指示当前被 ioWatcher 曝光的模块最外层 Dom 元素. callback 基本格式: (node) => {}
        所有上报 Mes 统计系统的业务逻辑, 均在 callback 中由调用者自行完成!

**   2.2 在涉及 Vue / React 的代码中使用:
**    使用和上面的 2.1 类似. 唯一的不同点是:
**    1. 在 vue 中: 需要在 APP.vue 的 mounted 生命周期函数中通过如下方式调用:
      mounted() {
        this.$nextTick(() => {
          this.ioWatcher = new IoWatcher({exposedTime, callback, container});
        });
      }
      特殊情况下( 通过 JS 动态添加了需要监听的元素(模块) ), 此时需要在 updated 生命周期函数调用如下函数:
      updated() {
        this.$nextTick(() => {
          this.ioWatcher.refreshNodeList();
        });
      }
      这里使用 this.$nextTick 函数的原因是: mounted/(updated) 不会承诺所有的子组件也都一起被挂载/(重绘),
      如果你希望等到整个视图都渲染完毕/(重绘完毕), 可以用 vm.$nextTick 替换掉 mounted/(updated) !

**    2. 在 react 中: 需要在 APP.js 的 componentDidMount 生命周期函数中通过如下方式调用:
      componentDidMount() {
        setTimeout(() => {
          this.ioWatcher = new IoWatcher({exposedTime, callback, container});
        }, 0);
      }
      特殊情况下( 通过 JS 动态添加了需要监听的元素(模块) ), 此时需要在 componentDidUpdate 生命周期函数调用如下函数:
      componentDidUpdate() {
        setTimeout(() => {
          this.ioWatcher.refreshNodeList();
        }, 0);
      }
      这里使用 setTimeout 函数的原因和上面 vue 中使用 this.$nextTick 函数的原因相同!

**   3. 注意一种特殊情况, 即当我们的页面的 DOM 是等到 ajax 数据加载完成之后才被加载到页面上, 此时 IoWatcher 的初始化需要在 ajax 的回调函数中执行. 如下:
     在 vue 中我们需要这么做:
       this.$store.dispatch(bookingInfoTypes.GET_BOOKING_INFO, {
          sFrom, sVCode, sOrderId, sOtaName,
        }).then(() => {
          this.$nextTick(() => {
            const ioWatcher = new IoWatcher({
              exposedTime: 500,
              callback: node => { console.log(node.tagName) },
            });
          });
        });
*/
import 'intersection-observer';

export default class IoWatcher {
  exposedTime;

  callback;

  container;

  proportion;

  nodeList = [];

  // 保存已曝光的模块
  watchedModuleSet = new Set();

  // 保存进入可视区域的模块
  entryModuleMap = new Map();

  // 保存离开可视区域的模块
  outModuleMap = new Map();

  constructor({
    exposedTime = 1500,
    callback = () => {},
    container = null,
    proportion = 0.1,
  }) {
    this.exposedTime = parseInt(exposedTime);
    this.callback = callback;
    this.container = container;
    this.validateProportion(proportion);

    // 在需要曝光的模块上添加 data-mfw-watch-item 属性
    this.nodeList = [...document.querySelectorAll('[data-mfw-watch-item]')];
    // 初始化 IntersectionObserver 实例
    this.observer = this.initObserver();
    this.nodeList.forEach(node => {
      this.observer.observe(node);
    });
  }

  validateProportion(proportion) {
    let pro = parseFloat(proportion);
    if (proportion >= 1) pro = 0.99;
    if (proportion <= 0) pro = 0.01;
    this.proportion = pro;
  }

  initObserver() {
    const {
      container,
      exposedTime,
      proportion,
      entryModuleMap,
      outModuleMap,
      watchedModuleSet,
    } = this;
    let timerId = null;
    return new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        const {
          isIntersecting,
          target,
        } = entry;
        if (isIntersecting) {
          // 将进入可视区域的元素(模块) set 进 entryModuleMap
          entryModuleMap.set(target, entry);
          if (outModuleMap.has(target)) outModuleMap.delete(target);
        } else {
          // 将不在可视区域的元素(模块) set 进 outModuleMap
          outModuleMap.set(target, entry);
          if (entryModuleMap.has(target)) {
            // 离开可视区域时需要进行判断, 之前进入的时间和离开的时间是否超过了曝光时间, 如果超过了, 则需要曝光
            if (outModuleMap.get(target).time - entryModuleMap.get(target).time >= exposedTime) {
              watchedModuleSet.add(target);
              // 解除该元素的监听
              observer.unobserve(target);
              outModuleMap.delete(target);
              // 回调函数处理曝光逻辑
              this.callback(target);
            }
            entryModuleMap.delete(target);
          }
        }
        if (timerId) clearTimeout(timerId);
        // 当页面停止滚动时, 对当前 可视区域 中的元素进行处理, 即处理 entryModuleMap 中的元素
        timerId = setTimeout(() => {
          // 如果进入的组件没有出去, 则说明还停留在可视区域, 直接曝光
          [...entryModuleMap].forEach(([node]) => {
            watchedModuleSet.add(node);
            // 解除该元素的监听
            observer.unobserve(node);
            entryModuleMap.delete(node);
            // 回调函数处理曝光逻辑
            this.callback(node);
          });
        }, exposedTime);
      });
    }, {
      root: container,
      threshold: [proportion],
    });
  }

  /*
   ** 重置已曝光的某个 Dom 节点的 Watcher 到当前状态
   * */
  refreshNodeWatcher(node) {
    const {
      watchedModuleSet,
    } = this;
    if (watchedModuleSet.has(node)) {
      watchedModuleSet.delete(node);
      this.observer.observe(node);
    }
  }

  /*
   ** 监听通过 JS 动态生成的 nodeList
   * */
  addNodelistWatcher(nodeList) {
    const {
      watchedModuleSet,
    } = this;
    nodeList.forEach(node => {
      if (!watchedModuleSet.has(node)) {
        this.observer.observe(node);
      }
    });
  }

  /*
   ** 移除 nodeList 监听
   * */
  removeNodelistWatcher(nodeList) {
    nodeList.forEach(node => {
      this.observer.unobserve(node);
      this.entryModuleMap.delete(node);
      this.outModuleMap.delete(node);
      this.watchedModuleSet.delete(node);
    });
  }

  /*
   ** 重置 nodeList.
   ** 可能调用改函数的情形: 通过 JS 动态添加了需要监听的元素(模块)
   * */
  refreshNodeList() {
    this.clear();
    this.nodeList.forEach(node => {
      this.observer.unobserve(node);
    });

    // 重新绑定监听器
    this.nodeList = [...document.querySelectorAll('[data-mfw-watch-item]')];
    this.nodeList.forEach(node => {
      this.observer.observe(node);
    });
  }

  /*
   ** 重置 Watcher 到初始状态
   * */
  refreshWatcher() {
    this.clear();
    this.nodeList.forEach(node => {
      this.observer.unobserve(node);
    });

    // 重新 observe
    this.nodeList.forEach(node => {
      this.observer.observe(node);
    });
  }

  /*
   ** 销毁生成的 IoWatcher 实例
   * */
  destroy() {
    this.clear();
    this.observer.disconnect();
  }

  clear() {
    const {
      entryModuleMap,
      outModuleMap,
      watchedModuleSet,
    } = this;

    entryModuleMap.clear();
    outModuleMap.clear();
    watchedModuleSet.clear();
  }
}

export { IoWatcher };
