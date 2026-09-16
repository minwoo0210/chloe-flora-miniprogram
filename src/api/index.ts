import { Network } from '@/network'
import { CATEGORIES as STATIC_CATEGORIES, PRODUCTS as STATIC_PRODUCTS, SLOGAN, HERO, type Product, type Category } from '@/data/catalog'
import Taro from '@tarojs/taro'

/**
 * Chloe Flora — 共享 Supabase 数据库接入层（后台项目 7685923382940106767）
 * 后端已按共享库结构（UUID、snake_case）读取，这里把返回数据归一化回前端结构，
 * 以最小侵入方式替换原有静态数据源。
 */

export interface Banner { id: string; title: string; imageKey: string; linkTarget: string; sortOrder: number }

let cachedCatalog: { categories: Category[]; products: Product[] } | null = null

/** 设备/客户端标识（作为订单与“我的订单”的客户归户 key，替代登录体系） */
export function getDeviceId(): string {
  const key = 'CF_DEVICE_ID'
  let id = Taro.getStorageSync(key)
  if (!id) {
    id = 'guest_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
    Taro.setStorageSync(key, id)
  }
  return id
}

function mapCat(c: any): Category {
  // 共享库 categories: { id, name, slug, ... } —— 前端用 slug 作为分组 key
  return { id: c.slug || c.id, name: c.name }
}

function mapProd(p: any): Product {
  return {
    id: p.id,
    categoryId: p.categorySlug || p.categoryId,
    name: p.name,
    subtitle: '',
    price: Number(p.price) || 0,
    originalPrice: p.originalPrice == null ? undefined : Number(p.originalPrice),
    description: p.description || '',
    // 共享库 main_image 为真实图片 URL → ProductImage 会渲染图片
    imageHint: p.mainImage || '',
    detailNotes: [],
    tags: [],
    hot: false
  }
}

/** 拉取分类 + 商品（一次读取，进程内缓存） */
export async function getCatalog(): Promise<{ categories: Category[]; products: Product[] }> {
  if (cachedCatalog) return cachedCatalog
  const [cr, pr] = await Promise.all([
    Network.request({ url: '/api/catalog/categories' }),
    Network.request({ url: '/api/catalog/products' })
  ])
  const cats: any[] = cr?.data?.data || []
  const prods: any[] = pr?.data?.data || []
  cachedCatalog = { categories: cats.map(mapCat), products: prods.map(mapProd) }
  return cachedCatalog
}

/** 首页内容：banner 轮播 / 品类宣传区 / 热门推荐 */
export async function getHome(): Promise<{
  banners: Banner[]
  sections: any[]
  hot: any[]
}> {
  const res: any = await Network.request({ url: '/api/catalog/home' })
  return { banners: res?.data?.data?.banners || [], sections: res?.data?.data?.sections || [], hot: res?.data?.data?.hot || [] }
}

export interface Theme { primary: string; background: string; textPrimary: string; textSecondary: string; textTertiary: string }

export async function getTheme(): Promise<Theme> {
  const res: any = await Network.request({ url: '/api/catalog/theme' })
  const d = res?.data?.data || {}
  return {
    primary: d.primary || '#E8830C',
    background: d.background || '#F7F3ED',
    textPrimary: d.textPrimary || '#2B2622',
    textSecondary: d.textSecondary || '#6B625A',
    textTertiary: d.textTertiary || '#A39A90'
  }
}

/** 提交订单（共享库 orders/order_items） */
export async function createOrder(payload: {
  openid?: string
  customerName: string
  customerPhone: string
  customerAddress?: string
  remark?: string
  items: { productId: string; name: string; price: number; quantity: number; imageKey?: string }[]
  deliveryFee?: number
}) {
  const res: any = await Network.request({
    url: '/api/orders',
    method: 'POST',
    data: { openid: payload.openid || getDeviceId(), ...payload }
  })
  return res?.data?.data || res?.data
}

/** 读取我的订单 */
export async function getMyOrders(openid?: string): Promise<any[]> {
  const res: any = await Network.request({ url: `/api/orders/my?openid=${encodeURIComponent(openid || getDeviceId())}` })
  return res?.data?.data || []
}

/** 页面数据源：尽量用共享库；接口失败回退静态数据 */
export async function loadCatalog(): Promise<{ categories: Category[]; products: Product[] }> {
  try {
    return await getCatalog()
  } catch {
    return { categories: STATIC_CATEGORIES, products: STATIC_PRODUCTS }
  }
}

export const fallbackHeroes = HERO
export { SLOGAN, STATIC_PRODUCTS }