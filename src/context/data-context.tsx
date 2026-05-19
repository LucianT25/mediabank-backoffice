"use client";

import React, { createContext, useContext } from "react";
import { Reseller } from '@/interfaces/reseller.interface';

interface DataContextType {
  reseller: Reseller;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children, data }: { children: React.ReactNode; data: any }) {
  return <DataContext.Provider value={{ ...data }}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used within a DataProvider");
  return context;
}
