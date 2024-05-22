/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx,vue}',
  ],
  theme: {
    extend: {
      backgroundColor: {
        'vscode-side-bar': 'var(--vscode-sideBar-background)',
        'vscode-cmd-center': 'var(--vscode-commandCenter-background)'
      },
      borderColor: {
        vscode: 'var(--vscode-sideBar-border)'
      },
      borderWidth: {
        '1': '1px'
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    require('daisyui')
  ],
  daisyui: {
    base: false,
    themes: [{
      'dark': {
        ...require('daisyui/src/theming/themes')["dark"],
        "--rounded-box": "calc(var(--corner-radius-round) * 1px)",
      }
    }]
  },
};
