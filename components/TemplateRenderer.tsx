
import React from 'react';
import { CVData, AppConfig, DynamicTableData } from '../types';
import { DynamicTable } from './DynamicTable';
import { Mail, Phone, MapPin, Linkedin, Edit2 } from 'lucide-react';

interface Props {
  data: CVData;
  config: AppConfig;
  setCVData: React.Dispatch<React.SetStateAction<CVData>>;
  isEditing: boolean;
  onEditTable: (index: number) => void;
  onEditImage: () => void;
}

export const TemplateRenderer: React.FC<Props> = ({ data, config, setCVData, isEditing, onEditTable, onEditImage }) => {
  
  const deleteTable = (index: number) => {
    if(window.confirm("Are you sure you want to delete this table?")) {
        const newTables = data.customTables.filter((_, i) => i !== index);
        setCVData({ ...data, customTables: newTables });
    }
  };

  // Convert spacing level to REM units
  const getSpacing = () => {
      switch(config.spacing) {
          case 1: return '0.5rem';
          case 3: return '1.5rem';
          default: return '1rem';
      }
  };

  // CSS Variables for dynamic styling
  const styleVars = {
    '--primary': config.colors.primary,
    '--secondary': config.colors.secondary,
    '--text-main': config.colors.text,
    '--text-head': config.colors.heading || config.colors.primary, 
    '--bg-main': config.colors.background,
    '--font-head': config.fonts.heading,
    '--font-body': config.fonts.body,
    '--spacing': getSpacing(),
    '--radius': `${config.borderRadius}px`,
  } as React.CSSProperties;

  // Custom Image Style
  const imgStyle = data.personalInfo.imageStyle 
    ? { 
        borderRadius: `${data.personalInfo.imageStyle.borderRadius}%`,
        borderWidth: `${data.personalInfo.imageStyle.borderWidth}px`,
        borderColor: data.personalInfo.imageStyle.borderColor
      }
    : { borderRadius: 'var(--radius)', borderWidth: '4px', borderColor: 'white' };

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
      <div className="flex min-h-[1123px] w-full" style={styleVars}>
        {/* Sidebar */}
        <div className="w-1/3 text-white p-8 flex flex-col gap-6" style={{ backgroundColor: 'var(--primary)', fontFamily: 'var(--font-body)' }}>
          <div className="flex flex-col items-center text-center">
            <div className="mb-4">
               <ProfileImage />
            </div>
            <h2 className="text-2xl font-bold break-words w-full" style={{ fontFamily: 'var(--font-head)' }}>{data.personalInfo.title}</h2>
          </div>

          <div className="flex flex-col gap-4 text-sm mt-4">
             <h3 className="font-bold border-b border-white/40 pb-2 uppercase tracking-widest" style={{ fontFamily: 'var(--font-head)' }}>Contact</h3>
             <div className="flex items-center gap-2 break-all"><Phone size={14} className="shrink-0"/> {data.personalInfo.phone}</div>
             <div className="flex items-center gap-2 break-all"><Mail size={14} className="shrink-0"/> {data.personalInfo.email}</div>
             <div className="flex items-center gap-2 break-all"><MapPin size={14} className="shrink-0"/> {data.personalInfo.address}</div>
             {data.personalInfo.linkedin && <div className="flex items-center gap-2 break-all"><Linkedin size={14} className="shrink-0"/> {data.personalInfo.linkedin}</div>}
          </div>

          <div className="flex flex-col gap-4 mt-4">
             <h3 className="font-bold border-b border-white/40 pb-2 uppercase tracking-widest" style={{ fontFamily: 'var(--font-head)' }}>Skills</h3>
             {data.skills.map(skill => (
                <div key={skill.id} className="text-sm">
                   <div className="flex justify-between mb-1">
                     <span>{skill.name}</span>
                   </div>
                   <div className="w-full bg-white/30 h-1.5" style={{ borderRadius: 'var(--radius)' }}>
                      <div className="bg-white h-1.5" style={{ width: `${skill.level * 20}%`, borderRadius: 'var(--radius)' }}></div>
                   </div>
                </div>
             ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="w-2/3 p-8 flex flex-col" style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', gap: 'var(--spacing)', fontFamily: 'var(--font-body)' }}>
           <div style={{ marginBottom: 'var(--spacing)' }}>
              <h1 className="text-5xl font-bold uppercase tracking-tight break-words" style={{ color: 'var(--text-head)', fontFamily: 'var(--font-head)' }}>
                {data.personalInfo.fullName}
              </h1>
              <p className="mt-4 leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--secondary)' }}>{data.personalInfo.summary}</p>
           </div>

           <div>
              <h3 className="text-xl font-bold uppercase tracking-widest border-b-2 pb-2 mb-4" style={{ borderColor: 'var(--primary)', color: 'var(--text-head)', fontFamily: 'var(--font-head)' }}>Experience</h3>
              {data.experience.map(exp => (
                 <div key={exp.id} className="mb-4 last:mb-0" style={{ marginBottom: 'var(--spacing)' }}>
                    <h4 className="font-bold text-lg" style={{ color: 'var(--text-head)' }}>{exp.role}</h4>
                    <div className="flex justify-between text-sm mb-2" style={{ color: 'var(--secondary)' }}>
                       <span className="font-semibold">{exp.company}</span>
                       <span>{exp.duration}</span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{exp.description}</p>
                 </div>
              ))}
           </div>

           <div>
              <h3 className="text-xl font-bold uppercase tracking-widest border-b-2 pb-2 mb-4" style={{ borderColor: 'var(--primary)', color: 'var(--text-head)', fontFamily: 'var(--font-head)' }}>Education</h3>
              {data.education.map(edu => (
                 <div key={edu.id} className="mb-3 last:mb-0" style={{ marginBottom: 'calc(var(--spacing) * 0.5)' }}>
                    <h4 className="font-bold" style={{ color: 'var(--text-head)' }}>{edu.degree}</h4>
                    <div className="text-sm" style={{ color: 'var(--secondary)' }}>{edu.school}, {edu.year}</div>
                 </div>
              ))}
           </div>

           <div>
             {data.customTables.map((table, i) => (
                <DynamicTable 
                    key={table.id} 
                    table={table} 
                    onEdit={() => onEditTable(i)} 
                    onDelete={() => deleteTable(i)} 
                    isEditing={isEditing}
                    primaryColor={config.colors.primary}
                />
             ))}
           </div>
        </div>
      </div>
    );
  }

  /* --- CLASSIC TEMPLATE (Simple, Elegant) --- */
  if (config.templateId === 'classic') {
    return (
      <div className="p-12 min-h-[1123px] w-full" style={styleVars}>
          <div 
             className="w-full h-full"
             style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', fontFamily: 'var(--font-body)' }}
          >
            <div className="text-center border-b-2 pb-6 mb-6" style={{ borderColor: 'var(--text-main)' }}>
                <h1 className="text-4xl font-bold uppercase mb-2" style={{ fontFamily: 'var(--font-head)', color: 'var(--text-head)' }}>{data.personalInfo.fullName}</h1>
                <p className="text-lg tracking-widest mb-2" style={{ color: 'var(--secondary)' }}>{data.personalInfo.title}</p>
                <div className="flex justify-center flex-wrap gap-4 text-sm" style={{ color: 'var(--secondary)' }}>
                    <span>{data.personalInfo.email}</span> | <span>{data.personalInfo.phone}</span> | <span>{data.personalInfo.address}</span>
                </div>
            </div>

            <div className="mb-6">
                <p className="text-center italic max-w-xl mx-auto whitespace-pre-wrap" style={{ color: 'var(--secondary)' }}>{data.personalInfo.summary}</p>
            </div>

            <div className="grid grid-cols-1" style={{ gap: 'var(--spacing)' }}>
                <section>
                    <h3 className="font-bold text-xl border-b mb-3 uppercase" style={{ fontFamily: 'var(--font-head)', borderColor: 'var(--secondary)', color: 'var(--text-head)' }}>Experience</h3>
                    {data.experience.map(exp => (
                        <div key={exp.id} className="mb-4 last:mb-0">
                            <div className="flex justify-between font-bold">
                                <span style={{ color: 'var(--primary)' }}>{exp.company}</span>
                                <span>{exp.duration}</span>
                            </div>
                            <div className="italic mb-1">{exp.role}</div>
                            <p className="text-sm whitespace-pre-wrap">{exp.description}</p>
                        </div>
                    ))}
                </section>

                <section>
                    <h3 className="font-bold text-xl border-b mb-3 uppercase" style={{ fontFamily: 'var(--font-head)', borderColor: 'var(--secondary)', color: 'var(--text-head)' }}>Education</h3>
                    {data.education.map(edu => (
                        <div key={edu.id} className="flex justify-between mb-2">
                            <span>{edu.school} - <span className="italic">{edu.degree}</span></span>
                            <span>{edu.year}</span>
                        </div>
                    ))}
                </section>
                
                <section>
                    {data.customTables.length > 0 && <h3 className="font-bold text-xl border-b mb-3 uppercase" style={{ fontFamily: 'var(--font-head)', borderColor: 'var(--secondary)', color: 'var(--text-head)' }}>Additional Data</h3>}
                    {data.customTables.map((table, i) => (
                        <DynamicTable 
                            key={table.id} 
                            table={table} 
                            onEdit={() => onEditTable(i)} 
                            onDelete={() => deleteTable(i)} 
                            isEditing={isEditing}
                            primaryColor={config.colors.primary}
                        />
                    ))}
                </section>
            </div>
         </div>
      </div>
    );
  }

  /* --- CREATIVE TEMPLATE (Header Image, Colorful) --- */
  return (
    <div className="min-h-[1123px] w-full flex flex-col" style={styleVars}>
       <div className="h-48 w-full relative shrink-0" style={{ backgroundColor: 'var(--primary)' }}>
          <div className="absolute -bottom-12 left-12">
             <ProfileImage />
          </div>
       </div>
       
       <div className="mt-16 px-12 pb-12 grow" style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', fontFamily: 'var(--font-body)' }}>
          <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
             <div>
                <h1 className="text-5xl font-bold break-words" style={{ fontFamily: 'var(--font-head)', color: 'var(--text-head)' }}>{data.personalInfo.fullName}</h1>
                <p className="text-2xl mt-1" style={{ color: 'var(--secondary)' }}>{data.personalInfo.title}</p>
             </div>
             <div className="text-right text-sm space-y-1" style={{ color: 'var(--secondary)' }}>
                <div className="flex justify-end items-center gap-2">{data.personalInfo.email} <Mail size={14}/></div>
                <div className="flex justify-end items-center gap-2">{data.personalInfo.phone} <Phone size={14}/></div>
                <div className="flex justify-end items-center gap-2">{data.personalInfo.address} <MapPin size={14}/></div>
             </div>
          </div>

          <div className="grid grid-cols-12 gap-8">
             <div className="col-span-8 space-y-6">
                <section>
                   <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-head)', fontFamily: 'var(--font-head)' }}>
                      <span className="w-2 h-8 block" style={{ backgroundColor: 'var(--primary)', borderRadius: '4px' }}></span> Profile
                   </h3>
                   <p className="leading-relaxed whitespace-pre-wrap">{data.personalInfo.summary}</p>
                </section>

                <section>
                   <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-head)', fontFamily: 'var(--font-head)' }}>
                      <span className="w-2 h-8 block" style={{ backgroundColor: 'var(--primary)', borderRadius: '4px' }}></span> Experience
                   </h3>
                   {data.experience.map(exp => (
                      <div key={exp.id} className="relative pl-6 border-l-2 mb-6 last:mb-0" style={{ borderColor: 'var(--secondary)', marginBottom: 'var(--spacing)' }}>
                         <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-4" style={{ borderColor: 'var(--secondary)', borderRadius: 'var(--radius)' }}></div>
                         <h4 className="font-bold text-lg" style={{ color: 'var(--text-head)' }}>{exp.role}</h4>
                         <div className="text-sm font-semibold mb-2" style={{ color: 'var(--primary)' }}>{exp.company} | {exp.duration}</div>
                         <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--secondary)' }}>{exp.description}</p>
                      </div>
                   ))}
                </section>

                <section>
                   {data.customTables.map((table, i) => (
                      <DynamicTable 
                          key={table.id} 
                          table={table} 
                          onEdit={() => onEditTable(i)} 
                          onDelete={() => deleteTable(i)} 
                          isEditing={isEditing}
                          primaryColor={config.colors.primary}
                      />
                   ))}
                </section>
             </div>

             <div className="col-span-4 flex flex-col gap-6 p-6" style={{ backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: 'var(--radius)' }}>
                 <section>
                    <h3 className="font-bold text-lg mb-4 uppercase" style={{ color: 'var(--secondary)', fontFamily: 'var(--font-head)' }}>Education</h3>
                    {data.education.map(edu => (
                       <div key={edu.id} className="mb-4">
                          <div className="font-bold">{edu.degree}</div>
                          <div className="text-sm" style={{ color: 'var(--secondary)' }}>{edu.school}</div>
                          <div className="text-xs inline-block px-2 py-1 rounded mt-1" style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}>{edu.year}</div>
                       </div>
                    ))}
                 </section>

                 <section>
                    <h3 className="font-bold text-lg mb-4 uppercase" style={{ color: 'var(--secondary)', fontFamily: 'var(--font-head)' }}>Skills</h3>
                    <div className="flex flex-wrap gap-2">
                       {data.skills.map(skill => (
                          <span key={skill.id} className="px-3 py-1 text-sm text-white shadow-sm" style={{ backgroundColor: 'var(--primary)', borderRadius: 'calc(var(--radius) + 4px)' }}>
                             {skill.name}
                          </span>
                       ))}
                    </div>
                 </section>
             </div>
          </div>
       </div>
    </div>
  );
};
