import { View, Text, ScrollView } from '@tarojs/components'
import { useEffect, useState } from 'react'
import { RefreshCw, Boxes, Tags, FileText, Coins, Plus, Pencil, Trash2 } from 'lucide-react-taro'
import Taro from '@tarojs/taro'
import { Network } from '@/network'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

interface Overview {
  productCount: number
  categoryCount: number
  orderCount: number
  orderAmount: number
}
interface Category { id: number; name: string; note: string }
interface Product {
  id: number
  categoryId: number
  name: string
  subtitle: string
  price: number
  originalPrice?: number
  tags: string[]
  isFeatured?: boolean
  isHot?: boolean
}
interface OrderItem { name: string; qty: number }
interface Order {
  orderNo: string
  receiver: string
  phone: string
  address: string
  total: number
  status: string
  remark?: string
  createdAt: string
  items?: OrderItem[]
}

const fmtNum = (n: number) => (n >= 10000 ? `${(n / 10000).toFixed(2)}w` : n.toLocaleString())
const fmtDate = (s: string) => (s ? new Date(s).toLocaleString('zh-CN', { hour12: false }) : '')

const emptyForm = (categoryId: number) => ({
  name: '',
  subtitle: '',
  categoryId: String(categoryId),
  price: '',
  originalPrice: '',
  description: '',
  imageHint: '',
  tags: '',
  isFeatured: false,
  isHot: false,
})

