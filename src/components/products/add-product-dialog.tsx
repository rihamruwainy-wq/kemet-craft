'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus } from 'lucide-react'

export function AddProductDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { error } = await supabase.from('products').insert({
        seller_id: user.id,
        title: String(formData.get('title')),
        description: String(formData.get('description')),
        price: Number(formData.get('price')),
        stock: Number(formData.get('stock')),
        era_tag: String(formData.get('era_tag')),
      })

      if (!error) {
        setOpen(false)
        router.refresh()
      }
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 cursor-pointer">
  <Plus className="h-4 w-4" />
  Add Product
</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>إضافة منتج تراثي جديد</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">اسم المنتج</Label>
            <Input id="title" name="title" placeholder="مثال: تمثال باستت نحاسي" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="price">السعر ($)</Label>
              <Input id="price" name="price" type="number" step="0.01" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="stock">الكمية المتاحة</Label>
              <Input id="stock" name="stock" type="number" required />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="era_tag">العصر / التصنيف</Label>
            <Input id="era_tag" name="era_tag" placeholder="Pharaonic / Islamic / Coptic" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">الوصف والقصة التاريخية (يُستخدم في الـ RAG)</Label>
            <Input id="description" name="description" placeholder="وصف مختصر للقطعة وخامتها..." />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'جاري الحفظ...' : 'حفظ المنتج'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}