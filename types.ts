
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
  };
  // Advanced Fonts
  fonts: {
      heading: string;
      body: string;
  };
  spacing: number; // 1-3 scale
  borderRadius: number; // 0-20px
  language: 'en' | 'si';
}

export const TRANSLATIONS = {
  en: {
    appTitle: "Smart CV",
    tabData: "Data",
    tabDesign: "Design",
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
    advColors: "Advanced Colors",
    advFonts: "Advanced Fonts",
    borderRadius: "Border Radius",
    tableStyles: "Table Styles",
    headerBg: "Header Background",
    borderColor: "Border Color"
  },
  si: {
    appTitle: "Smart CV",
    tabData: "දත්ත",
    tabDesign: "පෙනුම",
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
    advColors: "සියලු වර්ණ",
    advFonts: "අකුරු වර්ග",
    borderRadius: "හැඩය (Radius)",
    tableStyles: "වගුවේ මෝස්තරය",
    headerBg: "මාතෘකා පසුබිම",
    borderColor: "මායිම් වර්ණය"
  }
};
