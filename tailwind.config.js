/** @type {import('tailwindcss').Config} */
module.exports = {
  // Light-only site. 'class' keeps Stitch's leftover `dark:` variants inert
  // (no `.dark` ancestor is ever set) instead of activating them on dark-mode devices.
  "darkMode": "class",
  "content": [
    "./site/**/*.html"
  ],
  "theme": {
    "extend": {
      "colors": {
        "background": "#f7f9fb",
        "error": "#ba1a1a",
        "error-container": "#ffdad6",
        "inverse-on-surface": "#eff1f3",
        "inverse-primary": "#6bd8cb",
        "inverse-surface": "#2d3133",
        "on-background": "#191c1e",
        "on-error": "#ffffff",
        "on-error-container": "#93000a",
        "on-primary": "#ffffff",
        "on-primary-container": "#f4fffc",
        "on-primary-fixed": "#00201d",
        "on-primary-fixed-variant": "#005049",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#fefcff",
        "on-secondary-fixed": "#00174b",
        "on-secondary-fixed-variant": "#003ea8",
        "on-surface": "#191c1e",
        "on-surface-variant": "#3d4947",
        "on-tertiary": "#ffffff",
        "on-tertiary-container": "#f6fff5",
        "on-tertiary-fixed": "#00210f",
        "on-tertiary-fixed-variant": "#00522d",
        "outline": "#6d7a77",
        "outline-variant": "#bcc9c6",
        "primary": "#00685f",
        "primary-container": "#008378",
        "primary-fixed": "#89f5e7",
        "primary-fixed-dim": "#6bd8cb",
        "secondary": "#0051d5",
        "secondary-container": "#316bf3",
        "secondary-fixed": "#dbe1ff",
        "secondary-fixed-dim": "#b4c5ff",
        "surface": "#f7f9fb",
        "surface-bright": "#f7f9fb",
        "surface-container": "#eceef0",
        "surface-container-high": "#e6e8ea",
        "surface-container-highest": "#e0e3e5",
        "surface-container-low": "#f2f4f6",
        "surface-container-lowest": "#ffffff",
        "surface-dim": "#d8dadc",
        "surface-tint": "#006a61",
        "surface-variant": "#e0e3e5",
        "tertiary": "#006a3c",
        "tertiary-container": "#08864e",
        "tertiary-fixed": "#8ff8b4",
        "tertiary-fixed-dim": "#73db9a"
      },
      "borderRadius": {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "2xl": "1rem",
        "full": "9999px"
      },
      "spacing": {
        "base": "8px",
        "container-max": "1280px",
        "gutter": "24px",
        "margin-desktop": "64px",
        "margin-mobile": "20px"
      },
      "maxWidth": {
        "container-max": "1280px"
      },
      "fontFamily": {
        "body-lg": [
          "Inter",
          "sans-serif"
        ],
        "body-md": [
          "Inter",
          "sans-serif"
        ],
        "caption": [
          "Inter",
          "sans-serif"
        ],
        "headline-lg": [
          "Inter",
          "sans-serif"
        ],
        "headline-lg-mobile": [
          "Inter",
          "sans-serif"
        ],
        "headline-md": [
          "Inter",
          "sans-serif"
        ],
        "headline-sm": [
          "Inter",
          "sans-serif"
        ],
        "label-md": [
          "Inter",
          "sans-serif"
        ],
        "body": [
          "Inter",
          "sans-serif"
        ],
        "sans": [
          "Inter",
          "sans-serif"
        ]
      },
      "fontSize": {
        "body-lg": [
          "18px",
          {
            "lineHeight": "28px",
            "fontWeight": "400"
          }
        ],
        "body-md": [
          "16px",
          {
            "lineHeight": "24px",
            "fontWeight": "400"
          }
        ],
        "caption": [
          "12px",
          {
            "lineHeight": "16px",
            "fontWeight": "400"
          }
        ],
        "headline-lg": [
          "48px",
          {
            "lineHeight": "56px",
            "fontWeight": "700",
            "letterSpacing": "-0.02em"
          }
        ],
        "headline-lg-mobile": [
          "32px",
          {
            "lineHeight": "40px",
            "fontWeight": "700",
            "letterSpacing": "-0.02em"
          }
        ],
        "headline-md": [
          "30px",
          {
            "lineHeight": "38px",
            "fontWeight": "600",
            "letterSpacing": "-0.01em"
          }
        ],
        "headline-sm": [
          "24px",
          {
            "lineHeight": "32px",
            "fontWeight": "600"
          }
        ],
        "label-md": [
          "14px",
          {
            "lineHeight": "20px",
            "fontWeight": "500",
            "letterSpacing": "0.05em"
          }
        ]
      }
    }
  },
  "plugins": [require("@tailwindcss/forms"), require("@tailwindcss/container-queries")]
}
