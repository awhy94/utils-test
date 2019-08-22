import axios from 'axios';

let cachedUser = null;
let promise = null;

/**
 * 获取登录用户数据
 * @param {boolean} isForce 是否强制获取
 */
export default function getUser(isForce) {
  if (!isForce && cachedUser !== null) {
    return Promise.resolve(cachedUser);
  }
  if (isForce || !promise) {
    promise = new Promise((resolve, reject) => {
      axios.get('/hservice/api/user_common/status', {
        timeout: 10000,
      }).then(rsp => {
        if (rsp && rsp.data && rsp.data.data) {
          cachedUser = {
            uid: Number(rsp.data.data.uid) || 0,
            isBindMobile: !!rsp.data.data.is_bind_mobile,
            extra: rsp.data.data.extra || {},
          };
          resolve(cachedUser);
        } else {
          reject();
        }
      }).catch(error => {
        reject();
      });
    });
  }
  return promise;
}

export { getUser };
