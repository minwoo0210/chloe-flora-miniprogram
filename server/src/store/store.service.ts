import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// ---- Chloe Flora 共享库行类型（snake_case，与后台项目 7685923382940106767 一致）----
interface ProductRow {
  id: string; name: string; price: number | string; original_price?: number | string | null;
  main_image?: string | null; description?: string | null; category_id: string;
  status: string; stock: number; sort_order: number; created_at?: string; updated_at?: string;
}
interface CategoryRow {
  id: string; name: string; slug: string; description?: string | null;
  sort_order: number; is_active: boolean; created_at?: string; updated_at?: string;
}
interface BannerRow { id: string; title?: string | null; image_key: string; link_target?: string | null; sort_order: number; is_active: boolean; }
interface SectionRow { id: string; title: string; subtitle?: string | null; image_key: string; category_id?: string | null; sort_order: number; is_active: boolean; }
interface HotRow { id: string; product_id: string; title?: string | null; sort_order: number; is_active: boolean; }
interface CustomerRow { id: string; openid?: string | null; nickname?: string | null; name?: string | null; phone?: string | null; address?: string | null; remark?: string | null; }
interface OrderRow {
  id: string; order_no: string; customer_id?: string | null; customer_name: string;
  customer_phone: string; address?: string | null; remark?: string | null;
  total_amount: number | string; delivery_fee: number | string; status: string;
  created_at?: string; updated_at?: string;
}
interface OrderItemRow {
  id: string; order_id: string; product_id?: string | null; product_name: string;
  price: number | string; quantity: number; image_key?: string | null; subtotal?: number | string | null; main_image?: string | null;
}

export interface CreateOrderInput {
  openid: string;
  nickname?: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  remark?: string;
  deliveryFee?: number;
  items: { productId: string; name: string; price: number; quantity: number; imageKey?: string }[];
}

@Injectable()
export class StoreService {
  private c() {
    return getSupabaseClient();
  }

  private num(v: any): number {
    return Number(v ?? 0) || 0;
  }

  // ---------- 商品 / 分类 ----------
  async listCategories() {
    const { data, error } = await this.c()
      .from('categories').select('*').eq('is_active', true)
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return (data || []).map((c: CategoryRow) => ({
      id: c.id, name: c.name, slug: c.slug, description: c.description || '', sortOrder: c.sort_order,
    }));
  }

  private async allCategories(): Promise<Map<string, CategoryRow>> {
    try {
      const { data } = await this.c()
        .from('categories').select('*').eq('is_active', true);
      const m = new Map<string, CategoryRow>();
      (data || []).forEach((c: any) => m.set(c.id, c));
      return m;
    } catch {
      return new Map();
    }
  }

  private async categoryBySlug(slug: string): Promise<CategoryRow | null> {
    const { data, error } = await this.c()
      .from('categories').select('*').eq('slug', slug).eq('is_active', true).maybeSingle();
    if (error || !data) return null;
    return data as CategoryRow;
  }

  private mapProduct(p: ProductRow, cat?: CategoryRow) {
    return {
      id: p.id, name: p.name, price: this.num(p.price),
      originalPrice: p.original_price == null ? null : this.num(p.original_price),
      mainImage: p.main_image || '', description: p.description || '',
      categoryId: p.category_id, categorySlug: cat?.slug || '', categoryName: cat?.name || '',
      stock: this.num(p.stock), status: p.status,
    };
  }

  async listProducts(categorySlug?: string): Promise<any[]> {
    let q = this.c()
      .from('products').select('*').eq('status', 'active')
      .order('sort_order', { ascending: true });
    if (categorySlug) {
      const cat = await this.categoryBySlug(categorySlug);
      if (!cat) return [];
      q = q.eq('category_id', cat.id);
    }
    const { data, error } = await q;
    if (error) throw error;
    const cats = await this.allCategories();
    return (data || []).map((p: ProductRow) => this.mapProduct(p, cats.get(p.category_id)));
  }

  async getProduct(id: string): Promise<any> {
    const { data, error } = await this.c()
      .from('products').select('*').eq('id', id).eq('status', 'active').maybeSingle();
    if (error) throw error;
    if (!data) throw new NotFoundException('商品不存在');
    const cats = await this.allCategories();
    return this.mapProduct(data as ProductRow, cats.get((data as ProductRow).category_id));
  }

