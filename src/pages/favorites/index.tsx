import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Heart } from 'lucide-react-taro'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import ProductImage from '@/components/product-image'
import { PRODUCTS, formatPrice } from '@/data/catalog'
import { useStore } from '@/store/use-store'

const FavoritesPage = () => {
  const favorites = useStore((s) => s.favorites)
  const toggleFavorite = useStore((s) => s.toggleFavorite)
  const list = PRODUCTS.filter((p) => favorites.includes(p.id))

  const goProduct = (id: string) =>
    Taro.navigateTo({ url: `/pages/product/index?id=${id}` })
  const goCategory = () => Taro.switchTab({ url: '/pages/category/index' })

  if (list.length === 0) {
    return (
      <View className="flex flex-col items-center justify-center h-full bg-background px-8">
        <View className="flex items-center justify-center w-20 h-20 rounded-full border border-border bg-card">
          <Heart size={34} color="#c9a063" strokeWidth={1.4} />
        </View>
        <Text className="block mt-5 text-base font-medium text-foreground">
          还没有收藏的花礼
        </Text>
        <Text className="block mt-2 text-sm text-muted-foreground text-center">
          收藏心动之作，随时回来取悦自己
        </Text>
        <Button className="mt-6" onClick={goCategory}>
          <Text>去逛逛</Text>
        </Button>
      </View>
    )
  }

  return (
    <ScrollView scrollY className="h-full bg-background">
      <View className="px-5 pt-4 pb-8 grid grid-cols-2 gap-3">
        {list.map((p) => (
          <Card key={p.id} className="overflow-hidden" onClick={() => goProduct(p.id)}>
            <CardContent className="p-0">
              <ProductImage name={p.name} hint={p.imageHint} className="h-32" />
              <View className="px-3 pt-3 pb-3">
                <Text className="block text-sm font-medium text-foreground line-clamp-1">
                  {p.name}
                </Text>
                <Text className="block mt-1 text-xs text-muted-foreground line-clamp-1">
                  {p.subtitle}
                </Text>
                <View className="flex items-center justify-between mt-2">
                  <Text className="text-base font-semibold text-primary">
                    ¥{formatPrice(p.price)}
                  </Text>
                  <View
                    className="flex items-center justify-center w-8 h-8 rounded-full border border-border"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleFavorite(p.id)
                    }}
                  >
                    <Heart size={16} color="#e8830c" filled />
                  </View>
                </View>
                {p.tags.length ? (
                  <View className="flex flex-wrap gap-2 mt-2">
                    {p.tags.map((t) => (
                      <Badge key={t} variant="secondary" className="px-2 py-1">
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
    </ScrollView>
  )
}

export default FavoritesPage