
import React, { useState, useRef, useEffect } from 'react';
import { CVData, AppConfig, DynamicTableData, TRANSLATIONS, ImageStyle } from './types';
import { TemplateRenderer } from './components/TemplateRenderer';
import { TableEditorModal } from './components/TableEditorModal';
import { ImageSettingsModal } from './components/ImageSettingsModal';
import { Download, Upload, Plus, Palette, Grid, Type, Bot, Settings, Menu, X, Save, FileJson, FileSpreadsheet, Globe, ZoomIn, ZoomOut, Maximize, Sliders, ChevronDown } from 'lucide-react';
import { improveText, suggestTemplateFromImage } from './services/geminiService';
import * as XLSX from 'xlsx';

const INITIAL_DATA: CVData = {
  personalInfo: {
    fullName: 'සමන් කුමාර',
    title: 'Software Engineer',
    email: 'saman@example.com',
    phone: '077-1234567',
    address: 'කොළඹ, ශ්‍රී ලංකාව',
    linkedin: 'linkedin.com/in/saman',
    summary: 'වසර 5ක අත්දැකීම් සහිත මෘදුකාංග ඉංජිනේරුවෙකි. React සහ Node.js පිළිබඳ විශේෂඥ දැනුමක් ඇත.',
    imageUrl: 'https://picsum.photos/200'
  },
  experience: [
    { id: '1', role: 'Senior Developer', company: 'Tech Corp', duration: '2020 - Present', description: 'කණ්ඩායම් මෙහෙයවීම සහ නව ව්‍යාපෘති සැලසුම් කිරීම.' }
  ],
  education: [
    { id: '1', degree: 'BSc in Computer Science', school: 'University of Colombo', year: '2019' }
  ],
  skills: [
    { id: '1', name: 'React', level: 5 },
    { id: '2', name: 'TypeScript', level: 4 }
  ],
  customTables: []
};

const FONTS = [
    { name: 'Modern (Inter)', value: 'Inter, sans-serif' },
    { name: 'Classic (Merriweather)', value: 'Merriweather, serif' },
    { name: 'Elegant (Playfair)', value: 'Playfair Display, serif' },
    { name: 'Roboto', value: 'Roboto, sans-serif' },
    { name: 'Open Sans', value: 'Open Sans, sans-serif' }
];

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#1f2937', '#ec4899', '#6366f1'];

