import { useEffect, useRef, useState } from 'react';

function useInterval(callback, delay) {
  const time = useRef(null);

  // 每次渲染后， 保存新的执行函数到ref中
  useEffect(() => {
    time.current = callback;
  });

  useEffect(() => {
    let timer = null;
    if (delay !== null) {
      timer = setInterval(() => {
        // 每次执行时，调用新的执行函数
        time.current();
      }, delay);
    }

    return () => {
      timer && clearInterval(timer);
      timer = null;
    };
  }, [delay]);
}

export default useInterval;
