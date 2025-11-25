



import React, { useState } from 'react';
import { X, RefreshCcw, Type, Layout, PaintBucket, Scaling } from 'lucide-react';
import { SectionStyle } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  sectionId: string;
  currentStyle: SectionStyle;
  onSave: (id: string, style: SectionStyle) => void;
}

export const StyleEditorModal: React.FC<Props> = ({ isOpen, onClose, sectionId, currentStyle, onSave }) => {
  if (!isOpen) return null;
  
  const [activeTab, setActiveTab] = useState<'text' | 'bg' | 'border' | 'layout'>('text');

  const handleReset = () => {
    onSave(sectionId, {});
  };

  const updateStyle = (key: keyof SectionStyle, value: any) => {
    onSave(sectionId, { ...currentStyle, [key]: value });
  };

  const tabs = [
      { id: 'text', label: 'Text', icon: <Type size={16}/> },
      { id: 'bg', label: 'Background', icon: <PaintBucket size={16}/> },
      { id: 'border', label: 'Lines & Borders', icon: <Scaling size={16}/> },
      { id: 'layout', label: 'Spacing', icon: <Layout size={16}/> },
  ];

  return (
    // Updated overlay opacity to be much lighter (bg-black/10) so user can see changes
    <div className="fixed inset-0 bg-black/10 backdrop-blur-[1px] z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-96 overflow-hidden animate-enter flex flex-col max-h-[90vh] border border-gray-200">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b bg-gray-50">
          <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide">Customize Element</h3>
          <div className="flex gap-2">
             <button onClick={handleReset} title="Reset to Default" className="text-gray-400 hover:text-blue-600 transition-colors p-1"><RefreshCcw size={16}/></button>
             <button onClick={onClose} className="text-gray-400 hover:text-red-600 transition-colors p-1"><X size={18}/></button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-white border-b overflow-x-auto">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 py-3 px-2 flex items-center justify-center gap-2 text-xs font-bold transition-colors border-b-2 ${
                        activeTab === tab.id 
                        ? 'border-blue-600 text-blue-600 bg-blue-50' 
                        : 'border-transparent text-gray-500 hover:bg-gray-50'
                    }`}
                >
                    {tab.icon} {tab.label}
                </button>
            ))}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
          
          {/* --- TEXT TAB --- */}
          {activeTab === 'text' && (
             <div className="space-y-4">
                 <div className="grid grid-cols-2 gap-3">
                    {/* Body Color */}
                    <div>
                        <label className="text-xs font-bold text-gray-700 block mb-2">Body Color</label>
                        <div className="flex items-center gap-2">
                            <input 
                                type="color" 
                                value={currentStyle.color || '#000000'} 
                                onChange={(e) => updateStyle('color', e.target.value)}
                                className="h-9 w-full border rounded cursor-pointer"
                            />
                            <button onClick={() => updateStyle('color', undefined)} className="text-[10px] text-red-500 hover:underline">Clear</button>
                        </div>
                    </div>

                    {/* Heading Color Override */}
                    <div>
                        <label className="text-xs font-bold text-gray-700 block mb-2">Heading Color</label>
                        <div className="flex items-center gap-2">
                            <input 
                                type="color" 
                                value={currentStyle.headingColor || '#000000'} 
                                onChange={(e) => updateStyle('headingColor', e.target.value)}
                                className="h-9 w-full border rounded cursor-pointer"
                            />
                            <button onClick={() => updateStyle('headingColor', undefined)} className="text-[10px] text-red-500 hover:underline">Clear</button>
                        </div>
                    </div>
                 </div>

                 <div>
                    <label className="text-xs font-bold text-gray-700 block mb-2">Alignment</label>
                    <div className="flex border rounded overflow-hidden">
                        {['left', 'center', 'right', 'justify'].map((align) => (
                            <button
                                key={align}
                                onClick={() => updateStyle('textAlign', align)}
                                className={`flex-1 py-2 text-xs capitalize ${currentStyle.textAlign === align ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                            >
                                {align}
                            </button>
                        ))}
                    </div>
                 </div>

                 <div>
                    <label className="text-xs font-bold text-gray-700 flex justify-between mb-2">
                        <span>Font Size Scale</span>
                        <span>{currentStyle.fontSize || 1}x</span>
                    </label>
                    <input 
                        type="range" min="0.5" max="2.5" step="0.1"
                        value={currentStyle.fontSize || 1}
                        onChange={(e) => updateStyle('fontSize', parseFloat(e.target.value))}
                        className="w-full accent-blue-600"
                    />
                 </div>

                 <div>
                     <label className="text-xs font-bold text-gray-700 block mb-2">Font Weight</label>
                     <div className="flex gap-2">
                         {['light', 'normal', 'bold'].map(w => (
                             <button
                                key={w}
                                onClick={() => updateStyle('fontWeight', w)}
                                className={`flex-1 py-1 rounded text-xs border capitalize ${currentStyle.fontWeight === w ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200'}`}
                             >
                                 {w}
                             </button>
                         ))}
                     </div>
                 </div>
             </div>
          )}

          {/* --- BACKGROUND TAB --- */}
          {activeTab === 'bg' && (
              <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-2">Background Color</label>
                    <div className="flex items-center gap-2">
                        <input 
                            type="color" 
                            value={currentStyle.backgroundColor || '#ffffff'} 
                            onChange={(e) => updateStyle('backgroundColor', e.target.value)}
                            className="h-10 w-full border rounded cursor-pointer"
                        />
                        <button onClick={() => updateStyle('backgroundColor', undefined)} className="text-xs text-red-500 hover:underline">Clear</button>
                    </div>
                 </div>
                 <div className="p-3 bg-gray-50 rounded text-xs text-gray-500">
                     Tip: You can set transparent backgrounds by clearing the color.
                 </div>
              </div>
          )}

          {/* --- BORDER & LINES TAB --- */}
          {activeTab === 'border' && (
              <div className="space-y-6">
                 {/* Box Border */}
                 <div className="space-y-3 pb-4 border-b">
                    <h4 className="font-bold text-sm text-gray-900">Container Border</h4>
                    <div className="grid grid-cols-2 gap-3">
                         <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase">Width (px)</label>
                            <input 
                                type="number" min="0" max="20"
                                value={currentStyle.borderWidth || 0}
                                onChange={(e) => updateStyle('borderWidth', parseInt(e.target.value))}
                                className="w-full border rounded p-1 text-sm mt-1"
                            />
                         </div>
                         <div>
                             <label className="text-[10px] font-bold text-gray-500 uppercase">Radius (px)</label>
                             <input 
                                type="number" min="0" max="100"
                                value={currentStyle.borderRadius || 0}
                                onChange={(e) => updateStyle('borderRadius', parseInt(e.target.value))}
                                className="w-full border rounded p-1 text-sm mt-1"
                            />
                         </div>
                    </div>
                    
                    <div>
                         <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Style</label>
                         <div className="flex gap-1">
                             {['solid', 'dashed', 'dotted', 'none'].map(s => (
                                 <button 
                                    key={s} 
                                    onClick={() => updateStyle('borderStyle', s)}
                                    className={`flex-1 text-[10px] py-1 border rounded capitalize ${currentStyle.borderStyle === s ? 'bg-blue-100 border-blue-500 text-blue-700' : 'bg-white'}`}
                                 >
                                     {s}
                                 </button>
                             ))}
                         </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Color</label>
                        <input 
                            type="color" 
                            value={currentStyle.borderColor || '#e5e7eb'} 
                            onChange={(e) => updateStyle('borderColor', e.target.value)}
                            className="h-8 w-full border rounded cursor-pointer"
                        />
                    </div>
                 </div>

                 {/* Separator / Decoration Lines */}
                 <div className="space-y-3">
                    <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                        Inner Lines / Steppers
                        <span className="text-[10px] bg-yellow-100 text-yellow-800 px-1 rounded">Timeline</span>
                    </h4>
                    
                    <div>
                        <label className="text-xs font-bold text-gray-700 flex justify-between mb-1">
                            <span>Line Thickness</span>
                            <span>{currentStyle.lineWidth || 0}px</span>
                        </label>
                        <input 
                            type="range" min="0" max="10" 
                            value={currentStyle.lineWidth ?? 2} 
                            onChange={(e) => updateStyle('lineWidth', parseInt(e.target.value))}
                            className="w-full accent-blue-600"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">Line / Progress Color</label>
                         <div className="flex items-center gap-2">
                            <input 
                                type="color" 
                                value={currentStyle.lineColor || '#000000'} 
                                onChange={(e) => updateStyle('lineColor', e.target.value)}
                                className="h-8 w-full border rounded cursor-pointer"
                            />
                            <button onClick={() => updateStyle('lineColor', undefined)} className="text-xs text-red-500 hover:underline">Clear</button>
                         </div>
                         <p className="text-[10px] text-gray-500 mt-1">Controls sidebar lines and skill bars</p>
                    </div>
                 </div>
              </div>
          )}

          {/* --- LAYOUT TAB --- */}
          {activeTab === 'layout' && (
              <div className="space-y-4">
                  <div>
                      <label className="text-xs font-bold text-gray-700 flex justify-between mb-1">
                          <span>Internal Padding</span>
                          <span>{currentStyle.padding || 0}px</span>
                      </label>
                      <input 
                          type="range" min="0" max="60" 
                          value={currentStyle.padding || 0} 
                          onChange={(e) => updateStyle('padding', parseInt(e.target.value))}
                          className="w-full accent-blue-600"
                      />
                  </div>

                  <div>
                      <label className="text-xs font-bold text-gray-700 flex justify-between mb-1">
                          <span>Item Spacing (Margin Bottom)</span>
                          <span>{currentStyle.marginBottom || 0}px</span>
                      </label>
                      <input 
                          type="range" min="0" max="60" 
                          value={currentStyle.marginBottom || 0} 
                          onChange={(e) => updateStyle('marginBottom', parseInt(e.target.value))}
                          className="w-full accent-blue-600"
                      />
                  </div>
              </div>
          )}

        </div>
        
        <div className="p-3 border-t bg-gray-50 text-[10px] text-gray-500 text-center">
            Changes apply in real-time
        </div>
      </div>
    </div>
  );
};