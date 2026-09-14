import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import {
  User,
  Heart,
  MapPin,
  PackageOpen,
  Phone,
  ChevronRight,
  MessageCircle,
  Crown
} from 'lucide-react-taro'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useStore } from '@/store/use-store'

const SERVICE_PHONE = '400-800-1234'

const MyPage = () => {
  const favorites = useStore((s) => s.favorites)
  const addresses = useStore((s) => s.addresses)
  const orders = useStore((s) => s.orders)

  const go = (url: string) => Taro.navigateTo({ url })
  const call = () =>
    Taro.makePhoneCall({
      phoneNumber: SERVICE_PHONE,
      fail: () => Taro.showToast({ title: SERVICE_PHONE, icon: 'none' })
    })

  const menu = [
    { icon: PackageOpen, label: '我的订单', hint: '查看订单状态', onClick: () => go('/pages/orders/index'), color: '#e8830c' },
    { icon: Heart, label: '我的收藏', hint: `${favorites.length} 件珍藏`, onClick: () => go('/pages/favorites/index'), color: '#c0392b' },
    { icon: MapPin, label: '地址管理', hint: `${addresses.length} 个收货地址`, onClick: () => go('/pages/address/index'), color: '#c9a063' },
    { icon: MessageCircle, label: '联系客服', hint: SERVICE_PHONE, onClick: call, color: '#7a8b6f' }
  ]

  return (
    <ScrollView scrollY className="h-full bg-background">
      {/* 个人信息 */}
      <View className="px-5 pt-10 pb-6">
        <Card className="overflow-hidden">
          <CardContent className="p-6 flex flex-row items-center gap-4 bg-gradient-to-br from-[#fbf1e0] to-[#f6ead6]">
            <View className="flex items-center justify-center w-16 h-16 rounded-full bg-white border border-secondary">
              <User size={30} color="#e8830c" strokeWidth={1.4} />
            </View>
            <View className="flex-1">
              <View className="flex items-center gap-2">
                <Text className="block text-lg font-semibold text-foreground">
                  Chloe Flora 会员
                </Text>
                <Crown size={16} color="#c9a063" />
              </View>
              <Text className="block mt-1 text-xs text-muted-foreground">
                金卡会员 · 尊享鲜花订阅
              </Text>
            </View>
          </CardContent>
        </Card>
      </View>

      {/* 数据统计 */}
      <View className="px-5 mb-5">
        <View className="grid grid-cols-3 gap-3">
          <Card className="overflow-hidden" onClick={() => go('/pages/orders/index')}>
            <CardContent className="p-4 flex flex-col items-center">
              <Text className="block text-2xl font-bold text-primary">
                {orders.length}
              </Text>
              <Text className="block mt-1 text-xs text-muted-foreground">订单</Text>
            </CardContent>
          </Card>
          <Card className="overflow-hidden" onClick={() => go('/pages/favorites/index')}>
            <CardContent className="p-4 flex flex-col items-center">
              <Text className="block text-2xl font-bold text-primary">
                {favorites.length}
              </Text>
              <Text className="block mt-1 text-xs text-muted-foreground">收藏</Text>
            </CardContent>
          </Card>
          <Card className="overflow-hidden" onClick={() => go('/pages/address/index')}>
            <CardContent className="p-4 flex flex-col items-center">
              <Text className="block text-2xl font-bold text-primary">
                {addresses.length}
              </Text>
              <Text className="block mt-1 text-xs text-muted-foreground">地址</Text>
            </CardContent>
          </Card>
        </View>
      </View>

      {/* 功能菜单 */}
      <View className="px-5 pb-6">
        <Text className="block text-base font-medium text-foreground tracking-wide mb-3">
          我的服务
        </Text>
        <Card>
          <CardContent className="p-2">
            {menu.map((m, i) => {
              const Icon = m.icon
              return (
                <View key={m.label}>
                  {i > 0 ? <View className="mx-4 h-px bg-border" /> : null}
                  <View
                    className="flex flex-row items-center gap-3 p-3"
                    onClick={m.onClick}
                  >
                    <View className="flex items-center justify-center w-10 h-10 rounded-full bg-accent">
                      <Icon size={18} color={m.color} strokeWidth={1.6} />
                    </View>
                    <View className="flex-1">
                      <Text className="block text-sm font-medium text-foreground">
                        {m.label}
                      </Text>
                      <Text className="block mt-1 text-xs text-muted-foreground">
                        {m.hint}
                      </Text>
                    </View>
                    <ChevronRight size={16} color="#c9a063" />
                  </View>
                </View>
              )
            })}
          </CardContent>
        </Card>

        {/* 客服联系方式 */}
        <View className="mt-5 rounded-sm border border-border bg-card p-4 flex items-center gap-3">
          <View className="flex items-center justify-center w-10 h-10 rounded-full bg-accent">
            <Phone size={18} color="#7a8b6f" />
          </View>
          <View className="flex-1">
            <Text className="block text-sm font-medium text-foreground">
              客服热线
            </Text>
            <Text className="block mt-1 text-xs text-muted-foreground">
              工作日 9:00 - 21:00
            </Text>
          </View>
          <Button variant="outline" size="sm" onClick={call}>
            <Text>拨打</Text>
          </Button>
        </View>

        <View className="mt-8 flex flex-col items-center">
          <Text
            className="block text-sm text-muted-foreground"
            style={{
              fontFamily: "'Playfair Display','Didot','Bodoni MT','Cormorant Garamond','Songti SC','STSong','SimSun',serif",
              letterSpacing: '0.15em',
            }}
          >
            Chloe Flora
          </Text>
          <Text className="block mt-1 text-xs text-muted-foreground">
            FLORIST · BOUTIQUE · EST. 2016
          </Text>
        </View>
      </View>
    </ScrollView>
  )
}

export default MyPage