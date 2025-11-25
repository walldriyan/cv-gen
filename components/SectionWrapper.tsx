

import React from 'react';
import { Settings } from 'lucide-react';
import { SectionStyle } from '../types';

interface Props {
  sectionId: string;
  children: React.ReactNode;
  styles?: SectionStyle;
  isEditing: boolean;
  onEdit: (id: string) => void;
  className?: string;
  defaultStyles?: React.CSSProperties;
}

export const SectionWrapper: React.FC<Props> = ({ 
  sectionId, 
  children, 
  styles, 
  isEditing, 
  onEdit, 
  className = '', 
  defaultStyles = {} 
}) => {
  
  // Construct CSS Variables for children to consume
  // Uses specific style if available, otherwise falls back to the CSS variable provided by parent (Global)
  const cssVariables = {
      '--sec-line-color': styles?.lineColor, // If undefined, will fallback to var(--global-line-color) in usage
      '--sec-line-width': styles?.lineWidth !== undefined ? `${styles.lineWidth}px` : undefined,
      '--sec-margin-bottom': styles?.marginBottom !== undefined ? `${styles.marginBottom}px` : undefined,
      '--sec-heading-color': styles?.headingColor,
  } as React.CSSProperties;

  // Combine defaults with custom styles
  const combinedStyle: React.CSSProperties = {
    ...defaultStyles,
    backgroundColor: styles?.backgroundColor,
    color: styles?.color,
    
    // Border
    borderColor: styles?.borderColor, // If undefined, usually no border unless specified in class
    borderWidth: styles?.borderWidth !== undefined ? `${styles.borderWidth}px` : undefined,
    borderRadius: styles?.borderRadius !== undefined ? `${styles.borderRadius}px` : undefined,
    borderStyle: styles?.borderStyle || (styles?.borderWidth ? 'solid' : undefined),
    
    // Layout
    padding: styles?.padding !== undefined ? `${styles.padding}px` : undefined,
    
    // Typography
    // Apply font scale to the section specifically if provided
    fontSize: styles?.fontSize ? `${styles.fontSize}em` : undefined,
    fontWeight: styles?.fontWeight,
    textAlign: styles?.textAlign,

    ...cssVariables
  };

  return (
    <div 
      className={`relative group transition-all duration-200 ${className}`} 
      style={combinedStyle}
    >
      {/* Edit Button Overlay */}
      {isEditing && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(sectionId);
          }}
          className="absolute -top-3 -right-3 z-20 bg-gray-900 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-black no-print flex items-center justify-center"
          title="Customize Section"
        >
          <Settings size={14} />
        </button>
      )}
      
      {/* Outline on hover to show editable area */}
      {isEditing && (
        <div className="absolute inset-0 border-2 border-dashed border-blue-400 opacity-0 group-hover:opacity-30 pointer-events-none rounded-lg no-print z-10"></div>
      )}

      {children}
    </div>
  );
};