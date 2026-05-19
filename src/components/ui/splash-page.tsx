"use client"

import React from 'react';
import catLoader from 'p/cat_loader.json';
import {clsx} from "clsx";
import dynamic from 'next/dynamic';

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export const SplashPage = ({className}: {className?: string}) => {
  return (
    <div className={clsx("flex flex-col h-screen w-full items-center justify-center", className)}>
        <Lottie animationData={catLoader} loop={true} />
        <div className="text-2xl font-bold text-primary ">Please wait...</div>
    </div>
  );
};
