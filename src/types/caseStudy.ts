export type CaseStudyStatus = 'draft' | 'published' | 'featured'

export interface CaseStudy {
  id: string
  title: string
  client_type: string
  service_used: string
  result: string
  description: string
  image_url: string | null
  status: CaseStudyStatus
  created_at: string
  updated_at: string
}

export interface CaseStudyFormData {
  title: string
  client_type: string
  service_used: string
  result: string
  description: string
  image_url: string | null
  status: CaseStudyStatus
}
