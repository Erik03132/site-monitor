export interface Site {
    id: string
    user_id: string
    url: string
    name: string | null
    scan_interval_minutes: number
    is_active: boolean
    last_scanned_at: string | null
    last_hash: string | null
    created_at: string
    updated_at: string
}

export interface Page {
    id: string
    site_id: string
    url: string
    title: string | null
    content_hash: string | null
    status: 'pending' | 'success' | 'error'
    error_message: string | null
    raw_html_path: string | null
    fetched_at: string
}

export interface Chunk {
    id: string
    page_id: string
    version: number
    position: number
    block_type: 'heading' | 'paragraph' | 'list' | 'table' | 'code' | 'mixed' | null
    content: string
    token_count: number | null
    created_at: string
}

export interface ChunkChange {
    id: string
    page_id: string
    chunk_id: string | null
    change_type: 'added' | 'removed' | 'modified'
    old_content: string | null
    new_content: string | null
    summary: string | null
    detected_at: string
}

export interface Keyword {
    id: string
    user_id: string
    keyword: string
    is_active: boolean
    created_at: string
}

export interface NotificationSettings {
    id: string
    user_id: string
    email_enabled: boolean
    email_frequency: 'instant' | 'daily' | 'weekly'
    email_address: string | null
    updated_at: string
}

export interface CreateSiteRequest {
    url: string
    name?: string
    scan_interval_minutes?: number
}

export interface UpdateSiteRequest {
    name?: string
    scan_interval_minutes?: number
    is_active?: boolean
}

export interface SiteWithStats extends Site {
    changes_count?: number
    pages_count?: number
}

export interface ChunkChangeWithContext extends ChunkChange {
    site_name?: string
    page_url?: string
}
