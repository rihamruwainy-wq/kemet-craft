import { createClient } from '@/lib/supabase/server'
import { AddProductDialog } from '@/components/products/add-product-dialog'
import { ProductsTable } from '@/components/products/products-table'

export default async function ProductsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('seller_id', user?.id ?? '')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Products</h2>
          <p className="text-sm text-slate-500">Manage your heritage catalog and stock</p>
        </div>
        <AddProductDialog />
      </div>

      <ProductsTable data={products ?? []} />
    </div>
  )
}