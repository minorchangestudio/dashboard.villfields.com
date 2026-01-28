"use client"

import React, { Suspense } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useApiClient } from '@/lib/axios'
import { ArrowLeft, TrendingUp, Users, Globe } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Area, AreaChart, Bar, BarChart, Pie, PieChart, Cell, XAxis, YAxis, CartesianGrid } from 'recharts'

const AnalyticsContent = () => {
  const params = useParams()
  const router = useRouter()
  const api = useApiClient()
  const code = params.code

  const { data, isLoading, error } = useQuery({
    queryKey: ['utm-analytics', code],
    queryFn: async () => {
      const response = await api.get(`/api/v1/utm-links/analytics/${code}`)
      return response.data
    },
  })

  if (isLoading) {
    return (
      <div className="px-4 lg:px-6">
        <div className="text-center py-12 text-muted-foreground">Loading analytics...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-4 lg:px-6">
        <div className="text-center py-12 text-destructive">
          Error loading analytics: {error instanceof Error ? error.message : 'Unknown error'}
        </div>
        <div className="text-center">
          <Button onClick={() => router.push('/utm-links')} variant="outline" className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to UTM Links
          </Button>
        </div>
      </div>
    )
  }

  if (!data?.data) {
    return (
      <div className="px-4 lg:px-6">
        <div className="text-center py-12 text-muted-foreground">No analytics data found</div>
      </div>
    )
  }

  const analytics = data.data
  const { link, overview, timeSeries, countryDistribution, cityDistribution, deviceDistribution, browserDistribution, osDistribution, refererDistribution, hourlyDistribution, weeklyDistribution } = analytics

  // Chart configurations
  const timeSeriesConfig = {
    clicks: {
      label: "Clicks",
      color: "hsl(var(--chart-1))",
    },
  }

  const countryConfig = countryDistribution.reduce((acc, item, index) => {
    const colors = [
      "hsl(var(--chart-1))",
      "hsl(var(--chart-2))",
      "hsl(var(--chart-3))",
      "hsl(var(--chart-4))",
      "hsl(var(--chart-5))",
    ]
    acc[item.country] = {
      label: item.country,
      color: colors[index % colors.length],
    }
    return acc
  }, {})

  const deviceConfig = deviceDistribution.reduce((acc, item, index) => {
    const colors = [
      "hsl(var(--chart-1))",
      "hsl(var(--chart-2))",
      "hsl(var(--chart-3))",
    ]
    acc[item.device] = {
      label: item.device,
      color: colors[index % colors.length],
    }
    return acc
  }, {})

  const browserConfig = browserDistribution.reduce((acc, item, index) => {
    const colors = [
      "hsl(var(--chart-1))",
      "hsl(var(--chart-2))",
      "hsl(var(--chart-3))",
      "hsl(var(--chart-4))",
      "hsl(var(--chart-5))",
    ]
    acc[item.browser] = {
      label: item.browser,
      color: colors[index % colors.length],
    }
    return acc
  }, {})

  const osConfig = osDistribution.reduce((acc, item, index) => {
    const colors = [
      "hsl(var(--chart-1))",
      "hsl(var(--chart-2))",
      "hsl(var(--chart-3))",
      "hsl(var(--chart-4))",
    ]
    acc[item.os] = {
      label: item.os,
      color: colors[index % colors.length],
    }
    return acc
  }, {})

  const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ]

  return (
    <div className="px-4 lg:px-6 pb-8">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/utm-links')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to UTM Links
        </Button>
        <h1 className="text-3xl font-bold">UTM Link Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Code: <span className="font-mono">{link.code}</span>
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {link.destinationUrl}
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalClicks}</div>
            <p className="text-xs text-muted-foreground">All time clicks</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique IPs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.uniqueIPs}</div>
            <p className="text-xs text-muted-foreground">Unique visitors</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Countries</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.uniqueCountries}</div>
            <p className="text-xs text-muted-foreground">Countries reached</p>
          </CardContent>
        </Card>
      </div>

      {/* Time Series Chart */}
      {timeSeries.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Clicks Over Time</CardTitle>
            <CardDescription>Daily click distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={timeSeriesConfig} className="h-[300px]">
              <AreaChart data={timeSeries}>
                <defs>
                  <linearGradient id="fillClicks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-clicks)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--color-clicks)" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => {
                    const date = new Date(value)
                    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
                  }}
                />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Area
                  type="monotone"
                  dataKey="clicks"
                  stroke="var(--color-clicks)"
                  fill="url(#fillClicks)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Country Distribution */}
        {countryDistribution.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Country Distribution</CardTitle>
              <CardDescription>Clicks by country</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={countryConfig} className="h-[300px]">
                <BarChart data={countryDistribution.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="country"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                  <Bar dataKey="count" fill="var(--color-clicks)" radius={4} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {/* Device Type Distribution */}
        {deviceDistribution.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Device Type</CardTitle>
              <CardDescription>Clicks by device type</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={deviceConfig} className="h-[300px]">
                <PieChart>
                  <Pie
                    data={deviceDistribution}
                    dataKey="count"
                    nameKey="device"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ device, count }) => `${device}: ${count}`}
                  >
                    {deviceDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {/* Browser Distribution */}
        {browserDistribution.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Browser Distribution</CardTitle>
              <CardDescription>Clicks by browser</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={browserConfig} className="h-[300px]">
                <BarChart data={browserDistribution.slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="browser"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                  <Bar dataKey="count" fill="var(--color-clicks)" radius={4} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {/* OS Distribution */}
        {osDistribution.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Operating System</CardTitle>
              <CardDescription>Clicks by OS</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={osConfig} className="h-[300px]">
                <BarChart data={osDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="os"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                  <Bar dataKey="count" fill="var(--color-clicks)" radius={4} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {/* Hourly Distribution */}
        {hourlyDistribution.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Hourly Distribution</CardTitle>
              <CardDescription>Clicks by hour of day</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={timeSeriesConfig} className="h-[300px]">
                <BarChart data={hourlyDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="hour"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => `${value}:00`}
                  />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                  <Bar dataKey="count" fill="var(--color-clicks)" radius={4} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {/* Weekly Distribution */}
        {weeklyDistribution.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Day of Week Distribution</CardTitle>
              <CardDescription>Clicks by day of week</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={timeSeriesConfig} className="h-[300px]">
                <BarChart data={weeklyDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                  <Bar dataKey="count" fill="var(--color-clicks)" radius={4} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Top Cities and Referers */}
      <div className="grid gap-6 md:grid-cols-2 mt-6">
        {/* Top Cities */}
        {cityDistribution.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Top Cities</CardTitle>
              <CardDescription>Top 10 cities by clicks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {cityDistribution.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{item.city}</span>
                    <span className="text-sm font-medium">{item.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top Referers */}
        {refererDistribution.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Top Referers</CardTitle>
              <CardDescription>Top 10 traffic sources</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {refererDistribution.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm truncate max-w-[200px]">{item.referer}</span>
                    <span className="text-sm font-medium">{item.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

const Page = () => {
  return (
    <Suspense fallback={
      <div className="px-4 lg:px-6">
        <div className="text-center py-12 text-muted-foreground">Loading analytics...</div>
      </div>
    }>
      <AnalyticsContent />
    </Suspense>
  )
}

export default Page
