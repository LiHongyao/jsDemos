/*
 * @Author: Lee
 * @Date: 2023-08-19 09:49:14
 * @LastEditors: Lee
 * @LastEditTime: 2023-08-19 09:49:17
 * @Description: 
 */
/**
 * 并发控制
 * @param {*} limit 最大并发数
 */
function limitFn(limit) {
  const queue = []; // 存储待执行的任务
  let activeCount = 0; // 当前正在执行的任务数量

  const next = () => {
    activeCount--;

    if (queue.length > 0) {
      queue.shift()();
    }
  };

  const run = async (fn, resolve, ...args) => {
    activeCount++;

    const result = (async () => fn(...args))();

    try {
      const res = await result;
      resolve(res);
    } catch {}

    next();
  };

  const enqueue = (fn, resolve, ...args) => {
    queue.push(run.bind(null, fn, resolve, ...args));

    if (activeCount < limit && queue.length > 0) {
      queue.shift()();
    }
  };

  const generator = (fn, ...args) =>
    new Promise((resolve) => {
      enqueue(fn, resolve, ...args);
    });

  return generator;
}
