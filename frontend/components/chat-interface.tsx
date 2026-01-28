'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTranslations, useLocale } from 'next-intl'
import ReactMarkdown from 'react-markdown'

type Message = {
    id: string
    role: 'user' | 'assistant'
    content: string
}

export function ChatInterface() {
    const [chatId, setChatId] = useState<string>('')
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const t = useTranslations('Chat')
    const locale = useLocale()

    useEffect(() => {
        setChatId(crypto.randomUUID())
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || isLoading) return

        const userMessage: Message = {
            id: crypto.randomUUID(),
            role: 'user',
            content: input,
        }

        setMessages(prev => [...prev, userMessage])
        setInput('')
        setIsLoading(true)

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMessage].map(m => ({
                        role: m.role,
                        content: m.content,
                    })),
                    chatId,
                    data: { locale } // Pass locale to API
                }),
            })

            if (!response.ok) throw new Error('Failed to get response')

            const reader = response.body?.getReader()
            const decoder = new TextDecoder()
            let assistantMessage = ''

            const assistantId = crypto.randomUUID()
            setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '' }])

            while (true) {
                const { done, value } = await reader!.read()
                if (done) break

                const chunk = decoder.decode(value)
                assistantMessage += chunk

                setMessages(prev =>
                    prev.map(m =>
                        m.id === assistantId ? { ...m, content: assistantMessage } : m
                    )
                )
            }
        } catch (error) {
            console.error('Chat error:', error)
            setMessages(prev => [...prev, {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: t('error'),
            }])
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="w-full h-[600px] flex flex-col">
            <CardHeader>
                <CardTitle>{t('title')}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto space-y-4 p-4">
                {messages.length === 0 && (
                    <div className="text-center text-muted-foreground mt-20">
                        <p>{t('welcome1')}</p>
                        <p>{t('welcome2')}</p>
                    </div>
                )}
                {messages.map((m) => (
                    <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex items-start gap-2 max-w-[80%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <Avatar>
                                <AvatarFallback>{m.role === 'user' ? 'U' : 'AI'}</AvatarFallback>
                                <AvatarImage src={m.role === 'user' ? undefined : "/ai-avatar.png"} />
                            </Avatar>
                            <div className={`rounded-lg p-3 ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'} overflow-hidden prose prose-sm dark:prose-invert max-w-none break-words`}>
                                <ReactMarkdown
                                    components={{
                                        p: ({ node, ...props }: any) => <p className="mb-2 last:mb-0" {...props} />,
                                        ul: ({ node, ...props }: any) => <ul className="list-disc pl-4 mb-2" {...props} />,
                                        ol: ({ node, ...props }: any) => <ol className="list-decimal pl-4 mb-2" {...props} />,
                                        li: ({ node, ...props }: any) => <li className="mb-1" {...props} />,
                                        a: ({ node, ...props }: any) => <a className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                                        strong: ({ node, ...props }: any) => <strong className="font-bold" {...props} />,
                                    }}
                                >
                                    {m.content}
                                </ReactMarkdown>
                            </div>
                        </div>
                    </div>
                ))}
            </CardContent>
            <CardFooter className="p-4 pt-0">
                <form onSubmit={handleSubmit} className="flex w-full gap-2">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={t('placeholder')}
                        disabled={isLoading}
                    />
                    <Button type="submit" disabled={isLoading || !input.trim()}>
                        {isLoading ? '...' : t('send')}
                    </Button>
                </form>
            </CardFooter>
        </Card>
    )
}
