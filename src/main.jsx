import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import About from "./About.jsx";
import Stats from "./Stats.jsx";
import Create from "./CreateProduct.jsx";

import "./css/styles.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { createTheme, ThemeProvider } from "@mui/material";
import Profile from "./Profile.jsx";

const theme = createTheme({
  palette: {
    primary: {
      main: "#000000",
    },
    secondary: {
      main: "#ffffff",
    },
  },
});

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <StrictMode>
      <ThemeProvider theme={theme}>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="about" element={<About />} />
          <Route path="stats" element={<Stats />} />
          <Route path="create" element={<Create />} />
          <Route path="user-profile" element={<Profile />} />
        </Routes>
      </ThemeProvider>
    </StrictMode>
  </BrowserRouter>,
);
