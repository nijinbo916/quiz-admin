module.exports = {
  // 用相对路径打包，dist 既能放在 Vercel 根目录，也能放到 GitHub Pages 的子目录
  publicPath: './',
  outputDir: 'dist',
  assetsDir: 'static',
  productionSourceMap: false,
  lintOnSave: false,
  devServer: {
    port: 8080,
    open: false
  }
}
