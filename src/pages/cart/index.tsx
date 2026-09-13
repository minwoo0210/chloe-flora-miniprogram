import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Minus, Plus, Trash2, ShoppingBasket } from 'lucide-react-taro'
import { Button } from '@/components/ui/button'
import ProductImage from '@/components/product-image'
import { formatPrice } from '@/data/catalog'
import { useStore } from '@/store/use-store'

const CartPage = () => {
  const detail = useStore((s) => s.cartDetail())
  const updateQty = useStore((s) => s.updateQty)
  const removeFromCart = useStore((s) => s.removeFromCart)
  const cartTotal = useStore((s) => s.cartTotal())

  const goCategory = () => Taro.switchTab({ url: '/pages/category/index' })
  const goCheckout = () => {
    if (detail.length === 0) return
    Taro.navigateTo({ url: '/pages/checkout/index' })
  }

  if (detail.length === 0) {
    return (
      <View className="flex flex-col items-center justify-center h-full bg-background px-8">
        <View className="flex items-center justify-center w-20 h-20 rounded-full border border-border bg-card">
          <ShoppingBasket size={34} color="#c9a063" strokeWidth={1.4} />
        </View>
        <Text className="block mt-5 text-base font-medium text-foreground">
          购物车还是空的
        </Text>
        <Text className="block mt-2 text-sm text-muted-foreground text-center">
          去挑选一束被珍视的花礼吧
        </Text>
        <Button className="mt-6" onClick={goCategory}>
          <Text>去逛逛</Text>
        </Button>
      </View>
    )
  }

  return (
    <View className="h-full bg-background flex flex-col">
      <ScrollView scrollY className="flex-1 px-5 pt-4">
        <Text className="block text-lg font-medium text-foreground tracking-wide mb-3">
          共 {detail.length} 件花礼
        </Text>
        <View className="flex flex-col gap-3">
          {detail.map((d) => {
            const p = d.product
            if (!p) return null
            const price = p.price
            return (
              <View
                key={p.id}
                className="flex flex-row gap-3 p-3 rounded-xl border border-border bg-card"
              >
                <ProductImage
                  name={p.name}
                  hint={p.imageHint}
                  className="w-24 h-24 rounded-lg shrink-0"
                />
                <View className="flex-1 flex flex-col justify-between">
                  <View>
                    <View className="flex items-start justify-between gap-2">
                      <Text className="block text-sm font-medium text-foreground leading-snug">
                        {p.name}
                      </Text>
                      <View
                        className="shrink-0"
                        onClick={() => removeFromCart(p.id)}
                      >
                        <Trash2 size={17} color="#c9a063" />
                      </View>
                    </View>
                    <Text className="block mt-1 text-xs text-muted-foreground">
                      {p.subtitle}
                    </Text>
                  </View>
                  <View className="flex items-center justify-between">
                    <Text className="text-base font-semibold text-primary">
                      ¥{formatPrice(price)}
                    </Text>
                    <View className="flex items-center gap-3">
                      <View
                        className="flex items-center justify-center w-7 h-7 rounded-full border border-border"
                        onClick={() => updateQty(p.id, d.qty - 1)}
                      >
                        <Minus size={14} color="#2b2118" />
                      </View>
                      <Text className="block w-5 text-center text-sm font-medium text-foreground">
                        {d.qty}
                      </Text>
                      <View
                        className="flex items-center justify-center w-7 h-7 rounded-full border border-border"
                        onClick={() => updateQty(p.id, d.qty + 1)}
                      >
                        <Plus size={14} color="#e8830c" />
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            )
          })}
        </View>
        <View className="h-6" />
      </ScrollView>

      {/* 结算栏 */}
      <View
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          backgroundColor: '#ffffff',
          borderTop: '1px solid #e9dfce',
          zIndex: 100
        }}
      >
        <View>
          <Text className="block text-xs text-muted-foreground">合计</Text>
          <Text className="block text-xl font-bold text-primary">
            ¥{formatPrice(cartTotal)}
          </Text>
        </View>
        <Button className="px-8" onClick={goCheckout}>
          <Text>去结算</Text>
        </Button>
      </View>
      <View className="h-24" />
    </View>
  )
}

export default CartPage