module.exports = {
  // 用相对路径打包，dist 既能放在 Vercel 根目录，也能放到 GitHub Pages 的子目录
  publicPath: './',
  outputDir: 'dist',
  assetsDir: 'static',
  productionSourceMap: false,
  lintOnSave: false,
  devServer: {
    // Java 后端占着 8080，前端开发服务器改用 8081（老师笔记 2.4 的要求）
    port: 8081,
    open: false,
    // 开发环境跨域交给代理：前端所有以 / 开头的请求都转发到 8080，
    // 页面里就不用写死 http://localhost:8080，打包部署时再换
    proxy: {
      '/': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
}
