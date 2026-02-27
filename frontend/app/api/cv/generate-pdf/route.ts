import { NextRequest, NextResponse } from 'next/server'
import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'

// pdfMake standard fonts (Helvetica, Times, Courier) don't require vfs
// Using Helvetica as default to avoid font file issues on server-side

// Configure pdfMake to use standard PDF fonts (no vfs required)
pdfMake.fonts = {
    Helvetica: {
        normal: 'Helvetica',
        bold: 'Helvetica-Bold',
        italics: 'Helvetica-Oblique',
        bolditalics: 'Helvetica-BoldOblique'
    }
}

export async function POST(req: NextRequest) {
    try {
        console.log('=== PDF Generation API called ===')
        const body = await req.json()
        console.log('Request body received:', JSON.stringify(body).substring(0, 200))
        const { data, template } = body

        if (!data) {
            console.error('No data provided in request')
            return NextResponse.json({ error: 'CV data is required' }, { status: 400 })
        }

        console.log('Creating doc definition with template:', template || 'harvard')
        const docDefinition = getDocDefinition(data, template || 'harvard')
        console.log('Doc definition created successfully')

        // Generate PDF buffer
        console.log('Creating PDF document...')
        const pdfDocGenerator = pdfMake.createPdf(docDefinition)
        console.log('PDF generator created')

        return new Promise<Response>((resolve, reject) => {
            try {
                console.log('Calling getBuffer...')
                pdfDocGenerator.getBuffer((buffer: any) => {
                    try {
                        console.log('PDF buffer generated, size:', buffer?.length || 'undefined')

                        if (!buffer) {
                            console.error('Buffer is null or undefined')
                            reject(new Error('PDF buffer is empty'))
                            return
                        }

                        // Convert buffer to Uint8Array for NextResponse compatibility
                        const uint8Array = new Uint8Array(buffer)
                        console.log('Converted to Uint8Array, size:', uint8Array.length)

                        const response = new NextResponse(uint8Array, {
                            headers: {
                                'Content-Type': 'application/pdf',
                                'Content-Disposition': `attachment; filename="cv-${data.fullName || 'draft'}.pdf"`,
                            },
                        })
                        console.log('=== PDF Generation successful ===')
                        resolve(response)
                    } catch (innerError) {
                        console.error('Error in getBuffer callback:', innerError)
                        reject(innerError)
                    }
                })

                // Timeout fallback
                setTimeout(() => {
                    console.error('PDF generation timeout after 30 seconds')
                    reject(new Error('PDF generation timeout'))
                }, 30000)
            } catch (syncError) {
                console.error('Synchronous error in getBuffer:', syncError)
                reject(syncError)
            }
        })
    } catch (error) {
        console.error('=== PDF Generation Error ===')
        console.error('Error type:', (error as any)?.constructor?.name)
        console.error('Error message:', (error as Error)?.message)
        console.error('Error stack:', (error as Error)?.stack)
        return NextResponse.json({ error: 'Failed to generate PDF', details: (error as Error)?.message }, { status: 500 })
    }
}

