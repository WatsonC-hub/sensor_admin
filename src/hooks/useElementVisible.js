import { useRef, useEffect, useState } from "react";

export default function useElementVisible(options) {
  const containerRef = useRef(null);
  const [isTabVisible, setIsTabVisible] = useState(false);

  const callbackFunction = (entries) => {
    const [entry] = entries;
    setIsTabVisible(entry.isIntersecting);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(callbackFunction, options);
    if (containerRef.current) observer.observe(containerRef.current);

    return () => {
      if (containerRef.current) observer.unobserve(containerRef.current);
    };
  }, [containerRef, options]);

  return [containerRef, isTabVisible];
}
