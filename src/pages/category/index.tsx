import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useState } from 'react'
import { Flower } from 'lucide-react-taro'
import ProductImage from '@/components/product-image'
import ProductCard from '@/components/product-card'
import { CATEGORIES, PRODUCTS } from '@/data/catalog'
import { cn } from '@/lib/utils'

const TABS = [{ id: 'all', name: '全部' }, ...CATEGORIES]
const TAGS = ['精选', '热卖', '新品']

const goProduct = (id: string) =>
  Taro.navigateTo({ url: `/pages/product/index?id=${id}` })

const CATEGORY_NOTE: Record<string, string> = {
  fresh: '每日鲜切 · 手作花束',
  preserved: '见微知著 · 久存美好',
  basket: '礼仪款呈 · 庆贺之选',
  plant: '一隅绿意 · 自然共生',
  event: '空间叙事 · 场景定制'
}

const CategoryPage = () => {
  const router = useRouter()
  const [active, setActive] = useState<string>(router.params?.id || 'all')
  const [tag, setTag] = useState<string>('')

  const list = PRODUCTS.filter(
    (p) =>
      (active === 'all' || p.categoryId === active) && (!tag || p.tags.includes(tag))
  )

  const activeCat = CATEGORIES.find((c) => c.id === active)

  return (
    <View className="min-h-full bg-background flex flex-col">
      {/* 顶部 logo + 品类横向滚动导航 */}
      <View
        style={{ position: 'sticky', top: 0, zIndex: 40 }}
        className="bg-background border-b border-border"
      >
        <View className="flex items-center gap-2 px-5 h-14">
          <View className="w-7 h-7 rounded-sm bg-primary flex items-center justify-center">
            <Flower size={16} color="#ffffff" strokeWidth={1.8} />
          </View>
          <Text className="text-base font-semibold text-foreground tracking-widest">
            花礼陈列
          </Text>
        </View>
        <ScrollView scrollX className="w-full px-5 pb-3" enhanced showScrollbar={false}>
          <View className="flex items-center gap-6">
            {TABS.map((c) => (
              <View key={c.id} className="flex flex-col items-center" onClick={() => setActive(c.id)}>
                <Text
                  className={cn(
                    'block text-sm leading-none',
                    active === c.id ? 'text-foreground font-medium' : 'text-muted-foreground'
                  )}
                >
                  {c.name}
                </Text>
                <View
                  className={cn('mt-2 h-1 bg-primary transition-all', active === c.id ? 'w-5' : 'w-0')}
                />
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      <ScrollView scrollY className="flex-1">
        {/* 品类主题大图 */}
        <View className="px-5 mt-5">
          <ProductImage
            name={`${activeCat ? activeCat.name : '花礼臻选'} · 主题视觉`}
            hint="750 × 420"
            tone="gold"
            className="w-full aspect-[16/9]"
          />
        </View>

        {/* 子分类/标签筛选 */}
        <View className="flex items-center justify-between px-5 mt-6">
          <Text className="block text-xs text-muted-foreground tracking-[0.2em]">
            {activeCat ? CATEGORY_NOTE[activeCat.id] : 'Chloe Flora · 花礼陈列'}
          </Text>
          <Text className="block text-xs text-muted-foreground">共 {list.length} 件</Text>
        </View>
        <View className="flex items-center gap-3 px-5 mt-4">
          <Text className="block text-xs text-muted-foreground tracking-widest">筛选</Text>
          <View className="flex items-center gap-3">
            {TAGS.map((t) => (
              <Text
                key={t}
                className={cn(
                  'block text-sm leading-none',
                  tag === t ? 'text-primary' : 'text-foreground'
                )}
                onClick={() => setTag(tag === t ? '' : t)}
              >
                {t}
              </Text>
            ))}
          </View>
        </View>

        {/* 2 列无边框商品网格 */}
        <View className="grid grid-cols-2 gap-x-5 gap-y-9 px-5 mt-6 pb-10">
          {list.map((p) => (
            <ProductCard key={p.id} p={p} onTap={() => goProduct(p.id)} />
          ))}
        </View>
        {!list.length ? (
          <View className="py-16 flex flex-col items-center">
            <Text className="block text-sm text-muted-foreground">该分类下暂无花礼</Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  )
}

export default CategoryPage