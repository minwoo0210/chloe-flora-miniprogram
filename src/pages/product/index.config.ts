export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '花礼详情' })
  : { navigationBarTitleText: '花礼详情' }