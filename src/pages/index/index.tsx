import { useState } from 'react'
import { View, Text, Swiper, SwiperItem, Image } from '@tarojs/components'
import Taro, { usePageScroll } from '@tarojs/taro'
import { Flower, ShoppingBag, ChevronRight, ChevronDown } from 'lucide-react-taro'
import ProductImage from '@/components/product-image'
import ProductCard from '@/components/product-card'
import { CATEGORIES, PRODUCTS, SERVICES, SLOGAN, HERO } from '@/data/catalog'
import { useStore } from '@/store/use-store'

const goTab = (url: string) => Taro.switchTab({ url })
const goProduct = (id: string) => Taro.navigateTo({ url: `/pages/product/index?id=${id}` })

/** Hero 大图轮播的品牌色调 */
const HERO_TONE: Record<string, { bg: string; fg: string; glyph: string }> = {
  deep: { bg: '#33302b', fg: '#fcf7f1', glyph: '#e8830c' },
  orange: { bg: '#d97a10', fg: '#fffdf8', glyph: '#fff6e8' },
  sage: { bg: '#7b8b6f', fg: '#fffdf8', glyph: '#f4efe6' }
}

/** 品类主题视觉底稿：文案 + 暖色品牌意象 */
const CATEGORY_NOTE: Record<string, string> = {
  fresh: '每日鲜切 · 手作花束',
  preserved: '见微知著 · 久存美好',
  basket: '礼仪款呈 · 庆贺之选',
  plant: '一隅绿意 · 自然共生',
  event: '空间叙事 · 场景定制'
}

/** 顶部自定义导航高度（含状态栏）与小程序端右侧安全留白 */
const sysInfo = Taro.getWindowInfo ? Taro.getWindowInfo() : Taro.getSystemInfoSync()
const statusBarHeight = sysInfo.statusBarHeight || 0
const env = Taro.getEnv()
const isMini = env === Taro.ENV_TYPE.WEAPP || env === Taro.ENV_TYPE.TT
const HEADER_BODY = 44
const headerHeight = statusBarHeight + HEADER_BODY
// 购物袋按钮需避开右上角微信/抖音胶囊
let capsuleRight = 16
if (isMini && (Taro as unknown as { getMenuButtonBoundingClientRect?: () => { width: number; right: number; screenWidth: number } }).getMenuButtonBoundingClientRect) {
  try {
    const rect = Taro.getMenuButtonBoundingClientRect()
    capsuleRight = sysInfo.windowWidth - rect.right + 12
  } catch {
    capsuleRight = 16
  }
}

