import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RevenueChart } from '@/components/dashboard/revenue-chart'

type OrderRow = { total_amount: number | string; status: string; created_at?: string | null }

// Groups paid orders into the last 6 calendar months for the chart
function monthlyRevenue(orders: OrderRow[]) {
  const now = new Date()
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    return {
      key: `${d.getFullYear()}-${d.getMonth()}`,
      month: d.toLocaleString('en-US', { month: 'short' }),
      revenue: 0,
    }
  })

  for (const o of orders) {
    if (!o.created_at) continue
    const d = new Date(o.created_at)
    const bucket = months.find((m) => m.key === `${d.getFullYear()}-${d.getMonth()}`)
    if (bucket) bucket.revenue += Number(o.total_amount)
  }

  return months.map(({ month, revenue }) => ({ month, revenue: Math.round(revenue * 100) / 100 }))
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const [{ count: productsCount }, { data: orders }] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*'),
  ])

  const paidOrders = ((orders ?? []) as OrderRow[]).filter((o) => o.status === 'paid')
  const pendingCount = (orders?.length ?? 0) - paidOrders.length
  const totalOrders = paidOrders.length
  const totalRevenue = paidOrders.reduce((sum, o) => sum + Number(o.total_amount), 0)
  const avgOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0
  const chartData = monthlyRevenue(paidOrders)

  const money = (n: number) =>
    `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{money(totalRevenue)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Paid Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            {pendingCount > 0 && (
              <p className="text-xs text-slate-500">{pendingCount} awaiting payment</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Listed Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productsCount ?? 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Avg. Order Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{money(avgOrder)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Revenue (last 6 months)</CardTitle>
        </CardHeader>
        <CardContent>
          <RevenueChart data={chartData} />
        </CardContent>
      </Card>
    </div>
  )
}
