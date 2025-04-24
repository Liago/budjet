import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProd = mode === "production";

  return {
    base: isProd ? "/budjet/" : "/",
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      proxy: {
        "/api": {
          target: "http://localhost:3000",
          changeOrigin: true,
          secure: false,
        },
      },
    },
    build: {
      outDir: "dist",
      sourcemap: !isProd,
      minify: isProd,
      cssMinify: isProd,
      commonjsOptions: {
        transformMixedEsModules: true,
      },
      rollupOptions: {
        makeNativeSite: false,
        external: [],
        onwarn(warning, warn) {
          if (warning.code === "MODULE_NOT_FOUND") return;
          if (warning.code === "UNRESOLVED_IMPORT") return;
          warn(warning);
        },
        output: {
          manualChunks: {
            vendor: ["react", "react-dom", "react-router-dom"],
            ui: [
              "@mui/material",
              "@mui/icons-material",
              "@emotion/react",
              "@emotion/styled",
            ],
            charts: ["chart.js", "react-chartjs-2", "recharts"],
          },
        },
      },
    },
    esbuild: {
      logOverride: {
        "this-is-undefined-in-esm": "silent",
        "unsupported-jsx-comment": "silent",
        "unused-import": "silent",
        "unsupported-syntax": "silent",
      },
      tsconfigRaw: {
        compilerOptions: {
          jsx: "react-jsx",
          skipLibCheck: true,
          noEmit: true,
        },
      },
    },
    optimizeDeps: {
      esbuildOptions: {
        target: "es2020",
        jsx: "automatic",
        plugins: [
          {
            name: "ignore-missing-deps",
            setup(build) {
              build.onResolve({ filter: /.*/ }, (args) => {
                if (
                  args.path.includes("framer-motion") ||
                  args.path.includes("recharts") ||
                  args.path.includes("../../types/")
                ) {
                  return { path: args.path, external: true };
                }
                return null;
              });
            },
          },
        ],
      },
      include: ["react", "react-dom", "framer-motion", "recharts", "notistack"],
    },
  };
});
