/**
 * Custom node component for ReactFlow
 * Renders state machine nodes with beautiful styling
 */

import { Handle, NodeProps, Position } from 'reactflow';
import { memo } from 'react';

export interface CustomNodeData {
  label: string;
  type: string;
  description: string;
  isFinal: boolean;
  isInitial: boolean;
  functions?: string[];
}

/**
 * Custom node component with type-specific styling
 */
export const CustomNode = memo(({ data, targetPosition = Position.Top, sourcePosition = Position.Bottom }: NodeProps<CustomNodeData>) => {
  const nodeStyles = getNodeStyles(data);
  
  return (
    <>
      <Handle
        type="target"
        position={targetPosition}
        className="!bg-gray-500"
      />
      
      <div className={nodeStyles.container}>
        {data.isInitial && (
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
            <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
              START
            </span>
          </div>
        )}
        
        <div className={nodeStyles.header}>
          <h3 className="font-semibold text-sm truncate">
            {data.label}
          </h3>
          <span className={nodeStyles.typeBadge}>
            {data.type}
          </span>
        </div>
        
        <div className="px-3 pb-2">
          <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
            {data.description}
          </p>
          
          {data.functions && data.functions.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {data.functions.slice(0, 2).map((fn, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-1.5 py-0.5 rounded"
                  title={fn}
                >
                  {formatFunctionName(fn)}
                </span>
              ))}
              {data.functions.length > 2 && (
                <span className="text-xs text-gray-500">
                  +{data.functions.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
        
        {data.isFinal && (
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
            <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
              END
            </span>
          </div>
        )}
      </div>
      
      <Handle
        type="source"
        position={sourcePosition}
        className="!bg-gray-500"
      />
    </>
  );
});

CustomNode.displayName = 'CustomNode';

function getNodeStyles(data: CustomNodeData): {
  container: string;
  header: string;
  typeBadge: string;
} {
  const baseContainer = `
    bg-white dark:bg-gray-800 
    border-2 rounded-lg shadow-lg
    min-w-[200px] max-w-[250px]
    transition-all duration-200
    hover:shadow-xl hover:scale-[1.02]
    cursor-pointer
  `;
  
  const baseHeader = `
    flex items-center justify-between 
    px-3 py-2 rounded-t-md
  `;
  
  const baseBadge = `
    text-xs px-1.5 py-0.5 rounded-full
    font-medium uppercase
  `;
  
  if (data.isFinal) {
    return {
      container: `${baseContainer} border-red-400 dark:border-red-600`,
      header: `${baseHeader} bg-red-50 dark:bg-red-950 border-b border-red-200 dark:border-red-800`,
      typeBadge: `${baseBadge} bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200`,
    };
  }
  
  if (data.isInitial) {
    return {
      container: `${baseContainer} border-green-400 dark:border-green-600`,
      header: `${baseHeader} bg-green-50 dark:bg-green-950 border-b border-green-200 dark:border-green-800`,
      typeBadge: `${baseBadge} bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200`,
    };
  }
  
  switch (data.type) {
    case 'decision':
      return {
        container: `${baseContainer} border-yellow-400 dark:border-yellow-600`,
        header: `${baseHeader} bg-yellow-50 dark:bg-yellow-950 border-b border-yellow-200 dark:border-yellow-800`,
        typeBadge: `${baseBadge} bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200`,
      };
    case 'process':
      return {
        container: `${baseContainer} border-blue-400 dark:border-blue-600`,
        header: `${baseHeader} bg-blue-50 dark:bg-blue-950 border-b border-blue-200 dark:border-blue-800`,
        typeBadge: `${baseBadge} bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200`,
      };
    default:
      return {
        container: `${baseContainer} border-gray-300 dark:border-gray-600`,
        header: `${baseHeader} bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700`,
        typeBadge: `${baseBadge} bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200`,
      };
  }
}

function formatFunctionName(name: string): string {
  return name.length > 20 ? `${name.slice(0, 20)}...` : name;
}
