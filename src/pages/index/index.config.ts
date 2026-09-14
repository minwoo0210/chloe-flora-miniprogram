export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationStyle: 'custom',
      navigationBarTitleText: 'Chloe Flora',
      enablePullDownRefresh: false
    })
  : { navigationStyle: 'custom', navigationBarTitleText: 'Chloe Flora' }
