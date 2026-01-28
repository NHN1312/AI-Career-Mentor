'use client'

import React from 'react'

interface CVPreviewProps {
  data: {
    fullName: string
    email: string
    phone: string
    address: string
    linkedin: string
    summary: string
    experience: Array<{
      organization: string
      position: string
      startDate: string
      endDate: string
      location: string
      description: string
    }>
    education: Array<{
      institution: string
      degree: string
      field: string
      startDate: string
      endDate: string
      location: string
      gpa: string
      description: string
    }>
    skills: string
    projects: Array<{
      name: string
      description: string
      role: string
      startDate: string
      endDate: string
      githubLink: string
      technologies: string
    }>
  }
  template: 'harvard' | 'modern' | 'creative'
}

export function CVPreview({ data, template }: CVPreviewProps) {
  const isModern = template === 'modern'
  const isCreative = template === 'creative'

  console.log('CVPreview data:', data)

  return (
    <div className="w-full h-full overflow-auto bg-white p-12 shadow-2xl" style={{ fontFamily: 'serif' }}>
      {/* Header */}
      <div className={`mb-6 ${isModern ? 'text-left' : 'text-center'}`}>
        <h1 className={`text-3xl font-bold mb-2 ${isCreative ? 'text-blue-600' : 'text-black'}`}>
          {data.fullName || 'Your Name'}
        </h1>
        <div className="text-sm text-gray-600 space-x-2">
          {data.email && <span>{data.email}</span>}
          {data.phone && <span>| {data.phone}</span>}
          {data.address && <span>| {data.address}</span>}
          {data.linkedin && <span>| <a href={data.linkedin} className="text-blue-600 hover:underline">{data.linkedin}</a></span>}
        </div>
      </div>

      {/* Summary */}
      {data.summary && (
        <div className="mb-6">
          <h2 className={`text-lg font-bold mb-2 ${isCreative ? 'text-blue-600' : 'text-black'} ${!isModern && 'underline'}`}>
            Professional Summary
          </h2>
          <p className="text-base leading-relaxed whitespace-pre-wrap text-black">{data.summary}</p>
        </div>
      )}

      {/* Experience */}
      {data.experience.length > 0 && (
        <div className="mb-6">
          <h2 className={`text-lg font-bold mb-2 ${isCreative ? 'text-blue-600' : 'text-black'} ${!isModern && 'underline'}`}>
            Work Experience
          </h2>
          <div className="space-y-4">
            {data.experience.map((exp, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-black">{exp.organization || 'Company'}</h3>
                    <p className="text-sm text-gray-700 italic">{exp.position || 'Position'}</p>
                  </div>
                  <div className="text-right text-sm">
                    {exp.location && <p className="text-gray-600">{exp.location}</p>}
                    <p className="text-gray-600">
                      {exp.startDate || 'Start'} - {exp.endDate || 'End'}
                    </p>
                  </div>
                </div>
                {exp.description && (
                  <div className="mt-1 text-base text-black whitespace-pre-wrap leading-relaxed">
                    {exp.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <div className="mb-6">
          <h2 className={`text-lg font-bold mb-2 ${isCreative ? 'text-blue-600' : 'text-black'} ${!isModern && 'underline'}`}>
            Education
          </h2>
          <div className="space-y-4">
            {data.education.map((edu, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-black">{edu.institution || 'Institution'}</h3>
                    <p className="text-sm text-gray-700">
                      {edu.degree} {edu.field && `in ${edu.field}`}
                      {edu.gpa && ` - GPA: ${edu.gpa}`}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    {edu.location && <p className="text-gray-600">{edu.location}</p>}
                    <p className="text-gray-600">
                      {edu.startDate || 'Start'} - {edu.endDate || 'End'}
                    </p>
                  </div>
                </div>
                {edu.description && (
                  <div className="mt-1 text-base text-black whitespace-pre-wrap leading-relaxed">
                    {edu.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {data.skills && (
        <div className="mb-6">
          <h2 className={`text-lg font-bold mb-2 ${isCreative ? 'text-blue-600' : 'text-black'} ${!isModern && 'underline'}`}>
            Skills
          </h2>
          <p className="text-base leading-relaxed text-black">{data.skills}</p>
        </div>
      )}

      {/* Projects */}
      {data.projects.length > 0 && (
        <div className="mb-6">
          <h2 className={`text-lg font-bold mb-2 ${isCreative ? 'text-blue-600' : 'text-black'} ${!isModern && 'underline'}`}>
            Projects
          </h2>
          <div className="space-y-4">
            {data.projects.map((proj, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-black">{proj.name || 'Project Name'}</h3>
                    {proj.role && <p className="text-sm text-gray-700 italic">{proj.role}</p>}
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    {proj.startDate || 'Start'} - {proj.endDate || 'End'}
                  </div>
                </div>
                {proj.technologies && (
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-semibold">Technologies:</span> {proj.technologies}
                  </p>
                )}
                {proj.githubLink && (
                  <p className="text-sm mt-1">
                    <a href={proj.githubLink} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                      {proj.githubLink}
                    </a>
                  </p>
                )}
                {proj.description && (
                  <div className="mt-1 text-base text-black whitespace-pre-wrap leading-relaxed">
                    {proj.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
