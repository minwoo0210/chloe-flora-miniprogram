import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { ChevronRight, Flower, Gift, CalendarHeart, Building2, Phone } from 'lucide-react-taro'
import { Button } from '@/components/ui/button'
import { SERVICES, SLOGAN } from '@/data/catalog'
import { cn } from '@/lib/utils'

const ICONS = [Flower, Gift, CalendarHeart, Building2]
const TINTS = ['bg-muted', 'bg-accent', 'bg-muted', 'bg-accent']

const ServicesPage = () => {
  const call = () => Taro.makePhoneCall({ phoneNumber: '4008886688' })
  const contact = () => Taro.makePhoneCall({ phoneNumber: '4008886688' })

  return (
    <View className="min-h-full bg-background">
      <View className="flex flex-col items-center pt-12 pb-8 px-5 border-b border-border">
        <View className="flex items-center gap-2">
          <View className="w-7 h-7 rounded-sm bg-primary flex items-center justify-center">
            <Flower size={15} color="#ffffff" strokeWidth={1.8} />
          </View>
          <Text className="text-base font-semibold text-foreground tracking-widest">Chloe Flora</Text>
        </View>
        <Text className="block mt-3 text-lg text-foreground tracking-wide">{SLOGAN.title}</Text>
        <Text className="block mt-2 text-xs text-muted-foreground tracking-[0.3em]">
          {SLOGAN.subtitle}
        </Text>
      </View>

      <View className="px-5 pt-8">
        <Text className="block text-sm font-medium text-foreground tracking-wider">花艺服务</Text>
        <Text className="block mt-1 text-xs text-muted-foreground tracking-widest">FLORAL SERVICES</Text>

        <View className="pt-4">
          {SERVICES.map((s, i) => {
            const Icon = ICONS[i % ICONS.length]
            return (
              <View
                key={s.id}
                className="flex items-center gap-4 py-4 border-b border-border"
                onClick={contact}
              >
                <View className={cn('w-28 h-28 shrink-0 flex items-center justify-center', TINTS[i])}>
                  <View className="flex flex-col items-center gap-2">
                    <Icon size={26} color="#7c7468" strokeWidth={1.3} />
                    <Text className="block text-[0.625rem] text-muted-foreground">
                      {s.imageHint}
                    </Text>
                  </View>
                </View>
                <View className="flex-1">
                  <Text className="block text-base text-foreground tracking-wide">{s.name}</Text>
                  <Text className="block mt-1 text-xs text-muted-foreground">{s.desc}</Text>
                  <Text
                    className="block mt-2 text-sm text-foreground underline underline-offset-4"
                  >
                    立即咨询
                  </Text>
                </View>
                <ChevronRight size={18} color="#a29b90" strokeWidth={1.5} />
              </View>
            )
          })}
        </View>
      </View>

      <View className="px-5 pt-9 pb-12">
        <View className="bg-white border border-border p-5">
          <Text className="block text-sm font-medium text-foreground tracking-wider">联系我们</Text>
          <View className="mt-3 space-y-1">
            <Text className="block text-sm text-foreground">客服专员 · 每天 9:00 - 21:00</Text>
            <Text className="block text-sm text-foreground">预约热线 · 400-888-6688</Text>
          </View>
          <View className="mt-5">
            <Button className="w-full" onClick={call}>
              <Phone size={16} color="#ffffff" strokeWidth={1.8} className="mr-2" />
              <Text className="block leading-none">电话咨询</Text>
            </Button>
          </View>
        </View>
      </View>
    </View>
  )
}

export default ServicesPage