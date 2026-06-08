export type FaqCategory = 'General' | 'Pricing' | 'Services' | 'Support' | 'Delivery'

export const FAQ_CATEGORIES: FaqCategory[] = [
  'General', 'Pricing', 'Services', 'Support', 'Delivery'
]

export interface FaqItem {
  id: string
  question: string
  answer: string
  category: FaqCategory
  published: boolean
  created_at: string
  updated_at: string
}

export type NewFaqItem = Omit<FaqItem, 'id' | 'created_at' | 'updated_at'>
export type FaqItemUpdate = Partial<NewFaqItem>
