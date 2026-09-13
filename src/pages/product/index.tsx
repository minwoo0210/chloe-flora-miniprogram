import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useState } from 'react'
import { Heart, Minus, Plus, Truck, ShieldCheck, Sparkles } from 'lucide-react-taro'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import ProductImage from '@/components/product-image'
import { PRODUCTS, formatPrice } from '@/data/catalog'
import { useStore } from '@/store/use-store'

const ProductDetailPage = () => {
  const router = useRouter()
  const id = router.params.id ?? ''
  const product = PRODUCTS.find((p) => p.id === id)
  const [qty, setQty] = useState(1)

  const addToCart = useStore((s) => s.addToCart)
  const toggleFavorite = useStore((s) => s.toggleFavorite)
  const isFav = useStore((s) => (product ? s.isFavorite(product.id) : false))

  if (!product) {
    return (
      <View className="flex flex-col items-center justify-center h-full bg-background px-6">
        <Text className="block text-base text-muted-foreground">未找到该花礼</Text>
        <Button
          className="mt-4"
          onClick={() => Taro.switchTab({ url: '/pages/category/index' })}
        >
          <Text>去逛逛</Text>
        </Button>
      </View>
    )
  }

  const handleAdd = () => {
    addToCart(product.id, qty)
    Taro.showToast({ title: '已加入购物车', icon: 'success' })
  }

  const handleBuy = () => {
    addToCart(product.id, qty)
    Taro.navigateTo({ url: '/pages/checkout/index' })
  }

  return (
    <ScrollView scrollY className="h-full bg-background">
      <View className="px-5 pt-4">
        <ProductImage
          name={product.name}
          hint={product.imageHint}
          tone="cream"
          className="h-80 rounded-xl"
        />
      </View>

      <View className="px-5 pt-5">
        <View className="flex items-start justify-between gap-3">
          <View className="flex-1">
            <Text className="block text-xl font-semibold text-foreground tracking-wide">
              {product.name}
            </Text>
            <Text className="block mt-1 text-sm text-muted-foreground">
              {product.subtitle}
            </Text>
          </View>
          <View
            className="flex flex-col items-center justify-center w-12 h-12 rounded-full border border-border bg-card"
            onClick={() => toggleFavorite(product.id)}
          >
            <Heart
              size={20}
              color={isFav ? '#e8830c' : '#c9a063'}
              filled={isFav}
            />
            <Text className="block mt-1 text-xs text-muted-foreground">
              {isFav ? '已收藏' : '收藏'}
            </Text>
          </View>
        </View>

        <View className="flex items-baseline gap-2 mt-3">
          <Text className="text-2xl font-bold text-primary">
            ¥{formatPrice(product.price)}
          </Text>
          {product.originalPrice ? (
            <Text className="text-sm text-muted-foreground line-through">
              ¥{formatPrice(product.originalPrice)}
            </Text>
          ) : null}
          {product.tags.length ? (
            <View className="flex gap-2">
              {product.tags.map((t) => (
                <Badge key={t} variant="secondary">
                  <Text className="text-xs leading-none">{t}</Text>
                </Badge>
              ))}
            </View>
          ) : null}
        </View>

        <Separator className="my-4" />

        {/* 服务承诺 */}
        <View className="grid grid-cols-3 gap-2">
          <View className="flex flex-col items-center py-2 rounded-lg bg-accent">
            <Truck size={18} color="#c9a063" />
            <Text className="block mt-2 text-xs text-foreground">同城配送</Text>
          </View>
          <View className="flex flex-col items-center py-2 rounded-lg bg-accent">
            <Sparkles size={18} color="#c9a063" />
            <Text className="block mt-2 text-xs text-foreground">每日鲜切</Text>
          </View>
          <View className="flex flex-col items-center py-2 rounded-lg bg-accent">
            <ShieldCheck size={18} color="#c9a063" />
            <Text className="block mt-2 text-xs text-foreground">售后无忧</Text>
          </View>
        </View>

        <Separator className="my-4" />

        <Text className="block text-base font-medium text-foreground tracking-wide">
          花礼说明
        </Text>
        <Text className="block mt-2 text-sm text-foreground leading-relaxed">
          {product.description}
        </Text>

        <View className="mt-4 bg-accent rounded-xl p-4">
          <Text className="block text-xs font-medium text-secondary tracking-widest">
            拍摄构图建议
          </Text>
          {product.detailNotes.map((n, i) => (
            <Text
              key={i}
              className="block mt-2 text-xs text-muted-foreground leading-relaxed"
            >
              · {n}
            </Text>
          ))}
          <Text className="block mt-2 text-xs text-muted-foreground">
            详情页建议主图 {product.imageHint}
          </Text>
        </View>

        <Separator className="my-5" />

        {/* 数量选择 */}
        <View className="flex items-center justify-between px-1">
          <Text className="block text-sm text-foreground">购买数量</Text>
          <View className="flex items-center gap-3">
            <View
              className="flex items-center justify-center w-9 h-9 rounded-full border border-border bg-card"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
            >
              <Minus size={16} color="#2b2118" />
            </View>
            <Text className="block w-6 text-center text-base font-medium text-foreground">
              {qty}
            </Text>
            <View
              className="flex items-center justify-center w-9 h-9 rounded-full border border-border bg-card"
              onClick={() => setQty((q) => Math.min(99, q + 1))}
            >
              <Plus size={16} color="#e8830c" />
            </View>
          </View>
        </View>
      </View>

      {/* 底部操作栏 */}
      <View
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'row',
          gap: '12px',
          padding: '12px 20px',
          backgroundColor: '#ffffff',
          borderTop: '1px solid #e9dfce',
          zIndex: 100
        }}
      >
        <View style={{ flex: 1 }}>
          <Button variant="outline" className="w-full" onClick={() => Taro.navigateBack()}>
            <Text>返回</Text>
          </Button>
        </View>
        <View style={{ flex: 1 }}>
          <Button className="w-full bg-primary" onClick={handleAdd}>
            <Text>加入购物车</Text>
          </Button>
        </View>
        <View style={{ flex: 1 }}>
          <Button className="w-full bg-secondary text-secondary-foreground" onClick={handleBuy}>
            <Text>立即购买</Text>
          </Button>
        </View>
      </View>

      {/* 底部占位避免遮挡 */}
      <View className="h-24" />
    </ScrollView>
  )
}

export default ProductDetailPage