import React from "react";
import { createRoot } from "react-dom/client";
import App from "./game.canvas";

const root = document.getElementById("root");
if (!root) throw new Error("Missing #root");
createRoot(root).render(<App />);
