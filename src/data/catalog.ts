/**
 * 花屿花艺工作室 - 商品目录 / 分类 / 服务 / Banner 静态数据
 * 说明：图片位统一使用风格化占位块，imageHint 为建议图片尺寸（预留真实图片上传位）。
 */

export interface Category {
  id: string
  name: string
  /** 建议图标尺寸，预留 */
}

export interface Product {
  id: string
  categoryId: string
  name: string
  subtitle: string
  price: number
  originalPrice?: number
  description: string
  /** 建议主图尺寸 */
  imageHint: string
  /** 详情长图构图建议 */
  detailNotes: string[]
  tags: string[] // 精选 / 热卖 / 新品
  hot?: boolean
}

export const CATEGORIES: Category[] = [
  { id: 'fresh', name: '鲜花' },
  { id: 'preserved', name: '永生花' },
  { id: 'basket', name: '花篮' },
  { id: 'plant', name: '绿植盆栽' },
  { id: 'event', name: '活动布置' }
]

export const PRODUCTS: Product[] = [
  // ---- 鲜花 ----
  {
    id: 'p1',
    categoryId: 'fresh',
    name: '爱马仕橙花束',
    subtitle: '奶油纸包装·橙调花材',
    price: 399,
    originalPrice: 499,
    description:
      '以爱马仕橙为主色的高级手作花束，点缀鼠尾草绿叶片，奶油纸手工包扎，适合日常送礼与家居摆放，鲜花水养可保持 5-7 天。',
    imageHint: '750 × 900',
    detailNotes: ['建议突出橙调花瓣与奶油纸质感', '背景为米白/浅灰，侧光拍摄'],
    tags: ['精选', '热卖'],
    hot: true
  },
  {
    id: 'p2',
    categoryId: 'fresh',
    name: '晨雾白玫瑰',
    subtitle: '进口白玫瑰·晨雾感包装',
    price: 359,
    originalPrice: 429,
    description:
      '精选进口厄瓜多尔白玫瑰，晨雾般柔和的纱质包装，清新克制，适合表白、纪念日与素雅场合。',
    imageHint: '750 × 900',
    detailNotes: ['建议低饱和背景突出白玫瑰层次', '微距拍摄花瓣水珠'],
    tags: ['精选'],
    hot: true
  },
  {
    id: 'p3',
    categoryId: 'fresh',
    name: '春日郁金香',
    subtitle: '当季郁金香·明媚春色',
    price: 289,
    description:
      '当季鲜切郁金香，明快春色，花束活泼通透，适合春日送礼与案头点缀。',
    imageHint: '750 × 900',
    detailNotes: ['建议日光充足处拍摄', '突出花杆线条'],
    tags: ['新品']
  },
  // ---- 永生花 ----
  {
    id: 'p5',
    categoryId: 'preserved',
    name: '鎏金永生玫瑰礼盒',
    subtitle: '鎏金烫金盒·久存花礼',
    price: 529,
    originalPrice: 599,
    description:
      '进口保鲜花材，配以鎏金烫金礼盒，可长久保存（约 3 年），是纪念日与表白的高定之选，自带仪式感。',
    imageHint: '750 × 900',
    detailNotes: ['建议突出烫金盒与花材质感', '暖光氛围拍摄金属光泽'],
    tags: ['精选', '热卖'],
    hot: true
  },
  {
    id: 'p6',
    categoryId: 'preserved',
    name: '玻璃罩永生花',
    subtitle: '透明玻璃罩·花艺装置',
    price: 469,
    description:
      '透明玻璃罩内的永生花艺作品，桌面装置感强，适合家居陈列与乔迁、开业贺礼。',
    imageHint: '750 × 900',
    detailNotes: ['建议逆光表现玻璃通透', '桌面俯拍突出装置感'],
    tags: ['新品']
  },
  {
    id: 'p7',
    categoryId: 'preserved',
    name: '永生花束·鎏金缎带',
    subtitle: '手作永生花束',
    price: 429,
    description:
      '手工扎束的永生花束，配以鎏金缎带，无需水养即可长久保持美好，送礼沉稳体面。',
    imageHint: '750 × 900',
    detailNotes: ['建议突出缎带细节', '奶油底侧光拍摄'],
    tags: []
  },
  // ---- 花篮 ----
  {
    id: 'p8',
    categoryId: 'basket',
    name: '商务会议花篮',
    subtitle: '会议桌花·商务礼仪',
    price: 699,
    originalPrice: 799,
    description:
      '大气稳重的商务会议桌花，花材饱满、层次清晰，适合会议、签约、开幕等商务场合。',
    imageHint: '750 × 750',
    detailNotes: ['建议俯拍展示花篮整体布局', '中性光突出商务感'],
    tags: ['热卖']
  },
  {
    id: 'p9',
    categoryId: 'basket',
    name: '开业庆典花篮',
    subtitle: '开业贺礼·双柱花篮',
    price: 888,
    description:
      '开业庆典双柱花篮，红橙暖调为主，配贺卡祝福，喜庆大气，是开业、乔迁之喜的首选。',
    imageHint: '750 × 900',
    detailNotes: ['建议全景展示双柱与贺卡', '暖色调突出喜庆'],
    tags: ['热卖'],
    hot: true
  },
  {
    id: 'p10',
    categoryId: 'basket',
    name: '探病安神花篮',
    subtitle: '柔和配色·关怀慰问',
    price: 529,
    description:
      '配色柔和安神的探病花篮，选用小雏菊、满天星等温婉花材，传递温柔关怀。',
    imageHint: '750 × 900',
    detailNotes: ['建议柔和自然光', '避免浓重色彩'],
    tags: []
  },
  // ---- 绿植盆栽 ----
  {
    id: 'p11',
    categoryId: 'plant',
    name: '橄榄树盆栽',
    subtitle: '地中海橄榄·质感绿意',
    price: 359,
    description:
      '株型优雅的地中海橄榄树，灰绿色叶片充满高级感，适合艺术空间与客厅陈列。',
    imageHint: '750 × 900',
    detailNotes: ['建议侧逆光突出叶片轮廓', '突出盆器质感'],
    tags: ['精选']
  },
  {
    id: 'p12',
    categoryId: 'plant',
    name: '龟背竹盆栽',
    subtitle: '阔叶散尾·ins 风',
    price: 269,
    description:
      '叶形独特的大型龟背竹，好养耐阴，是营造自然氛围的百搭绿植。',
    imageHint: '750 × 900',
    detailNotes: ['建议光线充足处拍摄', '突出叶面纹理'],
    tags: []
  },
  {
    id: 'p13',
    categoryId: 'plant',
    name: '琴叶榕盆栽',
    subtitle: '北欧风·置景植物',
    price: 329,
    description:
      '北欧风格的心叶榕，叶片宽大翠绿，摆放在角落即是天然景观。',
    imageHint: '750 × 900',
    detailNotes: ['建议浅色背景突出叶色', '直拍展现株型'],
    tags: ['新品']
  },
  // ---- 活动布置 ----
  {
    id: 'p14',
    categoryId: 'event',
    name: '婚礼主背景花艺',
    subtitle: '定制·按套系计价',
    price: 6888,
    description:
      '婚礼主背景定制花艺，根据主题与场地方案一对一设计，含现场搭建，让每一场婚礼独一无二。',
    imageHint: '1200 × 800',
    detailNotes: ['建议全景展示主背景比例', '突出花艺与整体氛围'],
    tags: ['精选']
  },
  {
    id: 'p15',
    categoryId: 'event',
    name: '高端晚宴桌花',
    subtitle: '定制·按桌计价',
    price: 1280,
    description:
      '高端晚宴桌花定制，低矮开阔、不挡视线，衬托餐桌氛围，适合商务晚宴与私宴。',
    imageHint: '1200 × 800',
    detailNotes: ['建议俯拍展示桌花布局', '表现空间通透感'],
    tags: []
  },
  {
    id: 'p16',
    categoryId: 'event',
    name: '橱窗现代花艺装置',
    subtitle: '定制·按方案报价',
    price: 5800,
    description:
      '品牌橱窗现代花艺装置，兼具观赏与传播力，为门店与活动空间注入艺术气质。',
    imageHint: '1200 × 800',
    detailNotes: ['建议立置拍摄全貌', '表现造型张力'],
    tags: ['精品']
  }
]

