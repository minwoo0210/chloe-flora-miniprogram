export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/category/index',
    'pages/cart/index',
    'pages/services/index',
    'pages/my/index',
    'pages/product/index',
    'pages/checkout/index',
    'pages/orders/index',
    'pages/address/index',
    'pages/favorites/index',
    'pages/admin/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#f6f1eb',
    navigationBarTitleText: 'Chloe Flora',
    navigationBarTextStyle: 'black',
    backgroundColor: '#f6f1eb'
  },
  tabBar: {
    color: '#8f8a82',
    selectedColor: '#e8830c',
    backgroundColor: '#f6f1eb',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
        iconPath: './assets/tabbar/house.png',
        selectedIconPath: './assets/tabbar/house-active.png'
      },
      {
        pagePath: 'pages/category/index',
        text: '商品',
        iconPath: './assets/tabbar/shapes.png',
        selectedIconPath: './assets/tabbar/shapes-active.png'
      },
      {
        pagePath: 'pages/cart/index',
        text: '购物袋',
        iconPath: './assets/tabbar/shopping-bag.png',
        selectedIconPath: './assets/tabbar/shopping-bag-active.png'
      },
      {
        pagePath: 'pages/services/index',
        text: '服务',
        iconPath: './assets/tabbar/sparkles.png',
        selectedIconPath: './assets/tabbar/sparkles-active.png'
      },
      {
        pagePath: 'pages/my/index',
        text: '我的',
        iconPath: './assets/tabbar/user.png',
        selectedIconPath: './assets/tabbar/user-active.png'
      }
    ]
  }
})