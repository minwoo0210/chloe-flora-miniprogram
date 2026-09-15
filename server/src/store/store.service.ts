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

  /* ---------- 管理端：全量数据 ---------- */
  async adminOverview() {
    const service = this.db();
    const [p, c, o] = await Promise.all([
      service.from('products').select('id', { count: 'exact', head: true }),
      service.from('categories').select('id', { count: 'exact', head: true }),
      service.from('orders').select('total'),
    ]);
    const err = p.error ?? c.error ?? o.error;
    if (err) throw new Error(`统计失败: ${err.message}`);
    const orderTotal = (o.data ?? []).reduce(
      (s: number, r: any) => s + toNumber(r.total),
      0,
    );
    return {
      productCount: p.count ?? 0,
      categoryCount: c.count ?? 0,
      orderCount: ((o.data ?? []) as unknown[]).length,
      orderAmount: Math.round(orderTotal),
    };
  }

  async listAllOrders() {
    const { data, error } = await this.db()
      .from('orders')
      .select('id, order_no, receiver, phone, address, total, status, remark, created_at, user_key')
      .order('created_at', { ascending: false })
      .limit(200);
    if (error) throw new Error(`查询全部订单失败: ${error.message}`);
    const orders = data ?? [];
    const orderIds = orders.map((o: any) => o.id);
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
      id: o.id,
      userKey: o.user_key,
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

  /* ---------------- 管理端：商品 CRUD ---------------- */
  async createProduct(input: any) {
    const { name, categoryId, price, subtitle, originalPrice, description, imageHint, tags, isFeatured, isHot } =
      input ?? {};
    if (!name || !categoryId || price == null) throw new BadRequestException('名称、分类与价格均为必填');
    const { count } = await this.db()
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', categoryId);
    const { data, error } = await this.db()
      .from('products')
      .insert({
        category_id: Number(categoryId),
        name,
        subtitle: subtitle ?? '',
        price: Number(price),
        original_price: originalPrice != null ? Number(originalPrice) : null,
        description: description ?? '',
        image_hint: imageHint ?? '750 × 900',
        tags: Array.isArray(tags) && tags.length ? tags : ['精选'],
        is_featured: !!isFeatured,
        is_hot: !!isHot,
        sort: (count ?? 0) + 1,
      })
      .select()
      .single();
    if (error) throw new Error(`新增商品失败: ${error.message}`);
    return this.mapProduct(data as unknown as ProductRow);
  }

  async updateProduct(id: number, patch: any) {
    const update: Record<string, unknown> = {};
    if ('name' in patch) update.name = patch.name;
    if ('categoryId' in patch) update.category_id = Number(patch.categoryId);
    if ('subtitle' in patch) update.subtitle = patch.subtitle;
    if ('price' in patch) update.price = Number(patch.price);
    if ('originalPrice' in patch)
      update.original_price = patch.originalPrice != null ? Number(patch.originalPrice) : null;
    if ('description' in patch) update.description = patch.description;
    if ('imageHint' in patch) update.image_hint = patch.imageHint;
    if ('tags' in patch) update.tags = Array.isArray(patch.tags) ? patch.tags : [];
    if ('isFeatured' in patch) update.is_featured = !!patch.isFeatured;
    if ('isHot' in patch) update.is_hot = !!patch.isHot;
    if (!Object.keys(update).length) throw new BadRequestException('没有可更新的字段');
    const exist = await this.db().from('products').select('id').eq('id', id).maybeSingle();
    if (exist.error) throw new Error(`查询商品失败: ${exist.error.message}`);
    if (!exist.data) throw new NotFoundException('商品不存在');
    const { data, error } = await this.db().from('products').update(update).eq('id', id).select().single();
    if (error) throw new Error(`更新失败: ${error.message}`);
    return this.mapProduct(data as unknown as ProductRow);
  }

  async deleteProduct(id: number) {
    const { error } = await this.db().from('products').delete().eq('id', id);
    if (error) throw new Error(`删除失败: ${error.message}`);
    return { id };
  }

  /* ---------------- 首页装修配置 ---------------- */
  static DEFAULT_HOME_CONFIG = {
    brand: 'Chloe Flora',
    slogan: { title: '于清晨的花影里', subtitle: '做一束被珍视的仪式感' },
    heroes: [
      { src: '', tone: 'deep', eyebrow: 'SUMMER 2025 COLLECTION', title: '盛夏花礼', sub: '以爱马仕橙开启高定花艺' },
      { src: '', tone: 'orange', eyebrow: 'WEDDING & EVENT', title: '婚礼花艺布置', sub: '为重要时刻定制高级仪式感' },
      { src: '', tone: 'sage', eyebrow: 'EVERLASTING FLOWERS', title: '永生花礼盒', sub: '恒久保存的爱意' },
    ],
  };

  async getHomeConfig() {
    const { data, error } = await this.db()
      .from('site_config')
      .select('content, updated_at')
      .eq('config_key', 'home')
      .maybeSingle();
    if (error) throw new Error(`读取首页配置失败: ${error.message}`);
    if (!data) return { ...StoreService.DEFAULT_HOME_CONFIG };
    return { ...StoreService.DEFAULT_HOME_CONFIG, ...(data.content as object) };
  }

  async saveHomeConfig(content: any) {
    if (!content || typeof content !== 'object') throw new BadRequestException('配置内容不合法');
    const cfg = {
      brand: typeof content.brand === 'string' && content.brand.trim() ? content.brand.trim() : 'Chloe Flora',
      slogan: {
        title: content?.slogan?.title ?? '',
        subtitle: content?.slogan?.subtitle ?? '',
      },
      heroes: Array.isArray(content.heroes)
        ? content.heroes
            .filter((h: any) => h && (h.title || h.eyebrow || h.src))
            .slice(0, 8)
            .map((h: any) => ({
              src: h.src ?? '',
              tone: ['deep', 'orange', 'sage'].includes(h.tone) ? h.tone : 'deep',
              eyebrow: h.eyebrow ?? '',
              title: h.title ?? '',
              sub: h.sub ?? '',
            }))
        : StoreService.DEFAULT_HOME_CONFIG.heroes,
    };
    const { data, error } = await this.db()
      .from('site_config')
      .upsert({ config_key: 'home', content: cfg, updated_at: new Date().toISOString() })
      .select('content, updated_at')
      .single();
    if (error) throw new Error(`保存首页配置失败: ${error.message}`);
    return { ...cfg, updatedAt: data?.updated_at };
  }

  /* ---------------- 客户管理 ---------------- */
  async listCustomers() {
    const [u, o, a] = await Promise.all([
      this.db().from('users').select('id, nickname, avatar, phone, created_at').order('created_at', { ascending: false }).limit(500),
      this.db().from('orders').select('user_key, total, created_at, status'),
      this.db().from('addresses').select('user_key'),
    ]);
    if (u.error) throw new Error(`查询客户失败: ${u.error.message}`);
    if (o.error) throw new Error(`查询客户订单失败: ${o.error.message}`);
    if (a.error) throw new Error(`查询客户地址失败: ${a.error.message}`);

    const stat = new Map<string, { count: number; spent: number; last: string | null; pending: number }>();
    for (const r of o.data ?? []) {
      const k = r.user_key as string;
      const cur = stat.get(k) ?? { count: 0, spent: 0, last: null, pending: 0 };
      cur.count += 1;
      cur.spent += toNumber(r.total);
      if (!cur.last || String(r.created_at) > cur.last) cur.last = r.created_at as string;
      if (r.status !== 'cancelled' && r.status !== 'completed') cur.pending += 1;
      stat.set(k, cur);
    }
    const addrCount = new Map<string, number>();
    for (const r of a.data ?? []) {
      const k = r.user_key as string;
      addrCount.set(k, (addrCount.get(k) ?? 0) + 1);
    }

    return (u.data ?? []).map((x: any) => {
      const s = stat.get(x.id);
      return {
        userKey: x.id,
        nickname: x.nickname ?? 'Chloe Flora 用户',
        avatar: x.avatar ?? '',
        phone: x.phone ?? '',
        addressCount: addrCount.get(x.id) ?? 0,
        orderCount: s?.count ?? 0,
        totalSpent: Math.round(s?.spent ?? 0),
        pendingCount: s?.pending ?? 0,
        lastOrderAt: s?.last ?? null,
        joinedAt: x.created_at,
      };
    });
  }

  /* ---------------- 订单状态 ---------------- */
  static ORDER_FLOW: Record<string, string[]> = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['arranging', 'cancelled'],
    arranging: ['shipped'],
    shipped: ['completed'],
    completed: [],
    cancelled: [],
  };

  async updateOrderStatus(id: number, status: string) {
    if (!status || !(status in StoreService.ORDER_FLOW)) throw new BadRequestException('非法订单状态');
    const exist = await this.db().from('orders').select('id, status').eq('id', id).maybeSingle();
    if (exist.error) throw new Error(`查询订单失败: ${exist.error.message}`);
    if (!exist.data) throw new NotFoundException('订单不存在');
    const allowed = StoreService.ORDER_FLOW[(exist.data as any).status] ?? [];
    if (!allowed.includes(status)) throw new BadRequestException(`当前状态不可流转到「${status}」`);
    const { data, error } = await this.db().from('orders').update({ status }).eq('id', id).select('id, order_no, status').single();
    if (error) throw new Error(`更新订单状态失败: ${error.message}`);
    return { id: data?.id, orderNo: data?.order_no, status: data?.status };
  }

  /* ---------------- 经营看板 ---------------- */
  async dashboard() {
    const dayKey = (d: Date) => d.toISOString().slice(0, 10);
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const days: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      days.push(dayKey(d));
    }
    const rangeStart = days[0];

    const [u, o, oi, prod, cat] = await Promise.all([
      this.db().from('users').select('id', { count: 'exact', head: true }),
      this.db().from('orders').select('id, total, status, created_at').order('created_at', { ascending: false }).limit(500),
      this.db().from('order_items').select('product_id, product_name, qty, product_price'),
      this.db().from('products').select('id, name, category_id'),
      this.db().from('categories').select('id, name'),
    ]);
    const err = u.error ?? o.error ?? oi.error ?? prod.error ?? cat.error;
    if (err) throw new Error(`看板统计失败: ${err.message}`);

    const orders = (o.data ?? []) as any[];
    const valid = orders.filter((x) => x.status !== 'cancelled');

    // 状态分布
    const statusMap: Record<string, number> = {};
    for (const x of orders) statusMap[x.status] = (statusMap[x.status] ?? 0) + 1;

    // 近 7 天趋势
    const trendMap = new Map<string, { orderCount: number; amount: number }>();
    days.forEach((d) => trendMap.set(d, { orderCount: 0, amount: 0 }));
    for (const x of valid) {
      const k = String(x.created_at).slice(0, 10);
      if (trendMap.has(k)) {
        const t = trendMap.get(k)!;
        t.orderCount += 1;
        t.amount += toNumber(x.total);
      }
    }
    const trend = days.map((d) => ({
      date: d,
      orderCount: trendMap.get(d)!.orderCount,
      amount: Math.round(trendMap.get(d)!.amount),
    }));
    const maxAmount = Math.max(1, ...trend.map((t) => t.amount));

    // 今日数据
    const todayOrders = valid.filter((x) => String(x.created_at) >= todayStart);
    const todayAmount = Math.round(todayOrders.reduce((s, x) => s + toNumber(x.total), 0));
    const pendingCount = statusMap['pending'] ?? 0;
    const totalAmount = Math.round(valid.reduce((s, x) => s + toNumber(x.total), 0));

    // 分类销售
    const catName = new Map<number, string>((cat.data ?? []).map((c: any) => [c.id, c.name]));
    const prodCat = new Map<number, number>((prod.data ?? []).map((p: any) => [p.id, p.category_id]));
    const catStat = new Map<string, { qty: number; amount: number }>();
    const prodStat = new Map<number, { name: string; qty: number; amount: number }>();
    for (const it of oi.data ?? []) {
      const qty = Number(it.qty) || 0;
      const amt = toNumber(it.product_price) * qty;
      const cid = prodCat.get(it.product_id);
      if (cid != null) {
        const cn = catName.get(cid) ?? '未分类';
        const c = catStat.get(cn) ?? { qty: 0, amount: 0 };
        c.qty += qty;
        c.amount += amt;
        catStat.set(cn, c);
      }
      const p = prodStat.get(it.product_id) ?? { name: it.product_name, qty: 0, amount: 0 };
      p.qty += qty;
      p.amount += amt;
      prodStat.set(it.product_id, p);
    }
    const categorySales = [...catStat.entries()]
      .map(([name, v]) => ({ name, qty: v.qty, amount: Math.round(v.amount) }))
      .sort((a, b) => b.amount - a.amount);
    const maxCatAmount = Math.max(1, ...categorySales.map((c) => c.amount));
    const topProducts = [...prodStat.values()]
      .map((v) => ({ name: v.name, qty: v.qty, amount: Math.round(v.amount) }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 8);

    return {
      kpis: {
        customerCount: u.count ?? 0,
        orderCount: orders.length,
        pendingCount,
        totalAmount,
        todayOrderCount: todayOrders.length,
        todayAmount,
      },
      statusDist: Object.entries(statusMap).map(([status, count]) => ({ status, count })),
      trend,
      maxAmount,
      categorySales,
      maxCatAmount,
      topProducts,
    };
  }
}