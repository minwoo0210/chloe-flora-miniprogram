import { useState, useEffect } from 'react'
import { View, Text, Swiper, SwiperItem, Image } from '@tarojs/components'
import Taro, { usePageScroll } from '@tarojs/taro'
import { Flower, ChevronRight, ChevronDown } from 'lucide-react-taro'
import ProductImage from '@/components/product-image'
import ProductCard from '@/components/product-card'
import { Network } from '@/network'
import { CATEGORIES, PRODUCTS, SERVICES, SLOGAN, HERO, type Product, formatPrice } from '@/data/catalog'


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

const IndexPage = () => {
  // 是否已经滚出首屏海报：越过海报后顶部栏才浮出米白背景
  const [scrolled, setScrolled] = useState(false)
  // 后台可配置的首页内容：默认回落静态数据，接口成功后覆盖
  const [brand, setBrand] = useState('Chloe Flora')
  const [slogan, setSlogan] = useState(SLOGAN)
  const [heroes, setHeroes] = useState(HERO)
  const heroHeight = sysInfo.windowHeight

  useEffect(() => {
    Network.request({ url: '/api/site/home' })
      .then((res: any) => {
        const cfg = res?.data?.data
        if (!cfg) return
        if (cfg.brand) setBrand(cfg.brand)
        if (cfg.slogan) setSlogan({ title: cfg.slogan.title || SLOGAN.title, subtitle: cfg.slogan.subtitle || SLOGAN.subtitle })
        if (Array.isArray(cfg.heroes) && cfg.heroes.length) setHeroes(cfg.heroes)
      })
      .catch(() => { /* 静默回落静态首页，避免白屏 */ })
  }, [])

  usePageScroll((e) => {
    // 海报底部 ⇒ 顶部导航完全落在米白内容区时切换
    const next = e.scrollTop > heroHeight - headerHeight - 8
    if (next !== scrolled) setScrolled(next)
  })

  return (
    <View className="min-h-full bg-background">
      {/* ============ 顶部居中品牌字：海报上透明(白字) / 滚出后米白底(深字) ============ */}
      <View
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          top: 0,
          zIndex: 50,
          paddingTop: `${statusBarHeight}px`,
          backgroundColor: scrolled ? '#f6f1eb' : 'transparent',
          boxShadow: scrolled ? '0 1px 0 rgba(160,153,141,0.18)' : 'none',
          transition: 'background-color 0.3s ease'
        }}
      >
        <View className="flex flex-col items-center justify-center" style={{ height: `${HEADER_BODY + 12}px` }}>
          <Flower size={18} color={scrolled ? '#e8830c' : '#ffffff'} strokeWidth={1.6} />
          <Text
            className="mt-1 text-base font-medium tracking-[0.18em] text-center"
            style={{ color: scrolled ? '#33302b' : '#ffffff' }}
          >
            {brand}
          </Text>
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
          {heroes.map((h0, i) => {
            const h = { ...h0, tone: HERO_TONE[h0.tone] ? h0.tone : 'deep' }
            return (
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
                    {slogan.title}
                    {'\n'}
                    {slogan.subtitle}
                  </Text>
                </View>
              )}
            </SwiperItem>
            )
          })}
        </Swiper>

        {/* 底部向下探索提示 */}
        <View className="absolute left-0 right-0 bottom-0 flex flex-col items-center" style={{ paddingBottom: isMini ? 28 : 24, pointerEvents: 'none' }}>
          <Text className="block text-xs tracking-[0.35em] text-white mb-2">向下滑动探索</Text>
          <ChevronDown size={20} color="#ffffff" />
        </View>
      </View>

      {/* ============ 各品类主题宣传区 ⇒ 商品网格（海报结束后开始呈现米白背景） ============ */}
      {CATEGORIES.map((c) => {
        const items = PRODUCTS.filter((p) => p.categoryId === c.id)
        if (!items.length) return null
        const featured = items[0]
        const rest = items.slice(1, 9)
        const pages: Product[][] = []
        for (let i = 0; i < rest.length; i += 4) pages.push(rest.slice(i, i + 4))
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

            {/* 品类第 1 个商品：全宽主推图（与页面等宽） */}
            <View className="relative w-full mt-5" onClick={() => goProduct(featured.id)}>
              <ProductImage
                name={featured.name}
                hint={featured.imageHint}
                tone="gold"
                className="w-full aspect-[3/4]"
              />
              <View
                className="absolute inset-x-0 bottom-0 px-5 pt-16 pb-6"
                style={{
                  backgroundImage:
                    'linear-gradient(to top, rgba(20,16,12,0.72) 0%, rgba(20,16,12,0) 100%)',
                }}
              >
                <Text className="block text-xs tracking-[0.3em] text-white opacity-80">
                  {CATEGORY_NOTE[c.id]} · 主推
                </Text>
                <Text className="block mt-2 text-xl font-medium text-white tracking-wide">
                  {featured.name}
                </Text>
                <View className="flex items-baseline gap-2 mt-2">
                  <Text className="text-lg font-semibold text-white">
                    ¥{formatPrice(featured.price)}
                  </Text>
                  {featured.originalPrice ? (
                    <Text className="text-xs text-white opacity-70 line-through">
                      ¥{formatPrice(featured.originalPrice)}
                    </Text>
                  ) : null}
                </View>
              </View>
            </View>

            {/* 2×2 分页商品网格：每页 4 个，可左右翻页 */}
            <Swiper
              className="mt-6"
              style={{ height: `${Math.round(((sysInfo.windowWidth - 60) / 2) * 1.3333 + 100) * 2 + 32}px` }}
              indicatorDots={pages.length > 1}
              indicatorColor="rgba(232,131,12,0.25)"
              indicatorActiveColor="#e8830c"
              circular={false}
            >
              {pages.map((page, pi) => (
                <SwiperItem key={pi}>
                  <View className="grid grid-cols-2 gap-x-5 gap-y-8 px-5">
                    {page.map((p) => (
                      <ProductCard key={p.id} p={p} onTap={() => goProduct(p.id)} />
                    ))}
                  </View>
                </SwiperItem>
              ))}
            </Swiper>
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
