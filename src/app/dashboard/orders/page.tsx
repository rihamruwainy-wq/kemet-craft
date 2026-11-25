import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type Order = {
  id: string
  buyer_id: string
  total_amount: number | string
  status: string
  created_at?: string | null
}

const statusVariant = (status: string) =>
  status === 'paid' ? 'default' : status === 'pending' ? 'secondary' : 'outline'

export default async function OrdersPage() {
  const supabase = await createClient()
  const { data } = await supabase.from('orders').select('*')
  const orders = ((data ?? []) as Order[]).sort((a, b) =>
    String(b.created_at ?? '').localeCompare(String(a.created_at ?? ''))
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Orders</h2>
        <p className="text-sm text-slate-500">All orders placed through the store</p>
      </div>

      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length ? (
              orders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono text-xs">{o.id.slice(0, 8)}</TableCell>
                  <TableCell>
                    {o.created_at ? new Date(o.created_at).toLocaleDateString('en-GB') : '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(o.status)} className="capitalize">
                      {o.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    ${Number(o.total_amount).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-slate-500">
                  No orders yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
