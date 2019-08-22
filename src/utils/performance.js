const performanceObj = window.performance || window.msPerformance || window.webkitPerformance;

function now() {
  if (performanceObj && performanceObj.now) {
    return performanceObj.now();
  }
  return Date.now();
}

const performance = {
  performanceObj,
  now,
};

export default performance;
export { performance };
