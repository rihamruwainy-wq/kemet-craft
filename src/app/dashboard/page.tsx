import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RevenueChart } from '@/components/dashboard/revenue-chart'

const fallbackChartData = [
  { month: 'Jul', revenue: 1200 },
  { month: 'Aug', revenue: 1950 },
  { month: 'Sep', revenue: 1700 },
  { month: 'Oct', revenue: 2800 },
  { month: 'Nov', revenue: 3450 },
]

export default async function DashboardPage() {
  const supabase = await createClient()

  const [{ count: productsCount }, { data: orders }] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('total_amount, status'),
  ])

  const totalOrders = orders?.length ?? 0
  const totalRevenue = orders?.reduce((sum, o) => sum + Number(o.total_amount), 0) ?? 0
  const avgOrder = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
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
            <div className="text-2xl font-bold">${avgOrder}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Revenue Growth</CardTitle>
        </CardHeader>
        <CardContent>
          <RevenueChart data={fallbackChartData} />
        </CardContent>
      </Card>
    </div>
  )
}