export type Product = {
  id: string
  seller_id: string
  title: string
  description: string | null
  price: number
  stock: number
  era_tag: string | null
  created_at: string
}