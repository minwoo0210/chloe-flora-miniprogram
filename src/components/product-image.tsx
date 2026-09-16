import { View, Text, Image } from '@tarojs/components'
import { Flower } from 'lucide-react-taro'
import { cn } from '@/lib/utils'

interface ProductImageProps {
  name?: string
  /** 建议图片尺寸（如 '750 × 900'）或真实图片 URL（数据库 main_image） */
  hint?: string
  className?: string
  /** 卡面底色风格，默认米灰 */
  tone?: 'cream' | 'gold' | 'olive'
}

const TONE: Record<string, string> = {
  cream: 'bg-muted',
  gold: 'bg-accent',
  olive: 'bg-accent'
}

const isUrl = (s?: string) => !!s && /^https?:\/\//i.test(s)

/**
 * 图片展示组件：hint 为 URL 时渲染真实图片（来自共享库 main_image），
 * 否则渲染风格化占位块（无边框、轻盈底色 + 居中花型图标 + 建议尺寸标注）。
 */
export default function ProductImage({ name, hint, className, tone = 'cream' }: ProductImageProps) {
  return (
    <View className={cn('flex items-center justify-center w-full overflow-hidden', TONE[tone], className)}>
      {isUrl(hint) ? (
        <Image className="w-full h-full" src={hint as string} mode="aspectFill" />
      ) : (
        <View className="flex flex-col items-center justify-center gap-2 p-4">
          <View className="flex items-center justify-center w-11 h-11 rounded-full bg-white">
            <Flower size={22} color="#c9a47a" strokeWidth={1.5} />
          </View>
          {name ? (
            <Text className="block text-xs text-muted-foreground text-center">{name}</Text>
          ) : null}
          {hint ? (
            <Text className="block text-xs text-muted-foreground tracking-wider">建议图片 {hint}</Text>
          ) : null}
        </View>
      )}
    </View>
  )
}