import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useState } from 'react'
import { PackageOpen, ChevronRight } from 'lucide-react-taro'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ProductImage from '@/components/product-image'
import { formatPrice } from '@/data/catalog'
import { useStore, ORDER_STATUS_TEXT, type OrderStatus } from '@/store/use-store'

const STATUS_TABS: { id: OrderStatus | 'all'; name: string }[] = [
  { id: 'all', name: '全部' },
  { id: 'pending', name: '待付款' },
  { id: 'paid', name: '待发货' },
  { id: 'delivering', name: '配送中' },
  { id: 'done', name: '已完成' }
]

const fmtDate = (t: number) => {
  const d = new Date(t)
  const p = (n: number) => (n < 10 ? `0${n}` : `${n}`)
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

const OrdersPage = () => {
  const router = useRouter()
  const orders = useStore((s) => s.orders)
  const updateOrderStatus = useStore((s) => s.updateOrderStatus)
  const [active, setActive] = useState<OrderStatus | 'all'>(
    (router.params.status as OrderStatus | undefined) || 'all'
  )

  const list =
    active === 'all' ? orders : orders.filter((o) => o.status === active)

  const goCategory = () => Taro.switchTab({ url: '/pages/category/index' })

  return (
    <View className="h-full bg-background flex flex-col">
      <View className="px-4 pt-3 pb-1">
        <ScrollView scrollX className="w-full">
          <Tabs value={active} onValueChange={(v) => setActive(v as OrderStatus | 'all')}>
            <TabsList className="inline-flex h-11 gap-1 bg-muted px-2 rounded-sm">
              {STATUS_TABS.map((s) => (
                <TabsTrigger key={s.id} value={s.id} className="px-3 py-2">
                  <Text className="block text-sm leading-none">{s.name}</Text>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </ScrollView>
      </View>

      <ScrollView scrollY className="flex-1 px-5 pt-3 pb-8">
        {list.length === 0 ? (
          <View className="flex flex-col items-center justify-center pt-24 px-8">
            <View className="flex items-center justify-center w-20 h-20 rounded-full border border-border bg-card">
              <PackageOpen size={34} color="#c9a063" strokeWidth={1.4} />
            </View>
            <Text className="block mt-5 text-base font-medium text-foreground">
              暂无相关订单
            </Text>
            <Text className="block mt-2 text-sm text-muted-foreground text-center">
              去挑选一束心仪的花礼吧
            </Text>
            <Button className="mt-6" onClick={goCategory}>
              <Text>去逛逛</Text>
            </Button>
          </View>
        ) : (
          <View className="flex flex-col gap-4">
            {list.map((o) => (
              <View
                key={o.id}
                className="rounded-sm border border-border bg-card overflow-hidden"
              >
                {/* 订单头部 */}
                <View className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <View className="flex-1">
                    <Text className="block text-xs text-muted-foreground">
                      订单号 {o.orderNo}
                    </Text>
                    <Text className="block mt-1 text-xs text-muted-foreground">
                      {fmtDate(o.createdAt)}
                    </Text>
                  </View>
                  <Text
                    className={`block text-sm font-medium ${
                      o.status === 'canceled' ? 'text-muted-foreground' : 'text-primary'
                    }`}
                  >
                    {ORDER_STATUS_TEXT[o.status]}
                  </Text>
                </View>

                {/* 商品 */}
                {o.items.map((it) => (
                  <View
                    key={it.productId}
                    className="flex flex-row gap-3 items-center px-4 py-3"
                  >
                    <ProductImage
                      name={it.name}
                      hint={it.imageHint}
                      className="w-14 h-14 rounded-sm shrink-0"
                    />
                    <View className="flex-1">
                      <Text className="block text-sm font-medium text-foreground leading-snug">
                        {it.name}
                      </Text>
                      <Text className="block mt-1 text-xs text-muted-foreground">
                        ¥{formatPrice(it.price)} × {it.qty}
                      </Text>
                    </View>
                    <Text className="block text-sm font-semibold text-foreground">
                      ¥{formatPrice(it.price * it.qty)}
                    </Text>
                  </View>
                ))}

                {/* 底部 */}
                <View className="px-4 py-3 border-t border-border">
                  <Text className="block text-sm text-muted-foreground">
                    收货人：{o.receiver} {o.phone}
                  </Text>
                  <Text className="block mt-1 text-xs text-muted-foreground">
                    {o.address}
                  </Text>
                  <View className="flex items-center justify-between mt-2">
                    <Text className="block text-sm text-foreground">
                      共 {o.items.reduce((s, i) => s + i.qty, 0)} 件
                    </Text>
                    <Text className="block text-lg font-bold text-primary">
                      ¥{formatPrice(o.total)}
                    </Text>
                  </View>
                  {o.status === 'pending' ? (
                    <View
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        gap: '10px',
                        marginTop: '12px'
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => updateOrderStatus(o.id, 'canceled')}
                        >
                          <Text>取消订单</Text>
                        </Button>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Button
                          className="w-full"
                          onClick={() => updateOrderStatus(o.id, 'paid')}
                        >
                          <Text>去付款</Text>
                        </Button>
                      </View>
                    </View>
                  ) : o.status === 'paid' ? (
                    <View
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        gap: '10px',
                        marginTop: '12px'
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Button
                          className="w-full"
                          onClick={() => updateOrderStatus(o.id, 'delivering')}
                        >
                          <Text>提醒发货</Text>
                        </Button>
                      </View>
                    </View>
                  ) : o.status === 'delivering' ? (
                    <View
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        gap: '10px',
                        marginTop: '12px'
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Button
                          className="w-full"
                          onClick={() => updateOrderStatus(o.id, 'done')}
                        >
                          <Text>确认收货</Text>
                        </Button>
                      </View>
                    </View>
                  ) : o.status === 'done' ? (
                    <View
                      className="flex items-center gap-1 justify-end mt-2"
                      onClick={goCategory}
                    >
                      <Text className="text-xs text-secondary">再来一单</Text>
                      <ChevronRight size={14} color="#c9a063" />
                    </View>
                  ) : null}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  )
}

export default OrdersPage