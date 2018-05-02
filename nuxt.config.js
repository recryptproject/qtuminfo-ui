const webpack = require('webpack')

module.exports = {
  head: {
    titleTemplate: '%s - recrypt.info',
    meta: [
      {charset: 'utf-8'},
      {name: 'viewport', content: 'width=device-width, initial-scale=1, user-scalable=no'}
    ]
  },
  css: [
    'bulma/css/bulma.css',
    '@fortawesome/fontawesome-free/css/all.css',
    '@/styles/common.less',
    '@/styles/card.less',
    '@/styles/info-table.less',
    '@/icons/style.css'
  ],
  render: {
    bundleRenderer: {
      shouldPreload: (file, type) => ['script', 'style', 'font'].includes(type)
    }
  },
  build: {
    extend(config, {isServer}) {
      config.module.rules.push({
        test: /\.ya?ml$/,
        use: ['json-loader', 'yaml-loader']
      })
      config.plugins.push(new webpack.DefinePlugin({
        'process.env.recryptinfoAPIBase': JSON.stringify(process.env.RECRYPTINFO_API_BASE
          || process.env[isServer ? 'RECRYPTINFO_API_BASE_SERVER' : 'RECRYPTINFO_API_BASE_CLIENT']
          || 'http://localhost:3001/recryptinfo-api/'),
        'process.env.recryptinfoWSBase': JSON.stringify(process.env.RECRYPTINFO_WS_BASE
          || process.env.RECRYPTINFO_API_BASE_WS
          || '//localhost:3002/recryptinfo-ws/'),
        'process.env.network': JSON.stringify(process.env.RECRYPT_NETWORK || 'mainnet')
      }))
    },
    extractCSS: true,
    postcss: {
      plugins: {
        'postcss-cssnext': {
          features: {
            customProperties: false
          }
        }
      }
    }
  },
  serverMiddleware: ['middleware/ip.js'],
  plugins: [
    '~/plugins/components.js',
    '~/plugins/i18n.js',
    '~/plugins/recrypt-utils.js',
    {src: '~/plugins/websocket.js', ssr: false}
  ]
}
