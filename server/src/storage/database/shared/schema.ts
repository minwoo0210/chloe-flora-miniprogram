import { sql } from "drizzle-orm"
import {
  pgTable,
  serial,
  timestamp,
  varchar,
  text,
  integer,
  numeric,
  boolean,
  jsonb,
  index,
} from "drizzle-orm/pg-core"

export const healthCheck = pgTable("health_check", {
  id: serial().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

// ============ Chloe Flora · 业务表 ============

// 用户（user_key = 小程序 openid 或生成的用户标识）
export const users = pgTable(
  "users",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    nickname: varchar("nickname", { length: 64 }),
    avatar: text("avatar"),
    phone: varchar("phone", { length: 20 }),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("users_created_at_idx").on(table.created_at)]
);

// 商品分类
export const categories = pgTable(
  "categories",
  {
    id: serial().primaryKey(),
    name: varchar("name", { length: 32 }).notNull(),
    note: varchar("note", { length: 128 }),
    sort: integer("sort").default(0),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("categories_sort_idx").on(table.sort)]
);

// 商品
export const products = pgTable(
  "products",
  {
    id: serial().primaryKey(),
    category_id: integer("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 64 }).notNull(),
    subtitle: varchar("subtitle", { length: 128 }),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    original_price: numeric("original_price", { precision: 10, scale: 2 }),
    description: text("description"),
    image_hint: varchar("image_hint", { length: 64 }),
    tags: jsonb("tags").default(sql`'[]'::jsonb`),
    is_hot: boolean("is_hot").default(false),
    is_featured: boolean("is_featured").default(false),
    sort: integer("sort").default(0),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("products_category_id_idx").on(table.category_id),
    index("products_sort_idx").on(table.sort),
    index("products_hot_idx").on(table.is_hot),
  ]
);

// 收货地址
export const addresses = pgTable(
  "addresses",
  {
    id: serial().primaryKey(),
    user_key: varchar("user_key", { length: 64 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 32 }).notNull(),
    phone: varchar("phone", { length: 20 }).notNull(),
    province: varchar("province", { length: 32 }),
    city: varchar("city", { length: 32 }),
    district: varchar("district", { length: 32 }),
    detail: varchar("detail", { length: 255 }).notNull(),
    is_default: boolean("is_default").default(false),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("addresses_user_key_idx").on(table.user_key)]
);

// 购物车
export const cart_items = pgTable(
  "cart_items",
  {
    id: serial().primaryKey(),
    user_key: varchar("user_key", { length: 64 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    product_id: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    qty: integer("qty").default(1).notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("cart_items_user_key_idx").on(table.user_key),
    index("cart_items_product_id_idx").on(table.product_id),
  ]
);

// 订单
export const orders = pgTable(
  "orders",
  {
    id: serial().primaryKey(),
    order_no: varchar("order_no", { length: 32 }).notNull().unique(),
    user_key: varchar("user_key", { length: 64 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    receiver: varchar("receiver", { length: 32 }).notNull(),
    phone: varchar("phone", { length: 20 }).notNull(),
    address: text("address").notNull(),
    total: numeric("total", { precision: 10, scale: 2 }).notNull().default("0"),
    status: varchar("status", { length: 16 }).default("pending").notNull(),
    remark: varchar("remark", { length: 255 }),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("orders_user_key_idx").on(table.user_key),
    index("orders_status_idx").on(table.status),
    index("orders_created_at_idx").on(table.created_at),
  ]
);

// 订单明细
export const order_items = pgTable(
  "order_items",
  {
    id: serial().primaryKey(),
    order_id: integer("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    product_id: integer("product_id").notNull(),
    product_name: varchar("product_name", { length: 64 }).notNull(),
    product_price: numeric("product_price", { precision: 10, scale: 2 }).notNull(),
    qty: integer("qty").default(1).notNull(),
    image_hint: varchar("image_hint", { length: 64 }),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("order_items_order_id_idx").on(table.order_id)]
);

// 站点 / 首页装修配置（单行 key='home'，content 为 JSONB）
export const site_config = pgTable("site_config", {
  config_key: varchar("config_key", { length: 32 }).primaryKey(),
  content: jsonb("content").notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true, mode: "string" }).defaultNow().notNull(),
});