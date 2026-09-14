export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: 'Chloe Flora' })
  : { navigationBarTitleText: 'Chloe Flora' }