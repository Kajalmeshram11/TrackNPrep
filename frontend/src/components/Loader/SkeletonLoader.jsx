 import React from "react";
 
 const SkeletonLoader = () => {
   return (
    
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Title skeleton */}
      <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4"></div>
      {/* Text paragraphs */}
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-4/5"></div>
      </div>

      {/* Code block skeleton */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-3 w-12 bg-gray-200 rounded animate-pulse"></div>
          </div>
         <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="space-y-1">
          <div className="h-3 bg-gray-200 rounded animate-pulse w-full"></div>
         <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded animate-pulse w-5/6"></div>
          <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
        </div>
      </div>

      {/* More text */}
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-4/5"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
      </div>
  </div>
   );
 };
 
 export default SkeletonLoader;