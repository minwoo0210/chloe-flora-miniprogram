import { View, Text, Swiper, SwiperItem, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Flower, ShoppingBag, ChevronRight } from 'lucide-react-taro'
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

const IndexPage = () => {
  const cartCount = useStore((s) => s.cartCount())

  return (
    <View className="min-h-full bg-background">
      {/* 顶部全屏大图轮播 Hero：整张大图覆盖最顶部，品牌字以透明质感叠加其上 */}
      <View className="relative w-full" style={{ height: '84vh' }}>
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
                  className="relative w-full h-full flex items-end overflow-hidden"
                  style={{ backgroundColor: HERO_TONE[h.tone].bg }}
                >
                  <View
                    className="absolute left-1/2 top-1/2 flex items-center justify-center"
                    style={{ transform: 'translate(-50%,-50%)', opacity: 0.16 }}
                  >
                    <Flower size={420} color={HERO_TONE[h.tone].glyph} strokeWidth={0.7} />
                  </View>
                  <View className="relative px-8 pb-14">
                    <Text className="block text-xs tracking-[0.4em]" style={{ color: HERO_TONE[h.tone].fg }}>
                      {h.eyebrow}
                    </Text>
                    <Text className="block mt-3 text-3xl font-semibold tracking-[0.25em]" style={{ color: HERO_TONE[h.tone].fg }}>
                      {h.title}
                    </Text>
                  </View>
                </View>
              )}
            </SwiperItem>
          ))}
        </Swiper>

        {/* 购物袋入口（浮于大图右上角） */}
        <View
          className="absolute top-4 right-5 z-10 flex items-center justify-center w-9 h-9"
          style={{ backgroundColor: 'rgba(51,48,43,0.35)', borderRadius: 99 }}
          onClick={() => goTab('/pages/cart/index')}
        >
          <ShoppingBag size={19} color="#ffffff" />
          {cartCount > 0 ? (
            <View className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-primary flex items-center justify-center">
              <Text className="text-xs leading-none text-white">{cartCount}</Text>
            </View>
          ) : null}
        </View>

        {/* 透明品牌字叠加层（悬于大图之上，字体半透明如水印） */}
        <View
          className="absolute inset-0 flex flex-col items-center justify-center px-10"
          style={{ pointerEvents: 'none' }}
        >
          <Text
            className="block text-sm tracking-[0.5em] text-center"
            style={{ color: 'rgba(252,247,241,0.5)', textShadow: '0 1px 16px rgba(0,0,0,0.28)' }}
          >
            CHLOE FLORA · FLOWER STUDIO
          </Text>
          <Text
            className="block mt-3 text-5xl font-semibold tracking-[0.3em] text-center"
            style={{ color: 'rgba(252,247,241,0.88)', textShadow: '0 2px 28px rgba(0,0,0,0.35)' }}
          >
            Chloe Flora
          </Text>
          <Text
            className="block mt-7 text-sm leading-7 text-center"
            style={{ color: 'rgba(252,247,241,0.7)', textShadow: '0 1px 12px rgba(0,0,0,0.3)' }}
          >
            {SLOGAN.title}
            {'\n'}
            {SLOGAN.subtitle}
          </Text>
        </View>
      </View>

      {/* 各品类主题宣传区 ⇒ 商品网格 */}
      {CATEGORIES.map((c) => {
        const items = PRODUCTS.filter((p) => p.categoryId === c.id).slice(0, 4)
        if (!items.length) return null
        return (
          <View key={c.id} className="pt-12 pb-2">
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
        className="mx-5 mt-14 mb-6 bg-foreground px-6 py-8"
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