import { useEffect, useState } from 'react';

export const useScript = (url: string, name: string) => {
  const [lib, setLib] = useState({});

  useEffect(() => {
    const script = document.createElement('script');

    script.src = url;
    script.async = true;
    // @ts-ignore
    script.onload = () => setLib({ [name]: window[name] });

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [name, url]);

  return lib;
};
