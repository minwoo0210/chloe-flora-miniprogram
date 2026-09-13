export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/category/index',
    'pages/cart/index',
    'pages/my/index',
    'pages/product/index',
    'pages/checkout/index',
    'pages/orders/index',
    'pages/address/index',
    'pages/favorites/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fbf6ee',
    navigationBarTitleText: '花屿花艺工作室',
    navigationBarTextStyle: 'black',
    backgroundColor: '#fbf6ee'
  },
  tabBar: {
    color: '#9b8b76',
    selectedColor: '#e8830c',
    backgroundColor: '#fbf6ee',
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
        text: '花礼',
        iconPath: './assets/tabbar/shapes.png',
        selectedIconPath: './assets/tabbar/shapes-active.png'
      },
      {
        pagePath: 'pages/cart/index',
        text: '购物车',
        iconPath: './assets/tabbar/shopping-basket.png',
        selectedIconPath: './assets/tabbar/shopping-basket-active.png'
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