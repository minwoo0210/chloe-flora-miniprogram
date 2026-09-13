export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '花屿 · 服务' })
  : { navigationBarTitleText: '花屿 · 服务' }