function getDocDefinition(data: any, templateId: string): any {
    const isModern = templateId === 'modern'
    const isCreative = templateId === 'creative'

    return {
        defaultStyle: {
            font: 'Helvetica'
        },
        content: [
            { text: data.fullName || 'Your Name', style: 'header', alignment: isModern ? 'left' : 'center' },
            {
                text: [
                    data.email || '',
                    data.phone ? ` | ${data.phone}` : '',
                    data.address ? ` | ${data.address}` : '',
                    data.linkedin ? ` | ${data.linkedin}` : ''
                ].filter(Boolean).join(''),
                style: 'contact',
                alignment: isModern ? 'left' : 'center'
            },
            { text: '\n' },

            // Summary
            ...(data.summary ? [
                { text: 'Professional Summary', style: 'sectionHeader' },
                { text: data.summary, margin: [0, 5, 0, 15] }
            ] : []),

            // Experience
            ...(data.experience && data.experience.length > 0 ? [
                { text: 'Work Experience', style: 'sectionHeader' },
                ...data.experience.flatMap((exp: any) => [
                    {
                        columns: [
                            {
                                width: '*',
                                stack: [
                                    { text: exp.organization || 'Company', bold: true },
                                    { text: exp.position || 'Position', italics: true, fontSize: 10, margin: [0, 2, 0, 0] }
                                ]
                            },
                            {
                                width: 'auto',
                                stack: [
                                    { text: exp.location || '', alignment: 'right', fontSize: 10 },
                                    { text: `${exp.startDate || 'Start'} - ${exp.endDate || 'End'}`, alignment: 'right', fontSize: 10, margin: [0, 2, 0, 0] }
                                ]
                            }
                        ],
                        margin: [0, 5, 0, 3]
                    },
                    ...(exp.description ? [{ text: exp.description, margin: [0, 3, 0, 10] }] : [{ text: '\n' }])
                ]),
                { text: '\n' }
            ] : []),

            // Education
            ...(data.education && data.education.length > 0 ? [
                { text: 'Education', style: 'sectionHeader' },
                ...data.education.flatMap((edu: any) => [
                    {
                        columns: [
                            {
                                width: '*',
                                stack: [
                                    { text: edu.institution || 'Institution', bold: true },
                                    {
                                        text: [
                                            edu.degree || 'Degree',
                                            edu.field ? ` in ${edu.field}` : '',
                                            edu.gpa ? ` - GPA: ${edu.gpa}` : ''
                                        ].filter(Boolean).join(''),
                                        fontSize: 10,
                                        margin: [0, 2, 0, 0]
                                    }
                                ]
                            },
                            {
                                width: 'auto',
                                stack: [
                                    { text: edu.location || '', alignment: 'right', fontSize: 10 },
                                    { text: `${edu.startDate || 'Start'} - ${edu.endDate || 'End'}`, alignment: 'right', fontSize: 10, margin: [0, 2, 0, 0] }
                                ]
                            }
                        ],
                        margin: [0, 5, 0, 3]
                    },
                    ...(edu.description ? [{ text: edu.description, margin: [0, 3, 0, 10] }] : [{ text: '\n' }])
                ]),
                { text: '\n' }
            ] : []),

            // Skills
            ...(data.skills ? [
                { text: 'Skills', style: 'sectionHeader' },
                { text: data.skills, margin: [0, 5, 0, 15] }
            ] : []),

            // Projects
            ...(data.projects && data.projects.length > 0 ? [
                { text: 'Projects', style: 'sectionHeader' },
                ...data.projects.flatMap((proj: any) => [
                    {
                        columns: [
                            {
                                width: '*',
                                stack: [
                                    { text: proj.name || 'Project Name', bold: true },
                                    { text: proj.role || '', italics: true, fontSize: 10, margin: [0, 2, 0, 0] }
                                ]
                            },
                            {
                                width: 'auto',
                                text: `${proj.startDate || 'Start'} - ${proj.endDate || 'End'}`,
                                alignment: 'right',
                                fontSize: 10
                            }
                        ],
                        margin: [0, 5, 0, 3]
                    },
                    ...(proj.technologies ? [{
                        text: `Technologies: ${proj.technologies}`,
                        fontSize: 9,
                        color: '#666',
                        margin: [0, 2, 0, 2]
                    }] : []),
                    ...(proj.githubLink ? [{
                        text: proj.githubLink,
                        link: proj.githubLink,
                        color: 'blue',
                        fontSize: 9,
                        margin: [0, 0, 0, 2]
                    }] : []),
                    ...(proj.description ? [{ text: proj.description, margin: [0, 3, 0, 10] }] : [{ text: '\n' }])
                ]),
                { text: '\n' }
            ] : []),
        ],
        styles: {
            header: {
                fontSize: 22,
                bold: true,
                color: isCreative ? '#2563eb' : 'black'
            },
            contact: {
                fontSize: 10,
                color: '#666',
                margin: [0, 2, 0, 10]
            },
            sectionHeader: {
                fontSize: 14,
                bold: true,
                decoration: isModern ? undefined : 'underline',
                margin: [0, 10, 0, 5],
                color: isCreative ? '#2563eb' : 'black'
            }
        }
    }
}
