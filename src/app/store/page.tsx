import Link from 'next/link'
import { connection } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BuyButton } from '@/components/store/buy-button'

// Reads the login session per request, so it renders on the server each time
export const instant = false

export default async function StorePage() {
  await connection()
  const supabase = await createClient()
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <h1 className="text-xl font-bold tracking-tight">KemetCraft Store</h1>
          <nav className="flex items-center gap-5 text-sm font-medium text-muted-foreground">
            <Link href="/store/assistant" className="hover:text-foreground">
              Ask our assistant
            </Link>
            <Link href="/store/chat" className="hover:text-foreground">
              Chat with us
            </Link>
            <Link href="/dashboard" className="hover:text-foreground">
              Seller Dashboard
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Authentic Heritage Crafts</h2>
          <p className="text-sm text-muted-foreground">Handcrafted Egyptian pieces delivered worldwide</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products?.map((product) => (
            <Card key={product.id} className="flex flex-col justify-between">
              <CardHeader className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{product.era_tag || 'Heritage'}</Badge>
                  <span className="text-lg font-bold">${Number(product.price).toFixed(2)}</span>
                </div>
                <CardTitle className="text-lg">{product.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {product.description || 'Handcrafted Egyptian heritage piece.'}
                </p>
              </CardContent>
              <CardFooter>
                <BuyButton productId={product.id} disabled={product.stock === 0} />
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}