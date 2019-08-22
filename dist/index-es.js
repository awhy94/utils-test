import 'intersection-observer';

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
}

function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  }
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArray(iter) {
  if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
}

function _iterableToArrayLimit(arr, i) {
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance");
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

var IoWatcher =
/*#__PURE__*/
function () {
  // 保存已曝光的模块
  // 保存进入可视区域的模块
  // 保存离开可视区域的模块
  function IoWatcher(_ref) {
    var _this = this;

    var _ref$exposedTime = _ref.exposedTime,
        exposedTime = _ref$exposedTime === void 0 ? 1500 : _ref$exposedTime,
        _ref$callback = _ref.callback,
        callback = _ref$callback === void 0 ? function () {} : _ref$callback,
        _ref$container = _ref.container,
        container = _ref$container === void 0 ? null : _ref$container,
        _ref$proportion = _ref.proportion,
        proportion = _ref$proportion === void 0 ? 0.1 : _ref$proportion;

    _classCallCheck(this, IoWatcher);

    _defineProperty(this, "exposedTime", void 0);

    _defineProperty(this, "callback", void 0);

    _defineProperty(this, "container", void 0);

    _defineProperty(this, "proportion", void 0);

    _defineProperty(this, "nodeList", []);

    _defineProperty(this, "watchedModuleSet", new Set());

    _defineProperty(this, "entryModuleMap", new Map());

    _defineProperty(this, "outModuleMap", new Map());

    this.exposedTime = parseInt(exposedTime);
    this.callback = callback;
    this.container = container;
    this.validateProportion(proportion); // 在需要曝光的模块上添加 data-mfw-watch-item 属性

    this.nodeList = _toConsumableArray(document.querySelectorAll('[data-mfw-watch-item]')); // 初始化 IntersectionObserver 实例

    this.observer = this.initObserver();
    this.nodeList.forEach(function (node) {
      _this.observer.observe(node);
    });
  }

  _createClass(IoWatcher, [{
    key: "validateProportion",
    value: function validateProportion(proportion) {
      var pro = parseFloat(proportion);
      if (proportion >= 1) pro = 0.99;
      if (proportion <= 0) pro = 0.01;
      this.proportion = pro;
    }
  }, {
    key: "initObserver",
    value: function initObserver() {
      var _this2 = this;

      var container = this.container,
          exposedTime = this.exposedTime,
          proportion = this.proportion,
          entryModuleMap = this.entryModuleMap,
          outModuleMap = this.outModuleMap,
          watchedModuleSet = this.watchedModuleSet;
      var timerId = null;
      return new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
          var isIntersecting = entry.isIntersecting,
              target = entry.target;

          if (isIntersecting) {
            // 将进入可视区域的元素(模块) set 进 entryModuleMap
            entryModuleMap.set(target, entry);
            if (outModuleMap.has(target)) outModuleMap["delete"](target);
          } else {
            // 将不在可视区域的元素(模块) set 进 outModuleMap
            outModuleMap.set(target, entry);

            if (entryModuleMap.has(target)) {
              // 离开可视区域时需要进行判断, 之前进入的时间和离开的时间是否超过了曝光时间, 如果超过了, 则需要曝光
              if (outModuleMap.get(target).time - entryModuleMap.get(target).time >= exposedTime) {
                watchedModuleSet.add(target); // 解除该元素的监听

                observer.unobserve(target);
                outModuleMap["delete"](target); // 回调函数处理曝光逻辑

                _this2.callback(target);
              }

              entryModuleMap["delete"](target);
            }
          }

          if (timerId) clearTimeout(timerId); // 当页面停止滚动时, 对当前 可视区域 中的元素进行处理, 即处理 entryModuleMap 中的元素

          timerId = setTimeout(function () {
            // 如果进入的组件没有出去, 则说明还停留在可视区域, 直接曝光
            _toConsumableArray(entryModuleMap).forEach(function (_ref2) {
              var _ref3 = _slicedToArray(_ref2, 1),
                  node = _ref3[0];

              watchedModuleSet.add(node); // 解除该元素的监听

              observer.unobserve(node);
              entryModuleMap["delete"](node); // 回调函数处理曝光逻辑

              _this2.callback(node);
            });
          }, exposedTime);
        });
      }, {
        root: container,
        threshold: [proportion]
      });
    }
    /*
     ** 重置已曝光的某个 Dom 节点的 Watcher 到当前状态
     * */

  }, {
    key: "refreshNodeWatcher",
    value: function refreshNodeWatcher(node) {
      var watchedModuleSet = this.watchedModuleSet;

      if (watchedModuleSet.has(node)) {
        watchedModuleSet["delete"](node);
        this.observer.observe(node);
      }
    }
    /*
     ** 监听通过 JS 动态生成的 nodeList
     * */

  }, {
    key: "addNodelistWatcher",
    value: function addNodelistWatcher(nodeList) {
      var _this3 = this;

      var watchedModuleSet = this.watchedModuleSet;
      nodeList.forEach(function (node) {
        if (!watchedModuleSet.has(node)) {
          _this3.observer.observe(node);
        }
      });
    }
    /*
     ** 移除 nodeList 监听
     * */

  }, {
    key: "removeNodelistWatcher",
    value: function removeNodelistWatcher(nodeList) {
      var _this4 = this;

      nodeList.forEach(function (node) {
        _this4.observer.unobserve(node);

        _this4.entryModuleMap["delete"](node);

        _this4.outModuleMap["delete"](node);

        _this4.watchedModuleSet["delete"](node);
      });
    }
    /*
     ** 重置 nodeList.
     ** 可能调用改函数的情形: 通过 JS 动态添加了需要监听的元素(模块)
     * */

  }, {
    key: "refreshNodeList",
    value: function refreshNodeList() {
      var _this5 = this;

      this.clear();
      this.nodeList.forEach(function (node) {
        _this5.observer.unobserve(node);
      }); // 重新绑定监听器

      this.nodeList = _toConsumableArray(document.querySelectorAll('[data-mfw-watch-item]'));
      this.nodeList.forEach(function (node) {
        _this5.observer.observe(node);
      });
    }
    /*
     ** 重置 Watcher 到初始状态
     * */

  }, {
    key: "refreshWatcher",
    value: function refreshWatcher() {
      var _this6 = this;

      this.clear();
      this.nodeList.forEach(function (node) {
        _this6.observer.unobserve(node);
      }); // 重新 observe

      this.nodeList.forEach(function (node) {
        _this6.observer.observe(node);
      });
    }
    /*
     ** 销毁生成的 IoWatcher 实例
     * */

  }, {
    key: "destroy",
    value: function destroy() {
      this.clear();
      this.observer.disconnect();
    }
  }, {
    key: "clear",
    value: function clear() {
      var entryModuleMap = this.entryModuleMap,
          outModuleMap = this.outModuleMap,
          watchedModuleSet = this.watchedModuleSet;
      entryModuleMap.clear();
      outModuleMap.clear();
      watchedModuleSet.clear();
    }
  }]);

  return IoWatcher;
}();

