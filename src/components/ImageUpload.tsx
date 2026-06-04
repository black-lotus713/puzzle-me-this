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
    <div className="space-y-2">
      {preview && (
        <img src={preview} alt="Preview" className="w-32 h-24 object-cover rounded" />
      )}
      <label className="flex items-center gap-2 cursor-pointer">
        <span className="px-3 py-1.5 bg-tan text-charcoal text-sm rounded hover:bg-olive/20 transition-colors">
          {uploading ? 'Uploading…' : 'Choose image'}
        </span>
        <input type="file" accept="image/*" className="hidden" onChange={handleChange} disabled={uploading} />
      </label>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  )
}
