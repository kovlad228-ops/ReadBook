const { app, BrowserWindow, Menu, shell } = require("electron");
const path = require("path");

const appUrl = process.env.LITERA_APP_URL || "https://glittery-fudge-3dcaa3.netlify.app";

function createMainWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 900,
    minHeight: 620,
    title: "Litera Reader",
    backgroundColor: "#e8eef0",
    show: false,
    icon: path.join(__dirname, "..", "icons", "icon-512.png"),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (isAppUrl(url)) return { action: "allow" };
    shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.webContents.on("will-navigate", (event, url) => {
    if (isAppUrl(url)) return;
    event.preventDefault();
    shell.openExternal(url);
  });

  mainWindow.webContents.on("did-fail-load", () => {
    mainWindow.loadURL(createOfflinePage());
  });

  mainWindow.loadURL(appUrl);
}

function isAppUrl(rawUrl) {
  try {
    return new URL(rawUrl).origin === new URL(appUrl).origin;
  } catch {
    return false;
  }
}

function createOfflinePage() {
  const html = `
    <!doctype html>
    <html lang="ru">
      <head>
        <meta charset="utf-8" />
        <title>Litera Reader</title>
        <style>
          body {
            display: grid;
            min-height: 100vh;
            margin: 0;
            place-items: center;
            background: #e8eef0;
            color: #20242a;
            font-family: Inter, "Segoe UI", sans-serif;
          }
          main {
            width: min(520px, calc(100vw - 40px));
            padding: 34px;
            border: 1px solid #d8e0df;
            border-radius: 8px;
            background: #fffefa;
            box-shadow: 0 24px 70px rgba(31, 46, 56, 0.16);
            text-align: center;
          }
          h1 {
            margin: 0 0 10px;
            font-size: 28px;
          }
          p {
            margin: 0 0 22px;
            color: #68727b;
            line-height: 1.5;
          }
          button {
            min-height: 42px;
            padding: 0 18px;
            border: 0;
            border-radius: 8px;
            background: #247c7a;
            color: white;
            cursor: pointer;
            font: inherit;
            font-weight: 760;
          }
        </style>
      </head>
      <body>
        <main>
          <h1>Litera Reader</h1>
          <p>Не удалось открыть приложение. Проверьте интернет и попробуйте снова.</p>
          <button onclick="location.href='${escapeAttribute(appUrl)}'">Повторить</button>
        </main>
      </body>
    </html>
  `;

  return `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
}

function escapeAttribute(value) {
  return String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  createMainWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
