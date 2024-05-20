import * as path from "path";
import * as webpack from "webpack";
import { VueLoaderPlugin } from "vue-loader";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import WebpackBar from "webpackbar";

const extensionConfig: webpack.Configuration = {
  // VS Code extensions run in a Node.js-context 📖 -> https://webpack.js.org/configuration/node/
  target: "node",
  // this leaves the source code as close as possible to the original (when packaging we set this to 'production')
  mode: "none",
  // the entry point of this extension, 📖 -> https://webpack.js.org/configuration/entry-context/
  entry: "./src/extension/extension.ts",
  output: {
    // the bundle is stored in the 'dist' folder (check package.json), 📖 -> https://webpack.js.org/configuration/output/
    path: path.resolve(__dirname, "dist"),
    filename: "extension.js",
    libraryTarget: "commonjs2",
  },
  externals: {
    // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
    // modules added here also need to be added in the .vscodeignore file
    vscode: "commonjs vscode",
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "ts-loader",
          },
        ],
      },
    ],
  },
  devtool: "inline-source-map",
  infrastructureLogging: {
    // enables logging required for problem matchers
    level: "log",
  },
  plugins: [new WebpackBar(), new webpack.ContextReplacementPlugin(/typescript/)],
};

const webviewConfig: webpack.Configuration = {
  target: "web",
  entry: "./src/webview/main.mts",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].webview.js",
  },
  watchOptions: {
    ignored: /node_modules/,
  },
  devtool: "inline-source-map",
  resolve: {
    extensions: [".mts", ".ts", ".js"],
    alias: {
      "@/webview": path.resolve(__dirname, "./src/webview"),
      "@/shared": path.resolve(__dirname, "./src/shared"),
      "@/blueprint": path.resolve(__dirname, "./src/blueprint"),
    },
  },
  module: {
    rules: [
      {
        test: /\.m?ts$/,
        exclude: /node_modules/,
        loader: "ts-loader",
        options: {
          appendTsSuffixTo: [/\.vue$/],
        },
      },
      {
        test: /\.vue$/,
        loader: "vue-loader",
        options: {
          compilerOptions: {
            // treat any tag that starts with ion- as custom elements
            isCustomElement: (tag: string) => tag.includes("-"),
          },
        },
      },
      {
        test: /\.(sass|css|scss)$/,
        use: [
          "vue-style-loader",
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              esModule: false,
            },
          },
          "css-loader",
          "postcss-loader",
          "sass-loader",
        ],
      },
    ],
  },
  plugins: [
    new VueLoaderPlugin(),
    new MiniCssExtractPlugin({
      filename: "[name].webview.css",
      runtime: false,
    }),
    new WebpackBar(),
    new webpack.DefinePlugin({
      __VUE_OPTIONS_API__: "true",
      __VUE_PROD_DEVTOOLS__: "false",
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: "false",
    }),
  ],
};

module.exports = [webviewConfig, extensionConfig];
