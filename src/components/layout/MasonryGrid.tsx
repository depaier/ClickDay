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
  default: 3,
  1100: 3,
  700: 2,
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
