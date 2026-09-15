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
      <ProductImage name={p.name} hint={p.imageHint} className="w-full aspect-square" />
      <View className="mt-2 flex flex-row items-center">
        <Text className="flex-1 text-base font-normal text-foreground leading-snug line-clamp-1" style={{ paddingLeft: 10 }}>
          {p.name}
        </Text>
        {p.tags.length ? (
          <View className="flex flex-row items-center gap-1 shrink-0 ml-1">
            {p.tags.slice(0, 2).map((t) => (
              <Badge key={t} variant="outline" className="px-1 py-0 rounded-sm border-border bg-white">
                <Text className="block text-xs leading-none text-muted-foreground">{t}</Text>
              </Badge>
            ))}
          </View>
        ) : null}
      </View>
      <Text className="block mt-1 text-xs font-light text-muted-foreground line-clamp-1" style={{ paddingLeft: 10 }}>
        {p.subtitle}
      </Text>
      <View className="flex items-baseline gap-2 mt-1">
        <Text className="text-base font-medium text-foreground" style={{ paddingLeft: 10 }}>
          ¥{formatPrice(p.price)}
        </Text>
        {p.originalPrice ? (
          <Text className="text-xs text-muted-foreground line-through">
            ¥{formatPrice(p.originalPrice)}
          </Text>
        ) : null}
      </View>
    </View>
  )
}