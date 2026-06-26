/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
    ],

    theme: {
        extend: {
            colors: {
                cream: {
                    50: "#FAFAF5",
                    100: "#F5F5EE",
                    200: "#ECECDD",
                },

                gold: {
                    300: "#E6C58A",
                    400: "#DDB36A",
                    500: "#D4A574",
                    600: "#C19A58",
                },

                sanctuary: {
                    50: "#F3E3EB",
                    100: "#FCDBED",
                    200: "#E49AC2",
                    400: "#6D2E50",
                    600: "#2D0A1B",
                    700: "#31061C",
                    860: "#3B0D1F",
                    900: "#3F0F1E",
                    950: "#3F061C",
                },

                wine: {
                    900: "#3F0F1E",
                },
            },
        },
    },

    plugins: [],
};