const App: React.FC = () => {
  const [cvData, setCVData] = useState<CVData>(INITIAL_DATA);
  const [config, setConfig] = useState<AppConfig>({
    templateId: 'modern',
    colors: {
        primary: '#3b82f6',
        secondary: '#4b5563',
        text: '#111827',
        background: '#ffffff',
        heading: '#3b82f6'
    },
    fonts: {
        heading: 'Inter, sans-serif',
        body: 'Inter, sans-serif'
    },
    spacing: 2,
    borderRadius: 4,
    language: 'si'
  });
  
  const [isEditing, setIsEditing] = useState(true);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'design'>('details');
  const [designSubTab, setDesignSubTab] = useState<'basic' | 'advanced'>('basic');
  const [aiLoading, setAiLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  
  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [editingTableIndex, setEditingTableIndex] = useState<number | null>(null);

  // Scaling State
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const cvContentRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState(1);
  const [scaleMode, setScaleMode] = useState<'fit' | 'manual'>('fit');
  const [contentHeight, setContentHeight] = useState(1123);

  const t = TRANSLATIONS[config.language];

  // --- LOCAL STORAGE LOGIC ---
  useEffect(() => {
    // Load from LocalStorage on mount
    const savedData = localStorage.getItem('cv_builder_data');
    const savedConfig = localStorage.getItem('cv_builder_config');
    
    if (savedData) {
        try {
            setCVData(JSON.parse(savedData));
        } catch (e) { console.error("Error loading saved data", e); }
    }
    if (savedConfig) {
        try {
            setConfig(JSON.parse(savedConfig));
        } catch (e) { console.error("Error loading saved config", e); }
    }
    setDataLoaded(true);
  }, []);

  useEffect(() => {
      if (!dataLoaded) return;
      // Save to LocalStorage whenever changes happen
      localStorage.setItem('cv_builder_data', JSON.stringify(cvData));
      localStorage.setItem('cv_builder_config', JSON.stringify(config));
  }, [cvData, config, dataLoaded]);


  // Monitor Content Height for resizing
  useEffect(() => {
    if (!cvContentRef.current) return;
    const observer = new ResizeObserver(() => {
      if (cvContentRef.current) {
        const newHeight = cvContentRef.current.offsetHeight;
        setContentHeight(prev => {
            if (Math.abs(prev - newHeight) > 1) return newHeight;
            return prev;
        });
      }
    });
    observer.observe(cvContentRef.current);
    return () => observer.disconnect();
  }, [cvData, config]);

  // Handle PDF Download
  const handlePrint = () => {
    try {
        console.log("Starting PDF generation...");
        // Ensure the print engine is triggered
        if (window.matchMedia) {
            const mediaQueryList = window.matchMedia('print');
            mediaQueryList.addListener((mql) => {
                if (mql.matches) console.log('Print media active');
            });
        }
        window.print();
    } catch (e) {
        console.error("Print Error:", e);
        alert("There was an error generating the PDF. Please check the console (F12) for details.");
    }
  };

  // Handle JSON Import
  const handleJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if(json.personalInfo) setCVData(json);
        if(json.config) setConfig(json.config); // Restore config if exists
        alert(config.language === 'si' ? "දත්ත සාර්ථකව ඇතුලත් කරන ලදී!" : "Data loaded successfully!");
      } catch (err) {
        alert("JSON Error");
      }
    };
    reader.readAsText(file);
  };

  // Handle Excel Upload
  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
          try {
              const data = e.target?.result;
              const workbook = XLSX.read(data, { type: 'binary' });
              const sheetName = workbook.SheetNames[0];
              const sheet = workbook.Sheets[sheetName];
              const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as string[][];

              if(jsonData.length > 0) {
                  const headers = jsonData[0].map(h => String(h || '-'));
                  const rows = jsonData.slice(1).map(row => {
                       const filledRow = new Array(headers.length).fill('-');
                       row.forEach((cell, idx) => filledRow[idx] = String(cell || '-'));
                       return filledRow;
                  });

                  const newTable: DynamicTableData = {
                      id: Date.now().toString(),
                      title: file.name.replace('.xlsx', ''),
                      headers: headers,
                      rows: rows
                  };
                  setCVData(prev => ({...prev, customTables: [...prev.customTables, newTable]}));
                  alert(config.language === 'si' ? "Excel ගොනුව වගුවක් ලෙස එකතු කරන ලදී." : "Excel file added as a table.");
              }
          } catch(err) {
              console.error(err);
              alert("Excel Error: Please ensure it is a valid .xlsx file");
          }
      };
      reader.readAsBinaryString(file);
  };

  // Handle JSON Export (include data + config)
  const handleJsonDownload = () => {
    const fullData = { ...cvData, config };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fullData));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "my_cv_data.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  // Handle Image Upload for Template Suggestion
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if(!file) return;

      const reader = new FileReader();
      reader.onloadend = async () => {
          const base64 = reader.result as string;
          setAiLoading(true);
          try {
             const suggestion = await suggestTemplateFromImage(base64);
             setConfig(prev => ({
                 ...prev, 
                 templateId: suggestion.templateId,
                 colors: {
                     ...prev.colors,
                     primary: suggestion.primaryColor,
                     secondary: suggestion.secondaryColor,
                     background: suggestion.backgroundColor,
                     heading: suggestion.headingColor
                 },
                 fonts: {
                     ...prev.fonts,
                     heading: suggestion.headingFont
                 }
             }));
          } catch (e) {
             console.error("Image Scan Error:", e);
             alert("Error scanning image");
          }
          setAiLoading(false);
      }
      reader.readAsDataURL(file);
  };

  // Handle Profile Image Upload
  const handleProfileImage = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if(file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setCVData(prev => ({...prev, personalInfo: {...prev.personalInfo, imageUrl: reader.result as string}}));
          }
          reader.readAsDataURL(file);
      }
  }

  // AI Improve Section
  const improveSection = async (text: string, type: 'summary' | 'experience') => {
      setAiLoading(true);
      const improved = await improveText(text, type);
      setAiLoading(false);
      return improved;
  }

  // Open Modal for New Table
  const addCustomTable = () => {
      const newTable: DynamicTableData = {
          id: Date.now().toString(),
          title: 'New Table',
          headers: ['Column 1', 'Column 2'],
          rows: [['-', '-']]
      };
      setCVData({...cvData, customTables: [...cvData.customTables, newTable]});
      setEditingTableIndex(cvData.customTables.length); 
      setModalOpen(true);
  };

  const handleEditTable = (index: number) => {
      setEditingTableIndex(index);
      setModalOpen(true);
  };

  const saveTableFromModal = (updatedTable: DynamicTableData) => {
      if (editingTableIndex !== null) {
          const newTables = [...cvData.customTables];
          newTables[editingTableIndex] = updatedTable;
          setCVData({...cvData, customTables: newTables});
      }
      setModalOpen(false);
      setEditingTableIndex(null);
  };

  // Update image style
  const updateImageStyle = (style: ImageStyle) => {
    setCVData(prev => ({
        ...prev,
        personalInfo: {
            ...prev.personalInfo,
            imageStyle: style
        }
    }));
  };

  // Improved Scale Calculation
  useEffect(() => {
    if (!previewContainerRef.current) return;
    let timeoutId: any;

    const handleResize = () => {
        if (scaleMode === 'manual') return;
        if (!previewContainerRef.current) return;
        
        const containerWidth = previewContainerRef.current.clientWidth;
        const a4WidthPx = 794; 
        const paddingPx = containerWidth < 768 ? 20 : 48; 

        let computedScale = (containerWidth - paddingPx) / a4WidthPx;
        computedScale = Math.min(Math.max(computedScale, 0.2), 1.5);
        
        setPreviewScale(computedScale);
    };

    const resizeObserver = new ResizeObserver(() => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(handleResize, 50);
    });
    
    resizeObserver.observe(previewContainerRef.current);
    handleResize();

    return () => {
        resizeObserver.disconnect();
        clearTimeout(timeoutId);
    };
  }, [scaleMode]); 

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100 overflow-hidden">
      
      {/* --- MOBILE HEADER --- */}
      <div className="md:hidden bg-white p-4 shadow flex justify-between items-center z-50 sticky top-0 print:hidden">
          <h1 className="font-bold text-lg">{t.appTitle}</h1>
          <div className="flex items-center gap-2">
            <button onClick={() => setConfig({...config, language: config.language === 'en' ? 'si' : 'en'})} className="p-2 bg-gray-100 rounded-full text-xs font-bold flex gap-1 text-gray-900">
                <Globe size={14}/> {config.language.toUpperCase()}
            </button>
            <button onClick={() => setShowMobileMenu(!showMobileMenu)}>{showMobileMenu ? <X/> : <Menu/>}</button>
          </div>
      </div>

      {/* --- SIDEBAR CONTROLS --- */}
      <div className={`
        fixed md:static inset-0 z-40 bg-white shadow-xl md:shadow-none w-full md:w-[400px] flex flex-col transition-transform duration-300 print:hidden
        ${showMobileMenu ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
         {/* Language Toggle (Desktop) */}
         <div className="hidden md:flex justify-between items-center p-4 border-b">
             <h1 className="font-bold text-lg text-blue-600">{t.appTitle}</h1>
             <button onClick={() => setConfig({...config, language: config.language === 'en' ? 'si' : 'en'})} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-xs font-bold flex items-center gap-1 transition-colors text-gray-900">
                <Globe size={14}/> {config.language === 'en' ? 'English' : 'සිංහල'}
             </button>
         </div>

         <div className="p-4 border-b flex gap-2">
            <button 
                className={`flex-1 py-2 rounded text-sm font-semibold ${activeTab === 'details' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => setActiveTab('details')}
            >
                <Type size={16} className="inline mr-1"/> {t.tabData}
            </button>
            <button 
                className={`flex-1 py-2 rounded text-sm font-semibold ${activeTab === 'design' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => setActiveTab('design')}
            >
                <Palette size={16} className="inline mr-1"/> {t.tabDesign}
            </button>
         </div>

         <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide pb-20">
            
            {/* DATA TAB */}
            {activeTab === 'details' && (
                <>
                    <section className="space-y-3">
                        <h3 className="font-bold text-gray-700">{t.personalInfo}</h3>
                        <div className="flex gap-2">
                           <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden shrink-0 relative cursor-pointer group">
                               {cvData.personalInfo.imageUrl ? <img src={cvData.personalInfo.imageUrl} className="w-full h-full object-cover"/> : <div className="flex items-center justify-center h-full text-xs text-gray-500">Photo</div>}
                               <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleProfileImage} accept="image/*" />
                               <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center text-white text-xs">Edit</div>
                           </div>
                           <div className="flex-1 space-y-2">
                               <input autoComplete="off" className="w-full border p-2 rounded text-sm bg-white text-gray-900" placeholder="Full Name" value={cvData.personalInfo.fullName} onChange={e => setCVData({...cvData, personalInfo: {...cvData.personalInfo, fullName: e.target.value}})} />
                               <input autoComplete="off" className="w-full border p-2 rounded text-sm bg-white text-gray-900" placeholder="Job Title" value={cvData.personalInfo.title} onChange={e => setCVData({...cvData, personalInfo: {...cvData.personalInfo, title: e.target.value}})} />
                           </div>
                        </div>
                        <input autoComplete="off" className="w-full border p-2 rounded text-sm bg-white text-gray-900" placeholder="Phone" value={cvData.personalInfo.phone} onChange={e => setCVData({...cvData, personalInfo: {...cvData.personalInfo, phone: e.target.value}})} />
                        <input autoComplete="off" className="w-full border p-2 rounded text-sm bg-white text-gray-900" placeholder="Email" value={cvData.personalInfo.email} onChange={e => setCVData({...cvData, personalInfo: {...cvData.personalInfo, email: e.target.value}})} />
                         <input autoComplete="off" className="w-full border p-2 rounded text-sm bg-white text-gray-900" placeholder="Address" value={cvData.personalInfo.address} onChange={e => setCVData({...cvData, personalInfo: {...cvData.personalInfo, address: e.target.value}})} />
                        
                        <div className="relative">
                            <textarea className="w-full border p-2 rounded text-sm h-24 bg-white text-gray-900" placeholder="Professional Summary" value={cvData.personalInfo.summary} onChange={e => setCVData({...cvData, personalInfo: {...cvData.personalInfo, summary: e.target.value}})} />
                            <button 
                                onClick={async () => {
                                    const res = await improveSection(cvData.personalInfo.summary, 'summary');
                                    setCVData({...cvData, personalInfo: {...cvData.personalInfo, summary: res}});
                                }}
                                disabled={aiLoading}
                                className="absolute bottom-2 right-2 p-1 bg-purple-100 text-purple-600 rounded hover:bg-purple-200" title={t.aiRewrite}
                            >
                                <Bot size={14} className={aiLoading ? 'animate-spin' : ''}/>
                            </button>
                        </div>
                    </section>
                    
                    {/* ... (Rest of Data Sections kept similar) ... */}
                     <section className="space-y-3 pt-4 border-t">
                        <h3 className="font-bold text-gray-700">{t.experience}</h3>
                        {cvData.experience.map((exp, idx) => (
                            <div key={exp.id} className="p-3 bg-gray-50 rounded border relative group">
                                <button onClick={() => {
                                    const newExp = cvData.experience.filter((_, i) => i !== idx);
                                    setCVData({...cvData, experience: newExp});
                                }} className="absolute top-2 right-2 text-red-400 opacity-0 group-hover:opacity-100"><X size={14}/></button>
                                
                                <input autoComplete="off" className="w-full bg-white border rounded p-2 mb-2 text-sm font-semibold placeholder-gray-400 text-gray-900" placeholder="Job Role" value={exp.role} onChange={e => {
                                    const newExp = [...cvData.experience]; newExp[idx].role = e.target.value; setCVData({...cvData, experience: newExp});
                                }} />
                                <input autoComplete="off" className="w-full bg-white border rounded p-2 mb-2 text-sm placeholder-gray-400 text-gray-900" placeholder="Company" value={exp.company} onChange={e => {
                                    const newExp = [...cvData.experience]; newExp[idx].company = e.target.value; setCVData({...cvData, experience: newExp});
                                }} />
                                 <input autoComplete="off" className="w-full bg-white border rounded p-2 mb-2 text-xs text-gray-500 placeholder-gray-400 text-gray-900" placeholder="Duration" value={exp.duration} onChange={e => {
                                    const newExp = [...cvData.experience]; newExp[idx].duration = e.target.value; setCVData({...cvData, experience: newExp});
                                }} />
                                <textarea className="w-full bg-white border rounded p-2 text-xs placeholder-gray-400 text-gray-900" rows={2} placeholder="Description" value={exp.description} onChange={e => {
                                    const newExp = [...cvData.experience]; newExp[idx].description = e.target.value; setCVData({...cvData, experience: newExp});
                                }} />
                            </div>
                        ))}
                        <button className="w-full py-2 border-2 border-dashed text-gray-400 hover:text-gray-600 rounded text-sm" onClick={() => {
                            setCVData({...cvData, experience: [...cvData.experience, {id: Date.now().toString(), role: '', company: '', duration: '', description: ''}]})
                        }}>+ {t.addExp}</button>
                    </section>
                    
                    <section className="space-y-3 pt-4 border-t">
                        <h3 className="font-bold text-gray-700">{t.education}</h3>
                        {cvData.education.map((edu, idx) => (
                            <div key={edu.id} className="p-3 bg-gray-50 rounded border relative group">
                                <button onClick={() => {
                                    const newEdu = cvData.education.filter((_, i) => i !== idx);
                                    setCVData({...cvData, education: newEdu});
                                }} className="absolute top-2 right-2 text-red-400 opacity-0 group-hover:opacity-100"><X size={14}/></button>
                                
                                <input autoComplete="off" className="w-full bg-white border rounded p-2 mb-2 text-sm font-semibold placeholder-gray-400 text-gray-900" placeholder="Degree" value={edu.degree} onChange={e => {
                                    const newEdu = [...cvData.education]; newEdu[idx].degree = e.target.value; setCVData({...cvData, education: newEdu});
                                }} />
                                <input autoComplete="off" className="w-full bg-white border rounded p-2 mb-2 text-sm placeholder-gray-400 text-gray-900" placeholder="School" value={edu.school} onChange={e => {
                                    const newEdu = [...cvData.education]; newEdu[idx].school = e.target.value; setCVData({...cvData, education: newEdu});
                                }} />
                                 <input autoComplete="off" className="w-full bg-white border rounded p-2 mb-2 text-xs text-gray-500 placeholder-gray-400 text-gray-900" placeholder="Year" value={edu.year} onChange={e => {
                                    const newEdu = [...cvData.education]; newEdu[idx].year = e.target.value; setCVData({...cvData, education: newEdu});
                                }} />
                            </div>
                        ))}
                        <button className="w-full py-2 border-2 border-dashed text-gray-400 hover:text-gray-600 rounded text-sm" onClick={() => {
                            setCVData({...cvData, education: [...cvData.education, {id: Date.now().toString(), degree: '', school: '', year: ''}]})
                        }}>+ Add Education</button>
                    </section>

                    <section className="space-y-3 pt-4 border-t">
                        <h3 className="font-bold text-gray-700">{t.skills}</h3>
                        {cvData.skills.map((skill, idx) => (
                            <div key={skill.id} className="flex gap-2 items-center">
                                <input autoComplete="off" className="flex-1 bg-white border rounded p-2 text-sm text-gray-900" placeholder="Skill Name" value={skill.name} onChange={e => {
                                    const newSkills = [...cvData.skills]; newSkills[idx].name = e.target.value; setCVData({...cvData, skills: newSkills});
                                }} />
                                <input type="number" min="1" max="5" className="w-16 bg-white border rounded p-2 text-sm text-gray-900" value={skill.level} onChange={e => {
                                    const newSkills = [...cvData.skills]; newSkills[idx].level = parseInt(e.target.value); setCVData({...cvData, skills: newSkills});
                                }} />
                                <button onClick={() => {
                                    const newSkills = cvData.skills.filter((_, i) => i !== idx);
                                    setCVData({...cvData, skills: newSkills});
                                }} className="text-red-400 hover:text-red-600"><X size={14}/></button>
                            </div>
                        ))}
                         <button className="w-full py-2 border-2 border-dashed text-gray-400 hover:text-gray-600 rounded text-sm" onClick={() => {
                            setCVData({...cvData, skills: [...cvData.skills, {id: Date.now().toString(), name: '', level: 3}]})
                        }}>+ Add Skill</button>
                    </section>

                    <section className="space-y-3 pt-4 border-t">
                        <h3 className="font-bold text-gray-700">{t.customTables}</h3>
                        <div className="space-y-2">
                             {cvData.customTables.map((table, i) => (
                                 <div key={table.id} onClick={() => handleEditTable(i)} className="flex items-center justify-between p-3 bg-white border rounded hover:bg-blue-50 cursor-pointer text-gray-900">
                                     <span className="text-sm font-semibold truncate">{table.title}</span>
                                     <Settings size={14} className="text-gray-400"/>
                                 </div>
                             ))}
                        </div>
                        <div className="flex gap-2">
                            <button onClick={addCustomTable} className="flex-1 flex items-center justify-center gap-2 bg-orange-100 text-orange-700 py-2 rounded font-semibold hover:bg-orange-200 text-xs">
                                <Grid size={16}/> {t.addTable}
                            </button>
                        </div>
                    </section>
                </>
            )}

            {/* DESIGN TAB */}
            {activeTab === 'design' && (
                <>
                    {/* Basic / Advanced Toggle */}
                    <div className="flex bg-gray-100 p-1 rounded mb-4">
                        <button onClick={() => setDesignSubTab('basic')} className={`flex-1 py-1 text-xs font-bold rounded ${designSubTab === 'basic' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>Basic</button>
                        <button onClick={() => setDesignSubTab('advanced')} className={`flex-1 py-1 text-xs font-bold rounded ${designSubTab === 'advanced' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>Advanced</button>
                    </div>

                    {designSubTab === 'basic' ? (
                        <>
                            <section className="space-y-4">
                                <h3 className="font-bold text-gray-700">{t.template}</h3>
                                <div className="grid grid-cols-3 gap-2">
                                     {['modern', 'classic', 'creative'].map((type) => (
                                         <button 
                                            key={type}
                                            onClick={() => setConfig({...config, templateId: type as any})}
                                            className={`p-2 border rounded text-xs capitalize text-gray-900 ${config.templateId === type ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-gray-200 hover:border-blue-300'}`}
                                         >
                                             {type}
                                         </button>
                                     ))}
                                </div>
                                <div className="p-4 bg-yellow-50 rounded border border-yellow-200">
                                    <h4 className="font-bold text-xs text-yellow-800 mb-2 flex items-center gap-2"><Upload size={12}/> {t.scanImage}</h4>
                                    <p className="text-xs text-yellow-700 mb-2">{t.scanDesc}</p>
                                    <input type="file" accept="image/*" className="text-xs w-full text-gray-700" onChange={handleImageUpload} />
                                </div>
                            </section>

                            <section className="space-y-4 border-t pt-4">
                                <h3 className="font-bold text-gray-700">{t.color}</h3>
                                <div className="flex flex-wrap gap-2">
                                    {COLORS.map(color => (
                                        <button 
                                            key={color} 
                                            className={`w-8 h-8 rounded-full border-2 transition-transform ${config.colors.primary === color ? 'border-gray-600 scale-110 shadow' : 'border-white hover:scale-105'}`}
                                            style={{backgroundColor: color}}
                                            onClick={() => setConfig({...config, colors: {...config.colors, primary: color, heading: color}})}
                                        />
                                    ))}
                                </div>
                            </section>
                        </>
                    ) : (
                        /* ADVANCED MODE */
                        <>
                            <section className="space-y-4">
                                <h3 className="font-bold text-gray-700 flex items-center gap-2"><Sliders size={14}/> {t.advColors}</h3>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-900">Primary Brand</span>
                                        <input type="color" value={config.colors.primary} onChange={e => setConfig({...config, colors: {...config.colors, primary: e.target.value}})} className="h-6 w-10 border rounded cursor-pointer"/>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-900">Headings</span>
                                        <input type="color" value={config.colors.heading || config.colors.primary} onChange={e => setConfig({...config, colors: {...config.colors, heading: e.target.value}})} className="h-6 w-10 border rounded cursor-pointer"/>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-900">Subtitles (Secondary)</span>
                                        <input type="color" value={config.colors.secondary} onChange={e => setConfig({...config, colors: {...config.colors, secondary: e.target.value}})} className="h-6 w-10 border rounded cursor-pointer"/>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-900">Body Text</span>
                                        <input type="color" value={config.colors.text} onChange={e => setConfig({...config, colors: {...config.colors, text: e.target.value}})} className="h-6 w-10 border rounded cursor-pointer"/>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-900">Background</span>
                                        <input type="color" value={config.colors.background} onChange={e => setConfig({...config, colors: {...config.colors, background: e.target.value}})} className="h-6 w-10 border rounded cursor-pointer"/>
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-4 border-t pt-4">
                                <h3 className="font-bold text-gray-700 flex items-center gap-2"><Type size={14}/> {t.advFonts}</h3>
                                <div>
                                    <label className="text-xs text-gray-500">Headings</label>
                                    <select className="w-full border rounded p-1 text-sm bg-white text-gray-900" value={config.fonts.heading} onChange={e => setConfig({...config, fonts: {...config.fonts, heading: e.target.value}})}>
                                        {FONTS.map(f => <option key={f.value} value={f.value}>{f.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500">Body Text</label>
                                    <select className="w-full border rounded p-1 text-sm bg-white text-gray-900" value={config.fonts.body} onChange={e => setConfig({...config, fonts: {...config.fonts, body: e.target.value}})}>
                                        {FONTS.map(f => <option key={f.value} value={f.value}>{f.name}</option>)}
                                    </select>
                                </div>
                            </section>
                        </>
                    )}

                    {/* Common Layout Settings */}
                    <section className="space-y-4 border-t pt-4">
                        <h3 className="font-bold text-gray-700">{t.layout}</h3>
                        <div>
                            <label className="text-xs text-gray-500 flex justify-between"><span>Spacing</span> <span>{config.spacing}</span></label>
                            <input type="range" min="1" max="3" step="1" value={config.spacing} onChange={(e) => setConfig({...config, spacing: parseInt(e.target.value)})} className="w-full accent-blue-600" />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 flex justify-between"><span>{t.borderRadius}</span> <span>{config.borderRadius}px</span></label>
                            <input type="range" min="0" max="24" step="1" value={config.borderRadius} onChange={(e) => setConfig({...config, borderRadius: parseInt(e.target.value)})} className="w-full accent-blue-600" />
                        </div>
                    </section>
                </>
            )}
         </div>

         {/* SIDEBAR FOOTER */}
         <div className="p-4 border-t bg-gray-50 flex flex-col gap-2">
             <button onClick={handlePrint} className="w-full bg-blue-600 text-white py-3 rounded font-bold shadow hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors">
                 <Download size={18}/> {t.downloadPdf}
             </button>
             <div className="flex gap-2">
                 <button onClick={handleJsonDownload} className="flex-1 flex items-center justify-center gap-1 bg-white border border-gray-300 py-2 rounded text-xs hover:bg-gray-50 transition-colors text-gray-900">
                     <Save size={14}/> JSON
                 </button>
                 <label className="flex-1 flex items-center justify-center gap-1 bg-white border border-gray-300 py-2 rounded text-xs hover:bg-gray-50 transition-colors cursor-pointer text-gray-900">
                     <Upload size={14}/> Import
                     <input type="file" accept=".json" className="hidden" onChange={handleJsonUpload} />
                 </label>
             </div>
         </div>
      </div>

      {/* --- MAIN PREVIEW AREA --- */}
      <div 
        className={`flex-1 bg-gray-200 flex justify-center py-8 print-area relative ${
             scaleMode === 'fit' ? 'overflow-x-hidden' : 'overflow-x-auto'
        } overflow-y-scroll`}
        ref={previewContainerRef}
      >
          {/* Zoom Controls Overlay */}
          <div className="fixed bottom-6 right-6 z-30 flex flex-col gap-2 bg-white p-2 rounded-lg shadow-xl print:hidden">
              <button onClick={() => { setScaleMode('manual'); setPreviewScale(prev => Math.min(prev + 0.1, 2.0)); }} className="p-2 hover:bg-gray-100 rounded text-gray-700" title="Zoom In">
                  <ZoomIn size={20} />
              </button>
              <div className="text-xs text-center font-bold text-gray-500">{Math.round(previewScale * 100)}%</div>
              <button onClick={() => { setScaleMode('manual'); setPreviewScale(prev => Math.max(prev - 0.1, 0.3)); }} className="p-2 hover:bg-gray-100 rounded text-gray-700" title="Zoom Out">
                  <ZoomOut size={20} />
              </button>
              <hr className="my-1"/>
              <button onClick={() => setScaleMode('fit')} className="p-2 hover:bg-gray-100 rounded text-blue-600" title="Fit to Screen">
                  <Maximize size={20} />
              </button>
          </div>

          {/* CV WRAPPER - Ensures proper spacing and centering */}
          <div 
            className="cv-print-wrapper"
            style={{
              width: `${794 * previewScale}px`,
              height: `${contentHeight * previewScale}px`,
              flexShrink: 0, 
              position: 'relative' 
          }}>
              <div 
                 ref={cvContentRef}
                 className="bg-white shadow-2xl print:shadow-none cv-paper"
                 style={{
                     transform: `scale(${previewScale})`,
                     transformOrigin: 'top left',
                     width: '794px', 
                     minHeight: '1123px',
                     position: 'absolute', 
                     top: 0,
                     left: 0
                 }}
              >
                  <TemplateRenderer 
                      data={cvData} 
                      config={config} 
                      setCVData={setCVData} 
                      isEditing={isEditing} 
                      onEditTable={handleEditTable}
                      onEditImage={() => setImageModalOpen(true)}
                  />
              </div>
          </div>
      </div>

      {/* Table Editor Modal */}
      <TableEditorModal 
          isOpen={modalOpen} 
          onClose={() => setModalOpen(false)} 
          table={editingTableIndex !== null ? cvData.customTables[editingTableIndex] : null}
          onSave={saveTableFromModal}
          lang={config.language}
      />

      {/* Image Settings Modal */}
      <ImageSettingsModal
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        imageStyle={cvData.personalInfo.imageStyle || { borderRadius: 0, borderWidth: 4, borderColor: '#ffffff' }}
        onSave={updateImageStyle}
      />

      {/* Loading Overlay */}
      {aiLoading && (
          <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center text-white flex-col">
              <Bot size={48} className="animate-bounce mb-4 text-yellow-300"/>
              <p className="text-xl font-bold">{t.aiThinking}</p>
          </div>
      )}

    </div>
  );
};

export default App;
