import { render } from "@wordpress/element";
import App from "./App";

/**
 * Import the stylesheet for the plugin.
 */
import "./style/main.scss";

// Render the App component into the DOM
if (document.getElementById("vercel")) {
  render(
    <App vercelOptions={vercel_options} />,
    document.getElementById("vercel")
  );
}
