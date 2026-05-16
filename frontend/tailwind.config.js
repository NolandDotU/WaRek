/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#10b981",
        "primary-light": "#d1fae5",
        "primary-dark": "#047857",
        accent: "#3b82f6",
        "accent-light": "#dbeafe",
        success: "#10b981",
        "success-light": "#d1fae5",
        warning: "#f59e0b",
        "warning-light": "#fef3c7",
        error: "#ef4444",
        "error-light": "#fee2e2",
        surface: "#ffffff",
        "surface-hover": "#f9fafb",
        "surface-secondary": "#f3f4f6",
        border: "#e5e7eb",
        text: "#111827",
        "text-secondary": "#6b7280",
        "text-muted": "#9ca3af",
      },
      fontFamily: {
        display: "'Plus Jakarta Sans', sans-serif",
        body: "'Plus Jakarta Sans', sans-serif",
      },
      borderRadius: {
        DEFAULT: "8px",
        lg: "12px",
        xl: "16px",
      },
      spacing: {
        "4.5": "1.125rem",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        sm: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
      },
    },
  },
  plugins: [],
}

