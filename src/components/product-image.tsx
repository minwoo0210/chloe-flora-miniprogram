import { View, Text } from '@tarojs/components'
import { Flower } from 'lucide-react-taro'
import { cn } from '@/lib/utils'

interface ProductImageProps {
  name?: string
  /** 建议图片尺寸，例如 '750 × 900' */
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

/**
 * 风格化图片占位组件：无边框、轻盈底色 + 居中花型图标 + 建议图片尺寸标注。
 * 真实图片接入后，可直接替换为 <Image src={url} className={className} />。
 * 图片块无边框，卡片依托底色自然区分，符合爱马仕「无边框卡片」规范。
 */
export default function ProductImage({
  name,
  hint,
  className,
  tone = 'cream'
}: ProductImageProps) {
  return (
    <View
      className={cn(
        'flex items-center justify-center w-full overflow-hidden',
        TONE[tone],
        className
      )}
    >
      <View className="flex flex-col items-center justify-center gap-2 p-4">
        <View className="flex items-center justify-center w-11 h-11 rounded-full bg-white">
          <Flower size={22} color="#c9a47a" strokeWidth={1.5} />
        </View>
        {name ? (
          <Text className="block text-xs text-muted-foreground text-center">
            {name}
          </Text>
        ) : null}
        {hint ? (
          <Text className="block text-xs text-muted-foreground tracking-wider">
            建议图片 {hint}
          </Text>
        ) : null}
      </View>
    </View>
  )
}