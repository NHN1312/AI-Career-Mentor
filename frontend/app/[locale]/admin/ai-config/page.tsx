'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Plus, Pencil, Trash2, Loader2, Search, Brain } from 'lucide-react'

type Category = 'technical' | 'tool' | 'framework' | 'soft_skill' | 'language'

interface Skill {
    id: string
    skill_name: string
    category: Category
    description: string | null
    created_at: string
}

const CATEGORIES: { value: Category; label: string; color: string }[] = [
    { value: 'technical', label: 'Technical', color: 'bg-blue-500/10 text-blue-600' },
    { value: 'tool', label: 'Tool', color: 'bg-orange-500/10 text-orange-600' },
    { value: 'framework', label: 'Framework', color: 'bg-green-500/10 text-green-600' },
    { value: 'soft_skill', label: 'Soft Skill', color: 'bg-pink-500/10 text-pink-600' },
    { value: 'language', label: 'Language', color: 'bg-purple-500/10 text-purple-600' },
]

const emptyForm = { skill_name: '', category: 'technical' as Category, description: '' }

export default function AdminAIConfigPage() {
    const [skills, setSkills] = useState<Skill[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingSkill, setEditingSkill] = useState<Skill | null>(null)
    const [form, setForm] = useState(emptyForm)
    const [saving, setSaving] = useState(false)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const supabase = createClient()

    const loadSkills = useCallback(async () => {
        setLoading(true)
        const { data } = await supabase
            .from('skills_library')
            .select('*')
            .order('skill_name')
        setSkills(data ?? [])
        setLoading(false)
    }, [supabase])

    useEffect(() => { loadSkills() }, [loadSkills])

    const filteredSkills = skills.filter((s) =>
        s.skill_name.toLowerCase().includes(search.toLowerCase()) ||
        s.category.toLowerCase().includes(search.toLowerCase())
    )

    const openCreate = () => {
        setEditingSkill(null)
        setForm(emptyForm)
        setDialogOpen(true)
    }

    const openEdit = (skill: Skill) => {
        setEditingSkill(skill)
        setForm({ skill_name: skill.skill_name, category: skill.category, description: skill.description ?? '' })
        setDialogOpen(true)
    }

    const handleSave = async () => {
        if (!form.skill_name.trim()) return
        setSaving(true)
        if (editingSkill) {
            await supabase.from('skills_library').update({
                skill_name: form.skill_name.trim(),
                category: form.category,
                description: form.description || null,
            }).eq('id', editingSkill.id)
        } else {
            await supabase.from('skills_library').insert({
                skill_name: form.skill_name.trim(),
                category: form.category,
                description: form.description || null,
            })
        }
        setSaving(false)
        setDialogOpen(false)
        loadSkills()
    }

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Xoá skill "${name}"?`)) return
        setActionLoading(id)
        await supabase.from('skills_library').delete().eq('id', id)
        setSkills((prev) => prev.filter((s) => s.id !== id))
        setActionLoading(null)
    }

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">AI Config</h1>
                <p className="text-muted-foreground mt-1">
                    Quản lý Skill Library · {skills.length} skills
                </p>
            </div>

            {/* Toolbar */}
            <div className="flex gap-3 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Tìm skill..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Button onClick={openCreate} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Thêm Skill
                </Button>
            </div>

            {/* Skills Grid */}
            {loading ? (
                <div className="flex justify-center items-center h-48">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
            ) : filteredSkills.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-3">
                    <Brain className="w-10 h-10 opacity-30" />
                    <p>{search ? 'Không tìm thấy skill phù hợp.' : 'Chưa có skill nào. Thêm skill đầu tiên!'}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredSkills.map((skill) => {
                        const cat = CATEGORIES.find((c) => c.value === skill.category)
                        return (
                            <div
                                key={skill.id}
                                className="border rounded-lg p-4 flex items-start justify-between gap-2 hover:shadow-sm transition-shadow"
                            >
                                <div className="min-w-0">
                                    <p className="font-medium text-sm truncate">{skill.skill_name}</p>
                                    {skill.description && (
                                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                            {skill.description}
                                        </p>
                                    )}
                                    <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full font-medium ${cat?.color}`}>
                                        {cat?.label}
                                    </span>
                                </div>
                                <div className="flex gap-1 flex-shrink-0">
                                    {actionLoading === skill.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin mt-1" />
                                    ) : (
                                        <>
                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(skill)}>
                                                <Pencil className="w-3.5 h-3.5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-destructive hover:text-destructive"
                                                onClick={() => handleDelete(skill.id, skill.skill_name)}
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Create / Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingSkill ? 'Sửa Skill' : 'Thêm Skill Mới'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label>Tên Skill *</Label>
                            <Input
                                placeholder="Ví dụ: React.js"
                                value={form.skill_name}
                                onChange={(e) => setForm((f) => ({ ...f, skill_name: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Danh mục *</Label>
                            <Select
                                value={form.category}
                                onValueChange={(v) => setForm((f) => ({ ...f, category: v as Category }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {CATEGORIES.map((c) => (
                                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label>Mô tả (tuỳ chọn)</Label>
                            <Input
                                placeholder="Mô tả ngắn về skill này..."
                                value={form.description}
                                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>Huỷ</Button>
                        <Button onClick={handleSave} disabled={saving || !form.skill_name.trim()}>
                            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {editingSkill ? 'Lưu thay đổi' : 'Thêm Skill'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
