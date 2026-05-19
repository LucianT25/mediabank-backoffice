"use client"

import dynamic from "next/dynamic";
import React from 'react';
import catLoader from 'p/cat_loader.json';
import {clsx} from "clsx";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export const SplashPage = ({className}: {className?: string}) => {
  return (
    <div className={clsx("flex h-screen w-full flex-col items-center justify-center bg-white", className)}>
        <Lottie className="w-[30%]" animationData={catLoader} loop={true} />
        <div className="text-2xl font-bold text-primary">Mediabank</div>
    </div>
  );
};
