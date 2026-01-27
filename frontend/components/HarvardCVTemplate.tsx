import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'

// Harvard CV Template Styles
const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontSize: 11,
        fontFamily: 'Helvetica',
        lineHeight: 1.4,
    },
    header: {
        marginBottom: 20,
        textAlign: 'center',
    },
    name: {
        fontSize: 18,
        fontFamily: 'Helvetica-Bold',
        marginBottom: 4,
    },
    contactInfo: {
        fontSize: 10,
        color: '#333',
    },
    section: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 12,
        fontFamily: 'Helvetica-Bold',
        marginBottom: 8,
        borderBottom: '1px solid #000',
        paddingBottom: 2,
    },
    text: {
        marginBottom: 4,
    },
    bulletPoint: {
        flexDirection: 'row',
        marginBottom: 3,
        marginLeft: 15,
    },
    bullet: {
        width: 10,
    },
    bulletText: {
        flex: 1,
    },
    jobHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 2,
    },
    jobTitle: {
        fontFamily: 'Helvetica-Bold',
    },
    jobDate: {
        fontFamily: 'Helvetica-Oblique',
        fontSize: 10,
    },
    companyName: {
        fontFamily: 'Helvetica-Oblique',
        marginBottom: 4,
    },
    skillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    skillItem: {
        marginRight: 8,
        marginBottom: 4,
    },
})

type CVData = {
    name?: string
    email?: string
    phone?: string
    summary?: string
    skills?: Array<{ skill_name: string; skill_category: string }>
    education?: Array<{
        institution: string
        degree: string
        field_of_study?: string
        start_date?: string
        end_date?: string
    }>
    workExperience?: Array<{
        company: string
        position: string
        start_date?: string
        end_date?: string
        description?: string
    }>
    certifications?: Array<{
        certification_name: string
        issuing_organization?: string
        issue_date?: string
    }>
}

export const HarvardCVTemplate = ({ data }: { data: CVData }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.name}>{data.name || 'YOUR NAME'}</Text>
                <Text style={styles.contactInfo}>
                    {data.email || 'email@example.com'} | {data.phone || '+1 234 567 8900'}
                </Text>
            </View>

            {/* Summary */}
            {data.summary && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>SUMMARY</Text>
                    <Text style={styles.text}>{data.summary}</Text>
                </View>
            )}

            {/* Education */}
            {data.education && data.education.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>EDUCATION</Text>
                    {data.education.map((edu, i) => (
                        <View key={i} style={{ marginBottom: 8 }}>
                            <View style={styles.jobHeader}>
                                <Text style={styles.jobTitle}>{edu.degree}</Text>
                                <Text style={styles.jobDate}>
                                    {edu.start_date} - {edu.end_date || 'Present'}
                                </Text>
                            </View>
                            <Text style={styles.companyName}>{edu.institution}</Text>
                            {edu.field_of_study && (
                                <Text style={styles.text}>Field: {edu.field_of_study}</Text>
                            )}
                        </View>
                    ))}
                </View>
            )}

            {/* Experience */}
            {data.workExperience && data.workExperience.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>EXPERIENCE</Text>
                    {data.workExperience.map((exp, i) => (
                        <View key={i} style={{ marginBottom: 10 }}>
                            <View style={styles.jobHeader}>
                                <Text style={styles.jobTitle}>{exp.position}</Text>
                                <Text style={styles.jobDate}>
                                    {exp.start_date} - {exp.end_date || 'Present'}
                                </Text>
                            </View>
                            <Text style={styles.companyName}>{exp.company}</Text>
                            {exp.description && (
                                <View style={styles.bulletPoint}>
                                    <Text style={styles.bullet}>•</Text>
                                    <Text style={styles.bulletText}>{exp.description}</Text>
                                </View>
                            )}
                        </View>
                    ))}
                </View>
            )}

            {/* Skills */}
            {data.skills && data.skills.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>SKILLS</Text>
                    <View style={styles.skillsContainer}>
                        {data.skills.map((skill, i) => (
                            <Text key={i} style={styles.skillItem}>
                                {skill.skill_name}
                                {i < data.skills!.length - 1 ? ',' : ''}
                            </Text>
                        ))}
                    </View>
                </View>
            )}

            {/* Certifications */}
            {data.certifications && data.certifications.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>CERTIFICATIONS</Text>
                    {data.certifications.map((cert, i) => (
                        <View key={i} style={{ marginBottom: 4 }}>
                            <Text style={styles.text}>
                                <Text style={{ fontFamily: 'Helvetica-Bold' }}>
                                    {cert.certification_name}
                                </Text>
                                {cert.issuing_organization && ` - ${cert.issuing_organization}`}
                                {cert.issue_date && ` (${cert.issue_date})`}
                            </Text>
                        </View>
                    ))}
                </View>
            )}
        </Page>
    </Document>
)