  // ---------- 首页内容 ----------
  async getHome(): Promise<any> {
    const [b, s, h] = await Promise.all([
      this.c().from('banners').select('*').eq('is_active', true).order('sort_order', { ascending: true }),
      this.c().from('category_sections').select('*').eq('is_active', true).order('sort_order', { ascending: true }),
      this.c().from('hot_recommendations').select('*').eq('is_active', true).order('sort_order', { ascending: true }),
    ]);
    for (const r of [b, s, h]) if (r.error) throw r.error;

    const cats = await this.allCategories();
    const banners = (b.data || []).map((x: BannerRow) => ({
      id: x.id, title: x.title || '', imageKey: x.image_key, linkTarget: x.link_target || '', sortOrder: x.sort_order,
    }));

    const sections = (s.data || []).map((x: SectionRow) => {
      const c = cats.get(x.category_id || '');
      return {
        id: x.id, title: x.title, subtitle: x.subtitle || '', imageKey: x.image_key,
        categoryId: x.category_id || '', sortOrder: x.sort_order,
        category: { id: c?.id || '', name: c?.name || '', slug: c?.slug || '' },
      };
    });

    // 热门推荐 —— 关联商品
    const hots = (h.data || []) as HotRow[];
    const pids = hots.map((x) => x.product_id).filter(Boolean);
    let prdMap = new Map<string, ProductRow>();
    if (pids.length) {
      const { data, error } = await this.c().from('products').select('*').in('id', pids).eq('status', 'active');
      if (!error) (data || []).forEach((p: any) => prdMap.set(p.id, p));
    }
    const hot = hots.map((x) => {
      const p = prdMap.get(x.product_id);
      return { id: x.id, title: x.title || '', sortOrder: x.sort_order, product: p ? this.mapProduct(p, cats.get(p.category_id)) : null };
    });

    return { banners, sections, hot };
  }

  // ---------- 设计风格 ----------
  async getTheme(): Promise<any> {
    const { data, error } = await this.c()
      .from('site_settings').select('value').eq('key', 'theme').maybeSingle();
    if (error) throw error;
    const v: any = data?.value;
    const o: any = v && typeof v === 'object' ? v : {};
    return {
      primary: o.primary || '#E8830C',
      background: o.background || '#F7F3ED',
      textPrimary: o.text_primary || '#2B2622',
      textSecondary: o.text_secondary || '#6B625A',
      textTertiary: o.text_tertiary || '#A39A90',
    };
  }

  // ---------- 订单 ----------
  async createOrder(input: CreateOrderInput): Promise<any> {
    if (!input.openid) throw new BadRequestException('缺少用户标识 openid');
    if (!input.customerName || !input.customerPhone) throw new BadRequestException('缺少收货人/电话');
    if (!Array.isArray(input.items) || input.items.length === 0) throw new BadRequestException('订单不能为空');

    // 1) 客户归户：直接用 openid 作为订单 customer_id（规避 customers 表 ANON 写 RLS 限制）
    //    best-effort 尝试记录客户到 customers（若后台 RLS 允许写入则记录，否则忽略）
    const customerId = input.openid;
    try { await this.upsertCustomer(input); } catch { /* RLS 可能不允许 anon 写 customers，忽略 */ }

    // 2) 汇总金额
    let total = 0;
    for (const it of input.items) total += (Number(it.price) || 0) * (Number(it.quantity) || 1);
    total += Number(input.deliveryFee) || 0;
    total = Math.round(total * 100) / 100;

    // 3) 创建订单头
    const orderNo = 'CF' + Date.now().toString(36).toUpperCase() + Math.floor(Math.random() * 900 + 100).toString();
    const { data: order, error: oErr } = await this.c()
      .from('orders')
      .insert({
        order_no: orderNo, customer_id: customerId,
        customer_name: input.customerName, customer_phone: input.customerPhone,
        address: input.customerAddress || null, remark: input.remark || null,
        total_amount: total, delivery_fee: Number(input.deliveryFee) || 0, status: 'pending',
      })
      .select('*')
      .single();
    if (oErr) throw oErr;
    const orderRow = order as OrderRow;

    // 4) 写入订单明细
    const itemRows = input.items.map((it) => ({
      order_id: orderRow.id, product_id: it.productId || null,
      product_name: it.name, price: Number(it.price) || 0, quantity: Number(it.quantity) || 1,
      image_key: it.imageKey || null, subtotal: Math.round(((Number(it.price) || 0) * (Number(it.quantity) || 1)) * 100) / 100,
    }));
    const { data: items, error: iErr } = await this.c().from('order_items').insert(itemRows).select('*');
    if (iErr) throw iErr;

    return {
      id: orderRow.id, orderNo: orderRow.order_no, status: orderRow.status,
      totalAmount: this.num(orderRow.total_amount), deliveryFee: this.num(orderRow.delivery_fee),
      createdAt: orderRow.created_at || '',
      items: (items || []).map((r: OrderItemRow) => ({
        id: r.id, productId: r.product_id, name: r.product_name, price: this.num(r.price),
        quantity: r.quantity, imageKey: r.image_key || '', subtotal: this.num(r.subtotal),
      })),
    };
  }

