"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const md_1 = require("react-icons/md");
const fa_1 = require("react-icons/fa");
const ThemeSwitcher = () => {
    const [theme, setTheme] = (0, react_1.useState)(() => {
        const saved = localStorage.getItem('theme');
        return saved || 'dark';
    });
    (0, react_1.useEffect)(() => {
        document.documentElement.classList.remove('dark', 'light');
        document.documentElement.classList.add(theme);
        localStorage.setItem('theme', theme);
    }, [theme]);
    const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    return ((0, jsx_runtime_1.jsx)("button", Object.assign({ onClick: toggleTheme, className: "theme-toggle-btn", "aria-label": `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`, title: `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme` }, { children: theme === 'dark' ? (0, jsx_runtime_1.jsx)(fa_1.FaRegLightbulb, { size: 22 }) : (0, jsx_runtime_1.jsx)(md_1.MdOutlineDarkMode, { size: 22 }) })));
};
exports.default = ThemeSwitcher;