function getQueryEntries() {
  var query = window.location.search.substr(1);
  var entries = {};

  if (query.length) {
    for (var i = 0, arr = query.split('&'); i < arr.length; i += 1) {
      var item = arr[i].split('=');

      try {
        var key = decodeURIComponent(item[0]);
        var val = item.length > 1 ? decodeURIComponent(item[1]) : '';
        entries[key] = val;
      } catch (error) {}
    }
  }

  return entries;
}

var _location = {
  query: {
    has: function has(key) {
      return key in getQueryEntries();
    },
    get: function get(key) {
      return getQueryEntries()[key];
    },
    entries: function entries() {
      return getQueryEntries();
    }
  }
};

// https://github.com/faisalman/ua-parser-js
var getUa = function getUa() {
  return window.navigator.userAgent.toLowerCase();
};

console.log(123);

function isApp() {
  var ua = getUa();
  return ua && /mfwappcode/.test(ua);
}

function isIos() {
  var ua = getUa();
  var isIos = ua && /iphone|ipad|ipod|ios/.test(ua);
  var _window = window,
      MFWAPP = _window.MFWAPP;

  if (MFWAPP && MFWAPP.sdk && MFWAPP.sdk.has && MFWAPP.sdk.has('isiOS')) {
    isIos = !!MFWAPP.sdk.isiOS;
  }

  return isIos;
}

