import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Flower, ShoppingBag, ChevronDown, ChevronRight } from 'lucide-react-taro'
import ProductImage from '@/components/product-image'
import ProductCard from '@/components/product-card'
import { CATEGORIES, PRODUCTS, SERVICES, SLOGAN } from '@/data/catalog'
import { useStore } from '@/store/use-store'

const goTab = (url: string) => Taro.switchTab({ url })
const goProduct = (id: string) => Taro.navigateTo({ url: `/pages/product/index?id=${id}` })

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
      {/* 顶部固定品牌栏 */}
      <View
        style={{ position: 'sticky', top: 0, zIndex: 50 }}
        className="bg-background border-b border-border"
      >
        <View className="flex items-center justify-between px-5 h-14">
          <View className="flex items-center gap-2">
            <View className="w-7 h-7 rounded-sm bg-primary flex items-center justify-center">
              <Flower size={16} color="#ffffff" strokeWidth={1.8} />
            </View>
            <Text className="text-base font-semibold text-foreground tracking-widest">
              Chloe Flora
            </Text>
          </View>
          <View className="relative" onClick={() => goTab('/pages/cart/index')}>
            <ShoppingBag size={20} color="#33302b" strokeWidth={1.6} />
            {cartCount > 0 ? (
              <View className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-primary flex items-center justify-center">
                <Text className="text-xs leading-none text-white">{cartCount}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>

      {/* 首屏品牌主题海报 */}
      <View
        className="bg-foreground flex flex-col justify-center px-8"
        style={{ height: '82vh', position: 'relative', overflow: 'hidden' }}
      >
        <View
          className="flex items-center justify-center"
          style={{ position: 'absolute', inset: 0, opacity: 0.16 }}
        >
          <Flower size={340} color="#e8830c" strokeWidth={0.6} />
        </View>
        <View className="relative flex flex-col items-start">
          <View className="w-10 h-1 bg-primary" />
          <Text className="block mt-5 text-xs tracking-[0.5em] text-background">
            CHLOE FLORA · FLOWER STUDIO
          </Text>
          <Text className="block mt-5 text-4xl font-semibold text-background tracking-[0.35em]">
            Chloe Flora
          </Text>
          <Text className="block mt-6 text-sm leading-loose text-background opacity-80">
            {SLOGAN.title}
            {'\n'}
            {SLOGAN.subtitle}
          </Text>
          <View className="flex items-center gap-2 mt-12 text-background opacity-70">
            <Text className="text-xs tracking-[0.3em]">向下滑动探索</Text>
            <ChevronDown size={14} color="#ffffff" />
          </View>
        </View>
      </View>

      {/* 品牌宣言 */}
      <View className="px-8 pt-14 pb-4">
        <Text className="block text-center text-sm text-muted-foreground leading-7 tracking-wider">
          回归花艺的美学本质
          {'\n'}
          以克制与留白，重塑每一束被珍视的仪式感
        </Text>
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