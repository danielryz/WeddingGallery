// tailwind.config.js
module.exports = {
    theme: {
        extend: {
            colors: {
                cream: '#FEFBEA',   // jasny kremowy (tło)
                gold:  '#D4AF37',   // złoty akcent
                brown: '#5A4633',   // ciemny brąz (tekst)
            },
            fontFamily: {
                elegant: ['"Playfair Display"', 'serif'], // elegancka czcionka serif
            },
        }
    },
    plugins: [
        require('@tailwindcss/aspect-ratio'), // opcjonalnie, do obsługi aspect-square
    ]
}
