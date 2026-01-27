import React from 'react'

interface CVPreviewProps {
  cvData: {
    summary: string
    skills: string
    experience: string
  }
  profileData: any
}

export const CVPreview = React.forwardRef<HTMLDivElement, CVPreviewProps>(
  ({ cvData, profileData }, ref) => {
    const name = profileData?.profile?.email?.split('@')[0]?.toUpperCase() || 'YOUR NAME'
    const email = profileData?.profile?.email || 'email@example.com'

    return (
      <div
        ref={ref}
        style={{
          all: 'revert',
          width: '210mm',
          minHeight: '297mm',
          padding: '20mm',
          backgroundColor: '#ffffff',
          fontFamily: '"Times New Roman", Times, serif',
          fontSize: '11pt',
          lineHeight: '1.4',
          color: '#000000',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '18pt', fontWeight: 'bold', marginBottom: '5px' }}>
            {name}
          </div>
          <div style={{ fontSize: '10pt' }}>{email}</div>
        </div>

        {/* Summary */}
        {cvData.summary && (
          <div style={{ marginBottom: '18px' }}>
            <div style={{
              fontSize: '12pt',
              fontWeight: 'bold',
              borderBottom: '1px solid #000',
              paddingBottom: '2px',
              marginBottom: '8px'
            }}>
              SUMMARY
            </div>
            <p style={{ margin: 0 }}>{cvData.summary}</p>
          </div>
        )}

        {/* Education */}
        {profileData?.education?.length > 0 && (
          <div style={{ marginBottom: '18px' }}>
            <div style={{
              fontSize: '12pt',
              fontWeight: 'bold',
              borderBottom: '1px solid #000',
              paddingBottom: '2px',
              marginBottom: '8px'
            }}>
              EDUCATION
            </div>
            {profileData.education.map((edu: any, i: number) => (
              <div key={i} style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <div style={{ fontWeight: 'bold' }}>{edu.degree}</div>
                  <div style={{ fontStyle: 'italic', fontSize: '10pt' }}>
                    {edu.start_date || ''} - {edu.end_date || 'Present'}
                  </div>
                </div>
                <div style={{ fontStyle: 'italic', marginBottom: '4px' }}>{edu.institution}</div>
                {edu.field_of_study && <div>Field: {edu.field_of_study}</div>}
              </div>
            ))}
          </div>
        )}

        {/* Experience */}
        {profileData?.workExperience?.length > 0 && (
          <div style={{ marginBottom: '18px' }}>
            <div style={{
              fontSize: '12pt',
              fontWeight: 'bold',
              borderBottom: '1px solid #000',
              paddingBottom: '2px',
              marginBottom: '8px'
            }}>
              EXPERIENCE
            </div>
            {profileData.workExperience.map((exp: any, i: number) => (
              <div key={i} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <div style={{ fontWeight: 'bold' }}>{exp.position}</div>
                  <div style={{ fontStyle: 'italic', fontSize: '10pt' }}>
                    {exp.start_date || ''} - {exp.end_date || 'Present'}
                  </div>
                </div>
                <div style={{ fontStyle: 'italic', marginBottom: '4px' }}>{exp.company}</div>
                {exp.description && (
                  <div style={{ marginLeft: '20px', marginBottom: '3px' }}>
                    • {exp.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {profileData?.skills?.length > 0 && (
          <div style={{ marginBottom: '18px' }}>
            <div style={{
              fontSize: '12pt',
              fontWeight: 'bold',
              borderBottom: '1px solid #000',
              paddingBottom: '2px',
              marginBottom: '8px'
            }}>
              SKILLS
            </div>
            <div style={{ lineHeight: '1.6' }}>
              {profileData.skills.map((s: any) => s.skill_name).join(', ')}
            </div>
          </div>
        )}

        {/* Certifications */}
        {profileData?.certifications?.length > 0 && (
          <div style={{ marginBottom: '18px' }}>
            <div style={{
              fontSize: '12pt',
              fontWeight: 'bold',
              borderBottom: '1px solid #000',
              paddingBottom: '2px',
              marginBottom: '8px'
            }}>
              CERTIFICATIONS
            </div>
            {profileData.certifications.map((cert: any, i: number) => (
              <div key={i} style={{ marginBottom: '5px' }}>
                <strong>{cert.certification_name}</strong>
                {cert.issuing_organization && ` - ${cert.issuing_organization}`}
                {cert.issue_date && ` (${cert.issue_date})`}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }
)

CVPreview.displayName = 'CVPreview'
