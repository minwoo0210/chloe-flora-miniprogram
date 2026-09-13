import { View, Text } from '@tarojs/components'
import ProductImage from '@/components/product-image'
import { Badge } from '@/components/ui/badge'
import { formatPrice, Product } from '@/data/catalog'

interface ProductCardProps {
  p: Product
  onTap: () => void
}

/**
 * 爱马仕风格商品卡片：2 列网格、无边框，图片块占位 + 名称 + 价格 + 标签
 */
export default function ProductCard({ p, onTap }: ProductCardProps) {
  return (
    <View className="flex flex-col" onClick={onTap}>
      <ProductImage name={p.name} hint={p.imageHint} className="w-full aspect-[3/4]" />
      {p.tags.length ? (
        <View className="mt-2">
          <Badge variant="outline" className="px-2 py-1 rounded-sm border-border bg-white">
            <Text className="block text-xs leading-none text-foreground">{p.tags[0]}</Text>
          </Badge>
        </View>
      ) : null}
      <Text className="block mt-2 text-sm font-medium text-foreground leading-snug line-clamp-1">
        {p.name}
      </Text>
      <Text className="block mt-1 text-xs text-muted-foreground line-clamp-1">
        {p.subtitle}
      </Text>
      <View className="flex items-baseline gap-2 mt-2">
        <Text className="text-base font-semibold text-foreground">¥{formatPrice(p.price)}</Text>
        {p.originalPrice ? (
          <Text className="text-xs text-muted-foreground line-through">
            ¥{formatPrice(p.originalPrice)}
          </Text>
        ) : null}
      </View>
    </View>
  )
}