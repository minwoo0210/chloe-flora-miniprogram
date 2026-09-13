import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import { MapPin, Plus, X, Trash2, ChevronRight } from 'lucide-react-taro'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { useStore, type Address } from '@/store/use-store'

interface Form {
  name: string
  phone: string
  detail: string
  isDefault: boolean
}

const EMPTY: Form = { name: '', phone: '', detail: '', isDefault: false }

const AddressPage = () => {
  const addresses = useStore((s) => s.addresses)
  const addAddress = useStore((s) => s.addAddress)
  const updateAddress = useStore((s) => s.updateAddress)
  const removeAddress = useStore((s) => s.removeAddress)
  const setDefaultAddress = useStore((s) => s.setDefaultAddress)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Address | null>(null)
  const [form, setForm] = useState<Form>(EMPTY)

  const openAdd = () => {
    setEditing(null)
    setForm(EMPTY)
    setFormOpen(true)
  }
  const openEdit = (a: Address) => {
    setEditing(a)
    setForm({ name: a.name, phone: a.phone, detail: a.detail, isDefault: !!a.isDefault })
    setFormOpen(true)
  }

  const save = () => {
    if (!form.name.trim() || !form.phone.trim() || !form.detail.trim()) {
      Taro.showToast({ title: '请完整填写地址信息', icon: 'none' })
      return
    }
    if (!/^1\d{10}$/.test(form.phone.trim())) {
      Taro.showToast({ title: '请输入正确的手机号', icon: 'none' })
      return
    }
    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      detail: form.detail.trim(),
      isDefault: form.isDefault
    }
    if (editing) {
      updateAddress({ ...payload, id: editing.id })
    } else {
      addAddress(payload)
    }
    setFormOpen(false)
  }

  return (
    <View className="h-full bg-background">
      <ScrollView scrollY className="h-full px-5 pt-4 pb-8">
        {addresses.length === 0 && !formOpen ? (
          <View className="flex flex-col items-center justify-center pt-24 px-8">
            <View className="flex items-center justify-center w-20 h-20 rounded-full border border-border bg-card">
              <MapPin size={34} color="#c9a063" strokeWidth={1.4} />
            </View>
            <Text className="block mt-5 text-base font-medium text-foreground">
              还没有收货地址
            </Text>
            <Text className="block mt-2 text-sm text-muted-foreground">
              添加一个地址，方便鲜花送达
            </Text>
          </View>
        ) : null}

        {!formOpen ? (
          <View className="flex flex-col gap-3">
            {addresses.map((a) => (
              <View
                key={a.id}
                className="rounded-xl border border-border bg-card p-4"
              >
                <View className="flex flex-row items-center gap-2">
                  <Text className="block text-sm font-medium text-foreground">
                    {a.name}
                  </Text>
                  <Text className="block text-xs text-muted-foreground">{a.phone}</Text>
                  {a.isDefault ? (
                    <View className="px-2 py-1 rounded-full bg-accent border border-secondary">
                      <Text className="block text-xs text-secondary">默认</Text>
                    </View>
                  ) : null}
                </View>
                <Text className="block mt-2 text-xs text-foreground leading-relaxed">
                  {a.detail}
                </Text>
                <View className="flex flex-row items-center justify-between mt-3">
                  <View
                    className="flex flex-row items-center gap-2"
                    onClick={() => setDefaultAddress(a.id)}
                  >
                    <Switch checked={!!a.isDefault} onCheckedChange={() => setDefaultAddress(a.id)} />
                    <Text className="block text-xs text-muted-foreground">
                      设为默认
                    </Text>
                  </View>
                  <View className="flex flex-row items-center gap-3">
                    <View
                      className="flex items-center justify-center w-8 h-8 rounded-full border border-border"
                      onClick={() => removeAddress(a.id)}
                    >
                      <Trash2 size={15} color="#c9a063" />
                    </View>
                    <View
                      className="flex items-center gap-1"
                      onClick={() => openEdit(a)}
                    >
                      <Text className="text-xs text-secondary">编辑</Text>
                      <ChevronRight size={14} color="#c9a063" />
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View className="flex flex-col gap-4">
            <View className="flex flex-row items-center justify-between">
              <Text className="block text-lg font-medium text-foreground">
                {editing ? '编辑地址' : '新增地址'}
              </Text>
              <View
                className="flex items-center justify-center w-8 h-8 rounded-full border border-border bg-card"
                onClick={() => setFormOpen(false)}
              >
                <X size={16} color="#c9a063" />
              </View>
            </View>
            <View className="flex flex-col gap-3">
              <View className="flex flex-row items-center gap-3">
                <Text className="block w-16 shrink-0 text-sm text-foreground">联系人</Text>
                <View className="flex-1">
                  <Input
                    value={form.name}
                    placeholder="收件人姓名"
                    onInput={(e) => setForm({ ...form, name: e.detail.value })}
                  />
                </View>
              </View>
              <View className="flex flex-row items-center gap-3">
                <Text className="block w-16 shrink-0 text-sm text-foreground">手机号</Text>
                <View className="flex-1">
                  <Input
                    type="number"
                    value={form.phone}
                    placeholder="11 位手机号"
                    onInput={(e) => setForm({ ...form, phone: e.detail.value })}
                  />
                </View>
              </View>
              <View className="flex flex-row items-start gap-3">
                <Text className="block w-16 shrink-0 text-sm text-foreground pt-3">详细地址</Text>
                <View className="flex-1">
                  <Input
                    value={form.detail}
                    placeholder="省市区 · 街道 · 门牌号"
                    onInput={(e) => setForm({ ...form, detail: e.detail.value })}
                  />
                </View>
              </View>
              <View className="flex flex-row items-center justify-between bg-accent rounded-xl px-4 py-3">
                <Text className="block text-sm text-foreground">设为默认地址</Text>
                <Switch
                  checked={form.isDefault}
                  onCheckedChange={(v) => setForm({ ...form, isDefault: v })}
                />
              </View>
            </View>
            <Button className="w-full" onClick={save}>
              <Text>保存地址</Text>
            </Button>
          </View>
        )}
      </ScrollView>

      {!formOpen ? (
        <View
          style={{
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            padding: '12px 20px',
            backgroundColor: '#ffffff',
            borderTop: '1px solid #e9dfce',
            zIndex: 100
          }}
        >
          <Button className="w-full" onClick={openAdd}>
            <Plus size={16} color="#ffffff" />
            <Text>新增地址</Text>
          </Button>
        </View>
      ) : null}
      <View className="h-24" />
    </View>
  )
}

export default AddressPage