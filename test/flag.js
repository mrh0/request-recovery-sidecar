let flag = 0;

module.exports = {capture: () => ++flag, reset: () => flag = 0, get: () => flag}