export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '地址管理' })
  : { navigationBarTitleText: '地址管理' }