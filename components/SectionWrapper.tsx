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
  const cssVariables = {
      '--sec-line-color': styles?.lineColor, 
      '--sec-line-width': styles?.lineWidth !== undefined ? `${styles.lineWidth}px` : undefined,
      '--sec-margin-bottom': styles?.marginBottom !== undefined ? `${styles.marginBottom}px` : undefined,
      '--sec-heading-color': styles?.headingColor,
      '--item-bg': styles?.itemBackgroundColor, 
      '--item-text': styles?.itemTextColor,
  } as React.CSSProperties;

  // Combine defaults with custom styles strictly
  // We use conditional spreading to ensure defaults persist if custom style is undefined
  const combinedStyle: React.CSSProperties = {
    ...defaultStyles,
    ...cssVariables,
    
    // Only override default if custom style is explicitly defined
    ...(styles?.backgroundColor ? { backgroundColor: styles.backgroundColor } : {}),
    ...(styles?.color ? { color: styles.color } : {}),
    ...(styles?.borderColor ? { borderColor: styles.borderColor } : {}),
    
    // Numeric values need checks for undefined, as 0 is a valid value
    ...(styles?.borderWidth !== undefined ? { borderWidth: `${styles.borderWidth}px` } : {}),
    ...(styles?.borderRadius !== undefined ? { borderRadius: `${styles.borderRadius}px` } : {}),
    
    ...(styles?.borderStyle ? { borderStyle: styles.borderStyle } : (styles?.borderWidth ? { borderStyle: 'solid' } : {})),
    
    ...(styles?.padding !== undefined ? { padding: `${styles.padding}px` } : {}),
    
    ...(styles?.fontSize ? { fontSize: `${styles.fontSize}em` } : {}),
    ...(styles?.fontWeight ? { fontWeight: styles.fontWeight } : {}),
    ...(styles?.textAlign ? { textAlign: styles.textAlign } : {}),
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