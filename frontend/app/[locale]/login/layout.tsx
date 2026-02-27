import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Đăng Nhập — AI Career Mentor',
    description: 'Đăng nhập hoặc tạo tài khoản AI Career Mentor để bắt đầu hành trình phát triển sự nghiệp.',
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}
