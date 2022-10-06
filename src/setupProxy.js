const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: "http://localhost:80",
      changeOrigin: true,
      pathRewrite: {
        "^/api": "/", // rewrite path
      },
    })
  );
};
