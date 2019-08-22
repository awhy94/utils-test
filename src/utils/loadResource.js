function loadJs(opts = {}) {
  const body = document.body || document.getElementsByTagName('body')[0];
  const script = document.createElement('script');

  script.src = opts.src;
  script.type = opts.type || 'text/javascript';
  opts.async && (script.async = true);
  opts.defer && (script.defer = true);
  opts.crossOrigin && (script.crossOrigin = opts.crossOrigin);

  return new Promise((resolve, reject) => {
    script.onload = () => {
      resolve();
    };
    script.onerror = err => {
      reject(err);
    };
    body.appendChild(script);
    // let currentScripts = [].slice.call(document.scripts);
    // currentScripts = currentScripts.filter(el => el.src !== '').map(el => el.src);
    // if (currentScripts.indexOf(opts.src) > -1) {
    //   reject(new Error('页面引用js重复'));
    // } else {
    //   body.appendChild(script);
    // }
  });
}

function loadCss(opts = {}) {
  const head = document.getElementsByTagName('head')[0];
  const link = document.createElement('link');

  link.href = opts.href;
  link.type = opts.type || 'text/css';
  link.rel = opts.rel || 'stylesheet';
  opts.crossOrigin && (link.crossOrigin = opts.crossOrigin);
  opts.prefetch && (link.prefetch = true);

  return new Promise((resolve, reject) => {
    link.onload = () => {
      resolve();
    };
    link.onerror = err => {
      reject(err);
    };
    head.appendChild(link);
    // let currentLinks = [].slice.call(document.getElementsByTagName('link'));
    // currentLinks = currentLinks.filter(el => el.href !== '').map(el => el.href);
    // if (currentLinks.indexOf(link.href) > -1) {
    //   reject(new Error('页面引用css重复'));
    // } else {
    //   head.appendChild(link);
    // }
  });
}

const loadResource = {
  loadJs,
  loadCss,
};

export default loadResource;
export { loadResource };
