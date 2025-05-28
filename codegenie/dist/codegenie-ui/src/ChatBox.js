"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const api_1 = require("./api");
const prism_1 = require("react-syntax-highlighter/dist/esm/styles/prism");
const react_syntax_highlighter_1 = require("react-syntax-highlighter");
const io5_1 = require("react-icons/io5");
const hi_1 = require("react-icons/hi");
const bs_1 = require("react-icons/bs");
const bs_2 = require("react-icons/bs");
const lu_1 = require("react-icons/lu");
const io_1 = require("react-icons/io");
const react_markdown_1 = __importDefault(require("react-markdown"));
const ThemeSwitcher_1 = __importDefault(require("./ThemeSwitcher"));
require("./styles.css");
const ChatBox = () => {
    const [messages, setMessages] = (0, react_1.useState)([]);
    const [input, setInput] = (0, react_1.useState)("");
    const [isTyping, setIsTyping] = (0, react_1.useState)(false);
    const [isOnline, setIsOnline] = (0, react_1.useState)(false);
    const [copiedIndex, setCopiedIndex] = (0, react_1.useState)(null);
    const chatRef = (0, react_1.useRef)(null);
    const bottomRef = (0, react_1.useRef)(null);
    const textareaRef = (0, react_1.useRef)(null);
    const fileInputRef = (0, react_1.useRef)(null);
    const [pendingFiles, setPendingFiles] = (0, react_1.useState)([]);
    const [pendingFileContents, setPendingFileContents] = (0, react_1.useState)([]);
    const [showHelpPopup, setShowHelpPopup] = (0, react_1.useState)(false);
    const [showFullHelp, setShowFullHelp] = (0, react_1.useState)(false);
    function extractCodeBlocksWithLang(text) {
        const codeRegex = /```(\w+)?\n([\s\S]*?)```/g;
        let match;
        const codeBlocks = [];
        while ((match = codeRegex.exec(text)) !== null) {
            codeBlocks.push({
                lang: match[1] || "text",
                code: match[2].trim()
            });
        }
        return codeBlocks;
    }
    function removeCodeBlocks(text) {
        return text.replace(/```(?:[\w]*)?\n[\s\S]*?```/g, "").trim();
    }
    const renderMessage = (msg) => {
        if (msg.sender === "bot") {
            const codeBlocks = extractCodeBlocksWithLang(msg.text);
            const displayText = removeCodeBlocks(msg.text);
            return ((0, jsx_runtime_1.jsxs)("div", Object.assign({ className: "bot-message" }, { children: [displayText && ((0, jsx_runtime_1.jsx)("div", Object.assign({ className: "markdown", style: { whiteSpace: "pre-wrap", wordBreak: "break-word" } }, { children: (0, jsx_runtime_1.jsx)(react_markdown_1.default, { children: displayText }) }))), codeBlocks.map(({ lang, code }, idx) => ((0, jsx_runtime_1.jsxs)("div", Object.assign({ className: "code-block" }, { children: [(0, jsx_runtime_1.jsx)(react_syntax_highlighter_1.Prism, Object.assign({ language: lang, style: prism_1.darcula, wrapLongLines: true, customStyle: { whiteSpace: "pre-wrap", wordBreak: "break-word" } }, { children: code })), (0, jsx_runtime_1.jsxs)("div", Object.assign({ className: "code-actions" }, { children: [(0, jsx_runtime_1.jsx)("button", Object.assign({ onClick: () => handleCopy(code, idx) }, { children: copiedIndex === idx ? "Copied" : (0, jsx_runtime_1.jsx)(bs_2.BsCopy, { size: 15 }) })), (0, jsx_runtime_1.jsx)("button", Object.assign({ onClick: () => {
                                            var _a, _b;
                                            const vscode = (_b = (_a = window).acquireVsCodeApi) === null || _b === void 0 ? void 0 : _b.call(_a);
                                            if (vscode) {
                                                vscode.postMessage({ type: "insertCode", code });
                                            }
                                        } }, { children: (0, jsx_runtime_1.jsx)(lu_1.LuFileCode2, { size: 15 }) }))] }))] }), idx)))] })));
        }
        return (0, jsx_runtime_1.jsx)("pre", Object.assign({ className: "user-message" }, { children: msg.text }));
    };
    const handleCopy = (code, index) => {
        navigator.clipboard.writeText(code);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 5000);
    };
    (0, react_1.useEffect)(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            const scrollHeight = textarea.scrollHeight;
            const maxHeight = 120;
            const minHeight = 40;
            if (scrollHeight > minHeight) {
                textarea.style.height = Math.min(scrollHeight, maxHeight) + "px";
                textarea.style.overflowY = scrollHeight > maxHeight ? "auto" : "hidden";
            }
            else {
                textarea.style.height = minHeight + "px";
                textarea.style.overflowY = "hidden";
            }
        }
    }, [input]);
    (0, react_1.useEffect)(() => {
        const timeout = setTimeout(() => {
            var _a;
            (_a = bottomRef.current) === null || _a === void 0 ? void 0 : _a.scrollIntoView({ behavior: "smooth" });
        }, 0);
        return () => clearTimeout(timeout);
    }, [messages, isTyping]);
    (0, react_1.useEffect)(() => {
        function handleVsCodeMessage(event) {
            const message = event.data;
            if (message && message.type === "explainCode") {
                // Show selected code as user message
                setMessages(prev => [
                    ...prev,
                    { text: `Explain this code:\n\n${message.code}`, sender: "user" }
                ]);
                setIsTyping(true);
                // Call your backend /explain endpoint
                fetch("http://127.0.0.1:8000/explain", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        prompt: message.code,
                        max_tokens: 2048
                    })
                })
                    .then(res => res.json())
                    .then(data => {
                    setMessages(prev => [
                        ...prev,
                        { text: data.response, sender: "bot" }
                    ]);
                })
                    .catch(() => {
                    setMessages(prev => [
                        ...prev,
                        { text: "❌ Error: Could not explain code.", sender: "bot" }
                    ]);
                })
                    .finally(() => setIsTyping(false));
            }
        }
        window.addEventListener("message", handleVsCodeMessage);
        return () => window.removeEventListener("message", handleVsCodeMessage);
    }, []);
    const sendMessage = () => __awaiter(void 0, void 0, void 0, function* () {
        if (!input.trim() && pendingFiles.length === 0)
            return;
        if (pendingFiles.length > 0 && pendingFileContents.length < pendingFiles.length)
            return;
        // What to show in chat history:
        let userDisplay = input.trim();
        if (pendingFiles.length > 0) {
            userDisplay += (userDisplay ? "\n" : "") + "Attachments: " + pendingFiles.map(f => f.name).join(", ");
        }
        // What to send to backend:
        let promptToSend = input.trim();
        if (pendingFiles.length > 0) {
            pendingFiles.forEach((file, idx) => {
                promptToSend += `\n\nFile: ${file.name}\n\n${pendingFileContents[idx]}`;
            });
        }
        setMessages(prev => [
            ...prev,
            { text: userDisplay, sender: "user" }
        ]);
        setInput("");
        setPendingFiles([]);
        setPendingFileContents([]);
        setIsTyping(true);
        try {
            const API_URL = pendingFiles.length > 0
                ? "http://127.0.0.1:8000/generate-large"
                : "http://127.0.0.1:8000/generate";
            const maxTokens = pendingFiles.length > 0 ? 4096 : 1000;
            const aiResponse = yield (0, api_1.fetchAICompletion)(promptToSend, API_URL, maxTokens);
            setMessages(prev => [...prev, { text: aiResponse, sender: "bot" }]);
        }
        catch (error) {
            console.error("API Error:", error);
            setMessages(prev => [
                ...prev,
                {
                    text: "❌ Error: Failed to get response from AI backend. Please check your connection.",
                    sender: "bot"
                }
            ]);
        }
        setIsTyping(false);
    });
    const handleFileUpload = (e) => {
        const files = e.target.files;
        if (!files)
            return;
        const filesArray = Array.from(files);
        setPendingFiles(prev => [...prev, ...filesArray]);
        // Read all files as text
        filesArray.forEach((file) => {
            const reader = new FileReader();
            reader.onload = () => {
                setPendingFileContents(prev => [...prev, reader.result]);
            };
            reader.readAsText(file);
        });
    };
    return ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", Object.assign({ className: "theme-switcher-fixed" }, { children: (0, jsx_runtime_1.jsx)(ThemeSwitcher_1.default, {}) })), (0, jsx_runtime_1.jsx)("div", Object.assign({ className: "help-button-fixed" }, { children: (0, jsx_runtime_1.jsx)("button", Object.assign({ className: "help-button", onClick: () => setShowHelpPopup(true), "aria-label": "Show help", title: "Show CodeGenie Help" }, { children: (0, jsx_runtime_1.jsx)(io_1.IoMdHelp, { size: 14 }) })) })), (0, jsx_runtime_1.jsxs)("div", Object.assign({ className: "chatbox-container" }, { children: [(0, jsx_runtime_1.jsxs)("div", Object.assign({ className: "chatbox-history", ref: chatRef }, { children: [messages.map((msg, index) => ((0, jsx_runtime_1.jsx)("div", Object.assign({ className: `message-bubble ${msg.sender === "user" ? "user-bubble" : "bot-bubble"}` }, { children: renderMessage(msg) }), index))), isTyping && (0, jsx_runtime_1.jsx)("div", Object.assign({ className: "typing-indicator" }, { children: "CodeGenie is thinking..." })), (0, jsx_runtime_1.jsx)("div", { ref: bottomRef })] })), (0, jsx_runtime_1.jsxs)("div", Object.assign({ className: "chatbox-input-area", style: { flexDirection: "column", alignItems: "stretch" } }, { children: [pendingFiles.length > 0 && ((0, jsx_runtime_1.jsx)("div", Object.assign({ style: { display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "8px" } }, { children: pendingFiles.map((file, idx) => ((0, jsx_runtime_1.jsxs)("div", Object.assign({ className: "attached-file-chip show" }, { children: [(0, jsx_runtime_1.jsx)("span", Object.assign({ className: "file-name" }, { children: file.name })), (0, jsx_runtime_1.jsx)("button", Object.assign({ className: "remove-file-btn", "aria-label": `Remove ${file.name}`, onClick: () => {
                                                setPendingFiles(pendingFiles.filter((_, i) => i !== idx));
                                                setPendingFileContents(pendingFileContents.filter((_, i) => i !== idx));
                                            } }, { children: "\u2716" }))] }), file.name + idx))) }))), (0, jsx_runtime_1.jsxs)("div", Object.assign({ className: "input-row", style: { display: "flex", alignItems: "center", gap: "10px" } }, { children: [(0, jsx_runtime_1.jsx)("button", Object.assign({ className: "action-button", onClick: () => { var _a; return (_a = fileInputRef.current) === null || _a === void 0 ? void 0 : _a.click(); }, title: "Attachments" }, { children: (0, jsx_runtime_1.jsx)(io5_1.IoAddCircleOutline, { size: 20 }) })), (0, jsx_runtime_1.jsx)("input", { type: "file", ref: fileInputRef, style: { display: "none" }, multiple: true, onChange: handleFileUpload }), (0, jsx_runtime_1.jsx)("button", Object.assign({ className: "action-button", onClick: () => setIsOnline(prev => !prev), title: isOnline ? "RTX Mode (Remote)" : "Local Mode (on device)" }, { children: isOnline ? (0, jsx_runtime_1.jsx)(bs_1.BsPciCard, { size: 20 }) : (0, jsx_runtime_1.jsx)(hi_1.HiDesktopComputer, { size: 20 }) })), (0, jsx_runtime_1.jsx)("textarea", { ref: textareaRef, className: "chatbox-input", placeholder: "Type your task here", value: input, onChange: (e) => setInput(e.target.value), onKeyDown: (e) => {
                                            if (e.key === "Enter" && !e.shiftKey) {
                                                e.preventDefault();
                                                sendMessage();
                                            }
                                        } }), (0, jsx_runtime_1.jsx)("button", Object.assign({ className: "send-button", onClick: sendMessage, disabled: isTyping ||
                                            (pendingFiles.length > 0 && pendingFileContents.length < pendingFiles.length) }, { children: (0, jsx_runtime_1.jsx)(io5_1.IoSendOutline, { size: 25 }) }))] }))] })), showHelpPopup && ((0, jsx_runtime_1.jsx)("div", Object.assign({ className: "help-popup-overlay", onClick: () => setShowHelpPopup(false) }, { children: (0, jsx_runtime_1.jsxs)("div", Object.assign({ className: "help-popup", onClick: e => e.stopPropagation() }, { children: [(0, jsx_runtime_1.jsx)("h2", { children: "CodeGenie Quick Help" }), (0, jsx_runtime_1.jsxs)("ul", { children: [(0, jsx_runtime_1.jsxs)("li", { children: ["\uD83D\uDCAC ", (0, jsx_runtime_1.jsx)("b", { children: "Chat with AI" }), " about code and tasks"] }), (0, jsx_runtime_1.jsxs)("li", { children: ["\uD83D\uDCCE ", (0, jsx_runtime_1.jsx)("b", { children: "Attach multiple files" }), " for context-aware analysis"] }), (0, jsx_runtime_1.jsxs)("li", { children: ["\uD83D\uDDB1\uFE0F ", (0, jsx_runtime_1.jsx)("b", { children: "Right-click code" }), " for Explain, Debug, or Improve"] }), (0, jsx_runtime_1.jsxs)("li", { children: ["\uD83D\uDCA1 ", (0, jsx_runtime_1.jsx)("b", { children: "Generate code" }), " or comments from prompts"] }), (0, jsx_runtime_1.jsxs)("li", { children: ["\uD83D\uDC1E ", (0, jsx_runtime_1.jsx)("b", { children: "Debug code" }), " for instant error analysis"] }), (0, jsx_runtime_1.jsxs)("li", { children: ["\uD83C\uDF13 ", (0, jsx_runtime_1.jsx)("b", { children: "Switch themes" }), " with the moon/sun icon"] }), (0, jsx_runtime_1.jsxs)("li", { children: ["\u26A1 ", (0, jsx_runtime_1.jsx)("b", { children: "Inline completions" }), " for code suggestions"] })] }), (0, jsx_runtime_1.jsx)("button", Object.assign({ className: "more-button", onClick: () => { setShowFullHelp(true); setShowHelpPopup(false); } }, { children: "More" })), (0, jsx_runtime_1.jsx)("button", Object.assign({ className: "close-button", onClick: () => setShowHelpPopup(false) }, { children: "Close" }))] })) }))), showHelpPopup && ((0, jsx_runtime_1.jsx)("div", Object.assign({ className: "help-popup-overlay", onClick: () => setShowHelpPopup(false) }, { children: (0, jsx_runtime_1.jsxs)("div", Object.assign({ className: "help-popup", onClick: e => e.stopPropagation() }, { children: [(0, jsx_runtime_1.jsx)("h2", { children: "CodeGenie Quick Help" }), (0, jsx_runtime_1.jsxs)("ul", { children: [(0, jsx_runtime_1.jsxs)("li", { children: ["\uD83D\uDCAC ", (0, jsx_runtime_1.jsx)("b", { children: "Chat with AI" }), " about code and tasks"] }), (0, jsx_runtime_1.jsxs)("li", { children: ["\uD83D\uDCCE ", (0, jsx_runtime_1.jsx)("b", { children: "Attach multiple files" }), " for context-aware analysis"] }), (0, jsx_runtime_1.jsxs)("li", { children: ["\uD83D\uDDB1 ", (0, jsx_runtime_1.jsx)("b", { children: "Right-click code" }), " for Explain, Debug, or Improve"] }), (0, jsx_runtime_1.jsxs)("li", { children: ["\uD83D\uDCA1 ", (0, jsx_runtime_1.jsx)("b", { children: "Generate code" }), " or comments from prompts"] }), (0, jsx_runtime_1.jsxs)("li", { children: ["\uD83D\uDC1E ", (0, jsx_runtime_1.jsx)("b", { children: "Debug code" }), " for instant error analysis"] }), (0, jsx_runtime_1.jsxs)("li", { children: ["\uD83C\uDF13 ", (0, jsx_runtime_1.jsx)("b", { children: "Switch themes" }), " with the moon/sun icon"] }), (0, jsx_runtime_1.jsxs)("li", { children: ["\u26A1 ", (0, jsx_runtime_1.jsx)("b", { children: "Inline completions" }), " for code suggestions"] })] }), (0, jsx_runtime_1.jsx)("button", Object.assign({ className: "more-button", onClick: () => { setShowFullHelp(true); setShowHelpPopup(false); } }, { children: "More" })), (0, jsx_runtime_1.jsx)("button", Object.assign({ className: "close-button", onClick: () => setShowHelpPopup(false) }, { children: "Close" }))] })) }))), showFullHelp && ((0, jsx_runtime_1.jsx)("div", Object.assign({ className: "help-full-overlay", onClick: () => setShowFullHelp(false) }, { children: (0, jsx_runtime_1.jsxs)("div", Object.assign({ className: "help-full-page", onClick: e => e.stopPropagation() }, { children: [(0, jsx_runtime_1.jsx)("h1", { children: "CodeGenie: Full Guide" }), (0, jsx_runtime_1.jsx)("h2", { children: "Feature, Commands, Access & Usage" }), (0, jsx_runtime_1.jsxs)("table", Object.assign({ className: "cg-feature-table" }, { children: [(0, jsx_runtime_1.jsx)("thead", { children: (0, jsx_runtime_1.jsxs)("tr", { children: [(0, jsx_runtime_1.jsx)("th", { children: "Feature" }), (0, jsx_runtime_1.jsx)("th", { children: "Command" }), (0, jsx_runtime_1.jsx)("th", { children: "How to Access" }), (0, jsx_runtime_1.jsx)("th", { children: "When to Use" })] }) }), (0, jsx_runtime_1.jsxs)("tbody", { children: [(0, jsx_runtime_1.jsxs)("tr", { children: [(0, jsx_runtime_1.jsx)("td", { children: "Generate Code" }), (0, jsx_runtime_1.jsx)("td", { children: (0, jsx_runtime_1.jsx)("code", { children: "codegenie.getCode" }) }), (0, jsx_runtime_1.jsx)("td", { children: "Command Palette, Sidebar, Right-click" }), (0, jsx_runtime_1.jsx)("td", { children: "When you want to generate new code from a prompt." })] }), (0, jsx_runtime_1.jsxs)("tr", { children: [(0, jsx_runtime_1.jsx)("td", { children: "Generate from Last Comment" }), (0, jsx_runtime_1.jsx)("td", { children: (0, jsx_runtime_1.jsx)("code", { children: "codegenie.generateFromComment" }) }), (0, jsx_runtime_1.jsx)("td", { children: "Command Palette" }), (0, jsx_runtime_1.jsx)("td", { children: "To generate code based on your last code comment." })] }), (0, jsx_runtime_1.jsxs)("tr", { children: [(0, jsx_runtime_1.jsx)("td", { children: "Trigger Inline Completion" }), (0, jsx_runtime_1.jsx)("td", { children: (0, jsx_runtime_1.jsx)("code", { children: "codegenie.triggerInlineCompletion" }) }), (0, jsx_runtime_1.jsxs)("td", { children: ["Command Palette, ", (0, jsx_runtime_1.jsx)("kbd", { children: "Ctrl+T Ctrl+I" })] }), (0, jsx_runtime_1.jsx)("td", { children: "For Copilot-style inline code suggestions." })] }), (0, jsx_runtime_1.jsxs)("tr", { children: [(0, jsx_runtime_1.jsx)("td", { children: "Debug Selected Code" }), (0, jsx_runtime_1.jsx)("td", { children: (0, jsx_runtime_1.jsx)("code", { children: "codegenie.debugSelectedCode" }) }), (0, jsx_runtime_1.jsx)("td", { children: "Right-click, Command Palette" }), (0, jsx_runtime_1.jsx)("td", { children: "To analyze selected code for errors and get fixes." })] }), (0, jsx_runtime_1.jsxs)("tr", { children: [(0, jsx_runtime_1.jsx)("td", { children: "Explain Code" }), (0, jsx_runtime_1.jsx)("td", { children: (0, jsx_runtime_1.jsx)("code", { children: "codegenie.explainCode" }) }), (0, jsx_runtime_1.jsx)("td", { children: "Right-click, Command Palette" }), (0, jsx_runtime_1.jsx)("td", { children: "When you want a plain-language explanation of code." })] }), (0, jsx_runtime_1.jsxs)("tr", { children: [(0, jsx_runtime_1.jsx)("td", { children: "Improve Code" }), (0, jsx_runtime_1.jsx)("td", { children: (0, jsx_runtime_1.jsx)("code", { children: "codegenie.improveCode" }) }), (0, jsx_runtime_1.jsx)("td", { children: "Right-click, Command Palette" }), (0, jsx_runtime_1.jsx)("td", { children: "To optimize, clean up, or refactor existing code." })] }), (0, jsx_runtime_1.jsxs)("tr", { children: [(0, jsx_runtime_1.jsx)("td", { children: "Enable/Disable" }), (0, jsx_runtime_1.jsxs)("td", { children: [(0, jsx_runtime_1.jsx)("code", { children: "codegenie.enable" }), (0, jsx_runtime_1.jsx)("br", {}), (0, jsx_runtime_1.jsx)("code", { children: "codegenie.disable" })] }), (0, jsx_runtime_1.jsx)("td", { children: "Command Palette" }), (0, jsx_runtime_1.jsx)("td", { children: "To turn CodeGenie on or off in VS Code." })] })] })] })), (0, jsx_runtime_1.jsx)("h2", { children: "Multi-file Support" }), (0, jsx_runtime_1.jsxs)("p", { children: [(0, jsx_runtime_1.jsx)("b", { children: "Attach multiple files" }), " using the ", (0, jsx_runtime_1.jsx)("b", { children: "paperclip" }), " icon in the chat input.", (0, jsx_runtime_1.jsx)("br", {}), "All files will be analyzed together for better, context-aware answers and code generation.", (0, jsx_runtime_1.jsx)("br", {}), (0, jsx_runtime_1.jsx)("i", { children: "Tip: Remove files before sending if you want to exclude them." })] }), (0, jsx_runtime_1.jsx)("h2", { children: "Access Methods Explained" }), (0, jsx_runtime_1.jsxs)("ul", { children: [(0, jsx_runtime_1.jsxs)("li", { children: [(0, jsx_runtime_1.jsx)("b", { children: "Command Palette" }), ": ", (0, jsx_runtime_1.jsx)("kbd", { children: "Ctrl+Shift+P" }), " (or ", (0, jsx_runtime_1.jsx)("kbd", { children: "Cmd+Shift+P" }), " on Mac), then type the command name."] }), (0, jsx_runtime_1.jsxs)("li", { children: [(0, jsx_runtime_1.jsx)("b", { children: "Sidebar Panel" }), ": Open the CodeGenie AI panel from the sidebar (rocket icon)."] }), (0, jsx_runtime_1.jsxs)("li", { children: [(0, jsx_runtime_1.jsx)("b", { children: "Right-click (Context Menu)" }), ": Select code in the editor, then right-click to see CodeGenie actions."] }), (0, jsx_runtime_1.jsxs)("li", { children: [(0, jsx_runtime_1.jsx)("b", { children: "Keyboard Shortcut" }), ": Use ", (0, jsx_runtime_1.jsx)("kbd", { children: "Ctrl+T Ctrl+I" }), " for inline completions."] })] }), (0, jsx_runtime_1.jsx)("button", Object.assign({ className: "close-button", onClick: () => setShowFullHelp(false) }, { children: "Close" }))] })) })))] }))] }));
};
exports.default = ChatBox;
