import { useState } from 'react'
import { uploadImage } from '../hooks/useProducts'

interface Props {
  currentUrl?: string | null
  onUpload: (url: string) => void
}

export default function ImageUpload({ currentUrl, onUpload }: Props) {
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hovering, setHovering] = useState(false)

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const url = await uploadImage(file)
      setPreview(url)
      onUpload(url)
    } catch (err) {
      setError('Upload failed. Try again.')
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <label className="block cursor-pointer">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleChange}
          disabled={uploading}
        />
        <div
          className={`aspect-[4/3] relative overflow-hidden rounded-md border-2 border-dashed transition-all duration-[150ms] focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-accent ${
            preview
              ? 'border-border-strong'
              : 'border-border-strong bg-subtle hover:border-accent hover:bg-accent-light'
          }`}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
        >
          {uploading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-subtle">
              <div className="spinner text-accent" />
              <span className="mt-2 text-sm text-secondary">Uploading…</span>
            </div>
          ) : preview ? (
            <>
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              {hovering && (
                <div className="absolute inset-0 flex items-center justify-center bg-primary/60">
                  <span className="text-sm text-inverse font-medium">Change image</span>
                </div>
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-tertiary">
                <polyline points="16,16 12,12 8,16" />
                <line x1="12" y1="12" x2="12" y2="21" />
                <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
              </svg>
              <span className="mt-2 text-sm text-secondary">Click to upload or drag and drop</span>
              <span className="mt-1 text-xs text-tertiary">PNG, JPG, WEBP — max 10MB</span>
            </div>
          )}
        </div>
      </label>
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </div>
  )
}
