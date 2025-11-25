import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CVData, AppConfig, DynamicTableData, TRANSLATIONS, ImageStyle, SectionStyle, ColorProfile } from './types';
import { TemplateRenderer } from './components/TemplateRenderer';
import { TableEditorModal } from './components/TableEditorModal';
import { ImageSettingsModal } from './components/ImageSettingsModal';
import { StyleEditorModal } from './components/StyleEditorModal';
import { Download, Upload, Plus, Palette, Grid, Type, Bot, Settings, Menu, X, Save, FileJson, FileSpreadsheet, Globe, ZoomIn, ZoomOut, Maximize, Sliders, ChevronDown, Loader2, Trash2, FolderOpen, Share, Layout, Scaling, Tag } from 'lucide-react';
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
  customTables: [],
  sectionStyles: {}
};

const FONTS = [
    { name: 'Modern (Inter)', value: 'Inter, sans-serif' },
    { name: 'Classic (Merriweather)', value: 'Merriweather, serif' },
    { name: 'Elegant (Playfair)', value: 'Playfair Display, serif' },
    { name: 'Roboto', value: 'Roboto, sans-serif' },
    { name: 'Open Sans', value: 'Open Sans, sans-serif' }
];

const DEFAULT_PROFILES: ColorProfile[] = [
    {
        id: 'default_blue', name: 'Modern Blue (Default)',
        colors: { 
            primary: '#2563eb', 
            secondary: '#475569', 
            text: '#0f172a', 
            background: '#f8fafc', // Light slate background instead of white
            heading: '#1e40af', 
            tagBackground: '#2563eb', 
            tagText: '#ffffff' 
        }
    },
    {
        id: 'emerald_green', name: 'Emerald Professional',
        colors: { primary: '#059669', secondary: '#374151', text: '#111827', background: '#ffffff', heading: '#047857', tagBackground: '#059669', tagText: '#ffffff' }
    },
    {
        id: 'crimson_bold', name: 'Crimson Bold',
        colors: { primary: '#dc2626', secondary: '#4b5563', text: '#111827', background: '#fff1f2', heading: '#b91c1c', tagBackground: '#dc2626', tagText: '#ffffff' }
    },
    {
        id: 'slate_minimal', name: 'Slate Minimal',
        colors: { primary: '#334155', secondary: '#64748b', text: '#0f172a', background: '#f8fafc', heading: '#1e293b', tagBackground: '#334155', tagText: '#ffffff' }
    },
    {
        id: 'royal_purple', name: 'Royal Purple',
        colors: { primary: '#7c3aed', secondary: '#6b7280', text: '#111827', background: '#ffffff', heading: '#6d28d9', tagBackground: '#7c3aed', tagText: '#ffffff' }
    }
];

