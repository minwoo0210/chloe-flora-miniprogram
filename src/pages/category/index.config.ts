export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '花礼' })
  : { navigationBarTitleText: '花礼' }