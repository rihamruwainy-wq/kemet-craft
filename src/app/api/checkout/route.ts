import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Please sign in first' }, { status: 401 })

  const { productId } = await req.json()
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single()

  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  if (Number(product.stock) <= 0) {
    return NextResponse.json({ error: 'This item is out of stock' }, { status: 409 })
  }

  // Use the service role to create the order safely, on the server only
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .insert({
      buyer_id: user.id,
      total_amount: product.price,
      status: 'pending',
    })
    .select()
    .single()

  if (orderError || !order) {
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }

  // Record which product this order is for
  const { error: itemError } = await supabaseAdmin.from('order_items').insert({
    order_id: order.id,
    product_id: product.id,
    quantity: 1,
    unit_price: product.price,
  })

  if (itemError) {
    await supabaseAdmin.from('orders').delete().eq('id', order.id)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: { name: product.title },
          unit_amount: Math.round(Number(product.price) * 100),
        },
        quantity: 1,
      },
    ],
    metadata: { orderId: order.id, productId: product.id },
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/store/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/store`,
  })

  return NextResponse.json({ url: session.url })
}