const defaults = require("@wordpress/scripts/config/webpack.config");
const Dotenv = require("dotenv-webpack");

module.exports = {
  ...defaults,
  plugins: [...defaults.plugins, new Dotenv()],
  externals: {
    react: "React",
    "react-dom": "ReactDOM",
  },
};
