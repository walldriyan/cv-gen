
import React from 'react';
import { X } from 'lucide-react';
import { ImageStyle } from '../types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    imageStyle: ImageStyle;
    onSave: (style: ImageStyle) => void;
}

export const ImageSettingsModal: React.FC<Props> = ({ isOpen, onClose, imageStyle, onSave }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-80 p-6 animate-enter">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-900">Profile Image Style</h3>
                    <button onClick={onClose}><X size={18} className="text-gray-500 hover:text-gray-700"/></button>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Shape (Radius)</label>
                        <input 
                            type="range" min="0" max="50" 
                            value={imageStyle.borderRadius} 
                            onChange={(e) => onSave({...imageStyle, borderRadius: parseInt(e.target.value)})}
                            className="w-full accent-blue-600"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>Square (0%)</span>
                            <span>Circle (50%)</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Border Width</label>
                        <input 
                            type="range" min="0" max="10" 
                            value={imageStyle.borderWidth} 
                            onChange={(e) => onSave({...imageStyle, borderWidth: parseInt(e.target.value)})}
                            className="w-full accent-blue-600"
                        />
                        <div className="text-right text-xs text-gray-500">{imageStyle.borderWidth}px</div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Border Color</label>
                        <div className="flex gap-2">
                             <input 
                                type="color" 
                                value={imageStyle.borderColor} 
                                onChange={(e) => onSave({...imageStyle, borderColor: e.target.value})}
                                className="h-8 w-full border rounded cursor-pointer"
                             />
                        </div>
                    </div>
                </div>

                <div className="mt-6">
                    <button onClick={onClose} className="w-full bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700">Done</button>
                </div>
            </div>
        </div>
    );
};