function isAndroid() {
  var ua = getUa();
  var isAndroid = ua && /android/.test(ua);
  var _window2 = window,
      MFWAPP = _window2.MFWAPP;

  if (MFWAPP && MFWAPP.sdk && MFWAPP.sdk.has && MFWAPP.sdk.has('isAndroid')) {
    isAndroid = !!MFWAPP.sdk.isAndroid;
  }

  return isAndroid;
}

function isWx() {
  var ua = getUa();
  return ua && /micromessenger/.test(ua);
}

function isWxMiniProgram() {
  var _window3 = window,
      wx = _window3.wx;
  return new Promise(function (resolve) {
    if (!isWx()) {
      resolve(false);
    } else if (wx && wx.miniProgram && wx.miniProgram.getEnv) {
      wx.miniProgram.getEnv(function (res) {
        if (res.miniprogram) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
    } else {
      resolve(false);
    }
  });
}

function getOS() {
  if (isIos()) return 'ios';
  if (isAndroid()) return 'android';
  return 'unknown';
}

var env = {
  isApp: isApp,
  isIos: isIos,
  isAndroid: isAndroid,
  isWx: isWx,
  isWxMiniProgram: isWxMiniProgram,
  getOS: getOS
};

function loadJs() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var body = document.body || document.getElementsByTagName('body')[0];
  var script = document.createElement('script');
  script.src = opts.src;
  script.type = opts.type || 'text/javascript';
  opts.async && (script.async = true);
  opts.defer && (script.defer = true);
  opts.crossOrigin && (script.crossOrigin = opts.crossOrigin);
  return new Promise(function (resolve, reject) {
    script.onload = function () {
      resolve();
    };

    script.onerror = function (err) {
      reject(err);
    };

    body.appendChild(script); // let currentScripts = [].slice.call(document.scripts);
    // currentScripts = currentScripts.filter(el => el.src !== '').map(el => el.src);
    // if (currentScripts.indexOf(opts.src) > -1) {
    //   reject(new Error('页面引用js重复'));
    // } else {
    //   body.appendChild(script);
    // }
  });
}

function loadCss() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var head = document.getElementsByTagName('head')[0];
  var link = document.createElement('link');
  link.href = opts.href;
  link.type = opts.type || 'text/css';
  link.rel = opts.rel || 'stylesheet';
  opts.crossOrigin && (link.crossOrigin = opts.crossOrigin);
  opts.prefetch && (link.prefetch = true);
  return new Promise(function (resolve, reject) {
    link.onload = function () {
      resolve();
    };

    link.onerror = function (err) {
      reject(err);
    };

    head.appendChild(link); // let currentLinks = [].slice.call(document.getElementsByTagName('link'));
    // currentLinks = currentLinks.filter(el => el.href !== '').map(el => el.href);
    // if (currentLinks.indexOf(link.href) > -1) {
    //   reject(new Error('页面引用css重复'));
    // } else {
    //   head.appendChild(link);
    // }
  });
}

var loadResource = {
  loadJs: loadJs,
  loadCss: loadCss
};

var performanceObj = window.performance || window.msPerformance || window.webkitPerformance;

function now() {
  if (performanceObj && performanceObj.now) {
    return performanceObj.now();
  }

  return Date.now();
}

var performance = {
  performanceObj: performanceObj,
  now: now
};

export { IoWatcher, env, loadResource, _location as location, performance };
