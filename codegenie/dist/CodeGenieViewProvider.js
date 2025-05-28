"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeGenieViewProvider = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
class CodeGenieViewProvider {
    constructor(context) {
        this.context = context;
    }
    resolveWebviewView(webviewView, context, _token) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.file(path.join(this.context.extensionPath, "src", "codegenie-ui", "build")),
            ],
        };
        const webviewDistPath = path.join(this.context.extensionPath, "src", "codegenie-ui", "build");
        const indexPath = path.join(webviewDistPath, "index.html");
        try {
            let html = fs.readFileSync(indexPath, "utf8");
            if (!html.includes('Content-Security-Policy')) {
                html = html.replace(/<head>/i, `<head>
            <meta http-equiv="Content-Security-Policy" 
                  content="default-src 'none'; 
                          connect-src http://127.0.0.1:8000 vscode-resource:; 
                          img-src vscode-resource: https:; 
                          script-src vscode-resource: 'unsafe-inline'; 
                          style-src vscode-resource: 'unsafe-inline'; 
                          font-src vscode-resource:;">
          `);
            }
            html = html.replace(/(src|href)="(?!https?:\/\/)(.*?)"/g, (match, attr, src) => {
                const resourceUri = webviewView.webview.asWebviewUri(vscode.Uri.file(path.join(webviewDistPath, src)));
                return `${attr}="${resourceUri}"`;
            });
            webviewView.webview.html = html;
        }
        catch (error) {
            console.error("❌ Failed to load Webview:", error);
            webviewView.webview.html = `<h1>Error loading UI</h1><p>${error.message}</p>`;
        }
        webviewView.webview.onDidReceiveMessage((message) => __awaiter(this, void 0, void 0, function* () {
            if (message.type === "insertCode") {
                try {
                    // Try to get the last active text editor
                    let editor = vscode.window.activeTextEditor;
                    if (!editor) {
                        vscode.window.showErrorMessage("No active editor. Please open a file to insert code.");
                        return;
                    }
                    // Always focus the editor before inserting
                    yield vscode.window.showTextDocument(editor.document, editor.viewColumn, false);
                    // Wait a tick for focus to update
                    setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                        // Get the (now) active editor again
                        editor = vscode.window.activeTextEditor;
                        if (!editor) {
                            vscode.window.showErrorMessage("No active editor after focusing.");
                            return;
                        }
                        const success = yield editor.edit(editBuilder => {
                            editBuilder.insert(editor.selection.active, message.code);
                        });
                        if (!success) {
                            vscode.window.showErrorMessage("Failed to insert code. Please try again.");
                        }
                    }), 10); // 10ms delay to ensure focus
                }
                catch (err) {
                    vscode.window.showErrorMessage("Error inserting code: " + err.message);
                }
            }
        }));
    }
    postMessage(message) {
        if (this._view) {
            this._view.webview.postMessage(message);
        }
        else {
            vscode.window.showErrorMessage("CodeGenie panel is not visible.");
        }
    }
}
exports.CodeGenieViewProvider = CodeGenieViewProvider;
CodeGenieViewProvider.viewType = "codegenieView";
