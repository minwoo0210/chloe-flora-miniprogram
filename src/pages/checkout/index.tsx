import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState } from 'react'
import { MapPin, PackageOpen, ChevronRight } from 'lucide-react-taro'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import ProductImage from '@/components/product-image'
import { formatPrice } from '@/data/catalog'
import { useStore } from '@/store/use-store'

const CheckoutPage = () => {
  const detail = useStore((s) => s.cartDetail())
  const cartTotal = useStore((s) => s.cartTotal())
  const defaultAddr = useStore((s) => s.defaultAddress())
  const placeOrder = useStore((s) => s.placeOrder)

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [remark, setRemark] = useState('')

  // 从地址管理返回时同步默认地址
  useDidShow(() => {
    if (defaultAddr) {
      if (!name) setName(defaultAddr.name)
      if (!phone) setPhone(defaultAddr.phone)
      if (!address) setAddress(defaultAddr.detail)
    }
  })

  const goAddress = () => Taro.navigateTo({ url: '/pages/address/index' })

  const submit = () => {
    if (detail.length === 0) {
      Taro.showToast({ title: '购物车为空', icon: 'none' })
      return
    }
    if (!name.trim() || !phone.trim() || !address.trim()) {
      Taro.showToast({ title: '请填写完整收货信息', icon: 'none' })
      return
    }
    if (!/^1\d{10}$/.test(phone.trim())) {
      Taro.showToast({ title: '请输入正确的手机号', icon: 'none' })
      return
    }
    placeOrder({
      receiver: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      remark: remark.trim(),
      itemIds: detail.map((d) => d.productId)
    })
    Taro.showToast({ title: '下单成功', icon: 'success' })
    Taro.redirectTo({ url: '/pages/orders/index?status=paid' })
  }

  return (
    <View className="h-full bg-background flex flex-col">
      <ScrollView scrollY className="flex-1 px-5 pt-4 pb-4">
        {/* 收货信息 */}
        <View className="flex items-center justify-between">
          <Text className="block text-lg font-medium text-foreground tracking-wide">
            收货信息
          </Text>
          <View
            className="flex items-center gap-1"
            onClick={goAddress}
          >
            <Text className="text-xs text-secondary">管理地址</Text>
            <ChevronRight size={14} color="#c9a063" />
          </View>
        </View>

        {defaultAddr ? (
          <View
            className="mt-3 flex flex-row items-center gap-3 p-4 rounded-xl border border-border bg-card"
            onClick={goAddress}
          >
            <View className="flex items-center justify-center w-10 h-10 rounded-full bg-accent">
              <MapPin size={18} color="#e8830c" />
            </View>
            <View className="flex-1">
              <View className="flex items-center gap-2">
                <Text className="block text-sm font-medium text-foreground">
                  {defaultAddr?.name}
                </Text>
                <Text className="block text-xs text-muted-foreground">
                  {defaultAddr?.phone}
                </Text>
              </View>
              <Text className="block mt-1 text-xs text-foreground">
                {defaultAddr?.detail}
              </Text>
            </View>
            <ChevronRight size={16} color="#c9a063" />
          </View>
        ) : (
          <Text className="block mt-3 text-xs text-muted-foreground">
            请填写下方收货信息
          </Text>
        )}

        <View className="mt-4 flex flex-col gap-3">
          <View className="flex flex-row items-center gap-3">
            <Text className="block w-16 shrink-0 text-sm text-foreground">联系人</Text>
            <View className="flex-1">
              <Input
                value={name}
                placeholder="收件人姓名"
                onInput={(e) => setName(e.detail.value)}
              />
            </View>
          </View>
          <View className="flex flex-row items-center gap-3">
            <Text className="block w-16 shrink-0 text-sm text-foreground">手机号</Text>
            <View className="flex-1">
              <Input
                type="number"
                value={phone}
                placeholder="11 位手机号"
                onInput={(e) => setPhone(e.detail.value)}
              />
            </View>
          </View>
          <View className="flex flex-row items-start gap-3">
            <Text className="block w-16 shrink-0 text-sm text-foreground pt-3">收货地址</Text>
            <View className="flex-1">
              <Input
                value={address}
                placeholder="省市区 · 详细地址"
                onInput={(e) => setAddress(e.detail.value)}
              />
            </View>
          </View>
          <View className="flex flex-row items-center gap-3">
            <Text className="block w-16 shrink-0 text-sm text-foreground">订单备注</Text>
            <View className="flex-1">
              <Textarea
                value={remark}
                placeholder="如：配送前请电话联系 (选填)"
                className="h-20"
                onInput={(e) => setRemark(e.detail.value)}
              />
            </View>
          </View>
        </View>

        {/* 商品清单 */}
        <View className="mt-6 flex items-center gap-2">
          <PackageOpen size={16} color="#c9a063" />
          <Text className="block text-base font-medium text-foreground tracking-wide">
            商品清单
          </Text>
        </View>
        <View className="mt-3 flex flex-col gap-3">
          {detail.map((d) => {
            const p = d.product
            if (!p) return null
            return (
              <View
                key={p.id}
                className="flex flex-row gap-3 items-center p-3 rounded-xl border border-border bg-card"
              >
                <ProductImage
                  name={p.name}
                  hint={p.imageHint}
                  className="w-16 h-16 rounded-lg shrink-0"
                />
                <View className="flex-1">
                  <Text className="block text-sm font-medium text-foreground leading-snug">
                    {p.name}
                  </Text>
                  <Text className="block mt-1 text-xs text-muted-foreground">
                    ¥{formatPrice(p.price)} × {d.qty}
                  </Text>
                </View>
                <Text className="block text-sm font-semibold text-foreground">
                  ¥{formatPrice(p.price * d.qty)}
                </Text>
              </View>
            )
          })}
        </View>

        <View className="mt-6 flex items-center justify-between rounded-xl bg-accent px-4 py-3">
          <Text className="block text-sm text-foreground">应付金额</Text>
          <Text className="block text-xl font-bold text-primary">
            ¥{formatPrice(cartTotal)}
          </Text>
        </View>
        <View className="h-4" />
      </ScrollView>

      {/* 提交栏 */}
      <View
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          padding: '12px 20px',
          backgroundColor: '#ffffff',
          borderTop: '1px solid #e9dfce',
          zIndex: 100
        }}
      >
        <Button className="w-full" onClick={submit}>
          <Text>提交订单</Text>
        </Button>
      </View>
      <View className="h-24" />
    </View>
  )
}

export default CheckoutPage