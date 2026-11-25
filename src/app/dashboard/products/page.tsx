import { createClient } from '@/lib/supabase/server'
import { AddProductDialog } from '@/components/products/add-product-dialog'
import { ProductsTable } from '@/components/products/products-table'

export default async function ProductsPage() {
  const supabase = await createClient()
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">المنتجات</h2>
          <p className="text-sm text-slate-500">إدارة كتالوج القطع التراثية والمخزون</p>
        </div>
        <AddProductDialog />
      </div>

      <ProductsTable data={products ?? []} />
    </div>
  )
}