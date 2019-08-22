// https://github.com/faisalman/ua-parser-js
const getUa = () => window.navigator.userAgent.toLowerCase();

console.log(123)

function isApp() {
  const ua = getUa();
  return (ua && /mfwappcode/.test(ua));
}

function isIos() {
  const ua = getUa();
  let isIos = (ua && /iphone|ipad|ipod|ios/.test(ua));
  const { MFWAPP } = window;
  if (MFWAPP && MFWAPP.sdk && MFWAPP.sdk.has && MFWAPP.sdk.has('isiOS')) {
    isIos = !!MFWAPP.sdk.isiOS;
  }
  return isIos;
}

function isAndroid() {
  const ua = getUa();
  let isAndroid = (ua && /android/.test(ua));
  const { MFWAPP } = window;
  if (MFWAPP && MFWAPP.sdk && MFWAPP.sdk.has && MFWAPP.sdk.has('isAndroid')) {
    isAndroid = !!MFWAPP.sdk.isAndroid;
  }
  return isAndroid;
}

function isWx() {
  const ua = getUa();
  return (ua && /micromessenger/.test(ua));
}

function isWxMiniProgram() {
  const { wx } = window;
  return new Promise(resolve => {
    if (!isWx()) {
      resolve(false);
    } else if (wx && wx.miniProgram && wx.miniProgram.getEnv) {
      wx.miniProgram.getEnv(res => {
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

const env = {
  isApp,
  isIos,
  isAndroid,
  isWx,
  isWxMiniProgram,
  getOS,
};

export default env;
export { env };
