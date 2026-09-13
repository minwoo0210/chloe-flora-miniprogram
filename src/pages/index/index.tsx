import { View, Text, Swiper, SwiperItem, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Flower, ChevronRight, Sparkles } from 'lucide-react-taro'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import ProductImage from '@/components/product-image'
import { BANNERS, PRODUCTS, SERVICES, SLOGAN, formatPrice } from '@/data/catalog'
import { useStore } from '@/store/use-store'

const TINT_TEXT: Record<string, string> = {
  orange: 'from-[#e8830c] to-[#f0a04b]',
  deep: 'from-[#4a3b2a] to-[#6b573c]',
  sage: 'from-[#5f7053] to-[#839576]',
  gold: 'from-[#c9a063] to-[#e0c893]'
}

const goProduct = (id: string) =>
  Taro.navigateTo({ url: `/pages/product/index?id=${id}` })
const goTab = (url: string) => Taro.switchTab({ url })

const IndexPage = () => {
  const cartCount = useStore((s) => s.cartCount())
  const hot = PRODUCTS.filter((p) => p.hot).slice(0, 4)
  const featured = PRODUCTS.filter((p) => p.tags.includes('精选')).slice(0, 4)

  return (
    <ScrollView scrollY className="h-full bg-background">
      {/* 品牌形象区 */}
      <View className="flex flex-col items-center pt-12 pb-8 px-6">
        <View className="flex items-center justify-center w-16 h-16 rounded-full border border-secondary bg-white shadow-sm">
          <Flower size={34} color="#e8830c" strokeWidth={1.4} />
        </View>
        <Text className="block mt-5 text-2xl tracking-[0.3em] font-semibold text-foreground">
          花屿花艺工作室
        </Text>
        <Text className="block mt-2 text-xs tracking-[0.4em] text-secondary">
          FLORIST · BOUQUET · BOUTIQUE
        </Text>
        <Text className="block mt-4 text-sm text-muted-foreground text-center leading-relaxed">
          {SLOGAN.title}
          {'\n'}
          {SLOGAN.subtitle}
        </Text>
      </View>

      {/* Banner 轮播 */}
      <View className="px-6 mb-4">
        <Swiper
          className="w-full h-36 rounded-xl overflow-hidden"
          indicatorDots
          indicatorColor="rgba(255,255,255,0.5)"
          indicatorActiveColor="#e8830c"
          autoplay
          circular
          interval={4000}
        >
          {BANNERS.map((b) => (
            <SwiperItem key={b.id}>
              <View
                className={`w-full h-full bg-gradient-to-br ${TINT_TEXT[b.tint]} flex flex-col justify-center px-6`}
              >
                <View className="w-10 h-1 bg-white mb-3" />
                <Text className="block text-lg tracking-widest text-white">
                  {b.title}
                </Text>
                <Text className="block mt-2 text-xs text-white">
                  {b.subtitle}
                </Text>
                <Text className="block mt-auto text-xs text-white">
                  建议 Banner 图 {b.imageHint}
                </Text>
              </View>
            </SwiperItem>
          ))}
        </Swiper>
      </View>

      {/* 服务介绍 */}
      <View className="px-6 mb-4">
        <View className="flex items-center justify-between mb-3">
          <Text className="block text-lg font-medium text-foreground tracking-wide">
            花艺服务
          </Text>
          <View className="flex items-center gap-1 text-secondary">
            <Sparkles size={13} color="#c9a063" />
            <Text className="text-xs text-secondary">PROFESSIONAL</Text>
          </View>
        </View>
        <View className="grid grid-cols-2 gap-3">
          {SERVICES.map((s) => (
            <Card key={s.id} className="overflow-hidden">
              <CardContent className="p-0">
                <ProductImage name={s.name} hint={s.imageHint} className="h-28" />
                <View className="px-3 py-3">
                  <Text className="block text-sm font-medium text-foreground">
                    {s.name}
                  </Text>
                  <Text className="block mt-1 text-xs text-muted-foreground">
                    {s.desc}
                  </Text>
                </View>
              </CardContent>
            </Card>
          ))}
        </View>
      </View>

      {/* 热门花礼推荐 */}
      <View className="px-6 mb-4">
        <View className="flex items-center justify-between mb-3">
          <Text className="block text-lg font-medium text-foreground tracking-wide">
            热门花礼
          </Text>
          <View
            className="flex items-center gap-1 text-secondary"
            onClick={() => goTab('/pages/category/index')}
          >
            <Text className="text-xs text-secondary">全部</Text>
            <ChevronRight size={14} color="#c9a063" />
          </View>
        </View>
        <View className="grid grid-cols-2 gap-3">
          {hot.map((p) => (
            <Card
              key={p.id}
              className="overflow-hidden"
              onClick={() => goProduct(p.id)}
            >
              <CardContent className="p-0">
                <ProductImage
                  name={p.name}
                  hint={p.imageHint}
                  className="h-32"
                />
                <View className="px-3 pt-3 pb-3">
                  <Text className="block text-sm font-medium text-foreground leading-snug line-clamp-1">
                    {p.name}
                  </Text>
                  <Text className="block mt-1 text-xs text-muted-foreground line-clamp-1">
                    {p.subtitle}
                  </Text>
                  <View className="flex items-center gap-2 mt-2">
                    <Text className="text-base font-semibold text-primary">
                      ¥{formatPrice(p.price)}
                    </Text>
                    {p.originalPrice ? (
                      <Text className="text-xs text-muted-foreground line-through">
                        ¥{formatPrice(p.originalPrice)}
                      </Text>
                    ) : null}
                  </View>
                  {p.tags.length ? (
                    <View className="flex flex-wrap gap-2 mt-2">
                      {p.tags.map((t) => (
                        <Badge key={t} variant="secondary" className="text-xs px-2 py-1">
                          <Text className="text-xs leading-none">{t}</Text>
                        </Badge>
                      ))}
                    </View>
                  ) : null}
                </View>
              </CardContent>
            </Card>
          ))}
        </View>
      </View>

      {/* 精选臻礼 */}
      <View className="px-6 pb-10">
        <Text className="block text-lg font-medium text-foreground tracking-wide mb-3">
          臻选之作
        </Text>
        <View className="grid grid-cols-2 gap-3">
          {featured.map((p) => (
            <Card
              key={p.id}
              className="overflow-hidden"
              onClick={() => goProduct(p.id)}
            >
              <CardContent className="p-0">
                <ProductImage
                  name={p.name}
                  hint={p.imageHint}
                  className="h-32"
                />
                <View className="px-3 pt-3 pb-3">
                  <Text className="block text-sm font-medium text-foreground line-clamp-1">
                    {p.name}
                  </Text>
                  <Text className="block mt-1 text-xs text-muted-foreground line-clamp-1">
                    {p.subtitle}
                  </Text>
                  <Text className="block mt-2 text-base font-semibold text-primary">
                    ¥{formatPrice(p.price)}
                  </Text>
                </View>
              </CardContent>
            </Card>
          ))}
        </View>

        {/* 购物车入口的简单提示条 */}
        <Card className="mt-6 overflow-hidden" onClick={() => goTab('/pages/cart/index')}>
          <CardContent className="p-4 flex items-center justify-between">
            <View>
              <Text className="block text-sm font-medium text-foreground">
                去购物车结算
              </Text>
              <Text className="block mt-1 text-xs text-muted-foreground">
                当前 {cartCount} 件花礼待确认
              </Text>
            </View>
            <ChevronRight size={18} color="#c9a063" />
          </CardContent>
        </Card>
      </View>
    </ScrollView>
  )
}

export default IndexPage