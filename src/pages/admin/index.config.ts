export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '数据总览' })
  : { navigationBarTitleText: '数据总览' }