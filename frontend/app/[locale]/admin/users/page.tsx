import { createAdminClient } from '@/utils/supabase/admin'
import UsersTable, { UserRow } from './UsersTable'

async function getAllUsers(): Promise<UserRow[]> {
    const supabase = createAdminClient()

    const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, updated_at')
        .order('updated_at', { ascending: false })

    if (!profiles) return []

    // Fetch CV count for each user (admin client bypasses RLS)
    const withCounts = await Promise.all(
        profiles.map(async (p) => {
            const { count } = await supabase
                .from('resume_analyses')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', p.id)
            return {
                ...p,
                cv_count: count ?? 0,
            } as UserRow
        })
    )

    return withCounts
}

export default async function AdminUsersPage() {
    const users = await getAllUsers()

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">User Manager</h1>
                <p className="text-muted-foreground mt-1">
                    Quản lý tất cả người dùng · {users.length} users
                </p>
            </div>

            <UsersTable initialUsers={users} />
        </div>
    )
}
