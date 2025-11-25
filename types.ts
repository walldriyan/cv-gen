

export interface DynamicTableData {
  id: string;
  title: string;
  headers: string[];
  rows: string[][];
  styles?: {
    headerBg?: string;
    headerText?: string;
    borderColor?: string;
    textColor?: string;
  };
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  duration: string;
  description: string;
}

export interface Education {
  id: string;
  degree: string;
  school: string;
  year: string;
}

export interface Skill {
  id: string;
  name: string;
  level: number; // 1-5
}

export interface ImageStyle {
    borderRadius: number; // 0-50 percentage
    borderWidth: number; // px
    borderColor: string;
}

export interface SectionStyle {
    // Background
    backgroundColor?: string;
    
    // Typography
    color?: string; // Body Text color
    headingColor?: string; // Specific Heading color override
    fontSize?: number; // multiplier (0.8 - 2.0)
    fontWeight?: 'normal' | 'bold' | 'light';
    textAlign?: 'left' | 'center' | 'right' | 'justify';
    
    // Border (Box)
    borderColor?: string;
    borderRadius?: number;
    borderWidth?: number;
    borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none';
    
    // Layout
    padding?: number;
    marginBottom?: number; // Spacing between items inside
    
    // Decorations (Lines/Steppers)
    lineColor?: string;
    lineWidth?: number; // px for borders/lines
    
    // Items (Tags, Pills, Sub-elements)
    itemBackgroundColor?: string;
    itemTextColor?: string;
}

export interface CVData {
  personalInfo: {
    fullName: string;
    title: string;
    email: string;
    phone: string;
    address: string;
    linkedin: string;
    summary: string;
    imageUrl?: string;
    imageStyle?: ImageStyle;
  };
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  customTables: DynamicTableData[];
  // Store custom styles per section ID (e.g., 'sidebar', 'header', 'experience')
  sectionStyles: Record<string, SectionStyle>; 
}

export interface ColorProfile {
    id: string;
    name: string;
    colors: {
        primary: string;
        secondary: string;
        text: string;
        background: string;
        heading: string;
        tagBackground?: string;
        tagText?: string;
    };
}

export interface GlobalDesignSettings {
    // Typography Scales (multipliers)
    headingScale: number;
    bodyScale: number;
    
    // Global Decoration Defaults
    lineColor?: string;
    lineWidth: number;
    
    // Global Borders
    borderColor?: string;
    borderStyle: 'solid' | 'dashed' | 'dotted' | 'none';
    borderRadius: number; 
}

export interface AppConfig {
  templateId: 'modern' | 'classic' | 'creative';
  // Advanced Colors
  colors: {
      primary: string;
      secondary: string;
      text: string;
      background: string;
      heading: string; // Separate color for headings
      tagBackground?: string; // New: Global tag background
      tagText?: string; // New: Global tag text
  };
  // Advanced Fonts
  fonts: {
      heading: string;
      body: string;
  };
  globalDesign: GlobalDesignSettings;
  spacing: number; // 1-3 scale
  borderRadius: number; // 0-20px (Legacy support, now merged into globalDesign but kept for compatibility)
  language: 'en' | 'si';
}

export const TRANSLATIONS = {
  en: {
    appTitle: "Smart CV",
    tabData: "Content & Data",
    tabDesign: "Design & Style",
    personalInfo: "Personal Info",
    experience: "Experience",
    education: "Education",
    skills: "Skills",
    customTables: "Exam Results / Custom Tables",
    addTable: "Add New Table",
    template: "Template",
    color: "Colors",
    fonts: "Typography",
    layout: "Layout",
    scanImage: "Scan Style from Image",
    scanDesc: "Upload a CV image. AI will extract colors and layout style.",
    downloadPdf: "Download PDF",
    saveJson: "Save JSON",
    loadJson: "Load JSON",
    loadExcel: "Load Excel",
    aiThinking: "AI is analyzing...",
    tableEdit: "Edit Table",
    editContent: "Edit Content",
    aiRewrite: "AI Rewrite",
    addExp: "Add Experience",
    cancel: "Cancel",
    save: "Save",
    addColumn: "Add Column",
    addRow: "Add Row",
    tableTitle: "Table Title",
    advColors: "Color Palette",
    advFonts: "Advanced Fonts",
    borderRadius: "Border Radius",
    tableStyles: "Table Styles",
    headerBg: "Header Background",
    borderColor: "Border Color",
    loadProfile: "Load Profile",
    saveProfile: "Save Profile",
    deleteProfile: "Delete",
    globalSettings: "Global Settings",
    headingSize: "Heading Size",
    bodySize: "Body Size",
    lineStyle: "Line Style"
  },
  si: {
    appTitle: "Smart CV",
    tabData: "දත්ත",
    tabDesign: "මෝස්තරය",
    personalInfo: "පෞද්ගලික විස්තර",
    experience: "අත්දැකීම්",
    education: "අධ්‍යාපන සුදුසුකම්",
    skills: "හැකියාවන්",
    customTables: "විභාග ප්‍රතිඵල / වගු",
    addTable: "අලුත් වගුවක් එකතු කරන්න",
    template: "තේමාව",
    color: "වර්ණ",
    fonts: "අකුරු විලාසය",
    layout: "පිරිසැලසුම",
    scanImage: "රූපයෙන් මෝස්තරය ගන්න",
    scanDesc: "CV පින්තුරයක් අප්ලෝඩ් කරන්න. AI මගින් වර්ණ සහ මෝස්තරය ලබා ගනී.",
    downloadPdf: "PDF ලෙස ගන්න",
    saveJson: "JSON සුරකින්න",
    loadJson: "JSON ඇතුලත් කරන්න",
    loadExcel: "Excel ඇතුලත් කරන්න",
    aiThinking: "AI විශ්ලේෂණය කරයි...",
    tableEdit: "වගුව වෙනස් කරන්න",
    editContent: "වෙනස් කරන්න",
    aiRewrite: "AI මගින් ලියන්න",
    addExp: "අත්දැකීම් එකතු කරන්න",
    cancel: "අවලංගු කරන්න",
    save: "සුරකින්න",
    addColumn: "තීරුවක් (+Col)",
    addRow: "පේළියක් (+Row)",
    tableTitle: "වගුවේ නම",
    advColors: "වර්ණ පුවරුව (Palette)",
    advFonts: "අකුරු වර්ග",
    borderRadius: "හැඩය (Radius)",
    tableStyles: "වගුවේ මෝස්තරය",
    headerBg: "මාතෘකා පසුබිම",
    borderColor: "මායිම් වර්ණය",
    loadProfile: "තෝරන්න",
    saveProfile: "සුරකින්න",
    deleteProfile: "මකන්න",
    globalSettings: "පොදු සැකසුම්",
    headingSize: "මාතෘකා ප්‍රමාණය",
    bodySize: "අකුරු ප්‍රමාණය",
    lineStyle: "ඉරි සහ හැඩතල"
  }
};

declare global {
  interface Window {
    html2pdf?: () => {
      set: (options: any) => any;
      from: (element: HTMLElement) => any;
      save: () => Promise<void>;
    };
  }
}
