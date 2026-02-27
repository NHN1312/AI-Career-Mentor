import { createAdminClient } from '@/utils/supabase/admin'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, User, Calendar, BarChart3, Files } from 'lucide-react'

export default async function AdminContentPage() {
    const supabase = createAdminClient()

    // Fetch analyses without FK join (user_id → auth.users, not profiles)
    const { data: analyses, error } = await supabase
        .from('resume_analyses')
        .select('id, file_name, analyzed_at, score, user_id')
        .order('analyzed_at', { ascending: false })
        .limit(50)

    // Fetch profiles separately for user names
    const userIds = [...new Set((analyses ?? []).map((a) => a.user_id))]
    const { data: profiles } = userIds.length > 0
        ? await supabase.from('profiles').select('id, full_name, email').in('id', userIds)
        : { data: [] }

    const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]))

    const totalAnalyses = analyses?.length ?? 0
    const scored = (analyses ?? []).filter((a) => a.score != null)
    const avgScore = scored.length > 0
        ? Math.round(scored.reduce((s, a) => s + (a.score ?? 0), 0) / scored.length)
        : null

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Content</h1>
                <p className="text-muted-foreground mt-1">Lịch sử phân tích CV của users</p>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                <Card>
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">Tổng CV đã phân tích</p>
                            <Files className="w-4 h-4 text-muted-foreground" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{totalAnalyses}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">Điểm trung bình</p>
                            <BarChart3 className="w-4 h-4 text-muted-foreground" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{avgScore ?? '—'}{avgScore ? '/100' : ''}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Analyses list */}
            {error || !analyses || analyses.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-3 border rounded-lg">
                    <FileText className="w-12 h-12 opacity-30" />
                    <div className="text-center">
                        <p className="font-medium">Chưa có CV nào được phân tích</p>
                        <p className="text-sm mt-1">Lịch sử phân tích CV sẽ hiển thị ở đây khi users bắt đầu sử dụng.</p>
                    </div>
                </div>
            ) : (
                <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 border-b">
                            <tr>
                                <th className="text-left px-4 py-3 font-medium">Tên file</th>
                                <th className="text-left px-4 py-3 font-medium">User</th>
                                <th className="text-left px-4 py-3 font-medium">Ngày phân tích</th>
                                <th className="text-center px-4 py-3 font-medium">Điểm</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {(analyses ?? []).map((a) => {
                                const profile = profileMap[a.user_id]
                                return (
                                    <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                                <span className="truncate max-w-[200px]">{a.file_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            <div className="flex items-center gap-1.5">
                                                <User className="w-3.5 h-3.5" />
                                                <span>{profile?.full_name ?? profile?.email ?? 'Unknown'}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5" />
                                                <span>{new Date(a.analyzed_at).toLocaleDateString('vi-VN')}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {a.score != null ? (
                                                <Badge variant={a.score >= 70 ? 'default' : a.score >= 50 ? 'secondary' : 'destructive'}>
                                                    {a.score}/100
                                                </Badge>
                                            ) : (
                                                <span className="text-muted-foreground">—</span>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
