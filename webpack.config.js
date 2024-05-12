/* https://github.com/facebook/create-react-app/issues/3365 */

const glob = require("glob")
const path = require("path")
const UglifyJsPlugin = require("uglifyjs-webpack-plugin")
const CopyPlugin = require("copy-webpack-plugin")

module.exports = {
  entry: {
    "bundle.js": glob.sync("build/static/?(js|css)/*.?(js|css)").map(f => path.resolve(__dirname, f)),
  },
  output: {
    filename: "photomon_photoprint_app.js",
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  plugins: [
    new UglifyJsPlugin(),
    new CopyPlugin([
      {
        from: "public/images",
        to: "images/",
        toType: "dir",
        force: true,
      },
    ]),
  ],
}
