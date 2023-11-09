const fetchFn = (delay, index) => {
  return new Promise((resolve) => {
    console.log(index);
    setTimeout(() => {
      resolve(index);
    }, delay);
  });
};

const generator = limitFn(2);
const promises = [
  generator(() => fetchFn(1000, 1)),
  generator(() => fetchFn(1000, 2)),
  generator(() => fetchFn(1000, 3)),
  generator(() => fetchFn(1000, 4)),
  generator(() => fetchFn(1000, 5)),
  generator(() => fetchFn(1000, 6)),
];

Promise.all(promises).then((res) => {
  console.log(res);
});
