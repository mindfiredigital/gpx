module.exports = {
    darkMode: ["class", "[data-theme=\"dark\"]"],
    content: [
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
        "./docs/**/*.{md,mdx}",
    ],
    corePlugins: {
        preflight: false,
    },
    theme: {
        extend: {},
    },
};