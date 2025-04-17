
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { useTheme } from '@/components/ThemeProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowUpIcon, ArrowDownIcon, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { getDashboardSummary } from '@/lib/dataService';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const DashboardPage: React.FC = () => {
  const { theme } = useTheme();
  const [dashboardData, setDashboardData] = useState<any>(null);
  
  useEffect(() => {
    const fetchData = () => {
      const data = getDashboardSummary();
      setDashboardData(data);
    };
    
    fetchData();
  }, []);
  
  if (!dashboardData) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[500px]">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Loading dashboard data...</p>
          </div>
        </div>
      </Layout>
    );
  }
  
  // Colors for pie charts
  const COLORS = ['#6F4E37', '#8D6A41', '#AB834F', '#C09C6F', '#D2B990'];
  
  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card p-3 border shadow-sm rounded-md">
          <p className="font-medium">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} style={{ color: entry.color }}>
              {`${entry.name}: $${entry.value.toFixed(2)}`}
            </p>
          ))}
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <Layout>
      <div className="flex flex-col space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="stat-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${dashboardData.summary.totalExpenses.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">For current month</p>
            </CardContent>
          </Card>
          
          <Card className="stat-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${dashboardData.summary.totalEarnings.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">For current month</p>
            </CardContent>
          </Card>
          
          <Card className="stat-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Net Profit/Loss</CardTitle>
              {dashboardData.summary.netProfit >= 0 ? (
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-destructive" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                dashboardData.summary.netProfit >= 0 ? 'text-emerald-500' : 'text-destructive'
              }`}>
                ${Math.abs(dashboardData.summary.netProfit).toFixed(2)}
                {dashboardData.summary.netProfit >= 0 ? (
                  <ArrowUpIcon className="inline-block h-4 w-4 ml-1" />
                ) : (
                  <ArrowDownIcon className="inline-block h-4 w-4 ml-1" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {dashboardData.summary.netProfit >= 0 ? 'Profit' : 'Loss'} for current month
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Charts */}
        <Tabs defaultValue="expenses-earnings">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="expenses-earnings">Expenses vs Earnings</TabsTrigger>
            <TabsTrigger value="top-items">Top Items</TabsTrigger>
          </TabsList>
          
          <TabsContent value="expenses-earnings" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Trend: Expenses vs Earnings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] sm:h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={dashboardData.monthlyData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis 
                        dataKey="name"
                        stroke={theme === 'dark' ? '#f5f5dc' : '#2a2a2a'} 
                      />
                      <YAxis 
                        stroke={theme === 'dark' ? '#f5f5dc' : '#2a2a2a'} 
                        tickFormatter={(value) => `$${value}`}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="expenses"
                        name="Expenses"
                        stroke="#E53935"
                        activeDot={{ r: 8 }}
                      />
                      <Line type="monotone" dataKey="earnings" name="Earnings" stroke="#4CAF50" />
                      <Line type="monotone" dataKey="profit" name="Profit" stroke="#6F4E37" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="top-items" className="pt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Top 5 Purchased Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={dashboardData.topPurchasedItems}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {dashboardData.topPurchasedItems.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Top 5 Sold Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={dashboardData.topSoldItems}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <XAxis 
                          dataKey="name" 
                          stroke={theme === 'dark' ? '#f5f5dc' : '#2a2a2a'} 
                        />
                        <YAxis 
                          stroke={theme === 'dark' ? '#f5f5dc' : '#2a2a2a'} 
                          tickFormatter={(value) => `$${value}`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="value" name="Revenue" fill="#6F4E37" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Recent Transactions */}
        <h2 className="text-2xl font-bold tracking-tight mt-4">Recent Transactions</h2>
        
        <Tabs defaultValue="purchases">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="purchases">Recent Purchases</TabsTrigger>
            <TabsTrigger value="sales">Recent Sales</TabsTrigger>
          </TabsList>
          
          <TabsContent value="purchases" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Latest Purchases</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left font-medium p-2">Date</th>
                        <th className="text-left font-medium p-2">Item</th>
                        <th className="text-right font-medium p-2">Quantity</th>
                        <th className="text-right font-medium p-2">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.recentPurchases.map((purchase: any) => (
                        <tr key={purchase.id} className="border-b">
                          <td className="p-2">{purchase.date}</td>
                          <td className="p-2">{purchase.item_name}</td>
                          <td className="text-right p-2">{purchase.quantity}</td>
                          <td className="text-right p-2">${purchase.total.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="sales" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Latest Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left font-medium p-2">Date</th>
                        <th className="text-left font-medium p-2">Item</th>
                        <th className="text-right font-medium p-2">Quantity</th>
                        <th className="text-right font-medium p-2">Sale</th>
                        <th className="text-right font-medium p-2">Profit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.recentSales.map((sale: any) => (
                        <tr key={sale.id} className="border-b">
                          <td className="p-2">{sale.date}</td>
                          <td className="p-2">{sale.item_name}</td>
                          <td className="text-right p-2">{sale.quantity}</td>
                          <td className="text-right p-2">${sale.total_sale.toFixed(2)}</td>
                          <td className="text-right p-2 text-emerald-500">${sale.profit.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default DashboardPage;
