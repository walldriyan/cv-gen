import React, { useMemo, useCallback } from 'react';
import { CVData, AppConfig, DynamicTableData } from '../types';
import { DynamicTable } from './DynamicTable';
import { SectionWrapper } from './SectionWrapper';
import { Mail, Phone, MapPin, Linkedin, Edit2 } from 'lucide-react';

interface Props {
  data: CVData;
  config: AppConfig;
  setCVData: React.Dispatch<React.SetStateAction<CVData>>;
  isEditing: boolean;
  onEditTable: (index: number) => void;
  onEditImage: () => void;
  onEditSectionStyle: (id: string) => void;
}

export const TemplateRenderer: React.FC<Props> = ({ 
    data, 
    config, 
    setCVData, 
    isEditing, 
    onEditTable, 
    onEditImage,
    onEditSectionStyle
}) => {
  
  const deleteTable = useCallback((index: number) => {
    if(window.confirm("Are you sure you want to delete this table?")) {
        const newTables = data.customTables.filter((_, i) => i !== index);
        setCVData({ ...data, customTables: newTables });
    }
  }, [data, setCVData]);

  // Convert spacing level to REM units
  const getSpacing = () => {
      switch(config.spacing) {
          case 1: return '0.5rem';
          case 3: return '1.5rem';
          default: return '1rem';
      }
  };

  // GLOBAL CSS VARIABLES
  // These provide the default values for the entire document.
  // Individual sections can override them via SectionWrapper.
  const styleVars = useMemo(() => ({
    // Colors
    '--primary': config.colors.primary,
    '--secondary': config.colors.secondary,
    '--text-main': config.colors.text,
    '--text-head': config.colors.heading || config.colors.primary, 
    '--bg-main': config.colors.background,
    
    // Fonts
    '--font-head': config.fonts.heading,
    '--font-body': config.fonts.body,
    
    // Global Design System (from Advanced Tab)
    '--global-line-color': config.globalDesign?.lineColor || config.colors.primary,
    '--global-line-width': `${config.globalDesign?.lineWidth || 2}px`,
    '--global-border-color': config.globalDesign?.borderColor || config.colors.secondary,
    '--global-border-style': config.globalDesign?.borderStyle || 'solid',
    
    // Global Tag/Item Colors
    '--item-bg': config.colors.tagBackground || config.colors.primary,
    '--item-text': config.colors.tagText || '#ffffff',

    // Layout
    '--spacing': getSpacing(),
    '--radius': `${config.globalDesign?.borderRadius ?? config.borderRadius}px`,
    
    // Typography Scaling
    '--scale-head': config.globalDesign?.headingScale || 1,
    '--scale-body': config.globalDesign?.bodyScale || 1,

  } as React.CSSProperties), [config]);

  // Custom Image Style
  const imgStyle = useMemo(() => data.personalInfo.imageStyle 
    ? { 
        borderRadius: `${data.personalInfo.imageStyle.borderRadius}%`,
        borderWidth: `${data.personalInfo.imageStyle.borderWidth}px`,
        borderColor: data.personalInfo.imageStyle.borderColor
      }
    : { borderRadius: 'var(--radius)', borderWidth: '4px', borderColor: 'white' },
    [data.personalInfo.imageStyle]);

  const ProfileImage = () => (
      <div className="relative group inline-block">
        {data.personalInfo.imageUrl ? (
            <img 
                src={data.personalInfo.imageUrl} 
                alt="Profile" 
                className="w-32 h-32 object-cover shadow-lg" 
                style={{ ...imgStyle, borderStyle: 'solid' }}
            />
        ) : (
            <div className="w-32 h-32 bg-gray-300 flex items-center justify-center shadow-lg" style={{ ...imgStyle, borderStyle: 'solid' }}>
                <span className="text-gray-500 text-xs">No Photo</span>
            </div>
        )}
        {isEditing && (
            <button 
                onClick={(e) => { e.stopPropagation(); onEditImage(); }}
                className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-full transition-opacity no-print z-10"
                style={{ borderRadius: imgStyle.borderRadius }}
            >
                <Edit2 size={20} />
            </button>
        )}
      </div>
  );

  /* --- MODERN TEMPLATE (Sidebar Layout) --- */
  if (config.templateId === 'modern') {
    return (
      <div className="flex min-h-[1123px] w-full" style={{...styleVars, fontSize: 'calc(1rem * var(--scale-body))'}}>
        {/* Sidebar */}
        <SectionWrapper
            sectionId="modern_sidebar"
            isEditing={isEditing}
            onEdit={onEditSectionStyle}
            styles={data.sectionStyles['modern_sidebar']}
            className="w-1/3 p-8 flex flex-col gap-6 text-white"
            defaultStyles={{ backgroundColor: 'var(--primary)', fontFamily: 'var(--font-body)' }}
        >
          <div className="flex flex-col items-center text-center">
            <div className="mb-4">
               <ProfileImage />
            </div>
            <h2 className="font-bold break-words w-full" style={{ fontSize: 'calc(1.5rem * var(--scale-head))', fontFamily: 'var(--font-head)', color: 'var(--sec-heading-color, white)' }}>{data.personalInfo.title}</h2>
          </div>

          <SectionWrapper
              sectionId="modern_contact"
              isEditing={isEditing}
              onEdit={onEditSectionStyle}
              styles={data.sectionStyles['modern_contact']}
              className="flex flex-col gap-4 text-sm mt-4 break-inside-avoid"
          >
             <h3 className="font-bold border-b pb-2 uppercase tracking-widest" style={{ 
                 fontFamily: 'var(--font-head)', 
                 color: 'var(--sec-heading-color, white)',
                 borderColor: 'var(--sec-line-color, rgba(255,255,255,0.4))',
                 borderBottomWidth: 'var(--sec-line-width, var(--global-line-width))'
            }}>Contact</h3>
             <div className="flex items-center gap-2 break-all"><Phone size={14} className="shrink-0"/> {data.personalInfo.phone}</div>
             <div className="flex items-center gap-2 break-all"><Mail size={14} className="shrink-0"/> {data.personalInfo.email}</div>
             <div className="flex items-center gap-2 break-all"><MapPin size={14} className="shrink-0"/> {data.personalInfo.address}</div>
             {data.personalInfo.linkedin && <div className="flex items-center gap-2 break-all"><Linkedin size={14} className="shrink-0"/> {data.personalInfo.linkedin}</div>}
          </SectionWrapper>

          <SectionWrapper
              sectionId="modern_skills"
              isEditing={isEditing}
              onEdit={onEditSectionStyle}
              styles={data.sectionStyles['modern_skills']}
              className="flex flex-col gap-4 mt-4 break-inside-avoid"
          >
             <h3 className="font-bold border-b pb-2 uppercase tracking-widest" style={{ 
                 fontFamily: 'var(--font-head)', 
                 color: 'var(--sec-heading-color, white)',
                 borderColor: 'var(--sec-line-color, rgba(255,255,255,0.4))',
                 borderBottomWidth: 'var(--sec-line-width, var(--global-line-width))'
             }}>Skills</h3>
             {data.skills.map(skill => (
                <div key={skill.id} className="text-sm">
                   <div className="flex justify-between mb-1">
                     <span>{skill.name}</span>
                   </div>
                   {/* Progress Bar */}
                   <div className="w-full h-1.5" style={{ 
                       borderRadius: 'var(--radius)', 
                       backgroundColor: 'rgba(255,255,255,0.2)' 
                   }}>
                      <div className="h-1.5" style={{ 
                          width: `${skill.level * 20}%`, 
                          borderRadius: 'var(--radius)',
                          backgroundColor: 'var(--sec-line-color, currentColor)' 
                      }}></div>
                   </div>
                </div>
             ))}
          </SectionWrapper>
        </SectionWrapper>

        {/* Main Content */}
        <SectionWrapper 
            sectionId="modern_main"
            isEditing={isEditing}
            onEdit={onEditSectionStyle}
            styles={data.sectionStyles['modern_main']}
            className="w-2/3 p-8 flex flex-col"
            defaultStyles={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', gap: 'var(--spacing)', fontFamily: 'var(--font-body)' }}
        >
           <SectionWrapper
                sectionId="modern_header"
                isEditing={isEditing}
                onEdit={onEditSectionStyle}
                styles={data.sectionStyles['modern_header']}
                className="mb-6"
           >
              <h1 className="font-bold uppercase tracking-tight break-words" style={{ fontSize: 'calc(3rem * var(--scale-head))', color: 'var(--sec-heading-color, var(--text-head))', fontFamily: 'var(--font-head)' }}>
                {data.personalInfo.fullName}
              </h1>
              <p className="mt-4 leading-relaxed whitespace-pre-wrap" style={{ color: 'inherit', opacity: 0.9 }}>{data.personalInfo.summary}</p>
           </SectionWrapper>

           <SectionWrapper
                sectionId="modern_experience"
                isEditing={isEditing}
                onEdit={onEditSectionStyle}
                styles={data.sectionStyles['modern_experience']}
                className="mb-6"
           >
              <h3 className="text-xl font-bold uppercase tracking-widest border-b pb-2 mb-4" style={{ 
                  borderColor: 'var(--sec-line-color, var(--global-line-color))', 
                  borderBottomWidth: 'var(--sec-line-width, var(--global-line-width))',
                  borderStyle: 'var(--global-border-style)' as any,
                  color: 'var(--sec-heading-color, var(--text-head))', 
                  fontFamily: 'var(--font-head)' 
              }}>Experience</h3>
              
              {data.experience.map(exp => (
                 <div key={exp.id} className="mb-4 last:mb-0 break-inside-avoid" style={{ marginBottom: 'var(--sec-margin-bottom, var(--spacing))' }}>
                    <h4 className="font-bold text-lg" style={{ color: 'var(--sec-heading-color, var(--text-head))' }}>{exp.role}</h4>
                    <div className="flex justify-between text-sm mb-2" style={{ color: 'inherit', opacity: 0.8 }}>
                       <span className="font-semibold">{exp.company}</span>
                       <span>{exp.duration}</span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{exp.description}</p>
                 </div>
              ))}
           </SectionWrapper>

           <SectionWrapper
                sectionId="modern_education"
                isEditing={isEditing}
                onEdit={onEditSectionStyle}
                styles={data.sectionStyles['modern_education']}
                className="mb-6"
           >
              <h3 className="text-xl font-bold uppercase tracking-widest border-b pb-2 mb-4" style={{ 
                  borderColor: 'var(--sec-line-color, var(--global-line-color))', 
                  borderBottomWidth: 'var(--sec-line-width, var(--global-line-width))',
                  borderStyle: 'var(--global-border-style)' as any,
                  color: 'var(--sec-heading-color, var(--text-head))', 
                  fontFamily: 'var(--font-head)' 
              }}>Education</h3>
              {data.education.map(edu => (
                 <div key={edu.id} className="mb-3 last:mb-0 break-inside-avoid" style={{ marginBottom: 'calc(var(--sec-margin-bottom, var(--spacing)) * 0.5)' }}>
                    <h4 className="font-bold" style={{ color: 'var(--sec-heading-color, var(--text-head))' }}>{edu.degree}</h4>
                    <div className="text-sm" style={{ color: 'inherit', opacity: 0.8 }}>{edu.school}, {edu.year}</div>
                 </div>
              ))}
           </SectionWrapper>

           <div>
             {data.customTables.map((table, i) => (
                <div key={table.id} className="break-inside-avoid">
                    <DynamicTable 
                        table={table} 
                        onEdit={() => onEditTable(i)} 
                        onDelete={() => deleteTable(i)} 
                        isEditing={isEditing}
                        primaryColor={config.colors.primary}
                    />
                </div>
             ))}
           </div>
        </SectionWrapper>
      </div>
    );
  }

  /* --- CLASSIC TEMPLATE (Simple, Elegant) --- */
  if (config.templateId === 'classic') {
    return (
      <div className="p-12 min-h-[1123px] w-full" style={{...styleVars, fontSize: 'calc(1rem * var(--scale-body))'}}>
          <div 
             className="w-full h-full"
             style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', fontFamily: 'var(--font-body)' }}
          >
            <SectionWrapper
                sectionId="classic_header"
                isEditing={isEditing}
                onEdit={onEditSectionStyle}
                styles={data.sectionStyles['classic_header']}
                className="text-center border-b pb-6 mb-6"
                defaultStyles={{ 
                    borderColor: 'var(--text-main)',
                    borderBottomWidth: 'var(--global-line-width)' 
                }}
            >
                <h1 className="font-bold uppercase mb-2" style={{ fontSize: 'calc(2.5rem * var(--scale-head))', fontFamily: 'var(--font-head)', color: 'var(--sec-heading-color, var(--text-head))' }}>{data.personalInfo.fullName}</h1>
                <p className="text-lg tracking-widest mb-2" style={{ color: 'inherit', opacity: 0.8 }}>{data.personalInfo.title}</p>
                <div className="flex justify-center flex-wrap gap-4 text-sm" style={{ color: 'inherit', opacity: 0.8 }}>
                    <span>{data.personalInfo.email}</span> | <span>{data.personalInfo.phone}</span> | <span>{data.personalInfo.address}</span>
                </div>
            </SectionWrapper>

            <SectionWrapper
                sectionId="classic_summary"
                isEditing={isEditing}
                onEdit={onEditSectionStyle}
                styles={data.sectionStyles['classic_summary']}
                className="mb-6 break-inside-avoid"
            >
                <p className="text-center italic max-w-xl mx-auto whitespace-pre-wrap" style={{ color: 'inherit' }}>{data.personalInfo.summary}</p>
            </SectionWrapper>

            <div className="grid grid-cols-1" style={{ gap: 'var(--spacing)' }}>
                <SectionWrapper
                    sectionId="classic_experience"
                    isEditing={isEditing}
                    onEdit={onEditSectionStyle}
                    styles={data.sectionStyles['classic_experience']}
                >
                    <h3 className="font-bold text-xl border-b mb-3 uppercase" style={{ 
                        fontFamily: 'var(--font-head)', 
                        borderColor: 'var(--sec-line-color, var(--global-line-color))', 
                        borderBottomWidth: 'var(--sec-line-width, var(--global-line-width))',
                        borderStyle: 'var(--global-border-style)' as any,
                        color: 'var(--sec-heading-color, var(--text-head))' 
                    }}>Experience</h3>
                    {data.experience.map(exp => (
                        <div key={exp.id} className="mb-4 last:mb-0 break-inside-avoid" style={{ marginBottom: 'var(--sec-margin-bottom, 1rem)' }}>
                            <div className="flex justify-between font-bold">
                                <span style={{ color: 'var(--sec-heading-color, var(--primary))' }}>{exp.company}</span>
                                <span>{exp.duration}</span>
                            </div>
                            <div className="italic mb-1">{exp.role}</div>
                            <p className="text-sm whitespace-pre-wrap">{exp.description}</p>
                        </div>
                    ))}
                </SectionWrapper>

                <SectionWrapper
                    sectionId="classic_education"
                    isEditing={isEditing}
                    onEdit={onEditSectionStyle}
                    styles={data.sectionStyles['classic_education']}
                >
                    <h3 className="font-bold text-xl border-b mb-3 uppercase" style={{ 
                         fontFamily: 'var(--font-head)', 
                         borderColor: 'var(--sec-line-color, var(--global-line-color))', 
                         borderBottomWidth: 'var(--sec-line-width, var(--global-line-width))',
                         borderStyle: 'var(--global-border-style)' as any,
                         color: 'var(--sec-heading-color, var(--text-head))' 
                    }}>Education</h3>
                    {data.education.map(edu => (
                        <div key={edu.id} className="flex justify-between mb-2 break-inside-avoid" style={{ marginBottom: 'calc(var(--sec-margin-bottom, 0.5rem))' }}>
                            <span>{edu.school} - <span className="italic">{edu.degree}</span></span>
                            <span>{edu.year}</span>
                        </div>
                    ))}
                </SectionWrapper>
                
                <section>
                    {data.customTables.length > 0 && <h3 className="font-bold text-xl border-b mb-3 uppercase" style={{ 
                        fontFamily: 'var(--font-head)', 
                        borderColor: 'var(--secondary)', 
                        borderBottomWidth: 'var(--global-line-width)',
                        color: 'var(--sec-heading-color, var(--text-head))' 
                    }}>Additional Data</h3>}
                    {data.customTables.map((table, i) => (
                        <div key={table.id} className="break-inside-avoid">
                            <DynamicTable 
                                table={table} 
                                onEdit={() => onEditTable(i)} 
                                onDelete={() => deleteTable(i)} 
                                isEditing={isEditing}
                                primaryColor={config.colors.primary}
                            />
                        </div>
                    ))}
                </section>
            </div>
         </div>
      </div>
    );
  }

  /* --- CREATIVE TEMPLATE (Header Image, Colorful) --- */
  return (
    <div className="min-h-[1123px] w-full flex flex-col" style={{...styleVars, fontSize: 'calc(1rem * var(--scale-body))'}}>
       <SectionWrapper
            sectionId="creative_header_bg"
            isEditing={isEditing}
            onEdit={onEditSectionStyle}
            styles={data.sectionStyles['creative_header_bg']}
            className="h-48 w-full relative shrink-0"
            defaultStyles={{ backgroundColor: 'var(--primary)' }}
       >
          <div className="absolute -bottom-12 left-12">
             <ProfileImage />
          </div>
       </SectionWrapper>
       
       <div className="mt-16 px-12 pb-12 grow" style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', fontFamily: 'var(--font-body)' }}>
          <SectionWrapper
             sectionId="creative_intro"
             isEditing={isEditing}
             onEdit={onEditSectionStyle}
             styles={data.sectionStyles['creative_intro']}
             className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4 break-inside-avoid"
          >
             <div>
                <h1 className="font-bold break-words" style={{ fontSize: 'calc(3rem * var(--scale-head))', fontFamily: 'var(--font-head)', color: 'var(--sec-heading-color, var(--text-head))' }}>{data.personalInfo.fullName}</h1>
                <p className="text-2xl mt-1" style={{ color: 'inherit', opacity: 0.8 }}>{data.personalInfo.title}</p>
             </div>
             <div className="text-right text-sm space-y-1" style={{ color: 'inherit', opacity: 0.8 }}>
                <div className="flex justify-end items-center gap-2">{data.personalInfo.email} <Mail size={14}/></div>
                <div className="flex justify-end items-center gap-2">{data.personalInfo.phone} <Phone size={14}/></div>
                <div className="flex justify-end items-center gap-2">{data.personalInfo.address} <MapPin size={14}/></div>
             </div>
          </SectionWrapper>

          <div className="grid grid-cols-12 gap-8">
             <div className="col-span-8 space-y-6">
                <SectionWrapper
                    sectionId="creative_summary"
                    isEditing={isEditing}
                    onEdit={onEditSectionStyle}
                    styles={data.sectionStyles['creative_summary']}
                    className="break-inside-avoid"
                >
                   <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--sec-heading-color, var(--text-head))', fontFamily: 'var(--font-head)' }}>
                      <span className="block" style={{ 
                          backgroundColor: 'var(--sec-line-color, var(--primary))', 
                          borderRadius: '4px',
                          width: 'var(--sec-line-width, 8px)', // Decoration uses line width too
                          height: '32px'
                      }}></span> Profile
                   </h3>
                   <p className="leading-relaxed whitespace-pre-wrap" style={{ color: 'inherit' }}>{data.personalInfo.summary}</p>
                </SectionWrapper>

                <SectionWrapper
                    sectionId="creative_experience"
                    isEditing={isEditing}
                    onEdit={onEditSectionStyle}
                    styles={data.sectionStyles['creative_experience']}
                >
                   <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--sec-heading-color, var(--text-head))', fontFamily: 'var(--font-head)' }}>
                      <span className="block" style={{ 
                          backgroundColor: 'var(--sec-line-color, var(--primary))', 
                          borderRadius: '4px',
                          width: 'var(--sec-line-width, 8px)',
                          height: '32px'
                      }}></span> Experience
                   </h3>
                   
                   {data.experience.map(exp => (
                      <div key={exp.id} className="relative pl-6 mb-6 last:mb-0 break-inside-avoid" style={{ 
                          borderLeftStyle: 'var(--global-border-style)' as any,
                          borderLeftColor: 'var(--sec-line-color, var(--secondary))', 
                          borderLeftWidth: 'var(--sec-line-width, var(--global-line-width))',
                          marginBottom: 'var(--sec-margin-bottom, var(--spacing))'
                       }}>
                         <div className="absolute top-0 rounded-full bg-white border-solid" style={{ 
                             left: 'calc(var(--sec-line-width, var(--global-line-width)) * -0.5 - 7px)', // Center dot on line
                             borderColor: 'var(--sec-line-color, var(--secondary))', 
                             borderRadius: 'var(--radius)',
                             width: '16px',
                             height: '16px',
                             borderWidth: '4px'
                        }}></div>
                         <h4 className="font-bold text-lg" style={{ color: 'var(--sec-heading-color, var(--text-head))' }}>{exp.role}</h4>
                         <div className="text-sm font-semibold mb-2" style={{ color: 'var(--primary)' }}>{exp.company} | {exp.duration}</div>
                         <p className="text-sm whitespace-pre-wrap" style={{ color: 'inherit', opacity: 0.9 }}>{exp.description}</p>
                      </div>
                   ))}
                </SectionWrapper>

                <section>
                   {data.customTables.map((table, i) => (
                      <div key={table.id} className="break-inside-avoid">
                        <DynamicTable 
                            table={table} 
                            onEdit={() => onEditTable(i)} 
                            onDelete={() => deleteTable(i)} 
                            isEditing={isEditing}
                            primaryColor={config.colors.primary}
                        />
                      </div>
                   ))}
                </section>
             </div>

             <div className="col-span-4">
                 <SectionWrapper
                    sectionId="creative_sidebar_box"
                    isEditing={isEditing}
                    onEdit={onEditSectionStyle}
                    styles={data.sectionStyles['creative_sidebar_box']}
                    className="flex flex-col gap-6 p-6 break-inside-avoid"
                    defaultStyles={{ backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: 'var(--radius)' }}
                 >
                    <section>
                        <h3 className="font-bold text-lg mb-4 uppercase" style={{ color: 'var(--sec-heading-color, var(--secondary))', fontFamily: 'var(--font-head)' }}>Education</h3>
                        {data.education.map(edu => (
                        <div key={edu.id} className="mb-4">
                            <div className="font-bold">{edu.degree}</div>
                            <div className="text-sm" style={{ color: 'inherit', opacity: 0.8 }}>{edu.school}</div>
                            <div className="text-xs inline-block px-2 py-1 rounded mt-1" style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}>{edu.year}</div>
                        </div>
                        ))}
                    </section>

                    <section>
                        <h3 className="font-bold text-lg mb-4 uppercase" style={{ color: 'var(--sec-heading-color, var(--secondary))', fontFamily: 'var(--font-head)' }}>Skills</h3>
                        <div className="flex flex-wrap gap-2">
                        {data.skills.map(skill => (
                            <span key={skill.id} className="px-3 py-1 text-sm shadow-sm font-medium" style={{ 
                                backgroundColor: 'var(--item-bg, var(--primary))', // Use global item bg
                                color: 'var(--item-text, white)', // Use global item text
                                borderRadius: 'calc(var(--radius) + 4px)' 
                            }}>
                                {skill.name}
                            </span>
                        ))}
                        </div>
                    </section>
                 </SectionWrapper>
             </div>
          </div>
       </div>
    </div>
  );
};