const IndexPage = () => {
  const cartCount = useStore((s) => s.cartCount())
  // 是否已经滚出首屏海报：越过海报后顶部栏才浮出米白背景
  const [scrolled, setScrolled] = useState(false)
  const heroHeight = sysInfo.windowHeight

  usePageScroll((e) => {
    // 海报底部 ⇒ 顶部导航完全落在米白内容区时切换
    const next = e.scrollTop > heroHeight - headerHeight - 8
    if (next !== scrolled) setScrolled(next)
  })

  return (
    <View className="min-h-full bg-background">
      {/* ============ 顶部悬浮品牌栏：海报上透明(白字) / 滚出后米白底(深字) ============ */}
      <View
        className="fixed left-0 right-0 top-0 z-50"
        style={{
          paddingTop: `${statusBarHeight}px`,
          backgroundColor: scrolled ? '#f7f3ed' : 'transparent',
          boxShadow: scrolled ? '0 1px 0 rgba(160,153,141,0.18)' : 'none',
          transition: 'background-color 0.3s ease'
        }}
      >
        <View
          className="relative flex items-center justify-between"
          style={{ height: `${HEADER_BODY}px`, paddingLeft: isMini ? '16px' : '20px', paddingRight: `${capsuleRight}px` }}
        >
          <View className="flex items-center gap-2">
            <Flower size={22} color={scrolled ? '#e8830c' : '#ffffff'} strokeWidth={1.6} />
            <Text
              className="text-base font-medium tracking-[0.28em]"
              style={{ color: scrolled ? '#33302b' : '#ffffff' }}
            >
              CHLOE FLORA
            </Text>
          </View>

          <View className="relative" onClick={() => goTab('/pages/cart/index')}>
            <View
              className="flex items-center justify-center w-9 h-9"
              style={{ backgroundColor: scrolled ? 'transparent' : 'rgba(51,48,43,0.28)', borderRadius: 99 }}
            >
              <ShoppingBag size={20} color={scrolled ? '#33302b' : '#ffffff'} />
            </View>
            {cartCount > 0 ? (
              <View className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-primary flex items-center justify-center">
                <Text className="text-xs leading-none text-white">{cartCount}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>

      {/* ============ 首屏全屏品牌海报（覆盖到最顶部） ============ */}
      <View className="relative w-full" style={{ height: `${heroHeight}px`, paddingTop: 0 }}>
        <Swiper
          className="w-full h-full"
          autoplay
          circular
          interval={4500}
          duration={650}
          indicatorDots
          indicatorColor="rgba(255,255,255,0.35)"
          indicatorActiveColor="#e8830c"
        >
          {HERO.map((h, i) => (
            <SwiperItem key={i}>
              {h.src ? (
                <Image className="w-full h-full" src={h.src} mode="aspectFill" />
              ) : (
                <View
                  className="relative w-full h-full flex flex-col justify-center items-center overflow-hidden px-10"
                  style={{ backgroundColor: HERO_TONE[h.tone].bg }}
                >
                  <View
                    className="absolute left-1/2 top-1/2 flex items-center justify-center"
                    style={{ transform: 'translate(-50%,-50%)', opacity: 0.16 }}
                  >
                    <Flower size={420} color={HERO_TONE[h.tone].glyph} strokeWidth={0.7} />
                  </View>
                  <View
                    className="w-10"
                    style={{ height: '1px', backgroundColor: HERO_TONE[h.tone].glyph, marginBottom: 28 }}
                  />
                  <Text className="block text-xs tracking-[0.45em] text-center" style={{ color: HERO_TONE[h.tone].fg }}>
                    {h.eyebrow}
                  </Text>
                  <Text
                    className="block mt-4 text-3xl font-semibold tracking-[0.18em] text-center"
                    style={{ color: HERO_TONE[h.tone].fg }}
                  >
                    {h.title}
                  </Text>
                  <Text
                    className="block mt-5 text-sm leading-7 tracking-wider text-center"
                    style={{ color: HERO_TONE[h.tone].fg, opacity: 0.78 }}
                  >
                    {SLOGAN.title}
                    {'\n'}
                    {SLOGAN.subtitle}
                  </Text>
                </View>
              )}
            </SwiperItem>
          ))}
        </Swiper>

        {/* 底部向下探索提示 */}
        <View className="absolute left-0 right-0 bottom-0 flex flex-col items-center" style={{ paddingBottom: isMini ? 28 : 24, pointerEvents: 'none' }}>
          <Text className="block text-xs tracking-[0.35em] text-white mb-2">向下滑动探索</Text>
          <ChevronDown size={20} color="#ffffff" />
        </View>
      </View>

      {/* ============ 各品类主题宣传区 ⇒ 商品网格（海报结束后开始呈现米白背景） ============ */}
      {CATEGORIES.map((c) => {
        const items = PRODUCTS.filter((p) => p.categoryId === c.id).slice(0, 4)
        if (!items.length) return null
        return (
          <View key={c.id} className="pt-14 pb-2">
            <View className="flex items-end justify-between px-5">
              <View>
                <Text className="block text-xs text-muted-foreground tracking-[0.3em]">
                  {CATEGORY_NOTE[c.id]}
                </Text>
                <Text className="block mt-1 text-2xl font-semibold text-foreground tracking-wide">
                  {c.name}
                </Text>
              </View>
              <View
                className="flex items-center gap-1 pb-1"
                onClick={() => goTab('/pages/category/index')}
              >
                <Text className="text-xs text-muted-foreground">查看全部</Text>
                <ChevronRight size={14} color="#a29b90" />
              </View>
            </View>

            {/* 品类主题宣传大图（场景化宣传位） */}
            <View className="px-5 mt-5">
              <ProductImage
                name={`${c.name} · 主题视觉`}
                hint="750 × 420"
                tone="gold"
                className="w-full aspect-[5/3]"
              />
            </View>

            {/* 2 列无边框商品网格 */}
            <View className="grid grid-cols-2 gap-x-5 gap-y-8 px-5 mt-6">
              {items.map((p) => (
                <ProductCard key={p.id} p={p} onTap={() => goProduct(p.id)} />
              ))}
            </View>
          </View>
        )
      })}

      {/* 花艺服务 CTA */}
      <View
        onClick={() => goTab('/pages/services/index')}
        className="mx-5 mt-14 mb-8 bg-foreground px-6 py-8"
      >
        <Text className="block text-xs tracking-[0.4em] text-background opacity-70">
          FLORAL SERVICES
        </Text>
        <Text className="block mt-3 text-2xl font-semibold text-background tracking-wide">
          匠心花艺 · 定制之选
        </Text>
        <Text className="block mt-4 text-sm leading-loose text-background opacity-75">
          {SERVICES.map((s) => s.name).join(' · ')}
        </Text>
        <View className="flex items-center gap-2 mt-6">
          <Text className="text-xs tracking-wider text-background">了解花艺服务</Text>
          <ChevronRight size={14} color="#ffffff" />
        </View>
      </View>
    </View>
  )
}

export default IndexPage
