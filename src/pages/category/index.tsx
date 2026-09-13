import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import { ChevronRight } from 'lucide-react-taro'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import ProductImage from '@/components/product-image'
import { CATEGORIES, PRODUCTS, formatPrice } from '@/data/catalog'

const TABS = [{ id: 'all', name: '全部' }, ...CATEGORIES]

const goProduct = (id: string) =>
  Taro.navigateTo({ url: `/pages/product/index?id=${id}` })

const CategoryPage = () => {
  const [active, setActive] = useState('all')
  const list =
    active === 'all' ? PRODUCTS : PRODUCTS.filter((p) => p.categoryId === active)

  return (
    <View className="h-full bg-background flex flex-col">
      <View className="px-4 pt-3 pb-1">
        <ScrollView scrollX className="w-full">
          <Tabs value={active} onValueChange={setActive}>
            <TabsList className="inline-flex h-11 gap-1 bg-muted px-2 rounded-xl">
              {TABS.map((c) => (
                <TabsTrigger key={c.id} value={c.id} className="px-4 py-2 text-sm">
                  <Text className="block text-sm leading-none">{c.name}</Text>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </ScrollView>
      </View>

      <ScrollView scrollY className="flex-1">
        <View className="px-4 py-1 flex items-baseline justify-between">
          <Text className="block text-sm text-muted-foreground">
            共 {list.length} 件花礼
          </Text>
          <View className="flex items-center gap-1">
            <Text className="text-xs text-secondary tracking-widest">HERMÈS ORANGE</Text>
          </View>
        </View>

        <View className="px-4 pb-8 grid grid-cols-2 gap-3 pt-3">
          {list.map((p) => (
            <Card
              key={p.id}
              className="overflow-hidden"
              onClick={() => goProduct(p.id)}
            >
              <CardContent className="p-0">
                <ProductImage name={p.name} hint={p.imageHint} className="h-36" />
                <View className="px-3 pt-3 pb-3">
                  <Text className="block text-sm font-medium text-foreground leading-snug line-clamp-1">
                    {p.name}
                  </Text>
                  <Text className="block mt-1 text-xs text-muted-foreground line-clamp-1">
                    {p.subtitle}
                  </Text>
                  <Text className="block mt-2 text-xs text-muted-foreground line-clamp-2">
                    {p.description}
                  </Text>
                  <View className="flex items-center justify-between mt-2">
                    <Text className="text-base font-semibold text-primary">
                      ¥{formatPrice(p.price)}
                    </Text>
                    {p.tags.length ? (
                      <View className="flex gap-1">
                        {p.tags.slice(0, 1).map((t) => (
                          <Badge key={t} variant="secondary" className="px-2 py-1">
                            <Text className="text-xs leading-none">{t}</Text>
                          </Badge>
                        ))}
                      </View>
                    ) : (
                      <ChevronRight size={14} color="#c9a063" />
                    )}
                  </View>
                </View>
              </CardContent>
            </Card>
          ))}
        </View>
      </ScrollView>
    </View>
  )
}

export default CategoryPage