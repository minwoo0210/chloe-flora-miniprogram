import { View, Text, ScrollView } from '@tarojs/components'
import { useEffect, useState } from 'react'
import {
  RefreshCw, Users, FileText, Coins, Plus, Pencil, Trash2,
  LayoutDashboard, ShoppingBag, UserRound, Image as ImageLucide, TrendingUp, Phone, MapPin, X,
} from 'lucide-react-taro'
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

/* ---------------- 类型 ---------------- */
interface Overview { productCount: number; categoryCount: number; orderCount: number; orderAmount: number }
interface Category { id: number; name: string; note: string }
interface Product {
  id: number; categoryId: number; name: string; subtitle: string
  price: number; originalPrice?: number; tags: string[]; isFeatured?: boolean; isHot?: boolean
}
interface OrderItem { productId?: number; name: string; price?: number; qty: number }
interface Order {
  id?: number; userKey: string; orderNo: string; receiver: string; phone: string
  address: string; total: number; status: string; remark?: string; createdAt: string; items?: OrderItem[]
}
interface Customer {
  userKey: string; nickname: string; avatar: string; phone: string
  addressCount: number; orderCount: number; totalSpent: number; pendingCount: number
  lastOrderAt: string | null; joinedAt: string
}
interface Dashboard {
  kpis: { customerCount: number; orderCount: number; pendingCount: number; totalAmount: number; todayOrderCount: number; todayAmount: number }
  statusDist: { status: string; count: number }[]
  trend: { date: string; orderCount: number; amount: number }[]
  maxAmount: number
  categorySales: { name: string; qty: number; amount: number }[]
  maxCatAmount: number
  topProducts: { name: string; qty: number; amount: number }[]
}
interface HeroSlide { src: string; tone: string; eyebrow: string; title: string; sub: string }
interface HomeConfig { brand: string; slogan: { title: string; subtitle: string }; heroes: HeroSlide[] }

/* ---------------- 常量 ---------------- */
const STATUS_META: Record<string, { label: string; cls: string }> = {
  pending: { label: '待确认', cls: 'bg-[#fdf3e3] text-primary' },
  confirmed: { label: '已确认', cls: 'bg-[#eaf0fb] text-[#2f5da8]' },
  arranging: { label: '制作中', cls: 'bg-[#eef3e8] text-[#5a6b48]' },
  shipped: { label: '配送中', cls: 'bg-[#e8f0f2] text-[#3f6f78]' },
  completed: { label: '已完成', cls: 'bg-[#eef0ee] text-[#55534d]' },
  cancelled: { label: '已取消', cls: 'bg-[#f7e9e7] text-[#b04a3c]' },
}
const STATUS_FLOW: Record<string, { value: string; label: string }[]> = {
  pending: [{ value: 'confirmed', label: '确认接单' }, { value: 'cancelled', label: '取消订单' }],
  confirmed: [{ value: 'arranging', label: '开始制作' }, { value: 'cancelled', label: '取消订单' }],
  arranging: [{ value: 'shipped', label: '安排配送' }],
  shipped: [{ value: 'completed', label: '确认完成' }],
  completed: [],
  cancelled: [],
}
const statusLabel = (s: string) => STATUS_META[s]?.label ?? s
const statusCls = (s: string) => STATUS_META[s]?.cls ?? 'bg-muted text-foreground'
const fmtNum = (n: number) => (n >= 10000 ? `${(n / 10000).toFixed(2)}w` : Math.round(n).toLocaleString())
const fmtDate = (s: string) => (s ? new Date(s).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }) : '—')
const TONES = [
  { value: 'deep', label: '墨黑' },
  { value: 'orange', label: '爱马仕橙' },
  { value: 'sage', label: '鼠尾草绿' },
]

const emptyForm = (categoryId: number) => ({
  name: '', subtitle: '', categoryId: String(categoryId), price: '', originalPrice: '',
  imageHint: '', tags: '', isFeatured: false, isHot: false,
})

