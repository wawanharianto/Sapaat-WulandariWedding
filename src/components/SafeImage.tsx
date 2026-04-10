import React, { useState, useEffect } from 'react';
import { motion, HTMLMotionProps } from 'motion/react';

interface SafeImageProps extends HTMLMotionProps<"img"> {
  src: string;
  alt: string;
  className?: string;
  referrerPolicy?: React.HTMLAttributeReferrerPolicy;
}

export const SafeImage = ({ 
  src, 
  alt, 
  className, 
  referrerPolicy = "no-referrer",
  ...motionProps
}: SafeImageProps) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const handleError = () => {
    if (retryCount < maxRetries) {
      setTimeout(() => {
        const separator = src.includes('?') ? '&' : '?';
        setImgSrc(`${src}${separator}retry=${retryCount + 1}`);
        setRetryCount(prev => prev + 1);
      }, 2000);
    }
  };

  useEffect(() => {
    setImgSrc(src);
    setRetryCount(0);
  }, [src]);

  return (
    <motion.img
      {...motionProps}
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
      referrerPolicy={referrerPolicy}
    />
  );
};

export default React.memo(SafeImage);
