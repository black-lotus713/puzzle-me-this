import { supabase } from '../lib/supabase'
import type { Product } from '../types/index'

export async function getProducts(filters?: { category?: string; status?: string }): Promise<Product[]> {
  let query = supabase.from('products').select('*').order('created_at', { ascending: false })

  if (filters?.category && filters.category !== 'All') {
    query = query.eq('category', filters.category)
  }
  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('featured', true)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createProduct(data: Omit<Product, 'id' | 'created_at'>): Promise<Product> {
  const { data: result, error } = await supabase
    .from('products')
    .insert(data)
    .select()
    .single()

  if (error) throw error
  return result
}

export async function updateProduct(id: string, data: Partial<Omit<Product, 'id' | 'created_at'>>): Promise<Product> {
  const { data: result, error } = await supabase
    .from('products')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return result
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw error
}

export async function uploadImage(file: File): Promise<string> {
  const filename = `${Date.now()}-${file.name}`
  const { error } = await supabase.storage.from('product-images').upload(filename, file)
  if (error) throw error

  const { data } = supabase.storage.from('product-images').getPublicUrl(filename)
  return data.publicUrl
}