const AdminPage = () => {
  const [tab, setTab] = useState('dashboard')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [overview, setOverview] = useState<Overview>({ productCount: 0, categoryCount: 0, orderCount: 0, orderAmount: 0 })
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [dashboard, setDashboard] = useState<Dashboard | null>(null)

  // 商品弹窗
  const [saving, setSaving] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState(emptyForm(1))

  // 首页装修
  const [homeOpen, setHomeOpen] = useState(false)
  const [homeSaving, setHomeSaving] = useState(false)
  const [home, setHome] = useState<HomeConfig>({
    brand: 'Chloe Flora', slogan: { title: '', subtitle: '' }, heroes: [],
  })

  const catName = (id: number) => categories.find((c) => c.id === id)?.name ?? '—'

  const load = async (silent = false) => {
    if (!silent) setLoading(true)
    setError('')
    try {
      const [ov, ca, pr, od, cu, db] = await Promise.all([
        Network.request({ url: '/api/admin/overview' }),
        Network.request({ url: '/api/admin/categories' }),
        Network.request({ url: '/api/admin/products' }),
        Network.request({ url: '/api/admin/orders' }),
        Network.request({ url: '/api/admin/customers' }),
        Network.request({ url: '/api/admin/dashboard' }),
      ])
      setOverview((ov as any).data?.data ?? overview)
      setCategories((ca as any).data?.data ?? [])
      setProducts((pr as any).data?.data ?? [])
      setOrders((od as any).data?.data ?? [])
      setCustomers((cu as any).data?.data ?? [])
      setDashboard((db as any).data?.data ?? null)
    } catch (e: any) {
      setError(e?.message ?? '加载失败，请确认后端已启动')
    } finally {
      if (!silent) setLoading(false)
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [])

  /* ---------- 商品 ---------- */
  const openCreate = () => { setEditingId(null); setForm(emptyForm(categories[0]?.id ?? 1)); setFormOpen(true) }
  const openEdit = (p: Product) => {
    setEditingId(p.id)
    setForm({
      name: p.name, subtitle: p.subtitle ?? '', categoryId: String(p.categoryId), price: String(p.price),
      originalPrice: p.originalPrice != null ? String(p.originalPrice) : '', imageHint: '',
      tags: Array.isArray(p.tags) ? p.tags.join(',') : '', isFeatured: !!p.isFeatured, isHot: !!p.isHot,
    })
    setFormOpen(true)
  }
  const saveProduct = async () => {
    if (!form.name.trim()) return Taro.showToast({ title: '请填写商品名称', icon: 'none' })
    if (!form.price.trim()) return Taro.showToast({ title: '请填写售价', icon: 'none' })
    const payload = {
      name: form.name.trim(), subtitle: form.subtitle.trim(), categoryId: Number(form.categoryId),
      price: Number(form.price), originalPrice: form.originalPrice.trim() ? Number(form.originalPrice) : null,
      imageHint: form.imageHint.trim() || '750 × 900',
      tags: form.tags.split(/[,，]/).map((s) => s.trim()).filter(Boolean),
      isFeatured: form.isFeatured, isHot: form.isHot,
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
      setFormOpen(false); await load(true)
    } catch (e: any) { Taro.showToast({ title: e?.message ?? '保存失败', icon: 'none' }) } finally { setSaving(false) }
  }
  const removeProduct = (p: Product) => Taro.showModal({
    title: '删除商品', content: `确认删除「${p.name}」？`, confirmColor: '#e8830c',
    success: async (r) => {
      if (!r.confirm) return
      try {
        await Network.request({ url: `/api/admin/products/${p.id}`, method: 'DELETE' })
        Taro.showToast({ title: '已删除', icon: 'success' }); await load(true)
      } catch (e: any) { Taro.showToast({ title: e?.message ?? '删除失败', icon: 'none' }) }
    },
  })
  const setF = (k: keyof typeof form) => (v: any) => setForm((f) => ({ ...f, [k]: v }))

  /* ---------- 订单 ---------- */
  const advanceOrder = (o: Order, next: string) => Taro.showModal({
    title: '更新订单状态', content: `将 ${o.orderNo} 标记为「${STATUS_META[next]?.label ?? next}」？`, confirmColor: '#e8830c',
    success: async (r) => {
      if (!r.confirm || o.id == null) return
      try {
        await Network.request({ url: `/api/admin/orders/${o.id}/status`, method: 'PUT', data: { status: next } })
        Taro.showToast({ title: '状态已更新', icon: 'success' }); await load(true)
      } catch (e: any) { Taro.showToast({ title: e?.message ?? '更新失败', icon: 'none' }) }
    },
  })

  /* ---------- 首页装修 ---------- */
  const openHome = async () => {
    try {
      const res = await Network.request({ url: '/api/admin/site/home' })
      setHome((res as any).data?.data ?? home)
    } catch { /* 用默认 */ }
    setHomeOpen(true)
  }
  const setHero = (i: number, k: keyof HeroSlide, v: string) =>
    setHome((h) => ({ ...h, heroes: h.heroes.map((x, idx) => (idx === i ? { ...x, [k]: v } : x)) }))
  const addHero = () => setHome((h) => ({
    ...h, heroes: [...h.heroes, { src: '', tone: 'deep', eyebrow: '', title: '新轮播', sub: '' }],
  }))
  const removeHero = (i: number) => setHome((h) => ({ ...h, heroes: h.heroes.filter((_, idx) => idx !== i) }))
  const saveHome = async () => {
    setHomeSaving(true)
    try {
      await Network.request({ url: '/api/admin/site/home', method: 'PUT', data: home })
      Taro.showToast({ title: '首页配置已发布', icon: 'success' }); setHomeOpen(false)
    } catch (e: any) { Taro.showToast({ title: e?.message ?? '发布失败', icon: 'none' }) } finally { setHomeSaving(false) }
  }

  const kpiList = dashboard ? [
    { label: '今日订单', value: dashboard.kpis.todayOrderCount, sub: `今日 ¥${fmtNum(dashboard.kpis.todayAmount)}`, icon: ShoppingBag, color: '#e8830c' },
    { label: '待处理', value: dashboard.kpis.pendingCount, sub: '待确认/制作/配送', icon: FileText, color: '#c9a063' },
    { label: '累计客户', value: dashboard.kpis.customerCount, sub: '注册用户数', icon: Users, color: '#7a8b6f' },
    { label: '累计交易额', value: `¥${fmtNum(dashboard.kpis.totalAmount)}`, sub: `${dashboard.kpis.orderCount} 笔有效订单`, icon: Coins, color: '#33302b' },
  ] : []

  return (
    <ScrollView scrollY className="h-full bg-background pb-12">
      <View className="px-5 pt-4">
        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text className="block text-xl font-semibold text-foreground tracking-wide">Chloe Flora · 经营后台</Text>
            <Text className="block mt-1 text-xs text-muted-foreground">商品 · 订单 · 客户 · 首页装修，一站管理</Text>
          </View>
          <Button size="sm" variant="outline" onClick={() => load()} disabled={loading}>
            <RefreshCw size={14} color="#33302b" className="mr-1" />
            <Text className="text-xs">刷新</Text>
          </Button>
        </View>

        {error ? (
          <Card className="mt-4"><CardContent className="p-4"><Text className="block text-sm text-destructive">{error}</Text></CardContent></Card>
        ) : null}

        <Tabs value={tab} onValueChange={setTab} className="mt-5">
          <TabsList className="w-full grid-cols-5 bg-muted">
            <TabsTrigger value="dashboard">看板</TabsTrigger>
            <TabsTrigger value="products">商品</TabsTrigger>
            <TabsTrigger value="orders">订单</TabsTrigger>
            <TabsTrigger value="customers">客户</TabsTrigger>
            <TabsTrigger value="home">装修</TabsTrigger>
          </TabsList>

          {/* ============ 看板 ============ */}
          <TabsContent value="dashboard" className="mt-4">
            {loading || !dashboard ? (
              <Text className="block py-10 text-center text-sm text-muted-foreground">加载中…</Text>
            ) : (
              <View>
                <View className="grid grid-cols-2 gap-3">
                  {kpiList.map((s) => {
                    const Icon = s.icon
                    return (
                      <Card key={s.label}>
                        <CardContent className="p-4">
                          <View className="flex items-center gap-2"><Icon size={18} color={s.color} /><Text className="text-xs text-muted-foreground">{s.label}</Text></View>
                          <Text className="block mt-2 text-2xl font-semibold text-foreground">{s.value}</Text>
                          <Text className="block mt-1 text-xs text-muted-foreground">{s.sub}</Text>
                        </CardContent>
                      </Card>
                    )
                  })}
                </View>

                {/* 近 7 天销售趋势 */}
                <Card className="mt-4">
                  <CardContent className="p-4">
                    <View className="flex items-center gap-2 mb-4"><TrendingUp size={16} color="#e8830c" /><Text className="text-sm font-medium text-foreground">近 7 天销售额</Text></View>
                    <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 130 }}>
                      {dashboard.trend.map((t) => (
                        <View key={t.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                          <Text className="block text-xs text-muted-foreground mb-1">{t.amount > 0 ? fmtNum(t.amount) : ''}</Text>
                          <View style={{ width: 16, height: `${Math.max(4, Math.round((t.amount / dashboard.maxAmount) * 80))}px`, backgroundColor: t.amount > 0 ? '#e8830c' : '#e7e2d8', borderRadius: 3 }} />
                          <Text className="block text-xs text-muted-foreground mt-2">{t.date.slice(5)}</Text>
                        </View>
                      ))}
                    </View>
                  </CardContent>
                </Card>

                {/* 订单状态分布 */}
                <Card className="mt-4">
                  <CardContent className="p-4">
                    <Text className="block text-sm font-medium text-foreground mb-3">订单状态分布</Text>
                    <View className="flex flex-row flex-wrap gap-2">
                      {dashboard.statusDist.length === 0 ? <Text className="text-xs text-muted-foreground">暂无订单</Text> :
                        dashboard.statusDist.map((s) => (
                          <Badge key={s.status} className={`px-3 py-1 ${statusCls(s.status)}`}>
                            <Text className="text-xs">{statusLabel(s.status)} · {s.count}</Text>
                          </Badge>
                        ))}
                    </View>
                  </CardContent>
                </Card>

                {/* 分类销售 */}
                {dashboard.categorySales.length > 0 && (
                  <Card className="mt-4">
                    <CardContent className="p-4">
                      <Text className="block text-sm font-medium text-foreground mb-3">分类销售占比</Text>
                      {dashboard.categorySales.map((c) => (
                        <View key={c.name} className="mb-3">
                          <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }} className="mb-1">
                            <Text className="text-xs text-foreground">{c.name}</Text>
                            <Text className="text-xs text-muted-foreground">¥{fmtNum(c.amount)} · {c.qty} 件</Text>
                          </View>
                          <View className="w-full rounded-full" style={{ height: 8, backgroundColor: '#eee8dd' }}>
                            <View style={{ height: 8, borderRadius: 999, backgroundColor: '#c9a063', width: `${Math.round((c.amount / dashboard.maxCatAmount) * 100)}%` }} />
                          </View>
                        </View>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* 热销商品 */}
                {dashboard.topProducts.length > 0 && (
                  <Card className="mt-4">
                    <CardContent className="p-4">
                      <Text className="block text-sm font-medium text-foreground mb-3">热销商品 TOP</Text>
                      {dashboard.topProducts.map((p, i) => (
                        <View key={p.name} style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }} className="py-2">
                          <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                            <Text className="text-xs font-semibold text-primary mr-2">{i + 1}</Text>
                            <Text className="text-xs text-foreground" style={{ flex: 1 }}>{p.name}</Text>
                          </View>
                          <Text className="text-xs text-muted-foreground ml-2">{p.qty} 件 · ¥{fmtNum(p.amount)}</Text>
                        </View>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </View>
            )}
          </TabsContent>

          {/* ============ 商品 ============ */}
          <TabsContent value="products" className="mt-4">
            <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="mb-3">
              <Text className="text-xs text-muted-foreground">共 {products.length} 件 · {categories.length} 个分类</Text>
              <Button size="sm" onClick={openCreate}><Plus size={14} color="#fff" className="mr-1" /><Text className="text-xs">新增/改价</Text></Button>
            </View>
            {loading ? <Text className="block py-10 text-center text-sm text-muted-foreground">加载中…</Text> :
              products.map((p) => (
                <Card key={p.id} className="mb-3">
                  <CardContent className="p-4">
                    <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <View style={{ flex: 1, marginRight: 12 }}>
                        <View className="flex flex-row items-center gap-2">
                          <Badge variant="outline" className="bg-white px-2 py-1"><Text className="text-xs text-foreground">{catName(p.categoryId)}</Text></Badge>
                          {p.isFeatured ? <Badge className="bg-primary px-2 py-1"><Text className="text-xs text-primary-foreground">主推</Text></Badge> : null}
                          {p.isHot ? <Badge className="bg-foreground px-2 py-1"><Text className="text-xs text-white">热卖</Text></Badge> : null}
                        </View>
                        <Text className="block mt-2 text-sm font-medium text-foreground">{p.name}</Text>
                        <Text className="block mt-1 text-xs text-muted-foreground">{p.subtitle}</Text>
                      </View>
                      <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <Text className="text-base font-semibold text-foreground">¥{p.price}</Text>
                        <View style={{ display: 'flex', flexDirection: 'row', gap: 8, marginTop: 12 }}>
                          <Button size="sm" variant="outline" onClick={() => openEdit(p)}><Pencil size={13} color="#33302b" className="mr-1" /><Text className="text-xs">编辑</Text></Button>
                          <Button size="sm" variant="ghost" onClick={() => removeProduct(p)}><Trash2 size={13} color="#c0392b" className="mr-1" /><Text className="text-xs text-destructive">删除</Text></Button>
                        </View>
                      </View>
                    </View>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>

          {/* ============ 订单 ============ */}
          <TabsContent value="orders" className="mt-4">
            {orders.length === 0 ? <Text className="block py-10 text-center text-sm text-muted-foreground">暂无订单</Text> :
              orders.map((o) => (
                <Card key={o.orderNo} className="mb-3">
                  <CardContent className="p-4">
                    <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text className="text-sm font-medium text-foreground">{o.orderNo}</Text>
                      <Badge className={`px-2 py-1 ${statusCls(o.status)}`}><Text className="text-xs">{statusLabel(o.status)}</Text></Badge>
                    </View>
                    <View className="mt-2 flex flex-row items-center gap-1">
                      <UserRound size={12} color="#9a938a" /><Text className="text-xs text-muted-foreground">{o.receiver} · {o.phone}</Text>
                    </View>
                    <View className="mt-1 flex flex-row items-start gap-1">
                      <MapPin size={12} color="#9a938a" style={{ marginTop: 2 }} /><Text className="text-xs text-muted-foreground" style={{ flex: 1 }}>{o.address}</Text>
                    </View>
                    <Text className="block mt-2 text-xs text-muted-foreground">
                      {fmtDate(o.createdAt)} · {(o.items ?? []).map((it) => `${it.name}×${it.qty}`).join('、')}
                    </Text>
                    {o.remark ? <Text className="block mt-1 text-xs text-primary">备注：{o.remark}</Text> : null}
                    <View className="mt-2" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text className="text-base font-semibold text-foreground">¥{o.total}</Text>
                      <View style={{ display: 'flex', flexDirection: 'row', gap: 8 }}>
                        {(STATUS_FLOW[o.status] ?? []).map((nx) => (
                          <Button key={nx.value} size="sm" variant={nx.value === 'cancelled' ? 'ghost' : 'default'} onClick={() => advanceOrder(o, nx.value)}>
                            <Text className={`text-xs ${nx.value === 'cancelled' ? 'text-destructive' : ''}`}>{nx.label}</Text>
                          </Button>
                        ))}
                      </View>
                    </View>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>

          {/* ============ 客户 ============ */}
          <TabsContent value="customers" className="mt-4">
            {customers.length === 0 ? <Text className="block py-10 text-center text-sm text-muted-foreground">暂无客户</Text> :
              customers.map((c) => (
                <Card key={c.userKey} className="mb-3">
                  <CardContent className="p-4">
                    <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                        <View className="flex items-center justify-center rounded-full bg-muted" style={{ width: 40, height: 40 }}>
                          <UserRound size={20} color="#9a938a" />
                        </View>
                        <View style={{ marginLeft: 12, flex: 1 }}>
                          <View className="flex flex-row items-center gap-2">
                            <Text className="text-sm font-medium text-foreground">{c.nickname}</Text>
                            {c.pendingCount > 0 ? <Badge className="bg-primary px-2 py-0"><Text className="text-xs text-primary-foreground">进行中 {c.pendingCount}</Text></Badge> : null}
                          </View>
                          {c.phone ? (
                            <View className="mt-1 flex flex-row items-center gap-1"><Phone size={11} color="#9a938a" /><Text className="text-xs text-muted-foreground">{c.phone}</Text></View>
                          ) : <Text className="block mt-1 text-xs text-muted-foreground">{c.userKey.slice(0, 14)}…</Text>}
                        </View>
                      </View>
                      <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <Text className="text-base font-semibold text-foreground">¥{fmtNum(c.totalSpent)}</Text>
                        <Text className="text-xs text-muted-foreground">{c.orderCount} 单 · {c.addressCount} 地址</Text>
                      </View>
                    </View>
                    <Text className="block mt-2 text-xs text-muted-foreground">最近下单：{c.lastOrderAt ? fmtDate(c.lastOrderAt) : '暂无'} · 注册：{fmtDate(c.joinedAt)}</Text>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>

          {/* ============ 首页装修 ============ */}
          <TabsContent value="home" className="mt-4">
            <Card>
              <CardContent className="p-4">
                <View className="flex flex-row items-center gap-2"><LayoutDashboard size={16} color="#e8830c" /><Text className="text-sm font-medium text-foreground">首页视觉装修</Text></View>
                <Text className="block mt-2 text-xs text-muted-foreground leading-5">
                  修改后点击「发布」，C 端小程序首页的顶部品牌名、全屏大图轮播（可填照片 / GIF 链接）与品牌标语即时生效。
                </Text>
                <Button className="mt-4" onClick={openHome}><ImageLucide size={15} color="#fff" className="mr-1" /><Text>编辑首页并发布</Text></Button>
              </CardContent>
            </Card>
            <View className="mt-4">
              <Text className="block text-xs text-muted-foreground mb-2">商品与分类数据</Text>
              <Text className="block text-xs text-muted-foreground leading-5">
                当前共 {overview.productCount} 件商品、{overview.categoryCount} 个分类。商品名称、价格、主推/热卖标记请在「商品」页维护，会同步影响首页展示。
              </Text>
            </View>
          </TabsContent>
        </Tabs>
      </View>

      {/* ============ 商品编辑弹窗 ============ */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[85%] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingId == null ? '新增商品' : '编辑商品'}</DialogTitle></DialogHeader>
          <View className="space-y-4">
            <View><Text className="block mb-2 text-xs text-muted-foreground">商品名称 *</Text>
              <Input value={form.name} onInput={(e) => setF('name')(e.detail.value)} placeholder="如：鎏金永生玫瑰" /></View>
            <View><Text className="block mb-2 text-xs text-muted-foreground">副标题</Text>
              <Input value={form.subtitle} onInput={(e) => setF('subtitle')(e.detail.value)} placeholder="一句话卖点" /></View>
            <View>
              <Text className="block mb-2 text-xs text-muted-foreground">所属分类</Text>
              <Select value={form.categoryId} onValueChange={setF('categoryId')}>
                <SelectTrigger><SelectValue placeholder={catName(Number(form.categoryId))} /></SelectTrigger>
                <SelectContent>{categories.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </View>
            <View><Text className="block mb-2 text-xs text-muted-foreground">售价（元）*</Text>
              <Input type="digit" value={form.price} onInput={(e) => setF('price')(e.detail.value)} placeholder="如：399" /></View>
            <View><Text className="block mb-2 text-xs text-muted-foreground">划线原价（元）</Text>
              <Input type="digit" value={form.originalPrice} onInput={(e) => setF('originalPrice')(e.detail.value)} placeholder="可留空" /></View>
            <View><Text className="block mb-2 text-xs text-muted-foreground">标签（逗号分隔）</Text>
              <Input value={form.tags} onInput={(e) => setF('tags')(e.detail.value)} placeholder="如：新品,热卖" /></View>
            <View><Text className="block mb-2 text-xs text-muted-foreground">图片占位提示</Text>
              <Input value={form.imageHint} onInput={(e) => setF('imageHint')(e.detail.value)} placeholder="如：750 × 900" /></View>
            <View className="flex flex-row items-center justify-between"><Text className="text-sm text-foreground">设为首页主推</Text><Switch checked={form.isFeatured} onCheckedChange={setF('isFeatured')} /></View>
            <View className="flex flex-row items-center justify-between"><Text className="text-sm text-foreground">标记为热卖</Text><Switch checked={form.isHot} onCheckedChange={setF('isHot')} /></View>
          </View>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)} disabled={saving}><Text>取消</Text></Button>
            <Button onClick={saveProduct} disabled={saving}><Text>{saving ? '保存中…' : '保存'}</Text></Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============ 首页装修弹窗 ============ */}
      <Dialog open={homeOpen} onOpenChange={setHomeOpen}>
        <DialogContent className="max-h-[88%] overflow-y-auto">
          <DialogHeader><DialogTitle>首页装修 · 发布即生效</DialogTitle></DialogHeader>
          <View className="space-y-4">
            <View><Text className="block mb-2 text-xs text-muted-foreground">顶部品牌名</Text>
              <Input value={home.brand} onInput={(e) => setHome((h) => ({ ...h, brand: e.detail.value }))} placeholder="Chloe Flora" /></View>
            <View><Text className="block mb-2 text-xs text-muted-foreground">标语主标题</Text>
              <Input value={home.slogan.title} onInput={(e) => setHome((h) => ({ ...h, slogan: { ...h.slogan, title: e.detail.value } }))} placeholder="于清晨的花影里" /></View>
            <View><Text className="block mb-2 text-xs text-muted-foreground">标语副标题</Text>
              <Input value={home.slogan.subtitle} onInput={(e) => setHome((h) => ({ ...h, slogan: { ...h.slogan, subtitle: e.detail.value } }))} placeholder="做一束被珍视的仪式感" /></View>

            <View className="flex flex-row items-center justify-between pt-1">
              <Text className="text-sm font-medium text-foreground">全屏大图轮播（{home.heroes.length}）</Text>
              <Button size="sm" variant="outline" onClick={addHero}><Plus size={13} color="#33302b" className="mr-1" /><Text className="text-xs">新增一屏</Text></Button>
            </View>
            {home.heroes.map((h, i) => (
              <Card key={i} className="bg-muted">
                <CardContent className="p-3 space-y-2">
                  <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text className="text-xs font-medium text-foreground">第 {i + 1} 屏</Text>
                    <Button size="sm" variant="ghost" onClick={() => removeHero(i)}><X size={14} color="#c0392b" /></Button>
                  </View>
                  <View><Text className="block mb-1 text-xs text-muted-foreground">图片 / GIF 链接（留空用品牌色块）</Text>
                    <Input value={h.src} onInput={(e) => setHero(i, 'src', e.detail.value)} placeholder="https://…（建议 750 × 1334）" /></View>
                  <View><Text className="block mb-1 text-xs text-muted-foreground">底色风格</Text>
                    <Select value={h.tone} onValueChange={(v) => setHero(i, 'tone', v)}>
                      <SelectTrigger><SelectValue placeholder={TONES.find((t) => t.value === h.tone)?.label} /></SelectTrigger>
                      <SelectContent>{TONES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </View>
                  <View><Text className="block mb-1 text-xs text-muted-foreground">眉标（英文小字）</Text>
                    <Input value={h.eyebrow} onInput={(e) => setHero(i, 'eyebrow', e.detail.value)} placeholder="SUMMER COLLECTION" /></View>
                  <View><Text className="block mb-1 text-xs text-muted-foreground">主标题</Text>
                    <Input value={h.title} onInput={(e) => setHero(i, 'title', e.detail.value)} placeholder="盛夏花礼" /></View>
                  <View><Text className="block mb-1 text-xs text-muted-foreground">副文案</Text>
                    <Input value={h.sub} onInput={(e) => setHero(i, 'sub', e.detail.value)} placeholder="以爱马仕橙开启高定花艺" /></View>
                </CardContent>
              </Card>
            ))}
          </View>
          <DialogFooter>
            <Button variant="outline" onClick={() => setHomeOpen(false)} disabled={homeSaving}><Text>取消</Text></Button>
            <Button onClick={saveHome} disabled={homeSaving}><Text>{homeSaving ? '发布中…' : '发布到首页'}</Text></Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ScrollView>
  )
}

export default AdminPage