"use client";

import React from "react";
import Masonry from "react-masonry-css";

interface MasonryGridProps {
  children: React.ReactNode;
  breakpointCols?: {
    default: number;
    [key: number]: number;
  };
}

const defaultBreakpoints = {
  default: 5,
  1600: 4,
  1200: 3,
  800: 2,
  500: 1
};

export function MasonryGrid({ 
  children, 
  breakpointCols = defaultBreakpoints 
}: MasonryGridProps) {
  return (
    <Masonry
      breakpointCols={breakpointCols}
      className="flex w-auto -ml-6"
      columnClassName="pl-6 bg-clip-padding"
    >
      {children}
    </Masonry>
  );
}
