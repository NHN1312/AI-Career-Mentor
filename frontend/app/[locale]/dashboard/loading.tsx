export default function DashboardLoading() {
    return (
        <div className="p-8 max-w-6xl mx-auto animate-pulse">
            {/* Welcome banner skeleton */}
            <div className="mb-8 space-y-2">
                <div className="h-8 w-64 bg-muted rounded-lg" />
                <div className="h-4 w-48 bg-muted rounded-lg" />
            </div>

            {/* Cards grid skeleton */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="border rounded-xl p-5 space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-muted" />
                            <div className="h-5 w-32 bg-muted rounded" />
                        </div>
                        <div className="h-4 w-40 bg-muted rounded" />
                        <div className="h-9 w-full bg-muted rounded-lg" />
                    </div>
                ))}
            </div>

            {/* Chat skeleton */}
            <div className="border rounded-xl h-64 bg-muted/30" />
        </div>
    )
}