const App: React.FC = () => {
  const [cvData, setCVData] = useState<CVData>(INITIAL_DATA);
  const [config, setConfig] = useState<AppConfig>({
    templateId: 'modern',
    colors: DEFAULT_PROFILES[0].colors,
    fonts: {
        heading: 'Inter, sans-serif',
        body: 'Inter, sans-serif'
    },
    globalDesign: {
        headingScale: 1,
        bodyScale: 1,
        lineWidth: 2,
        borderStyle: 'solid',
        borderRadius: 4
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
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  
  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [styleModalOpen, setStyleModalOpen] = useState(false);
  const [editingTableIndex, setEditingTableIndex] = useState<number | null>(null);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);

  // Profile Management State
  const [profiles, setProfiles] = useState<ColorProfile[]>(DEFAULT_PROFILES);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('default_blue');

  // Scaling State
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const cvContentRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState(1);
  const [scaleMode, setScaleMode] = useState<'fit' | 'manual'>('fit');
  const [contentHeight, setContentHeight] = useState(1123);

  // Persistence Timeout Ref
  // Using number | null for browser setTimeout compatibility
  const saveTimeoutRef = useRef<number | null>(null);

  const t = TRANSLATIONS[config.language];

  // --- LOCAL STORAGE LOGIC ---
  useEffect(() => {
    const savedData = localStorage.getItem('cv_builder_data');
    const savedConfig = localStorage.getItem('cv_builder_config');
    const savedProfiles = localStorage.getItem('cv_builder_profiles');
    
    if (savedData) {
        try {
            const parsed = JSON.parse(savedData);
            if (!parsed.sectionStyles) parsed.sectionStyles = {};
            setCVData(parsed);
        } catch (e) { console.error("Error loading saved data", e); }
    }
    if (savedConfig) {
        try {
            const parsedConfig = JSON.parse(savedConfig);
            // Migration for new global settings if missing
            if (!parsedConfig.globalDesign) {
                parsedConfig.globalDesign = {
                    headingScale: 1,
                    bodyScale: 1,
                    lineWidth: 2,
                    borderStyle: 'solid',
                    borderRadius: parsedConfig.borderRadius || 4
                };
            }
            // Migration for tag colors
            if (!parsedConfig.colors.tagBackground) parsedConfig.colors.tagBackground = parsedConfig.colors.primary;
            if (!parsedConfig.colors.tagText) parsedConfig.colors.tagText = '#ffffff';
            
            setConfig(parsedConfig);
        } catch (e) { console.error("Error loading saved config", e); }
    }
    if (savedProfiles) {
        try {
            const parsedProfiles = JSON.parse(savedProfiles);
            setProfiles([...DEFAULT_PROFILES, ...parsedProfiles]);
        } catch (e) { console.error("Error loading profiles", e); }
    }
    setDataLoaded(true);
  }, []);

  // Debounced Save
  const debouncedSave = useCallback(() => {
    if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = window.setTimeout(() => {
        try {
            localStorage.setItem('cv_builder_data', JSON.stringify(cvData));
            localStorage.setItem('cv_builder_config', JSON.stringify(config));
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
        }
    }, 1000); 
  }, [cvData, config]);

  useEffect(() => {
      if (!dataLoaded) return;
      debouncedSave();
      
      return () => {
          if (saveTimeoutRef.current) {
              clearTimeout(saveTimeoutRef.current);
          }
      };
  }, [cvData, config, dataLoaded, debouncedSave]);

  // Persist Custom Profiles
  useEffect(() => {
      if (!dataLoaded) return;
      const customProfiles = profiles.filter(p => !DEFAULT_PROFILES.find(dp => dp.id === p.id));
      localStorage.setItem('cv_builder_profiles', JSON.stringify(customProfiles));
  }, [profiles, dataLoaded]);


  // Monitor Content Height for resizing (Optimized)
  useEffect(() => {
    if (!cvContentRef.current) return;
    
    let timeoutId: ReturnType<typeof setTimeout>;
    const element = cvContentRef.current; 
    
    const observer = new ResizeObserver((entries) => {
        // Debounce the updates
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            if (!element) return;
            const newHeight = element.offsetHeight;
            setContentHeight(prev => {
                if (Math.abs(prev - newHeight) > 5) return newHeight;
                return prev;
            });
        }, 100); 
    });
    
    observer.observe(element);
    
    return () => {
        clearTimeout(timeoutId);
        observer.disconnect();
    };
  }, []); // Empty deps - only mount/unmount

  // --- PDF GENERATION HANDLER (IFRAME METHOD) ---
  const handlePrint = async () => {
    const element = cvContentRef.current;
    if (!element) {
        alert("CV Content not found.");
        return;
    }

    setIsGeneratingPdf(true);

    try {
        // 1. Create a hidden Iframe
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.top = '-9999px';
        iframe.style.left = '-9999px';
        iframe.style.width = '794px'; // A4 width
        iframe.style.height = '1200px';
        iframe.style.border = 'none';
        iframe.style.zIndex = '-1';
        document.body.appendChild(iframe);

        const doc = iframe.contentWindow?.document;
        if (!doc) throw new Error("Iframe document not found");

        // 2. Prepare HTML content
        // Inject Tailwind CDN
        const tailwindCDN = `<script src="https://cdn.tailwindcss.com"></script>`;
        // Extract font links from current head
        const fontLinks = document.querySelector('head')?.innerHTML.match(/<link[^>]*fonts\.googleapis[^>]*>/g)?.join('') || '';
        
        // Extract computed CSS variables from the main CV container
        // This ensures all the dynamic theme colors are transferred
        const computedStyle = window.getComputedStyle(element);
        let cssVars = '';
        for (let i = 0; i < computedStyle.length; i++) {
            const key = computedStyle[i];
            if (key.startsWith('--')) {
                cssVars += `${key}: ${computedStyle.getPropertyValue(key)};\n`;
            }
        }
        
        // Get the innerHTML and className of the CV
        const contentHTML = element.innerHTML;
        const className = element.className;

        // 3. Write complete HTML document to Iframe
        doc.open();
        doc.write(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="utf-8">
                ${tailwindCDN}
                ${fontLinks}
                <style>
                    body { 
                        margin: 0; 
                        padding: 0; 
                        width: 794px;
                        background: white;
                        -webkit-print-color-adjust: exact; 
                        print-color-adjust: exact;
                    }
                    .cv-wrapper {
                        ${cssVars}
                    }
                    @media print {
                        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                        .no-print { display: none !important; }
                    }
                    /* Ensure font families are applied globally in iframe */
                    body { font-family: 'Inter', sans-serif; }
                </style>
            </head>
            <body>
                <div class="${className} cv-wrapper" style="transform: none; margin: 0; box-shadow: none;">
                    ${contentHTML}
                </div>
            </body>
            </html>
        `);
        doc.close();

        // 4. Wait for Resources (Tailwind & Images)
        // Wait a bit for Tailwind script to parse and apply classes
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Wait for images inside iframe to load
        const images = Array.from(doc.images);
        await Promise.all(images.map(img => {
            if (img.complete) return Promise.resolve();
            return new Promise(resolve => { 
                img.onload = resolve; 
                img.onerror = resolve; 
            });
        }));

        // 5. Generate PDF using html2pdf from the iframe content
        // @ts-ignore
        if (window.html2pdf) {
            const opt = {
                margin: [0, 0, 0, 0], // No margin, handled by CV padding
                filename: `${cvData.personalInfo.fullName.replace(/\s+/g, '_')}_CV.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { 
                    scale: 2, 
                    useCORS: true, 
                    logging: false,
                    scrollY: 0,
                    scrollX: 0,
                    windowWidth: 794,
                    width: 794
                },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            // Capture the body of the iframe
            // @ts-ignore
            await window.html2pdf().set(opt).from(doc.body).save();
        } else {
            alert("PDF Library not loaded. Please refresh.");
        }

        // Cleanup
        document.body.removeChild(iframe);

    } catch (error: any) {
        console.error("PDF Generation Error:", error);
        alert(`Failed to generate PDF: ${error.message}`);
    } finally {
        setIsGeneratingPdf(false);
    }
  };

  const handleJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (!json.personalInfo) throw new Error("Invalid Format");
        if (!json.sectionStyles) json.sectionStyles = {};
        
        setCVData(json);
        if(json.config) setConfig(json.config);
        alert(config.language === 'si' ? "දත්ත සාර්ථකව ඇතුලත් කරන ලදී!" : "Data loaded successfully!");
      } catch (err) {
        alert("JSON Error");
      }
    };
    reader.readAsText(file);
  };

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
                     heading: suggestion.headingColor,
                     // Use primary for tags if not specified
                     tagBackground: suggestion.primaryColor,
                     tagText: '#ffffff'
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

  const improveSection = async (text: string, type: 'summary' | 'experience') => {
      setAiLoading(true);
      const improved = await improveText(text, type);
      setAiLoading(false);
      return improved;
  }

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

  const updateImageStyle = (style: ImageStyle) => {
    setCVData(prev => ({
        ...prev,
        personalInfo: {
            ...prev.personalInfo,
            imageStyle: style
        }
    }));
  };
  
  const handleEditSectionStyle = (id: string) => {
      setEditingSectionId(id);
      setStyleModalOpen(true);
  };

  const updateSectionStyle = (id: string, style: SectionStyle) => {
      setCVData(prev => ({
          ...prev,
          sectionStyles: {
              ...prev.sectionStyles,
              [id]: style
          }
      }));
  };

  const loadProfile = (profileId: string) => {
      const profile = profiles.find(p => p.id === profileId);
      if (profile) {
          setConfig(prev => ({ ...prev, colors: profile.colors }));
          setSelectedProfileId(profileId);
      }
  };

  const saveProfile = () => {
      const name = prompt(config.language === 'si' ? "නව වර්ණ තේමාවේ නම ඇතුලත් කරන්න:" : "Enter a name for this color profile:");
      if (!name) return;

      const newProfile: ColorProfile = {
          id: `custom_${Date.now()}`,
          name: name,
          colors: config.colors
      };
      setProfiles(prev => [...prev, newProfile]);
      setSelectedProfileId(newProfile.id);
  };

  const deleteProfile = (id: string) => {
      if (DEFAULT_PROFILES.find(p => p.id === id)) {
          alert("Cannot delete default profiles.");
          return;
      }
      if (confirm("Delete this profile?")) {
          setProfiles(prev => prev.filter(p => p.id !== id));
          if (selectedProfileId === id) {
              loadProfile(DEFAULT_PROFILES[0].id);
          }
      }
  };

  const handleExportProfiles = () => {
      const customProfiles = profiles.filter(p => !DEFAULT_PROFILES.find(dp => dp.id === p.id));
      if (customProfiles.length === 0) {
          alert(config.language === 'si' ? "සුරැකීමට අභිරුචි වර්ණ පැතිකඩක් නොමැත." : "No custom profiles to export.");
          return;
      }
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(customProfiles));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "cv_colors.json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
  };

  const handleImportProfiles = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const json = JSON.parse(event.target?.result as string);
              if (Array.isArray(json)) {
                  // Validate basic structure
                  const validProfiles = json.filter((p: any) => p.id && p.colors && p.name);
                  
                  // Avoid duplicates by ID
                  const newProfiles = validProfiles.filter((p: ColorProfile) => 
                    !profiles.some(existing => existing.id === p.id)
                  );

                  if (newProfiles.length > 0) {
                      setProfiles(prev => [...prev, ...newProfiles]);
                      alert(config.language === 'si' ? "වර්ණ පැතිකඩ සාර්ථකව ඇතුලත් විය!" : "Profiles imported successfully!");
                  } else {
                       alert(config.language === 'si' ? "මෙම පැතිකඩ දැනටමත් පවතී හෝ හිස් ය." : "Profiles already exist or file is empty.");
                  }
              }
          } catch (err) {
              alert("Error parsing JSON");
          }
      };
      reader.readAsText(file);
      e.target.value = ''; // Reset input
  };

  // Improved Scale Calculation (Optimized)
  useEffect(() => {
    if (!previewContainerRef.current) return;
    
    let rafId: number;
    let timeoutId: ReturnType<typeof setTimeout>;
    const container = previewContainerRef.current;

    const handleResize = () => {
        // Cancel previous RAF
        if (rafId) cancelAnimationFrame(rafId);
        
        rafId = requestAnimationFrame(() => {
            if (scaleMode === 'manual' || !container) return;
            
            const containerWidth = container.clientWidth;
            const a4WidthPx = 794; 
            const paddingPx = containerWidth < 768 ? 20 : 48; 

            let computedScale = (containerWidth - paddingPx) / a4WidthPx;
            computedScale = Math.min(Math.max(computedScale, 0.2), 1.5);
            
            setPreviewScale(prev => {
                // Prevent unnecessary updates
                if (Math.abs(prev - computedScale) < 0.01) return prev;
                return computedScale;
            });
        });
    };

    const debouncedResize = () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(handleResize, 150);
    };

    const resizeObserver = new ResizeObserver(debouncedResize);
    resizeObserver.observe(container);
    handleResize(); // Initial calculation

    return () => {
        resizeObserver.disconnect();
        clearTimeout(timeoutId);
        if (rafId) cancelAnimationFrame(rafId);
    };
  }, [scaleMode]); 

  // Helper to update global config
  const updateGlobalDesign = (key: keyof typeof config.globalDesign, value: any) => {
      setConfig(prev => ({
          ...prev,
          globalDesign: {
              ...prev.globalDesign,
              [key]: value
          },
          // Synch legacy values
          borderRadius: key === 'borderRadius' ? value : prev.borderRadius
      }));
  };

  return (
    <div id="main-app-container" className="flex flex-col md:flex-row h-screen bg-gray-100 overflow-hidden print:h-auto print:overflow-visible" style={{ fontFamily: 'Inter, sans-serif' }}>
      
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
         <div className="hidden md:flex justify-between items-center p-4 border-b bg-gray-50">
             <h1 className="font-black text-xl text-blue-600 tracking-tight">{t.appTitle}</h1>
             <button onClick={() => setConfig({...config, language: config.language === 'en' ? 'si' : 'en'})} className="px-3 py-1 bg-white border shadow-sm hover:bg-gray-50 rounded-full text-xs font-bold flex items-center gap-1 transition-colors text-gray-900">
                <Globe size={14}/> {config.language === 'en' ? 'English' : 'සිංහල'}
             </button>
         </div>

         <div className="p-2 bg-gray-50 flex gap-2 border-b">
            <button 
                className={`flex-1 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'details' ? 'bg-white shadow text-blue-600 ring-1 ring-black/5' : 'text-gray-500 hover:bg-gray-200/50'}`}
                onClick={() => setActiveTab('details')}
            >
                <Type size={18}/> {t.tabData}
            </button>
            <button 
                className={`flex-1 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'design' ? 'bg-white shadow text-purple-600 ring-1 ring-black/5' : 'text-gray-500 hover:bg-gray-200/50'}`}
                onClick={() => setActiveTab('design')}
            >
                <Palette size={18}/> {t.tabDesign}
            </button>
         </div>

         <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide pb-20">
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

            {activeTab === 'design' && (
                <>
                    <div className="flex bg-gray-100 p-1 rounded-lg mb-4">
                        <button onClick={() => setDesignSubTab('basic')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${designSubTab === 'basic' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>Basic</button>
                        <button onClick={() => setDesignSubTab('advanced')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${designSubTab === 'advanced' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>Advanced</button>
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
                            
                            {/* Color Section with Profile Management */}
                            <section className="space-y-4 border-t pt-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-bold text-gray-700">{t.advColors}</h3>
                                </div>
                                
                                <div className="p-3 bg-gray-50 rounded border">
                                    <label className="text-xs font-bold text-gray-500 mb-1 block">Profile</label>
                                    <div className="flex gap-2 mb-2">
                                        <div className="relative flex-1">
                                            <select 
                                                value={selectedProfileId}
                                                onChange={(e) => loadProfile(e.target.value)}
                                                className="w-full p-2 border rounded text-sm bg-white appearance-none pr-8 text-gray-900"
                                            >
                                                {profiles.map(p => (
                                                    <option key={p.id} value={p.id}>{p.name}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-2 top-2.5 text-gray-400 pointer-events-none" size={14}/>
                                        </div>
                                        <button 
                                            onClick={saveProfile} 
                                            className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                                            title={t.saveProfile}
                                        >
                                            <Save size={16}/>
                                        </button>
                                         <button 
                                            onClick={() => deleteProfile(selectedProfileId)} 
                                            className={`p-2 rounded ${DEFAULT_PROFILES.find(p => p.id === selectedProfileId) ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-red-100 text-red-600 hover:bg-red-200'}`}
                                            title={t.deleteProfile}
                                            disabled={!!DEFAULT_PROFILES.find(p => p.id === selectedProfileId)}
                                        >
                                            <Trash2 size={16}/>
                                        </button>
                                    </div>
                                    
                                    <div className="flex gap-2 mt-3 border-t pt-2">
                                        <button 
                                            onClick={handleExportProfiles} 
                                            className="flex-1 flex items-center justify-center gap-1 bg-white border border-gray-300 py-1.5 rounded text-xs hover:bg-gray-50 transition-colors text-gray-700 font-medium"
                                            title="Export Profiles to JSON"
                                        >
                                            <FileJson size={14}/> Export
                                        </button>
                                        <label className="flex-1 flex items-center justify-center gap-1 bg-white border border-gray-300 py-1.5 rounded text-xs hover:bg-gray-50 transition-colors cursor-pointer text-gray-700 font-medium">
                                            <FolderOpen size={14}/> Import
                                            <input type="file" accept=".json" className="hidden" onChange={handleImportProfiles} />
                                        </label>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mt-3 justify-center">
                                        {Object.values(config.colors).slice(0, 5).map((color, i) => (
                                             <div key={i} className="w-6 h-6 rounded-full border shadow-sm" style={{backgroundColor: color}}></div>
                                        ))}
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-4 border-t pt-4">
                                <h3 className="font-bold text-gray-700 flex items-center gap-2"><Layout size={14}/> {t.layout}</h3>
                                <div>
                                    <label className="text-xs text-gray-500 flex justify-between"><span>Spacing</span> <span>{config.spacing}</span></label>
                                    <input type="range" min="1" max="3" step="1" value={config.spacing} onChange={(e) => setConfig({...config, spacing: parseInt(e.target.value)})} className="w-full accent-blue-600" />
                                </div>
                            </section>
                        </>
                    ) : (
                        /* --- ADVANCED TAB --- */
                        <div className="space-y-6">
                            
                            {/* Typography System */}
                            <section className="space-y-3">
                                <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2 border-b pb-1"><Type size={14}/> Typography</h3>
                                <div className="grid grid-cols-2 gap-3">
                                     <div>
                                        <label className="text-xs font-bold text-gray-600 mb-1 block">Headings Font</label>
                                        <select className="w-full border rounded p-1.5 text-xs bg-white text-gray-900" value={config.fonts.heading} onChange={e => setConfig({...config, fonts: {...config.fonts, heading: e.target.value}})}>
                                            {FONTS.map(f => <option key={f.value} value={f.value}>{f.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-600 mb-1 block">Body Font</label>
                                        <select className="w-full border rounded p-1.5 text-xs bg-white text-gray-900" value={config.fonts.body} onChange={e => setConfig({...config, fonts: {...config.fonts, body: e.target.value}})}>
                                            {FONTS.map(f => <option key={f.value} value={f.value}>{f.name}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs text-gray-500 flex justify-between mb-1">
                                        <span>Heading Size Scale</span> 
                                        <span>{config.globalDesign?.headingScale}x</span>
                                    </label>
                                    <input 
                                        type="range" min="0.8" max="2.0" step="0.1" 
                                        value={config.globalDesign?.headingScale || 1} 
                                        onChange={(e) => updateGlobalDesign('headingScale', parseFloat(e.target.value))} 
                                        className="w-full accent-purple-600" 
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-gray-500 flex justify-between mb-1">
                                        <span>Body Size Scale</span> 
                                        <span>{config.globalDesign?.bodyScale}x</span>
                                    </label>
                                    <input 
                                        type="range" min="0.8" max="1.5" step="0.05" 
                                        value={config.globalDesign?.bodyScale || 1} 
                                        onChange={(e) => updateGlobalDesign('bodyScale', parseFloat(e.target.value))} 
                                        className="w-full accent-purple-600" 
                                    />
                                </div>
                            </section>

                            {/* Global Decorations */}
                            <section className="space-y-3 pt-4 border-t">
                                <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2 border-b pb-1"><Scaling size={14}/> Global Decorations</h3>
                                
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-bold text-gray-600 mb-1 block">Line Width</label>
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="number" min="0" max="10" 
                                                value={config.globalDesign?.lineWidth}
                                                onChange={(e) => updateGlobalDesign('lineWidth', parseInt(e.target.value))}
                                                className="w-full border p-1 rounded text-xs"
                                            />
                                            <span className="text-xs text-gray-400">px</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-600 mb-1 block">Global Radius</label>
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="number" min="0" max="30" 
                                                value={config.globalDesign?.borderRadius}
                                                onChange={(e) => updateGlobalDesign('borderRadius', parseInt(e.target.value))}
                                                className="w-full border p-1 rounded text-xs"
                                            />
                                            <span className="text-xs text-gray-400">px</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-bold text-gray-600 mb-1 block">Line Color</label>
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="color" 
                                                value={config.globalDesign?.lineColor || config.colors.primary} 
                                                onChange={(e) => updateGlobalDesign('lineColor', e.target.value)}
                                                className="h-8 w-12 border rounded cursor-pointer"
                                            />
                                            <button onClick={() => updateGlobalDesign('lineColor', undefined)} className="text-[10px] text-red-500 hover:underline">Reset</button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-600 mb-1 block">Border Style</label>
                                        <select 
                                            value={config.globalDesign?.borderStyle || 'solid'}
                                            onChange={(e) => updateGlobalDesign('borderStyle', e.target.value)}
                                            className="w-full border rounded p-1.5 text-xs bg-white"
                                        >
                                            <option value="solid">Solid</option>
                                            <option value="dashed">Dashed</option>
                                            <option value="dotted">Dotted</option>
                                            <option value="none">None</option>
                                        </select>
                                    </div>
                                </div>
                            </section>

                            {/* Detailed Colors */}
                            <section className="space-y-4 pt-4 border-t">
                                <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2 border-b pb-1"><Sliders size={14}/> Detailed Colors</h3>
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
                                    
                                    <div className="border-t my-2 pt-2">
                                        <div className="text-[10px] font-bold text-gray-500 mb-2 uppercase">Tags & Items</div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs text-gray-900">Tag Background</span>
                                            <input type="color" value={config.colors.tagBackground || config.colors.primary} onChange={e => setConfig({...config, colors: {...config.colors, tagBackground: e.target.value}})} className="h-6 w-10 border rounded cursor-pointer"/>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-900">Tag Text</span>
                                            <input type="color" value={config.colors.tagText || '#ffffff'} onChange={e => setConfig({...config, colors: {...config.colors, tagText: e.target.value}})} className="h-6 w-10 border rounded cursor-pointer"/>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}
                </>
            )}
         </div>

         {/* SIDEBAR FOOTER */}
         <div className="p-4 border-t bg-gray-50 flex flex-col gap-2">
             <button 
                onClick={handlePrint} 
                disabled={isGeneratingPdf}
                className="w-full bg-blue-600 text-white py-3 rounded font-bold shadow hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-wait"
            >
                 {isGeneratingPdf ? <Loader2 size={18} className="animate-spin"/> : <Download size={18}/>} 
                 {isGeneratingPdf ? 'Generating PDF...' : t.downloadPdf}
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
        } overflow-y-scroll print:h-auto print:overflow-visible`}
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
                      onEditSectionStyle={handleEditSectionStyle}
                  />
              </div>
          </div>
      </div>

      <TableEditorModal 
          isOpen={modalOpen} 
          onClose={() => setModalOpen(false)} 
          table={editingTableIndex !== null ? cvData.customTables[editingTableIndex] : null}
          onSave={saveTableFromModal}
          lang={config.language}
      />

      <ImageSettingsModal
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        imageStyle={cvData.personalInfo.imageStyle || { borderRadius: 0, borderWidth: 4, borderColor: '#ffffff' }}
        onSave={updateImageStyle}
      />
      
      {editingSectionId && (
          <StyleEditorModal 
              isOpen={styleModalOpen}
              onClose={() => { setStyleModalOpen(false); setEditingSectionId(null); }}
              sectionId={editingSectionId}
              currentStyle={cvData.sectionStyles[editingSectionId] || {}}
              onSave={updateSectionStyle}
          />
      )}

      {aiLoading && (
          <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center text-white flex-col print:hidden">
              <Bot size={48} className="animate-bounce mb-4 text-yellow-300"/>
              <p className="text-xl font-bold">{t.aiThinking}</p>
          </div>
      )}

    </div>
  );
};

export default App;