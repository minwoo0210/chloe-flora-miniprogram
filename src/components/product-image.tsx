import { View, Text } from '@tarojs/components'
import { Flower } from 'lucide-react-taro'
import { cn } from '@/lib/utils'

interface ProductImageProps {
  name?: string
  /** 建议图片尺寸，例如 '750 × 900' */
  hint?: string
  className?: string
  /** 卡面底色风格，默认奶油浅色 */
  tone?: 'cream' | 'gold' | 'olive'
}

const TONE: Record<string, string> = {
  cream: 'bg-accent border-border',
  gold: 'bg-accent border-secondary',
  olive: 'bg-accent border-secondary'
}

/**
 * 风格化图片占位组件：奶油底 + 细描边 + 居中花型图标 + 建议图片尺寸标注。
 * 真实图片接入后，可直接替换为 <Image src={url} />。未接入任何外部占位图服务。
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
        'flex items-center justify-center w-full overflow-hidden border',
        TONE[tone],
        className
      )}
    >
      <View className="flex flex-col items-center justify-center gap-2 p-4">
        <View className="flex items-center justify-center w-12 h-12 rounded-full bg-white border border-secondary">
          <Flower size={26} color="#c9a063" strokeWidth={1.4} />
        </View>
        {name ? (
          <Text className="block text-xs text-foreground text-center">
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