const AdminPage = () => {
  const [overview, setOverview] = useState<Overview>({
    productCount: 0,
    categoryCount: 0,
    orderCount: 0,
    orderAmount: 0,
  })
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [tab, setTab] = useState('products')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  // 商品编辑弹窗
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState(emptyForm(1))

  const catName = (id: number) => categories.find((c) => c.id === id)?.name ?? '—'

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [ov, ca, pr, od] = await Promise.all([
        Network.request({ url: '/api/admin/overview' }),
        Network.request({ url: '/api/admin/categories' }),
        Network.request({ url: '/api/admin/products' }),
        Network.request({ url: '/api/admin/orders' }),
      ])
      setOverview((ov as any).data?.data ?? overview)
      setCategories((ca as any).data?.data ?? [])
      setProducts((pr as any).data?.data ?? [])
      setOrders((od as any).data?.data ?? [])
    } catch (e: any) {
      setError(e?.message ?? '加载失败，请确认后端已启动')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm(categories[0]?.id ?? 1))
    setFormOpen(true)
  }

  const openEdit = (p: Product) => {
    setEditingId(p.id)
    setForm({
      name: p.name,
      subtitle: p.subtitle ?? '',
      categoryId: String(p.categoryId),
      price: String(p.price),
      originalPrice: p.originalPrice != null ? String(p.originalPrice) : '',
      description: '',
      imageHint: '',
      tags: Array.isArray(p.tags) ? (p.tags as string[]).join(',') : '',
      isFeatured: !!p.isFeatured,
      isHot: !!p.isHot,
    })
    setFormOpen(true)
  }

  const save = async () => {
    if (!form.name.trim()) return Taro.showToast({ title: '请填写商品名称', icon: 'none' })
    if (!form.price.trim()) return Taro.showToast({ title: '请填写售价', icon: 'none' })
    const payload = {
      name: form.name.trim(),
      subtitle: form.subtitle.trim(),
      categoryId: Number(form.categoryId),
      price: Number(form.price),
      originalPrice: form.originalPrice.trim() ? Number(form.originalPrice) : null,
      description: form.description.trim(),
      imageHint: form.imageHint.trim() || '750 × 900',
      tags: form.tags
        .split(/[,，]/)
        .map((s) => s.trim())
        .filter(Boolean),
      isFeatured: form.isFeatured,
      isHot: form.isHot,
    }
    setSaving(true)
    try {
      if (editingId == null) {
        await Network.request({ url: '/api/admin/products', method: 'POST', data: payload })
        Taro.showToast({ title: '已新增商品', icon: 'success' })
      } else {
        await Network.request({ url: `/api/admin/products/${editingId}`, method: 'PUT', data: payload })
        Taro.showToast({ title: '已保存修改', icon: 'success' })
      }
      setFormOpen(false)
      await load()
    } catch (e: any) {
      Taro.showToast({ title: e?.message ?? '保存失败', icon: 'none' })
    } finally {
      setSaving(false)
    }
  }

  const remove = (p: Product) => {
    Taro.showModal({
      title: '删除商品',
      content: `确认删除「${p.name}」？此操作不可恢复。`,
      confirmColor: '#e8830c',
      success: async (res) => {
        if (!res.confirm) return
        try {
          await Network.request({ url: `/api/admin/products/${p.id}`, method: 'DELETE' })
          Taro.showToast({ title: '已删除', icon: 'success' })
          await load()
        } catch (e: any) {
          Taro.showToast({ title: e?.message ?? '删除失败', icon: 'none' })
        }
      },
    })
  }

  const set = (k: keyof typeof form) => (v: any) => setForm((f) => ({ ...f, [k]: v }))

  const stats = [
    { label: '商品数', value: overview.productCount, icon: Boxes, color: '#e8830c' },
    { label: '分类数', value: overview.categoryCount, icon: Tags, color: '#c9a063' },
    { label: '订单数', value: overview.orderCount, icon: FileText, color: '#7a8b6f' },
    { label: '交易额', value: fmtNum(overview.orderAmount), icon: Coins, color: '#33302b' },
  ]

  return (
    <ScrollView scrollY className="h-full bg-background pb-10">
      <View className="px-5 pt-4">
        {/* 头部 */}
        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text className="block text-xl font-semibold text-foreground tracking-wide">Chloe Flora · 数据总览</Text>
            <Text className="block mt-1 text-xs text-muted-foreground">实时读取后端（Supabase）数据</Text>
          </View>
          <Button size="sm" variant="outline" onClick={load} disabled={loading}>
            <RefreshCw size={14} color="#33302b" className="mr-1" />
            <Text className="text-xs">刷新</Text>
          </Button>
        </View>

        {error ? (
          <Card className="mt-4">
            <CardContent className="p-4">
              <Text className="block text-sm text-destructive">{error}</Text>
            </CardContent>
          </Card>
        ) : null}

        {/* 概览统计 */}
        <View className="mt-5 grid grid-cols-2 gap-3">
          {stats.map((s) => {
            const Icon = s.icon
            return (
              <Card key={s.label}>
                <CardContent className="p-4">
                  <View className="flex items-center gap-2">
                    <Icon size={18} color={s.color} />
                    <Text className="text-xs text-muted-foreground">{s.label}</Text>
                  </View>
                  <Text className="block mt-2 text-2xl font-semibold text-foreground">{s.value}</Text>
                </CardContent>
              </Card>
            )
          })}
        </View>

        {/* 数据面板 */}
        <Tabs value={tab} onValueChange={setTab} className="mt-6">
          <TabsList className="w-full grid-cols-3 bg-muted">
            <TabsTrigger value="products">商品 {products.length}</TabsTrigger>
            <TabsTrigger value="categories">分类 {categories.length}</TabsTrigger>
            <TabsTrigger value="orders">订单 {orders.length}</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="mt-4">
            <View style={{ display: 'flex', justifyContent: 'flex-end' }} className="mb-3">
              <Button size="sm" onClick={openCreate}>
                <Plus size={14} color="#fff" className="mr-1" />
                <Text className="text-xs">新增商品</Text>
              </Button>
            </View>
            {loading ? (
              <Text className="block py-10 text-center text-sm text-muted-foreground">加载中…</Text>
            ) : (
              products.map((p) => (
                <Card key={p.id} className="mb-3">
                  <CardContent className="p-4">
                    <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <View style={{ flex: 1, marginRight: 12 }}>
                        <View className="flex flex-row items-center gap-2">
                          <Badge variant="outline" className="bg-white px-2 py-1">
                            <Text className="text-xs text-foreground">{catName(p.categoryId)}</Text>
                          </Badge>
                          {p.isFeatured ? (
                            <Badge className="bg-primary px-2 py-1">
                              <Text className="text-xs text-primary-foreground">主推</Text>
                            </Badge>
                          ) : null}
                          {p.isHot ? (
                            <Badge className="bg-foreground px-2 py-1">
                              <Text className="text-xs text-white">热卖</Text>
                            </Badge>
                          ) : null}
                        </View>
                        <Text className="block mt-2 text-sm font-medium text-foreground">{p.name}</Text>
                        <Text className="block mt-1 text-xs text-muted-foreground">{p.subtitle}</Text>
                      </View>
                      <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                        <Text className="text-base font-semibold text-foreground">¥{p.price}</Text>
                        <View style={{ display: 'flex', flexDirection: 'row', gap: 8, marginTop: 12 }}>
                          <Button size="sm" variant="outline" onClick={() => openEdit(p)}>
                            <Pencil size={13} color="#33302b" className="mr-1" />
                            <Text className="text-xs">编辑</Text>
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => remove(p)}>
                            <Trash2 size={13} color="#c0392b" className="mr-1" />
                            <Text className="text-xs text-destructive">删除</Text>
                          </Button>
                        </View>
                      </View>
                    </View>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="categories" className="mt-4">
            {categories.map((c) => (
              <Card key={c.id} className="mb-3">
                <CardContent className="p-4">
                  <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text className="text-sm font-medium text-foreground">{c.name}</Text>
                    <Text className="text-xs text-muted-foreground">{c.note}</Text>
                  </View>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="orders" className="mt-4">
            {orders.length === 0 ? (
              <Text className="block py-10 text-center text-sm text-muted-foreground">暂无订单</Text>
            ) : (
              orders.map((o) => (
                <Card key={o.orderNo} className="mb-3">
                  <CardContent className="p-4">
                    <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text className="text-sm font-medium text-foreground">{o.orderNo}</Text>
                      <Badge variant="outline" className="bg-white px-2 py-1">
                        <Text className="text-xs text-primary">{o.status}</Text>
                      </Badge>
                    </View>
                    <Text className="block mt-2 text-xs text-muted-foreground">
                      {o.receiver} · {o.phone}
                    </Text>
                    <Text className="block mt-1 text-xs text-muted-foreground">{o.address}</Text>
                    <View className="mt-2">
                      <Text className="block text-xs text-muted-foreground">
                        {fmtDate(o.createdAt)} · {(o.items ?? []).map((it) => `${it.name}×${it.qty}`).join('、')}
                      </Text>
                    </View>
                    <View className="mt-2" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Text className="text-base font-semibold text-foreground">¥{o.total}</Text>
                    </View>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </View>

      {/* 商品编辑弹窗 */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[85%] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId == null ? '新增商品' : '编辑商品'}</DialogTitle>
          </DialogHeader>
          <View className="space-y-4">
            <View>
              <Text className="block mb-2 text-xs text-muted-foreground">商品名称 *</Text>
              <Input value={form.name} onInput={(e) => set('name')(e.detail.value)} placeholder="如：鎏金永生玫瑰" />
            </View>
            <View>
              <Text className="block mb-2 text-xs text-muted-foreground">副标题</Text>
              <Input value={form.subtitle} onInput={(e) => set('subtitle')(e.detail.value)} placeholder="一句话卖点" />
            </View>
            <View>
              <Text className="block mb-2 text-xs text-muted-foreground">所属分类</Text>
              <Select value={form.categoryId} onValueChange={set('categoryId')}>
                <SelectTrigger>
                  <SelectValue placeholder={catName(Number(form.categoryId))} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </View>
            <View>
              <Text className="block mb-2 text-xs text-muted-foreground">售价（元）*</Text>
              <Input type="digit" value={form.price} onInput={(e) => set('price')(e.detail.value)} placeholder="如：399" />
            </View>
            <View>
              <Text className="block mb-2 text-xs text-muted-foreground">划线原价（元）</Text>
              <Input type="digit" value={form.originalPrice} onInput={(e) => set('originalPrice')(e.detail.value)} placeholder="可留空" />
            </View>
            <View>
              <Text className="block mb-2 text-xs text-muted-foreground">标签（逗号分隔）</Text>
              <Input value={form.tags} onInput={(e) => set('tags')(e.detail.value)} placeholder="如：新品,热卖" />
            </View>
            <View>
              <Text className="block mb-2 text-xs text-muted-foreground">图片占位提示</Text>
              <Input value={form.imageHint} onInput={(e) => set('imageHint')(e.detail.value)} placeholder="如：750 × 900" />
            </View>
            <View className="flex flex-row items-center justify-between">
              <Text className="text-sm text-foreground">设为首页主推</Text>
              <Switch checked={form.isFeatured} onCheckedChange={set('isFeatured')} />
            </View>
            <View className="flex flex-row items-center justify-between">
              <Text className="text-sm text-foreground">标记为热卖</Text>
              <Switch checked={form.isHot} onCheckedChange={set('isHot')} />
            </View>
          </View>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)} disabled={saving}>
              <Text>取消</Text>
            </Button>
            <Button onClick={save} disabled={saving}>
              <Text>{saving ? '保存中…' : '保存'}</Text>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ScrollView>
  )
}

export default AdminPage