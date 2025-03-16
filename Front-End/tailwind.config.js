/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}","./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors:{
        specialGreen:"#4C8479",
        TrmesColor:"#2C534B",
        specialGray:"#BED2D0",
        foncyGreen:"#2B524A",
        foncyYellow:"#F8A100",
      },
      textShadow: {
        custom: "8px 1px 10px #ffffff",
      },
      
    },
  },
  plugins: []
  ,
}