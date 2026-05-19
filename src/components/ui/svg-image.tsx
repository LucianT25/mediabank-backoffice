import { useState, useEffect } from "react";
import Image from 'next/image';

export const SvgImage = ({ svgString, className }: { svgString: string, className?: string }) => {
    const [imgSrc, setImgSrc] = useState("");
  
    useEffect(() => {
      const blob = new Blob([svgString], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      setImgSrc(url);
  
      return () => URL.revokeObjectURL(url);
    }, [svgString]);
  
    return imgSrc ? <Image src={imgSrc} alt="SVG" fill className={className} /> : '';
  };