  private async upsertCustomer(input: CreateOrderInput): Promise<string> {
    const { data: exist } = await this.c().from('customers').select('*').eq('openid', input.openid).maybeSingle();
    if (exist) {
      await this.c().from('customers')
        .update({ phone: input.customerPhone || exist.phone, nickname: input.nickname != null ? input.nickname : exist.nickname })
        .eq('id', (exist as CustomerRow).id);
      return (exist as CustomerRow).id;
    }
    const { data, error } = await this.c()
      .from('customers')
      .insert({
        openid: input.openid, nickname: input.nickname || null,
        phone: input.customerPhone || null, address: input.customerAddress || null,
      })
      .select('id')
      .single();
    if (error) throw error;
    return (data as CustomerRow).id;
  }

  async listMyOrders(openid: string): Promise<any[]> {
    if (!openid) return [];
    const { data: orders, error: oErr } = await this.c()
      .from('orders').select('*').eq('customer_id', openid)
      .order('created_at', { ascending: false });
    if (oErr) return [];

    const list = orders || [];
    const ids = list.map((o: OrderRow) => o.id);
    let itemMap = new Map<string, OrderItemRow[]>();
    if (ids.length) {
      const { data: items } = await this.c().from('order_items').select('*').in('order_id', ids);
      (items || []).forEach((r: OrderItemRow) => {
        const arr = itemMap.get(r.order_id) || [];
        arr.push(r);
        itemMap.set(r.order_id, arr);
      });
    }
    return list.map((o: OrderRow) => ({
      id: o.id, orderNo: o.order_no, status: o.status,
      totalAmount: this.num(o.total_amount), deliveryFee: this.num(o.delivery_fee),
      createdAt: o.created_at || '', remark: o.remark || '',
      items: (itemMap.get(o.id) || []).map((r: OrderItemRow) => ({
        id: r.id, productId: r.product_id, name: r.product_name, price: this.num(r.price),
        quantity: r.quantity, imageKey: r.image_key || '', subtotal: this.num(r.subtotal),
      })),
    }));
  }

  // ---------- 后台只读看板（共享库 + ANON，受 RLS 约束）----------
  async adminOverview(): Promise<any> {
    const [pd, cd, od, cd_, sd] = await Promise.all([
      this.c().from('products').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      this.c().from('categories').select('id', { count: 'exact', head: true }).eq('is_active', true),
      this.c().from('orders').select('total_amount'),
      this.c().from('customers').select('id', { count: 'exact', head: true }),
      this.c().from('orders').select('status'),
    ]);
    const total = (od.data || []).reduce((s: number, r: any) => s + this.num(r.total_amount), 0);
    return {
      productCount: pd.count ?? 0, categoryCount: cd.count ?? 0,
      orderCount: od.data?.length ?? 0, customerCount: cd_.count ?? 0, totalAmount: Math.round(total * 100) / 100,
    };
  }

  async listAllOrders(): Promise<any[]> {
    const { data, error } = await this.c().from('orders').select('*').order('created_at', { ascending: false });
    if (error) return [];
    const list = data || [];
    const ids = list.map((o: OrderRow) => o.id);
    let itemMap = new Map<string, OrderItemRow[]>();
    if (ids.length) {
      const { data: items } = await this.c().from('order_items').select('*').in('order_id', ids);
      (items || []).forEach((r: OrderItemRow) => {
        const a = itemMap.get(r.order_id) || [];
        a.push(r);
        itemMap.set(r.order_id, a);
      });
    }
    return list.map((o: OrderRow) => ({
      id: o.id, orderNo: o.order_no, customerName: o.customer_name, customerPhone: o.customer_phone,
      address: o.address || '', remark: o.remark || '', status: o.status,
      totalAmount: this.num(o.total_amount), deliveryFee: this.num(o.delivery_fee), createdAt: o.created_at || '',
      items: (itemMap.get(o.id) || []).map((r: OrderItemRow) => ({
        productId: r.product_id, name: r.product_name, price: this.num(r.price), quantity: r.quantity, imageKey: r.image_key || '',
      })),
    }));
  }

  async listCustomers(): Promise<any[]> {
    const { data, error } = await this.c().from('customers').select('*').order('created_at', { ascending: false });
    if (error) return [];
    return (data || []).map((c: CustomerRow) => ({
      id: c.id, openid: c.openid || '', nickname: c.nickname || '', name: c.name || '',
      phone: c.phone || '', address: c.address || '', createdAt: (c as any).created_at || '',
    }));
  }

  async dashboard(): Promise<any> {
    const all = await this.listAllOrders();
    const statusDist: Record<string, number> = {};
    let amount = 0;
    for (const o of all) {
      statusDist[o.status] = (statusDist[o.status] || 0) + 1;
      amount += o.totalAmount;
    }
    return {
      statusDist, totalAmount: Math.round(amount * 100) / 100, orderCount: all.length,
      recent: all.slice(0, 8),
    };
  }
}