function getQueryEntries() {
  const query =    window.location.search.substr(1);
  const entries = {};
  if (query.length) {
    for (let i = 0, arr = query.split('&'); i < arr.length; i += 1) {
      const item = arr[i].split('=');
      try {
        const key = decodeURIComponent(item[0]);
        const val = item.length > 1 ? decodeURIComponent(item[1]) : '';
        entries[key] = val;
      } catch (error) {}
    }
  }
  return entries;
}

const _location = {
  query: {
    has(key) {
      return key in getQueryEntries();
    },
    get(key) {
      return getQueryEntries()[key];
    },
    entries() {
      return getQueryEntries();
    },
  },
};

export default _location;
export { _location as location };