export interface Service {
  id: string
  name: string
  desc: string
  imageHint: string
  icon: string
}

export const SERVICES: Service[] = [
  {
    id: 'bouquet',
    name: '花束定制',
    desc: '手作花束 · 每日鲜切',
    imageHint: '600 × 400',
    icon: 'Flower'
  },
  {
    id: 'basket',
    name: '花篮礼品',
    desc: '礼仪花篮 · 庆典贺礼',
    imageHint: '600 × 400',
    icon: 'Gift'
  },
  {
    id: 'wedding',
    name: '婚礼布置',
    desc: '婚礼全程 · 定制方案',
    imageHint: '600 × 400',
    icon: 'CalendarHeart'
  },
  {
    id: 'business',
    name: '商业布置',
    desc: '橱窗 · 会议 · 空间花艺',
    imageHint: '600 × 400',
    icon: 'Building2'
  }
]

export interface Banner {
  id: string
  title: string
  subtitle: string
  imageHint: string
  tint: 'orange' | 'gold' | 'deep' | 'sage'
}

export const BANNERS: Banner[] = [
  {
    id: 'b1',
    title: '花屿花艺工作室',
    subtitle: 'HERMES ORANGE · 高端花艺定制品牌',
    imageHint: '750 × 320',
    tint: 'orange'
  },
  {
    id: 'b2',
    title: '七夕限定 · 一见倾心',
    subtitle: '鎏金永生花礼盒 · 提前预订',
    imageHint: '750 × 320',
    tint: 'deep'
  },
  {
    id: 'b3',
    title: '婚礼专区 · 一生一次',
    subtitle: '一站式婚礼花艺布置 · 预约设计',
    imageHint: '750 × 320',
    tint: 'sage'
  }
]

export const SLOGAN = {
  title: '于清晨的花影里',
  subtitle: '做一束被珍视的仪式感'
}

/** 将价格格式化为 ¥xxx.xx */
export function formatPrice(price: number): string {
  return price.toFixed(price % 1 === 0 ? 0 : 2)
}