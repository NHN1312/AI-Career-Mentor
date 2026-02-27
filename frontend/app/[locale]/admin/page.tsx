import { createAdminClient } from '@/utils/supabase/admin'
import { Users, FileText, TrendingUp, Activity, Brain } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import AdminUsersChart from './components/AdminUsersChart'

async function getStats() {
    // Use service-role client to bypass RLS and see ALL data
    const supabase = createAdminClient()

    // Total users
    const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

    // CV analyses today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const { count: analysesToday } = await supabase
        .from('resume_analyses')
        .select('*', { count: 'exact', head: true })
        .gte('analyzed_at', today.toISOString())

    // Total CV analyses
    const { count: totalAnalyses } = await supabase
        .from('resume_analyses')
        .select('*', { count: 'exact', head: true })

    // Total skills in library
    const { count: totalSkills } = await supabase
        .from('skills_library')
        .select('*', { count: 'exact', head: true })

    // Users registered over last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
    sevenDaysAgo.setHours(0, 0, 0, 0)

    const { data: recentUsers } = await supabase
        .from('profiles')
        .select('updated_at')
        .gte('updated_at', sevenDaysAgo.toISOString())
        .order('updated_at', { ascending: true })

    // Bucket users by day
    const dayMap: Record<string, number> = {}
    for (let i = 0; i < 7; i++) {
        const d = new Date(sevenDaysAgo)
        d.setDate(d.getDate() + i)
        const key = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
        dayMap[key] = 0
    }
    recentUsers?.forEach((u) => {
        const d = new Date(u.updated_at)
        const key = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
        if (key in dayMap) dayMap[key]++
    })
    const chartData = Object.entries(dayMap).map(([date, count]) => ({ date, count }))

    return { totalUsers, analysesToday, totalAnalyses, totalSkills, chartData }
}

export default async function AdminDashboardPage() {
    const { totalUsers, analysesToday, totalAnalyses, totalSkills, chartData } =
        await getStats()

    const stats = [
        {
            title: 'Tổng Users',
            value: totalUsers ?? 0,
            icon: Users,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
        },
        {
            title: 'CV Phân Tích Hôm Nay',
            value: analysesToday ?? 0,
            icon: Activity,
            color: 'text-green-500',
            bg: 'bg-green-500/10',
        },
        {
            title: 'Tổng CV Đã Phân Tích',
            value: totalAnalyses ?? 0,
            icon: FileText,
            color: 'text-orange-500',
            bg: 'bg-orange-500/10',
        },
        {
            title: 'Skills Trong Thư Viện',
            value: totalSkills ?? 0,
            icon: Brain,
            color: 'text-purple-500',
            bg: 'bg-purple-500/10',
        },
    ]

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground mt-1">Tổng quan hệ thống AI Career Mentor</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {stats.map((stat) => {
                    const Icon = stat.icon
                    return (
                        <Card key={stat.title}>
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        {stat.title}
                                    </CardTitle>
                                    <div className={`p-2 rounded-lg ${stat.bg}`}>
                                        <Icon className={`w-4 h-4 ${stat.color}`} />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold">{stat.value.toLocaleString()}</p>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Chart */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        <CardTitle>Users mới theo ngày (7 ngày gần đây)</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <AdminUsersChart data={chartData} />
                </CardContent>
            </Card>
        </div>
    )
}
