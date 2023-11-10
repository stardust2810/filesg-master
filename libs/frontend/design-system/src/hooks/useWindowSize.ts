import { useEffect, useState } from 'react';

const getSize = () => ({ width: window.innerWidth, height: window.innerHeight });

export const useWindowSize = () => {
  const [size, setSize] = useState(getSize());

  useEffect(() => {
    const onChangeHandler = () => {
      setSize(getSize());
    };

    window.addEventListener('resize', onChangeHandler);

    return () => {
      window.removeEventListener('resize', onChangeHandler);
    };
  }, []);

  return size;
};
