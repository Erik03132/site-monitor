export default function DashboardLoading() {
    return (
        <div className="p-8 max-w-7xl mx-auto animate-pulse">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <div className="h-9 w-48 bg-white/10 rounded-lg mb-2" />
                    <div className="h-4 w-64 bg-white/5 rounded-lg" />
                </div>
                <div className="h-12 w-40 bg-white/10 rounded-2xl" />
            </div>

            {/* Stats Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white/[0.03] rounded-3xl p-8 border border-white/[0.08]">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-white/5 rounded-2xl" />
                            <div>
                                <div className="h-10 w-12 bg-white/10 rounded-lg mb-2" />
                                <div className="h-3 w-16 bg-white/5 rounded-lg" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Content Skeleton */}
            <div className="bg-white/[0.03] rounded-3xl border border-white/[0.08] overflow-hidden">
                <div className="p-6 border-b border-white/[0.08] flex items-center justify-between">
                    <div className="h-6 w-40 bg-white/10 rounded-lg" />
                    <div className="h-4 w-24 bg-white/5 rounded-lg" />
                </div>
                <div className="divide-y divide-white/[0.05]">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="w-3 h-3 rounded-full mt-2.5 bg-white/5" />
                                <div className="flex-1">
                                    <div className="h-5 w-32 bg-white/10 rounded-lg mb-2" />
                                    <div className="h-4 w-full bg-white/5 rounded-lg mb-1" />
                                    <div className="h-4 w-2/3 bg-white/5 rounded-lg" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
