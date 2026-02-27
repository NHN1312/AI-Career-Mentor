'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { MoreHorizontal, Shield, User, Trash2, Loader2 } from 'lucide-react'

export interface UserRow {
    id: string
    email: string
    full_name: string | null
    role: string
    updated_at: string
    cv_count: number
}

interface Props { initialUsers: UserRow[] }

export default function UsersTable({ initialUsers }: Props) {
    const [users, setUsers] = useState<UserRow[]>(initialUsers)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null)
    const supabase = createClient()

    const handleRoleChange = async (userId: string, newRole: string) => {
        setActionLoading(userId)
        await supabase.from('profiles').update({ role: newRole }).eq('id', userId)
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)))
        setActionLoading(null)
    }

    const confirmDelete = async () => {
        if (!deleteTarget) return
        setActionLoading(deleteTarget.id)
        await supabase.from('profiles').delete().eq('id', deleteTarget.id)
        setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id))
        setDeleteTarget(null)
        setActionLoading(null)
    }

    return (
        <>
            {/* Confirm Delete Dialog */}
            <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Xoá user?</DialogTitle>
                        <DialogDescription>
                            Bạn sắp xoá <span className="font-medium text-foreground">{deleteTarget?.email}</span>.
                            Hành động này không thể hoàn tác.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setDeleteTarget(null)}>Huỷ</Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDelete}
                            disabled={!!actionLoading}
                        >
                            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Xoá'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="border rounded-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Ngày tạo</TableHead>
                            <TableHead className="text-center">CV đã phân tích</TableHead>
                            <TableHead className="w-12" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                    Không có users nào.
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium flex-shrink-0">
                                                {user.full_name?.[0] ?? user.email?.[0] ?? '?'}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-medium text-sm truncate">{user.full_name ?? '—'}</p>
                                                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="gap-1">
                                            {user.role === 'admin' ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {new Date(user.updated_at).toLocaleDateString('vi-VN')}
                                    </TableCell>
                                    <TableCell className="text-center font-medium">{user.cv_count}</TableCell>
                                    <TableCell>
                                        {actionLoading === user.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                                        ) : (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    {user.role === 'admin' ? (
                                                        <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'user')}>
                                                            <User className="w-4 h-4 mr-2" /> Đổi thành User
                                                        </DropdownMenuItem>
                                                    ) : (
                                                        <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'admin')}>
                                                            <Shield className="w-4 h-4 mr-2" /> Đổi thành Admin
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive"
                                                        onClick={() => setDeleteTarget(user)}
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2" /> Xoá user
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </>
    )
}
