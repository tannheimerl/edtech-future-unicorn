'use client'

import { useRef, useState } from 'react'
import { Icon } from "@/components/ui/Icon"
import { cn } from '@/lib/utils'
import { toDisplaySrc } from '@/lib/attachments'

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf']
const MAX_BYTES = 10 * 1024 * 1024

type Props = {
  urls: string[]
  onUpload: (file: File) => Promise<string | null>
  onDelete: (url: string) => Promise<void>
  disabled?: boolean
}

export const PruefungAnhangUpload = ({ urls, onUpload, onDelete, disabled }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!ACCEPTED.includes(file.type)) return
    if (file.size > MAX_BYTES) return
    e.target.value = ''
    setUploading(true)
    await onUpload(file)
    setUploading(false)
  }

  const handleDelete = async (url: string) => {
    setDeleting(url)
    await onDelete(url)
    setDeleting(null)
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {urls.map((url) => {
        const isPdf = url.toLowerCase().includes('.pdf') || url.includes('content-type=application%2Fpdf')
        const isDeleting = deleting === url
        const displaySrc = toDisplaySrc(url)
        return (
          <div key={url} className="group relative">
            {isPdf ? (
              <a
                href={displaySrc}
                target="_blank"
                rel="noopener noreferrer"
                title="PDF öffnen"
                className="flex size-10 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground hover:bg-accent transition-colors"
              >
                <Icon name="description" size={16} />
              </a>
            ) : (

              <a href={displaySrc} target="_blank" rel="noopener noreferrer">
                <img
                  src={displaySrc}
                  alt="Anhang"
                  className="size-10 rounded-lg object-cover border border-border"
                />
              </a>
            )}
            <button
              type="button"
              onClick={() => handleDelete(url)}
              disabled={isDeleting || !!disabled}
              className={cn(
                'absolute -right-1 -top-1 hidden size-4 items-center justify-center rounded-full bg-destructive text-destructive-foreground group-hover:flex',
                isDeleting && 'flex opacity-50'
              )}
            >
              {isDeleting ? <Icon name="progress_activity" size={10} className="animate-spin" /> : <Icon name="close" size={10} />}
            </button>
          </div>
        )
      })}

      {!disabled && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          title="Datei anhängen (Bild oder PDF, max. 10 MB)"
          className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-dashed border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground transition-colors disabled:opacity-50"
        >
          {uploading ? <Icon name="progress_activity" size={16} className="animate-spin" /> : <Icon name="add" size={16} />}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(',')}
        onChange={handleFile}
        className="hidden"
      />
    </div>
  )
}
