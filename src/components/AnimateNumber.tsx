import { useEffect, useState, useRef } from 'react';
import { animate } from 'motion/react';

interface AnimateNumberProps {
 value: number;
 duration?: number;
 formatter?: (val: number) => string;
}

export function AnimateNumber({ value, duration = 1.5, formatter }: AnimateNumberProps) {
 const [count, setCount] = useState(0);
 const countRef = useRef(0);

 useEffect(() => {
 const startValue = countRef.current;
 const controls = animate(startValue, value, {
 duration: startValue === 0 ? duration : 0.5, // Fast catchup on increments
 ease: 'easeOut',
 onUpdate: (latest) => {
 const rounded = Math.round(latest);
 setCount(rounded);
 countRef.current = rounded;
 },
 });

 return () => controls.stop();
 }, [value, duration]);

 return <span>{formatter ? formatter(count) : count.toLocaleString()}</span>;
}
