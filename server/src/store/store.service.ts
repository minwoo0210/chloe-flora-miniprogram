import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { getSupabaseClient } from '@/storage/database/supabase-client';

interface ProductRow {
  id: number;
  category_id: number;
  name: string;
  subtitle: string | null;
  price: string | number;
  original_price: string | number | null;
  description: string | null;
  image_hint: string | null;
  tags: string[] | null;
  is_featured: boolean | null;
  is_hot: boolean | null;
  sort: number | null;
}

interface CategoryRow {
  id: number;
  name: string;
  note: string | null;
  sort: number | null;
}

export interface AddressInput {
  name: string;
  phone: string;
  province?: string;
  city?: string;
  district?: string;
  detail: string;
  isDefault?: boolean;
}

export interface OrderItemInput {
  productId: number;
  qty: number;
}

function toNumber(v: string | number | null | undefined, fallback = 0): number {
  if (v === null || v === undefined) return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

@Injectable()
export class StoreService {
  private db() {
    return getSupabaseClient();
  }

  /* ---------------- 分类 ---------------- */
  async listCategories() {
    const { data, error } = await this.db()
      .from('categories')
      .select('id, name, note, sort')
      .order('sort', { ascending: true });
    if (error) throw new Error(`查询分类失败: ${error.message}`);
    const rows = (data ?? []) as CategoryRow[];
    return rows.map((r) => ({ id: r.id, name: r.name, note: r.note ?? '' }));
  }

  /* ---------------- 商品 ---------------- */
  private mapProduct(r: ProductRow) {
    return {
      id: r.id,
      categoryId: r.category_id,
      name: r.name,
      subtitle: r.subtitle ?? '',
      price: toNumber(r.price),
      originalPrice: r.original_price !== null && r.original_price !== undefined ? toNumber(r.original_price) : undefined,
      description: r.description ?? '',
      imageHint: r.image_hint ?? '750 × 900',
      tags: Array.isArray(r.tags) ? r.tags : [],
      isFeatured: !!r.is_featured,
      isHot: !!r.is_hot,
    };
  }

  async listProducts(categoryId?: number) {
    let q = this.db()
      .from('products')
      .select('id, category_id, name, subtitle, price, original_price, description, image_hint, tags, is_featured, is_hot, sort')
      .order('sort', { ascending: true })
      .limit(200);
    if (categoryId) q = q.eq('category_id', categoryId);
    const { data, error } = await q;
    if (error) throw new Error(`查询商品失败: ${error.message}`);
    return ((data ?? []) as ProductRow[]).map((r) => this.mapProduct(r));
  }

  async getProduct(id: number) {
    const { data, error } = await this.db()
      .from('products')
      .select('id, category_id, name, subtitle, price, original_price, description, image_hint, tags, is_featured, is_hot, sort')
      .eq('id', id)
      .maybeSingle();
    if (error) throw new Error(`查询商品失败: ${error.message}`);
    if (!data) throw new NotFoundException('商品不存在');
    return this.mapProduct(data as ProductRow);
  }

  /* ---------------- 用户登录（轻量 user_key） ---------------- */
  async login(userKey: string, nickname?: string) {
    if (!userKey) throw new BadRequestException('缺少 userKey');

    const exists = await this.db()
      .from('users')
      .select('id, nickname, created_at')
      .eq('id', userKey)
      .maybeSingle();
    if (exists.error) throw new Error(`查询用户失败: ${exists.error.message}`);

    if (exists.data) {
      if (nickname && nickname !== exists.data.nickname) {
        const { error } = await this.db()
          .from('users')
          .update({ nickname })
          .eq('id', userKey);
        if (error) throw new Error(`更新用户失败: ${error.message}`);
      }
      return { userKey, nickname: exists.data.nickname ?? nickname ?? 'Chloe Flora 用户' };
    }

    const { data, error } = await this.db()
      .from('users')
      .insert({ id: userKey, nickname: nickname ?? 'Chloe Flora 用户' })
      .select('id, nickname, created_at')
      .single();
    if (error) throw new Error(`创建用户失败: ${error.message}`);
    return { userKey: data?.id ?? userKey, nickname: data?.nickname };
  }

  /* ---------------- 地址 ---------------- */
  async listAddresses(userKey: string) {
    const { data, error } = await this.db()
      .from('addresses')
      .select('id, user_key, name, phone, province, city, district, detail, is_default, created_at')
      .eq('user_key', userKey)
      .order('created_at', { ascending: false });
    if (error) throw new Error(`查询地址失败: ${error.message}`);
    const rows = data ?? [];
    return rows.map((r: any) => ({
      id: r.id,
      name: r.name,
      phone: r.phone,
      province: r.province ?? '',
      city: r.city ?? '',
      district: r.district ?? '',
      detail: r.detail,
      isDefault: !!r.is_default,
    }));
  }

  async createAddress(userKey: string, input: AddressInput) {
    if (!userKey) throw new BadRequestException('缺少 userKey');
    if (!input.name || !input.phone || !input.detail) {
      throw new BadRequestException('收货人、电话、详细地址必填');
    }
    const { data, error } = await this.db()
      .from('addresses')
      .insert({
        user_key: userKey,
        name: input.name,
        phone: input.phone,
        province: input.province ?? '',
        city: input.city ?? '',
        district: input.district ?? '',
        detail: input.detail,
        is_default: !!input.isDefault,
      })
      .select('id')
      .single();
    if (error) throw new Error(`创建地址失败: ${error.message}`);
    return { id: data.id };
  }

  async updateAddress(userKey: string, id: number, input: AddressInput) {
    const { data, error } = await this.db()
      .from('addresses')
      .update({
        name: input.name,
        phone: input.phone,
        province: input.province ?? '',
        city: input.city ?? '',
        district: input.district ?? '',
        detail: input.detail,
        is_default: !!input.isDefault,
      })
      .eq('id', id)
      .eq('user_key', userKey)
      .select('id')
      .maybeSingle();
    if (error) throw new Error(`更新地址失败: ${error.message}`);
    if (!data) throw new NotFoundException('地址不存在');
    return { id: data.id };
  }

  async deleteAddress(userKey: string, id: number) {
    const { error } = await this.db()
      .from('addresses')
      .delete()
      .eq('id', id)
      .eq('user_key', userKey);
    if (error) throw new Error(`删除地址失败: ${error.message}`);
    return { success: true };
  }

  /* ---------------- 购物车 ---------------- */
  async listCart(userKey: string) {
    const { data, error } = await this.db()
      .from('cart_items')
      .select('id, user_key, product_id, qty, created_at')
      .eq('user_key', userKey)
      .order('created_at', { ascending: false });
    if (error) throw new Error(`查询购物车失败: ${error.message}`);
    const items = data ?? [];

    const productIds = items.map((i: any) => i.product_id).slice(0, 50);
    const { data: products, error: pError } = productIds.length
      ? await this.db()
          .from('products')
          .select('id, category_id, name, subtitle, price, original_price, image_hint, tags')
          .in('id', productIds)
      : { data: [], error: null };
    if (pError) throw new Error(`查询商品失败: ${pError.message}`);
    const map = new Map<number, any>((products ?? []).map((p: any): [number, any] => [p.id, p]));

    let total = 0;
    const detail = items.map((i: any) => {
      const p = map.get(i.product_id);
      const price = p ? toNumber(p.price) : 0;
      total += price * i.qty;
      return {
        cartId: i.id,
        productId: i.product_id,
        qty: i.qty,
        name: p?.name ?? '已失效商品',
        subtitle: p?.subtitle ?? '',
        price,
        originalPrice: p?.original_price !== null && p?.original_price !== undefined ? toNumber(p.original_price) : undefined,
        imageHint: p?.image_hint ?? '750 × 900',
      };
    });
    return { items: detail, total };
  }

  async addCartItem(userKey: string, productId: number, qty: number) {
    if (!userKey) throw new BadRequestException('缺少 userKey');
    const quantity = Math.max(1, Math.floor(qty || 1));

    const existing = await this.db()
      .from('cart_items')
      .select('id, qty')
      .eq('user_key', userKey)
      .eq('product_id', productId)
      .maybeSingle();
    if (existing.error) throw new Error(`查询购物车失败: ${existing.error.message}`);

    if (existing.data) {
      const { error } = await this.db()
        .from('cart_items')
        .update({ qty: existing.data.qty + quantity })
        .eq('id', existing.data.id);
      if (error) throw new Error(`更新购物车失败: ${error.message}`);
    } else {
      const { error } = await this.db()
        .from('cart_items')
        .insert({ user_key: userKey, product_id: productId, qty: quantity });
      if (error) throw new Error(`加入购物车失败: ${error.message}`);
    }
    return { success: true };
  }

  async updateCartItemQty(userKey: string, id: number, qty: number) {
    const quantity = Math.max(1, Math.floor(qty || 1));
    const { error } = await this.db()
      .from('cart_items')
      .update({ qty: quantity })
      .eq('id', id)
      .eq('user_key', userKey);
    if (error) throw new Error(`更新购物车失败: ${error.message}`);
    return { success: true };
  }

  async removeCartItem(userKey: string, id: number) {
    const { error } = await this.db().from('cart_items').delete().eq('id', id).eq('user_key', userKey);
    if (error) throw new Error(`移除购物车失败: ${error.message}`);
    return { success: true };
  }

  async clearCart(userKey: string) {
    const { error } = await this.db().from('cart_items').delete().eq('user_key', userKey);
    if (error) throw new Error(`清空购物车失败: ${error.message}`);
    return { success: true };
  }

  /* ---------------- 订单 ---------------- */
  async createOrder(
    userKey: string,
    payload: { receiver: string; phone: string; address: string; remark?: string; items?: OrderItemInput[] },
  ) {
    if (!userKey) throw new BadRequestException('缺少 userKey');
    if (!payload.receiver || !payload.phone || !payload.address) {
      throw new BadRequestException('收货人、电话、地址必填');
    }

    // 从显式 items 或服务端购物车构建订单项
    let orderItems: { product_id: number; qty: number }[] = [];
    if (payload.items && payload.items.length) {
      orderItems = payload.items.map((i) => ({ product_id: i.productId, qty: Math.max(1, Math.floor(i.qty)) }));
    } else {
      const { data, error } = await this.db()
        .from('cart_items')
        .select('product_id, qty')
        .eq('user_key', userKey);
      if (error) throw new Error(`读取购物车失败: ${error.message}`);
      orderItems = (data ?? []).map((i: any) => ({ product_id: i.product_id, qty: i.qty }));
    }
    if (!orderItems.length) throw new BadRequestException('订单商品为空');

    const productIds = orderItems.map((i) => i.product_id);
    const { data: products, error: pError } = await this.db()
      .from('products')
      .select('id, name, price, image_hint')
      .in('id', productIds);
    if (pError) throw new Error(`查询商品失败: ${pError.message}`);
    const priceMap = new Map<number, any>((products ?? []).map((p: any) => [p.id, p]));

    const orderNo = `CF${Date.now()}${Math.floor(Math.random() * 900 + 100)}`;
    let total = 0;
    for (const it of orderItems) {
      total += toNumber(priceMap.get(it.product_id)?.price) * it.qty;
    }
    total = Math.round(total * 100) / 100;

    const { data: order, error: oError } = await this.db()
      .from('orders')
      .insert({
        order_no: orderNo,
        user_key: userKey,
        receiver: payload.receiver,
        phone: payload.phone,
        address: payload.address,
        total,
        remark: payload.remark ?? '',
        status: '待配送',
      })
      .select('id, order_no, total, status, created_at')
      .single();
    if (oError) throw new Error(`创建订单失败: ${oError.message}`);

    const insertItems = orderItems.map((it) => {
      const p = priceMap.get(it.product_id);
      return {
        order_id: order.id,
        product_id: it.product_id,
        product_name: p?.name ?? '商品',
        product_price: toNumber(p?.price),
        qty: it.qty,
        image_hint: p?.image_hint ?? '750 × 900',
      };
    });
    const { error: iError } = await this.db().from('order_items').insert(insertItems);
    if (iError) throw new Error(`写入订单明细失败: ${iError.message}`);

    // 下单成功则清空服务端购物车
    await this.clearCart(userKey);

    return {
      orderNo: order.order_no,
      total: toNumber(order.total),
      status: order.status,
      createdAt: order.created_at,
    };
  }

  async listOrders(userKey: string) {
    const { data, error } = await this.db()
      .from('orders')
      .select('id, order_no, receiver, phone, address, total, status, remark, created_at')
      .eq('user_key', userKey)
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) throw new Error(`查询订单失败: ${error.message}`);
    const orders = data ?? [];

    const orderIds = orders.map((o: any) => o.id).slice(0, 50);
    const { data: items, error: iError } = orderIds.length
      ? await this.db()
          .from('order_items')
          .select('order_id, product_id, product_name, product_price, qty, image_hint')
          .in('order_id', orderIds)
      : { data: [], error: null };
    if (iError) throw new Error(`查询订单明细失败: ${iError.message}`);
    const byOrder = new Map<number, any[]>();
    for (const it of items ?? []) {
      const arr = byOrder.get(it.order_id) ?? [];
      arr.push(it);
      byOrder.set(it.order_id, arr);
    }

    return orders.map((o: any) => ({
      orderNo: o.order_no,
      receiver: o.receiver,
      phone: o.phone,
      address: o.address,
      total: toNumber(o.total),
      status: o.status,
      remark: o.remark ?? '',
      createdAt: o.created_at,
      items: (byOrder.get(o.id) ?? []).map((it: any) => ({
        productId: it.product_id,
        name: it.product_name,
        price: toNumber(it.product_price),
        qty: it.qty,
        imageHint: it.image_hint ?? '750 × 900',
      })),
    }));
  }
}