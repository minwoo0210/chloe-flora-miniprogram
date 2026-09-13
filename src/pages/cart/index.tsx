import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react-taro'
import { Button } from '@/components/ui/button'
import ProductImage from '@/components/product-image'
import { formatPrice } from '@/data/catalog'
import { useStore } from '@/store/use-store'

const CartPage = () => {
  const detail = useStore((s) => s.cartDetail())
  const total = useStore((s) => s.cartTotal())
  const updateQty = useStore((s) => s.updateQty)
  const removeFromCart = useStore((s) => s.removeFromCart)

  const goCheckout = () => {
    if (!detail.length) return
    Taro.navigateTo({ url: '/pages/checkout/index' })
  }

  return (
    <View className="min-h-full bg-background flex flex-col">
      <View className="flex items-center justify-between px-5 h-14 border-b border-border">
        <Text className="text-base font-semibold text-foreground tracking-widest">购物袋</Text>
        <Text className="block text-xs text-muted-foreground tracking-widest">SHOPPING BAG</Text>
      </View>

      <View className="flex-1">
        {!detail.length ? (
          <View className="pt-32 flex flex-col items-center px-10">
            <ShoppingBag size={40} color="#a29b90" strokeWidth={1.2} />
            <Text className="block mt-5 text-base text-foreground">购物袋还是空的</Text>
            <Text className="block mt-2 text-sm text-muted-foreground text-center">
              去挑选一份心仪的花礼吧
            </Text>
            <View className="mt-8 w-full">
              <Button
                className="w-full"
                onClick={() => Taro.switchTab({ url: '/pages/category/index' })}
              >
                <Text className="block leading-none">去选花礼</Text>
              </Button>
            </View>
          </View>
        ) : (
          <View className="px-5 pt-5 pb-8">
            {detail.map((d) => (
              <View key={d.productId} className="flex gap-4 py-5 border-b border-border">
                <View className="w-24 h-32 shrink-0">
                  <ProductImage
                    name={d.product?.name}
                    hint={d.product?.imageHint}
                    className="w-full h-full"
                    tone="gold"
                  />
                </View>
                <View className="flex-1 flex flex-col">
                  <View className="flex items-start justify-between gap-3">
                    <Text className="block text-sm font-medium text-foreground leading-snug">
                      {d.product?.name}
                    </Text>
                    <View
                      onClick={() => removeFromCart(d.productId)}
                      className="shrink-0"
                    >
                      <Trash2 size={16} color="#a29b90" strokeWidth={1.6} />
                    </View>
                  </View>
                  <Text className="block mt-1 text-xs text-muted-foreground">
                    {d.product?.subtitle}
                  </Text>
                  <View className="flex items-end justify-between mt-auto pt-4">
                    <Text className="text-base font-semibold text-foreground">
                      ¥{formatPrice((d.product?.price ?? 0) * d.qty)}
                    </Text>
                    <View className="flex items-center gap-3">
                      <View
                        className="w-7 h-7 border border-border flex items-center justify-center"
                        onClick={() => d.qty > 1 && updateQty(d.productId, d.qty - 1)}
                      >
                        <Minus size={14} color="#33302b" strokeWidth={1.6} />
                      </View>
                      <Text className="block text-sm text-foreground w-5 text-center">
                        {d.qty}
                      </Text>
                      <View
                        className="w-7 h-7 border border-foreground flex items-center justify-center"
                        onClick={() => updateQty(d.productId, d.qty + 1)}
                      >
                        <Plus size={14} color="#33302b" strokeWidth={1.6} />
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {detail.length ? (
        <View
          style={{ position: 'fixed', bottom: 0, left: 0, right: 0 }}
          className="flex items-center justify-between gap-5 px-5 py-3 bg-background border-t border-border"
        >
          <View>
            <Text className="block text-xs text-muted-foreground">合计</Text>
            <Text className="block mt-1 text-xl font-semibold text-foreground">
              ¥{formatPrice(total)}
            </Text>
          </View>
          <View className="flex-1 max-w-52">
            <Button className="w-full" onClick={goCheckout}>
              <Text className="block leading-none">去结算 · {detail.length} 件</Text>
            </Button>
          </View>
        </View>
      ) : null}
    </View>
  )
}

export default CartPage