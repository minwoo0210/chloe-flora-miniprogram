import { View, Text, Swiper, SwiperItem } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useState } from 'react'
import { ArrowLeft, Flower, Minus, Plus } from 'lucide-react-taro'
import { Button } from '@/components/ui/button'
import ProductImage from '@/components/product-image'
import ProductCard from '@/components/product-card'
import { PRODUCTS, formatPrice } from '@/data/catalog'
import { useStore } from '@/store/use-store'
import { cn } from '@/lib/utils'

const SPECS = ['标准包装', '礼盒装', '加急配送']
const PARAMS = ['进口鲜切花材', '人工手作包装', '全国冷链配送', '花期可养护 5-7 天']
const PERKS = ['免费配送', '可定制贺卡', '花期无忧养护']

const ProductPage = () => {
  const router = useRouter()
  const id = router.params?.id || ''
  const p = PRODUCTS.find((x) => x.id === id)
  const addToCart = useStore((s) => s.addToCart)

  const [spec, setSpec] = useState(SPECS[0])
  const [qty, setQty] = useState(1)

  if (!p) {
    return (
      <View className="min-h-full bg-background flex items-center justify-center">
        <Text className="block text-sm text-muted-foreground">花礼不存在</Text>
      </View>
    )
  }

  const related = PRODUCTS.filter((x) => x.categoryId === p.categoryId && x.id !== p.id).slice(0, 2)

  const toast = (msg: string) => Taro.showToast({ title: msg, icon: 'none' })
  const goBack = () => Taro.navigateBack()

  const handleAdd = () => {
    addToCart(p.id, qty)
    toast('已加入购物袋')
  }
  const handleBuy = () => {
    addToCart(p.id, qty)
    Taro.navigateTo({ url: '/pages/checkout/index' })
  }

  const slides = [p, ...p.detailNotes.map((n) => n)]

  return (
    <View className="min-h-full bg-background flex flex-col">
      {/* 顶部：返回 + logo */}
      <View
        style={{ position: 'sticky', top: 0, zIndex: 40 }}
        className="flex items-center justify-between px-4 h-14 bg-background border-b border-border"
      >
        <View className="w-8 h-8 flex items-center justify-center" onClick={goBack}>
          <ArrowLeft size={20} color="#33302b" />
        </View>
        <View className="flex items-center gap-2">
          <View className="w-6 h-6 rounded-sm bg-primary flex items-center justify-center">
            <Flower size={13} color="#ffffff" strokeWidth={1.8} />
          </View>
          <Text className="text-sm font-medium text-foreground tracking-widest">Chloe Flora</Text>
        </View>
        <View className="w-8" />
      </View>

      <View className="flex-1">
        {/* 商品轮播图 */}
        <View className="px-5 pt-5">
          <Swiper
            className="w-full aspect-[3/4] rounded-sm overflow-hidden"
            indicatorDots
            indicatorColor="rgba(0,0,0,0.12)"
            indicatorActiveColor="#e8830c"
            circular
          >
            {slides.map((s, i) => (
              <SwiperItem key={i}>
                {i === 0 ? (
                  <ProductImage name={p.name} hint={p.imageHint} className="w-full h-full" />
                ) : (
                  <ProductImage name={`构图建议 · ${s}`} hint={p.imageHint} className="w-full h-full" tone="gold" />
                )}
              </SwiperItem>
            ))}
          </Swiper>
        </View>

        {/* 名称 + 售价 */}
        <View className="px-5 pt-6">
          <Text className="block text-2xl font-semibold text-foreground tracking-wide leading-snug">
            {p.name}
          </Text>
          <Text className="block mt-2 text-sm text-muted-foreground">{p.subtitle}</Text>
          <View className="flex items-baseline gap-3 mt-4">
            <Text className="text-2xl font-semibold text-foreground">
              ¥{formatPrice(p.price)}
            </Text>
            {p.originalPrice ? (
              <Text className="text-sm text-muted-foreground line-through">
                ¥{formatPrice(p.originalPrice)}
              </Text>
            ) : null}
          </View>
        </View>

        {/* 选项：规格 + 数量 */}
        <View className="px-5 pt-7">
          <Text className="block text-sm font-medium text-foreground tracking-wider">选择规格</Text>
          <View className="flex items-center gap-3 mt-3">
            {SPECS.map((s) => (
              <Text
                key={s}
                className={cn(
                  'block px-4 py-2 border text-sm leading-none cursor-pointer',
                  spec === s
                    ? 'border-foreground text-foreground'
                    : 'border-border text-muted-foreground'
                )}
                onClick={() => setSpec(s)}
              >
                {s}
              </Text>
            ))}
          </View>

          <Text className="block text-sm font-medium text-foreground tracking-wider mt-7">数量</Text>
          <View className="flex items-center justify-between mt-3">
            <View className="flex items-center gap-4">
              <View
                className="w-8 h-8 border border-border flex items-center justify-center"
                onClick={() => qty > 1 && setQty(qty - 1)}
              >
                <Minus size={16} color="#33302b" strokeWidth={1.6} />
              </View>
              <Text className="block text-lg text-foreground w-6 text-center">{qty}</Text>
              <View
                className="w-8 h-8 border border-foreground flex items-center justify-center"
                onClick={() => setQty(qty + 1)}
              >
                <Plus size={16} color="#33302b" strokeWidth={1.6} />
              </View>
            </View>
            <Text className="block text-xs text-muted-foreground">满 ¥299 免配送费</Text>
          </View>
        </View>

        {/* 参数说明 */}
        <View className="px-5 pt-8">
          <Text className="block text-sm font-medium text-foreground tracking-wider">参数说明</Text>
          <View className="mt-3 border-t border-border">
            {PARAMS.map((x) => (
              <View key={x} className="flex items-center gap-3 py-3 border-b border-border">
                <View className="w-1 h-1 rounded-full bg-primary" />
                <Text className="block text-sm text-foreground">{x}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 服务说明 */}
        <View className="px-5 pt-8">
          <Text className="block text-sm font-medium text-foreground tracking-wider">花艺服务</Text>
          <View className="flex items-center gap-5 mt-3">
            {PERKS.map((x) => (
              <Text key={x} className="block text-sm text-foreground">
                {x}
              </Text>
            ))}
          </View>
        </View>

        {/* 关联推荐 */}
        {related.length ? (
          <View className="px-5 pt-9">
            <Text className="block text-sm font-medium text-foreground tracking-wider">
              关联推荐
            </Text>
            <View className="grid grid-cols-2 gap-x-5 gap-y-8 mt-4 pb-6">
              {related.map((r) => (
                <ProductCard
                  key={r.id}
                  p={r}
                  onTap={() => Taro.redirectTo({ url: `/pages/product/index?id=${r.id}` })}
                />
              ))}
            </View>
          </View>
        ) : null}

        {/* 详情描述 */}
        <View className="px-5 pt-4 pb-28">
          <Text className="block leading-relaxed text-sm text-foreground">{p.description}</Text>
        </View>
      </View>

      {/* 底部固定操作栏 */}
      <View
        style={{ position: 'fixed', bottom: 0, left: 0, right: 0 }}
        className="flex items-center gap-3 px-5 py-3 bg-background border-t border-border"
      >
        <View className="flex-1">
          <Button variant="outline" className="w-full" onClick={handleAdd}>
            <Text className="block leading-none">加入购物袋</Text>
          </Button>
        </View>
        <View className="flex-1">
          <Button className="w-full" onClick={handleBuy}>
            <Text className="block leading-none">立即购买</Text>
          </Button>
        </View>
      </View>
    </View>
  )
}

export default ProductPage