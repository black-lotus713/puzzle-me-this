export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  image_url: string | null
  featured: boolean
  status: 'active' | 'draft'
  created_at: string
}
