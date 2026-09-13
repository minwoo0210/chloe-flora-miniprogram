import Taro from '@tarojs/taro'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { PRODUCTS, type Product } from '@/data/catalog'

export interface CartItem {
  productId: string
  qty: number
}

export type OrderStatus = 'pending' | 'paid' | 'delivering' | 'done' | 'canceled'

export interface OrderItem {
  productId: string
  name: string
  subtitle: string
  price: number
  qty: number
  imageHint: string
  categoryId: string
}

export interface Order {
  id: string
  orderNo: string
  items: OrderItem[]
  total: number
  status: OrderStatus
  receiver: string
  phone: string
  address: string
  remark: string
  createdAt: number
}

export interface Address {
  id: string
  name: string
  phone: string
  detail: string
  isDefault?: boolean
}

export const ORDER_STATUS_TEXT: Record<OrderStatus, string> = {
  pending: '待付款',
  paid: '待发货',
  delivering: '配送中',
  done: '已完成',
  canceled: '已取消'
}

const genId = () =>
  `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`

export const genOrderNo = () =>
  `HY${Date.now()}${Math.floor(Math.random() * 90 + 10)}`

const taroStorage = () => {
  const storage = {
    getItem: (name: string) => {
      const value = Taro.getStorageSync(name)
      return value === '' ? null : value
    },
    setItem: (name: string, value: string) => Taro.setStorageSync(name, value),
    removeItem: (name: string) => Taro.removeStorageSync(name)
  }
  return storage
}

interface StoreState {
  cart: CartItem[]
  orders: Order[]
  addresses: Address[]
  favorites: string[]

  cartCount: () => number
  cartTotal: () => number
  cartDetail: () => (CartItem & { product?: Product })[]
  addToCart: (productId: string, qty?: number) => void
  updateQty: (productId: string, qty: number) => void
  updateCartChecked: (productId: string, checked: boolean) => void
  removeFromCart: (productId: string) => void
  clearCart: () => void

  placeOrder: (payload: {
    receiver: string
    phone: string
    address: string
    remark: string
    itemIds: string[]
  }) => Order
  updateOrderStatus: (id: string, status: OrderStatus) => void

  addAddress: (a: Omit<Address, 'id'>) => void
  updateAddress: (a: Address) => void
  removeAddress: (id: string) => void
  setDefaultAddress: (id: string) => void
  defaultAddress: () => Address | undefined

  toggleFavorite: (productId: string) => void
  isFavorite: (productId: string) => boolean
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      cart: [],
      orders: [],
      addresses: [],
      favorites: [],

      cartCount: () => get().cart.reduce((s, c) => s + c.qty, 0),
      cartTotal: () => {
        const detail = get().cartDetail()
        return detail.reduce((s, d) => s + (d.product?.price ?? 0) * d.qty, 0)
      },
      cartDetail: () => {
        const { cart } = get()
        return cart
          .map((c) => ({ ...c, product: PRODUCTS.find((p) => p.id === c.productId) }))
          .filter((d) => !!d.product)
      },

      addToCart: (productId, qty = 1) =>
        set((state) => {
          const exist = state.cart.find((c) => c.productId === productId)
          if (exist) {
            return {
              cart: state.cart.map((c) =>
                c.productId === productId ? { ...c, qty: c.qty + qty } : c
              )
            }
          }
          return { cart: [...state.cart, { productId, qty }] }
        }),

      updateQty: (productId, qty) =>
        set((state) => ({
          cart:
            qty <= 0
              ? state.cart.filter((c) => c.productId !== productId)
              : state.cart.map((c) =>
                  c.productId === productId ? { ...c, qty } : c
                )
        })),

      updateCartChecked: () => undefined,

      removeFromCart: (productId) =>
        set((state) => ({
          cart: state.cart.filter((c) => c.productId !== productId)
        })),

      clearCart: () => set({ cart: [] }),

      placeOrder: ({ receiver, phone, address, remark, itemIds }) => {
        const detail = get().cartDetail().filter((d) => itemIds.includes(d.productId))
        const items: OrderItem[] = detail.map((d) => ({
          productId: d.productId,
          name: d.product?.name ?? '',
          subtitle: d.product?.subtitle ?? '',
          price: d.product?.price ?? 0,
          qty: d.qty,
          imageHint: d.product?.imageHint ?? '750 × 900',
          categoryId: d.product?.categoryId ?? ''
        }))
        const total = items.reduce((s, i) => s + i.price * i.qty, 0)
        const order: Order = {
          id: genId(),
          orderNo: genOrderNo(),
          items,
          total,
          status: 'paid',
          receiver,
          phone,
          address,
          remark,
          createdAt: Date.now()
        }
        set((state) => ({
          orders: [order, ...state.orders],
          cart: state.cart.filter((c) => !itemIds.includes(c.productId))
        }))
        return order
      },

      updateOrderStatus: (id, status) =>
        set((state) => ({
          orders: state.orders.map((o) => (o.id === id ? { ...o, status } : o))
        })),

      addAddress: (a) =>
        set((state) => {
          const list: Address[] = [...state.addresses, { ...a, id: genId() }]
          if (a.isDefault && list.length > 0) {
            return {
              addresses: list.map((x) => ({
                ...x,
                isDefault: x.id === list[list.length - 1].id
              }))
            }
          }
          if (list.length === 1) list[0].isDefault = true
          return { addresses: list }
        }),

      updateAddress: (a) =>
        set((state) => {
          const list = state.addresses.map((x) => (x.id === a.id ? { ...a } : x))
          if (a.isDefault) {
            return {
              addresses: list.map((x) => ({ ...x, isDefault: x.id === a.id }))
            }
          }
          return { addresses: list }
        }),

      removeAddress: (id) =>
        set((state) => {
          const list = state.addresses.filter((x) => x.id !== id)
          if (list.length > 0 && !list.some((x) => x.isDefault)) {
            list[0].isDefault = true
          }
          return { addresses: list }
        }),

      setDefaultAddress: (id) =>
        set((state) => ({
          addresses: state.addresses.map((x) => ({
            ...x,
            isDefault: x.id === id
          }))
        })),

      defaultAddress: () => get().addresses.find((a) => a.isDefault),

      toggleFavorite: (productId) =>
        set((state) => ({
          favorites: state.favorites.includes(productId)
            ? state.favorites.filter((f) => f !== productId)
            : [...state.favorites, productId]
        })),

      isFavorite: (productId) => get().favorites.includes(productId)
    }),
    {
      name: 'huayu-store-v1',
      storage: createJSONStorage(taroStorage)
    }
  )
)