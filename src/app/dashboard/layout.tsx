import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/Sidebar'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        redirect('/login')
    }

    return (
        <div className="min-h-screen obsidian-gradient flex flex-col lg:flex-row">
            <Sidebar />
            <div className="flex-1 lg:ml-64 transition-all duration-300">
                {children}
            </div>
        </div>
    )
}
