import Link from 'next/link'
import { BrainCircuit, Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
            {/* Logo */}
            <div className="flex items-center gap-2 mb-12 text-muted-foreground">
                <BrainCircuit className="w-5 h-5" />
                <span className="text-sm font-medium">AI Career Mentor</span>
            </div>

            {/* 404 */}
            <p className="text-8xl font-bold tracking-tight text-muted-foreground/30 mb-2 select-none">
                404
            </p>
            <h1 className="text-2xl font-bold mb-2">Trang không tồn tại</h1>
            <p className="text-muted-foreground text-sm max-w-sm mb-8">
                Trang bạn đang tìm kiếm đã bị xóa, đổi tên, hoặc chưa bao giờ tồn tại.
            </p>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 justify-center">
                <Link href="/dashboard">
                    <Button className="gap-2">
                        <Home className="w-4 h-4" />
                        Về Dashboard
                    </Button>
                </Link>
                <Link href="/">
                    <Button variant="outline" className="gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Trang Chủ
                    </Button>
                </Link>
            </div>
        </div>
    )
}
