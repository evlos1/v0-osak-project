// postcss.config.js
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
    // autoprefixer 플러그인 추가
    autoprefixer: {},
  },
};

// ESM 'export default' 대신 CommonJS 'module.exports' 사용
module.exports = config;