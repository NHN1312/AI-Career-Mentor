import { Navbar } from '@/components/navbar'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Dashboard — AI Career Mentor',
    description: 'Tư vấn sự nghiệp AI, phân tích CV, luyện phỏng vấn và xây dựng kỹ năng cùng AI Career Mentor.',
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            {children}
        </div>
    )
}
