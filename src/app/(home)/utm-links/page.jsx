"use client"

import React, { useState, Suspense } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams, useRouter } from 'next/navigation'
import * as z from 'zod'
import { Copy, Plus, Check, Link as LinkIcon, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { toast } from 'sonner'
import { useApiClient } from '@/lib/axios'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// Zod schema for form validation
const utmLinkSchema = z.object({
  destinationUrl: z.string().url('Please enter a valid URL'),
  utmSource: z.string().min(1, 'UTM Source is required'),
  utmMedium: z.string().min(1, 'UTM Medium is required'),
  utmCampaign: z.string().optional(),
  utmContent: z.string().optional(),
})

const UtmLinksContent = () => {
  const [copiedCode, setCopiedCode] = useState(null)
  const api = useApiClient()
  const queryClient = useQueryClient()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get pagination params from URL or use defaults
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '10', 10)

  // React Hook Form setup
  const form = useForm({
    resolver: zodResolver(utmLinkSchema),
    defaultValues: {
      destinationUrl: '',
      utmSource: '',
      utmMedium: '',
      utmCampaign: '',
      utmContent: '',
    },
  })

  // Fetch UTM links with pagination
  const { data, isLoading } = useQuery({
    queryKey: ['utm-links', page, limit],
    queryFn: async () => {
      const response = await api.get(`/api/v1/utm-links?page=${page}&limit=${limit}`)
      return response.data
    },
  })

  // Extract data and pagination from response
  const utmLinks = data?.data || []
  const pagination = data?.metadata?.pagination || {
    count: 0,
    page: 1,
    pageCount: 1,
    limit: 10,
    from: 0,
    to: 0
  }

  // Update URL params when pagination changes
  const updatePagination = (newPage, newLimit) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', newPage.toString())
    params.set('limit', newLimit.toString())
    router.push(`?${params.toString()}`)
  }

  const handlePageChange = (newPage) => {
    updatePagination(newPage, limit)
  }

  const handleLimitChange = (newLimit) => {
    updatePagination(1, newLimit) // Reset to page 1 when changing limit
  }

  // Create UTM link mutation
  const createMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/api/v1/utm-links', {
        destinationUrl: data.destinationUrl,
        utmSource: data.utmSource,
        utmMedium: data.utmMedium,
        utmCampaign: data.utmCampaign || undefined,
        utmContent: data.utmContent || undefined,
      })
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['utm-links'] })
      form.reset()
      toast.success('UTM link created successfully!')
      // Switch to list tab after creation
      const listTab = document.querySelector('[value="list"]')
      if (listTab) listTab.click()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create UTM link')
    },
  })

  const onSubmit = (data) => {
    createMutation.mutate(data)
  }

  const copyToClipboard = (text, code) => {
    navigator.clipboard.writeText(text)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
    toast.success('Copied to clipboard!')
  }

  const getShortUrl = (code) => {
    const frontendUrl = typeof window !== 'undefined' ? window.location.origin : ''
    return `${frontendUrl}/r/${code}`
  }

  return (
    <div className="px-4 lg:px-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">UTM Links</h1>
        <p className="text-muted-foreground mt-2">
          Create and manage UTM tracking links for your campaigns
        </p>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList>
          <TabsTrigger value="list">All Links</TabsTrigger>
          <TabsTrigger value="create">Create New</TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Create UTM Short Link</CardTitle>
              <CardDescription>
                Generate a shortened URL with UTM parameters for tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="destinationUrl">Destination URL *</Label>
                  <Input
                    id="destinationUrl"
                    type="url"
                    placeholder="https://example.com/landing-page"
                    {...form.register('destinationUrl')}
                  />
                  {form.formState.errors.destinationUrl && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.destinationUrl.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="utmSource">UTM Source *</Label>
                    <Input
                      id="utmSource"
                      placeholder="facebook"
                      {...form.register('utmSource')}
                    />
                    {form.formState.errors.utmSource && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.utmSource.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="utmMedium">UTM Medium *</Label>
                    <Input
                      id="utmMedium"
                      placeholder="social"
                      {...form.register('utmMedium')}
                    />
                    {form.formState.errors.utmMedium && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.utmMedium.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="utmCampaign">UTM Campaign (optional)</Label>
                    <Input
                      id="utmCampaign"
                      placeholder="summer-sale"
                      {...form.register('utmCampaign')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="utmContent">UTM Content (optional)</Label>
                    <Input
                      id="utmContent"
                      placeholder="ad-variant-1"
                      {...form.register('utmContent')}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="w-full md:w-auto"
                >
                  {createMutation.isPending ? 'Creating...' : 'Create Short Link'}
                  <Plus className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>All UTM Links</CardTitle>
              <CardDescription>View and manage all your UTM short links</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : pagination.count === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No UTM links created yet. Create your first one!
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Code</TableHead>
                          <TableHead>Short URL</TableHead>
                          <TableHead>Destination URL</TableHead>
                          <TableHead>Source</TableHead>
                          <TableHead>Medium</TableHead>
                          <TableHead>Campaign</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {utmLinks.map((link) => {
                          const shortUrl = getShortUrl(link.code)
                          return (
                            <TableRow key={link.id}>
                              <TableCell className="font-mono text-sm">{link.code}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <LinkIcon className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                                    {shortUrl}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="text-sm truncate max-w-[200px] block">
                                  {link.destination_url || link.destinationUrl}
                                </span>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{link.utm_source || link.utmSource}</Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary">{link.utm_medium || link.utmMedium}</Badge>
                              </TableCell>
                              <TableCell>
                                {link.utm_campaign || link.utmCampaign ? (
                                  <Badge variant="outline">
                                    {link.utm_campaign || link.utmCampaign}
                                  </Badge>
                                ) : (
                                  <span className="text-muted-foreground text-sm">-</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge variant={link.is_active !== false ? 'default' : 'destructive'}>
                                  {link.is_active !== false ? 'Active' : 'Inactive'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(shortUrl, link.code)}
                                >
                                  {copiedCode === link.code ? (
                                    <Check className="h-4 w-4" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </Button>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination Controls */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="text-muted-foreground text-sm hidden lg:flex">
                      Showing {pagination.from} to {pagination.to} of {pagination.count} links
                    </div>
                    <div className="flex w-full items-center gap-4 lg:w-fit lg:gap-6">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="rows-per-page" className="text-sm font-medium hidden lg:block">
                          Rows per page
                        </Label>
                        <Select
                          value={pagination.limit.toString()}
                          onValueChange={(value) => handleLimitChange(parseInt(value, 10))}
                        >
                          <SelectTrigger className="w-20" id="rows-per-page">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[10, 20, 30, 50, 100].map((size) => (
                              <SelectItem key={size} value={size.toString()}>
                                {size}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-center text-sm font-medium">
                        Page {pagination.page} of {pagination.pageCount}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handlePageChange(1)}
                          disabled={pagination.page === 1}
                        >
                          <span className="sr-only">Go to first page</span>
                          <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handlePageChange(pagination.page - 1)}
                          disabled={pagination.page === 1}
                        >
                          <span className="sr-only">Go to previous page</span>
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handlePageChange(pagination.page + 1)}
                          disabled={pagination.page >= pagination.pageCount}
                        >
                          <span className="sr-only">Go to next page</span>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handlePageChange(pagination.pageCount)}
                          disabled={pagination.page >= pagination.pageCount}
                        >
                          <span className="sr-only">Go to last page</span>
                          <ChevronsRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

const page = () => {
  return (
    <Suspense fallback={
      <div className="px-4 lg:px-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">UTM Links</h1>
          <p className="text-muted-foreground mt-2">
            Create and manage UTM tracking links for your campaigns
          </p>
        </div>
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      </div>
    }>
      <UtmLinksContent />
    </Suspense>
  )
}

export default page
