import { marked } from "marked"
import DOMPurify from "dompurify"
import githubCss from "github-markdown-css/github-markdown-light.css"

var STORAGE_SOURCE_ID = "unichat_widget_source_id"
var STORAGE_CONV_ID = "unichat_widget_conversation_id"
var STORAGE_INBOX = "unichat_widget_inbox"

var instances = []

marked.setOptions({
  breaks: true,
  gfm: true,
  headerIds: false,
  mangle: false,
})

var PURIFY_CONFIG = {
  ALLOWED_TAGS: [
    "p", "em", "strong", "code", "pre", "ul", "ol", "li", "a",
    "blockquote", "hr", "br",
    "h1", "h2", "h3", "h4", "h5", "h6",
    "img", "table", "thead", "tbody", "tr", "th", "td",
    "del", "span", "div",
  ],
  ALLOWED_ATTR: ["href", "alt", "src", "class", "loading", "referrerpolicy", "title"],
  ALLOW_DATA_ATTR: false,
}

var PURIFY_HOOK_INSTALLED = false

function installPurifyHook() {
  if (PURIFY_HOOK_INSTALLED) return
  DOMPurify.addHook("afterSanitizeAttributes", function (node) {
    if (node.tagName === "A") {
      node.setAttribute("target", "_blank")
      node.setAttribute("rel", "noopener noreferrer")
    }
    if (node.tagName === "IMG") {
      node.setAttribute("loading", "lazy")
      node.setAttribute("referrerpolicy", "no-referrer")
    }
  })
  PURIFY_HOOK_INSTALLED = true
}

function renderContent(text) {
  if (!text) return ""
  installPurifyHook()
  var html = marked.parse(text, { async: false })
  return DOMPurify.sanitize(html, PURIFY_CONFIG)
}

function uuid() {
  if (crypto && crypto.randomUUID) return crypto.randomUUID()
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16)
  })
}

function getSourceId() {
  var id = localStorage.getItem(STORAGE_SOURCE_ID)
  if (!id) {
    id = uuid()
    localStorage.setItem(STORAGE_SOURCE_ID, id)
  }
  return id
}

function injectStyles(css) {
  if (document.getElementById("unichat-widget-styles")) return
  var el = document.createElement("style")
  el.id = "unichat-widget-styles"
  el.textContent = css
  document.head.appendChild(el)
}

function iconChat() {
  return (
    '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>' +
    "</svg>"
  )
}

function iconClose() {
  return (
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>' +
    "</svg>"
  )
}

function iconSend() {
  return (
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>' +
    "</svg>"
  )
}

var styles = [
  "#unichat-widget * { box-sizing:border-box; margin:0; padding:0; }",
  "#unichat-widget {",
  "  font-family: var(--widget-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif);",
  "  position: fixed;",
  "  bottom: var(--widget-position-bottom, 20px);",
  "  right: var(--widget-position-right, 20px);",
  "  z-index: 2147483645;",
  "  --uw-primary: var(--widget-primary-color, #4F46E5);",
  "  --uw-primary-dark: color-mix(in srgb, var(--uw-primary) 85%, #000);",
  "  --uw-radius: 16px;",
  "}",
  "#unichat-widget .uw-btn {",
  "  width: 58px; height: 58px; border-radius: 50%;",
  "  background: var(--uw-primary);",
  "  border: none; cursor: pointer;",
  "  display: flex; align-items: center; justify-content: center;",
  "  box-shadow: 0 6px 20px -4px color-mix(in srgb, var(--uw-primary) 50%, transparent),",
  "              0 2px 8px rgba(0,0,0,0.08);",
  "  transition: transform 0.15s ease, box-shadow 0.15s ease;",
  "}",
  "#unichat-widget .uw-btn:hover {",
  "  transform: translateY(-2px);",
  "  box-shadow: 0 10px 28px -4px color-mix(in srgb, var(--uw-primary) 55%, transparent),",
  "              0 4px 12px rgba(0,0,0,0.1);",
  "}",
  "#unichat-widget .uw-btn:active { transform: translateY(0) scale(0.96); }",
  "#unichat-widget .uw-panel {",
  "  position: absolute; bottom: 70px; right: 0;",
  "  width: 360px; height: 520px;",
  "  background: #fff; border-radius: var(--uw-radius);",
  "  box-shadow: 0 24px 60px -12px rgba(0,0,0,0.18),",
  "              0 8px 24px -8px rgba(0,0,0,0.1);",
  "  display: none; flex-direction: column; overflow: hidden;",
  "  animation: uw-slide-up 0.25s cubic-bezier(0.16, 1, 0.3, 1);",
  "}",
  "@keyframes uw-slide-up {",
  "  from { opacity:0; transform:translateY(12px) scale(0.98); }",
  "  to { opacity:1; transform:translateY(0) scale(1); }",
  "}",
  "@media (max-width:480px) {",
  "  #unichat-widget .uw-panel {",
  "    position: fixed; top: 0; left: 0;",
  "    width: 100%; height: 100vh; border-radius: 0;",
  "  }",
  "  @supports (height: 100dvh) {",
  "    #unichat-widget .uw-panel { height: 100dvh; }",
  "  }",
  "  #unichat-widget .uw-panel.uw-vv-active {",
  "    top: var(--uw-vv-top, 0px);",
  "    height: var(--uw-vv-height, 100vh);",
  "  }",
  "}",
  "#unichat-widget .uw-header {",
  "  background: var(--uw-primary);",
  "  color: #fff; padding: 18px 20px; display: flex;",
  "  align-items: center; justify-content: space-between; flex-shrink: 0;",
  "}",
  "#unichat-widget .uw-header h3 { font-size: 15px; font-weight: 600; letter-spacing: 0.01em; }",
  "#unichat-widget .uw-close {",
  "  background: rgba(255,255,255,0.15); border: none; color: #fff;",
  "  cursor: pointer; opacity: 0.9; padding: 6px; line-height: 0;",
  "  border-radius: 8px; transition: background 0.15s;",
  "}",
  "#unichat-widget .uw-close:hover { background: rgba(255,255,255,0.25); opacity: 1; }",
  "#unichat-widget .uw-messages {",
  "  flex: 1; overflow-y: auto; padding: 20px 16px;",
  "  display: flex; flex-direction: column; gap: 10px;",
  "  background: #FAFAFA;",
  "  -webkit-overflow-scrolling: touch;",
  "}",
  "#unichat-widget .uw-messages::-webkit-scrollbar { width: 5px; }",
  "#unichat-widget .uw-messages::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 10px; }",
  "#unichat-widget .uw-msg {",
  "  max-width: 82%; padding: 10px 14px; border-radius: 16px;",
  "  font-size: 14px; line-height: 1.5; word-wrap: break-word;",
  "}",
  "#unichat-widget .uw-msg.contact {",
  "  align-self: flex-end;",
  "  background: var(--uw-primary); color: #fff;",
  "  border-bottom-right-radius: 5px;",
  "  box-shadow: 0 2px 8px -2px color-mix(in srgb, var(--uw-primary) 40%, transparent);",
  "}",
  "#unichat-widget .uw-msg.agent {",
  "  align-self: flex-start;",
  "  background: #fff; color: #1F2937; border-bottom-left-radius: 5px;",
  "  box-shadow: 0 1px 3px rgba(0,0,0,0.06);",
  "  border: 1px solid #EEF0F2;",
  "}",
  "#unichat-widget .uw-input-bar {",
  "  display: flex; align-items: flex-end; padding: 12px 14px; gap: 10px;",
  "  border-top: 1px solid #EEF0F2; flex-shrink: 0; background: #fff;",
  "}",
  "#unichat-widget .uw-input {",
  "  flex: 1; border: 1px solid #E5E7EB; border-radius: 20px;",
  "  padding: 9px 14px; font-size: 14px; line-height: 1.4; outline: none; font-family: inherit;",
  "  resize: none; min-height: 38px; max-height: 120px; overflow-y: auto;",
  "  transition: border-color 0.15s, box-shadow 0.15s;",
  "}",
  "#unichat-widget .uw-input:focus {",
  "  border-color: var(--uw-primary);",
  "  box-shadow: 0 0 0 3px color-mix(in srgb, var(--uw-primary) 12%, transparent);",
  "}",
  "#unichat-widget .uw-input::placeholder { color: #B0B4BC; }",
  "#unichat-widget .uw-send {",
  "  background: var(--uw-primary);",
  "  border: none; color: #fff; width: 38px; height: 38px;",
  "  border-radius: 50%; cursor: pointer;",
  "  display: flex; align-items: center; justify-content: center;",
  "  flex-shrink: 0; transition: transform 0.15s, opacity 0.15s; line-height: 0;",
  "  box-shadow: 0 2px 8px -2px color-mix(in srgb, var(--uw-primary) 40%, transparent);",
  "}",
  "#unichat-widget .uw-send:hover:not(:disabled) { transform: scale(1.08); }",
  "#unichat-widget .uw-send:active:not(:disabled) { transform: scale(0.94); }",
  "#unichat-widget .uw-send:disabled { opacity: 0.35; cursor: not-allowed; box-shadow: none; }",
  "#unichat-widget .uw-activity {",
  "  text-align: center; color: #9CA3AF; font-size: 12px; padding: 6px 16px;",
  "  font-style: italic; line-height: 1.5; word-wrap: break-word;",
  "}",
  "#unichat-widget .uw-empty {",
  "  text-align: center; color: #B0B4BC; font-size: 14px; padding: 48px 20px;",
  "  line-height: 1.6;",
  "}",
  "@media (max-width:480px) {",
  "  #unichat-widget .uw-input { font-size: 16px; }",
  "}",
].join("\n")

/* Override github-markdown-css defaults for ~360px chat bubbles.
   github-markdown-css targets .markdown-body at 16px root on a full
   page; we shrink it to fit a 14px bubble with tight spacing. */
var widgetMarkdownOverrides = [
  "#unichat-widget .uw-msg .markdown-body,",
  "#unichat-widget .uw-activity .markdown-body {",
  "  font-size: 14px;",
  "  line-height: 1.5;",
  "  color: inherit;",
  "  background: transparent;",
  "  font-family: inherit;",
  "  word-wrap: break-word;",
  "}",
  /* 段落 */
  "#unichat-widget .uw-msg .markdown-body p { margin: 0 0 6px; }",
  "#unichat-widget .uw-msg .markdown-body p:last-child { margin-bottom: 0; }",
  /* 标题缩小 */
  "#unichat-widget .uw-msg .markdown-body h1,",
  "#unichat-widget .uw-msg .markdown-body h2,",
  "#unichat-widget .uw-msg .markdown-body h3,",
  "#unichat-widget .uw-msg .markdown-body h4,",
  "#unichat-widget .uw-msg .markdown-body h5,",
  "#unichat-widget .uw-msg .markdown-body h6 {",
  "  margin: 10px 0 4px; font-weight: 600; line-height: 1.3;",
  "}",
  "#unichat-widget .uw-msg .markdown-body h1 { font-size: 18px; }",
  "#unichat-widget .uw-msg .markdown-body h2 { font-size: 16px; }",
  "#unichat-widget .uw-msg .markdown-body h3 { font-size: 15px; padding-bottom: 0.3em; }",
  "#unichat-widget .uw-msg .markdown-body h4 { font-size: 14px; }",
  "#unichat-widget .uw-msg .markdown-body h5,",
  "#unichat-widget .uw-msg .markdown-body h6 { font-size: 13px; }",
  "#unichat-widget .uw-msg .markdown-body h1:first-child,",
  "#unichat-widget .uw-msg .markdown-body h2:first-child,",
  "#unichat-widget .uw-msg .markdown-body h3:first-child,",
  "#unichat-widget .uw-msg .markdown-body h4:first-child,",
  "#unichat-widget .uw-msg .markdown-body h5:first-child,",
  "#unichat-widget .uw-msg .markdown-body h6:first-child { margin-top: 0; }",
  /* 列表收紧 */
  "#unichat-widget .uw-msg .markdown-body ul,",
  "#unichat-widget .uw-msg .markdown-body ol { margin: 4px 0 6px; padding-left: 22px; }",
  "#unichat-widget .uw-msg .markdown-body li { margin: 2px 0; }",
  "#unichat-widget .uw-msg .markdown-body li + li { margin-top: 2px; }",
  /* 代码块缩小 */
  "#unichat-widget .uw-msg .markdown-body code {",
  "  font-size: 12.5px; padding: 0.2em 0.4em; word-break: break-all;",
  "}",
  "#unichat-widget .uw-msg .markdown-body pre { margin: 6px 0; padding: 10px 12px; }",
  "#unichat-widget .uw-msg .markdown-body pre code { font-size: 12px; }",
  /* 表格：圆角 + 仅水平分隔线（GitHub 风格），适配窄气泡 */
  "#unichat-widget .uw-msg .markdown-body table {",
  "  display: table; width: 100%; font-size: 13px; margin: 6px 0;",
  "  border-collapse: separate; border-spacing: 0;",
  "  border-radius: 8px; overflow: hidden;",
  "}",
  "#unichat-widget .uw-msg .markdown-body th,",
  "#unichat-widget .uw-msg .markdown-body td {",
  "  padding: 6px 10px; border: none;",
  "  border-top: 1px solid rgba(127, 127, 127, 0.2);",
  "  word-break: break-word;",
  "}",
  "#unichat-widget .uw-msg .markdown-body th {",
  "  border-top: none;",
  "  border-bottom: 2px solid rgba(127, 127, 127, 0.28);",
  "  font-weight: 600;",
  "}",
  "#unichat-widget .uw-msg .markdown-body tbody tr:last-child td { border-bottom: none; }",
  /* 引用 */
  "#unichat-widget .uw-msg .markdown-body blockquote { margin: 4px 0; padding: 2px 12px; }",
  /* 分隔线 */
  "#unichat-widget .uw-msg .markdown-body hr { margin: 10px 0; }",
  /* 图片圆角 */
  "#unichat-widget .uw-msg .markdown-body img { border-radius: 10px; margin: 4px 0; }",
  /* 链接 */
  "#unichat-widget .uw-msg .markdown-body a { color: inherit; word-break: break-all; }",
  /* contact 气泡（彩色背景）：代码块/引用/表格边线用半透白 */
  "#unichat-widget .uw-msg.contact .markdown-body pre { background: rgba(0,0,0,0.2); }",
  "#unichat-widget .uw-msg.contact .markdown-body pre code { color: #fff; }",
  "#unichat-widget .uw-msg.contact .markdown-body code { background: rgba(255,255,255,0.2); }",
  "#unichat-widget .uw-msg.contact .markdown-body blockquote { border-left-color: rgba(255,255,255,0.6); }",
  "#unichat-widget .uw-msg.contact .markdown-body table th,",
  "#unichat-widget .uw-msg.contact .markdown-body table td { border-color: rgba(255,255,255,0.2); }",
  "#unichat-widget .uw-msg.contact .markdown-body table th { border-bottom-color: rgba(255,255,255,0.35); }",
  "#unichat-widget .uw-msg.contact .markdown-body table tr:nth-child(2n) { background: rgba(255,255,255,0.06); }",
  "#unichat-widget .uw-msg.contact .markdown-body hr { background: rgba(255,255,255,0.3); }",
  /* activity 消息 */
  "#unichat-widget .uw-activity .markdown-body { font-style: italic; }",
  "#unichat-widget .uw-activity .markdown-body p { margin: 0; }",
].join("\n")

function Widget(options) {
  var self = this
  this.inbox = options.inbox
  this.embedKey = options.embedKey
  this.sourceId = getSourceId()
  this.conversationId = localStorage.getItem(STORAGE_CONV_ID)
  this._baseUrl = options.baseUrl || ""
  this._eventSource = null
  this._callbacks = {}
  this._panelOpen = false
  this._sending = false
  this._destroyed = false
  this._uiReady = false
  this._historyLoaded = false

  localStorage.setItem(STORAGE_INBOX, this.inbox)
  injectStyles(styles + "\n" + githubCss + "\n" + widgetMarkdownOverrides)
  this._buildDOM()
  this._bindEvents()
  this._setupVisualViewport()

  if (this.conversationId) {
    this._loadHistory().then(function () {
      self._subscribeSSE()
    })
  }

  this._uiReady = true
  this._emit("ready")
}

Widget.prototype._buildDOM = function () {
  var root = document.createElement("div")
  root.id = "unichat-widget"

  this._btn = document.createElement("button")
  this._btn.className = "uw-btn"
  this._btn.innerHTML = iconChat()
  this._btn.setAttribute("aria-label", "Open chat")

  this._panel = document.createElement("div")
  this._panel.className = "uw-panel"

  var header = document.createElement("div")
  header.className = "uw-header"
  header.innerHTML = "<h3>Chat</h3>"
  this._closeBtn = document.createElement("button")
  this._closeBtn.className = "uw-close"
  this._closeBtn.setAttribute("aria-label", "Close")
  this._closeBtn.innerHTML = iconClose()
  header.appendChild(this._closeBtn)

  this._messagesEl = document.createElement("div")
  this._messagesEl.className = "uw-messages"

  this._emptyEl = document.createElement("div")
  this._emptyEl.className = "uw-empty"
  this._emptyEl.textContent = "No messages yet"
  this._messagesEl.appendChild(this._emptyEl)

  var bar = document.createElement("div")
  bar.className = "uw-input-bar"

  this._inputEl = document.createElement("textarea")
  this._inputEl.className = "uw-input"
  this._inputEl.rows = 1
  this._inputEl.placeholder = "Type a message..."

  this._sendBtn = document.createElement("button")
  this._sendBtn.className = "uw-send"
  this._sendBtn.setAttribute("aria-label", "Send")
  this._sendBtn.disabled = true
  this._sendBtn.innerHTML = iconSend()

  bar.appendChild(this._inputEl)
  bar.appendChild(this._sendBtn)

  this._panel.appendChild(header)
  this._panel.appendChild(this._messagesEl)
  this._panel.appendChild(bar)
  root.appendChild(this._btn)
  root.appendChild(this._panel)
  document.body.appendChild(root)
}

Widget.prototype._bindEvents = function () {
  var self = this

  this._btn.addEventListener("click", function () {
    self.toggle()
  })

  this._closeBtn.addEventListener("click", function () {
    self.close()
  })

  this._inputEl.addEventListener("input", function () {
    self._sendBtn.disabled = !self._inputEl.value.trim()
    self._autoResize()
  })

  this._inputEl.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      self._doSend()
    }
  })

  this._sendBtn.addEventListener("click", function () {
    self._doSend()
  })
}

Widget.prototype._setupVisualViewport = function () {
  var vv = window.visualViewport
  if (!vv) return
  var self = this
  this._panel.classList.add("uw-vv-active")
  this._onVVResize = function () {
    self._panel.style.setProperty("--uw-vv-height", vv.height + "px")
    self._panel.style.setProperty("--uw-vv-top", vv.offsetTop + "px")
  }
  vv.addEventListener("resize", this._onVVResize)
  vv.addEventListener("scroll", this._onVVResize)
  this._onVVResize()
}

Widget.prototype._autoResize = function () {
  this._inputEl.style.height = "auto"
  this._inputEl.style.height = this._inputEl.scrollHeight + "px"
}

Widget.prototype._doSend = function () {
  if (this._sending) return
  var text = this._inputEl.value.trim()
  if (!text) return
  this._inputEl.value = ""
  this._inputEl.style.height = "auto"
  this._sendBtn.disabled = true
  this.send(text)
}

Widget.prototype.toggle = function () {
  if (this._panelOpen) this.close()
  else this.open()
}

Widget.prototype.open = function () {
  if (this._destroyed) return
  this._panelOpen = true
  this._panel.style.display = "flex"
  this._btn.innerHTML = iconClose()
  this._messagesEl.scrollTop = this._messagesEl.scrollHeight
}

Widget.prototype.close = function () {
  this._panelOpen = false
  this._panel.style.display = "none"
  this._btn.innerHTML = iconChat()
}

Widget.prototype.send = function (text) {
  var self = this
  this._sending = true

  var msgEl = this._addMessage(text, "contact")

  return fetch(this._baseUrl + "/widget/" + this.inbox + "/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      embed_key: this.embedKey,
      source_id: this.sourceId,
      content: text,
      content_type: "text",
    }),
  })
    .then(function (res) {
      if (!res.ok) throw new Error("Send failed: " + res.status)
      return res.json()
    })
    .then(function (data) {
      if (data.conversation_id) {
        self.conversationId = data.conversation_id
        localStorage.setItem(STORAGE_CONV_ID, data.conversation_id)
        self._subscribeSSE()
      }
    })
    .catch(function (err) {
      if (msgEl && msgEl.parentNode) {
        msgEl.parentNode.removeChild(msgEl)
      }
      self._emit("error", err)
      throw err
    })
    .finally(function () {
      self._sending = false
    })
}

Widget.prototype._addActivity = function (text) {
  if (this._emptyEl && this._emptyEl.parentNode) {
    this._emptyEl.parentNode.removeChild(this._emptyEl)
    this._emptyEl = null
  }
  var el = document.createElement("div")
  el.className = "uw-activity"
  var body = document.createElement("div")
  body.className = "markdown-body"
  body.innerHTML = renderContent(text)
  el.appendChild(body)
  this._messagesEl.appendChild(el)
  this._messagesEl.scrollTop = this._messagesEl.scrollHeight
  return el
}

Widget.prototype._addMessage = function (text, senderType) {
  if (this._emptyEl && this._emptyEl.parentNode) {
    this._emptyEl.parentNode.removeChild(this._emptyEl)
    this._emptyEl = null
  }
  var el = document.createElement("div")
  el.className = "uw-msg " + senderType
  var body = document.createElement("div")
  body.className = "markdown-body"
  body.innerHTML = renderContent(text)
  el.appendChild(body)
  this._messagesEl.appendChild(el)
  this._messagesEl.scrollTop = this._messagesEl.scrollHeight
  return el
}

Widget.prototype._loadHistory = function () {
  var self = this
  if (!this.conversationId) return Promise.resolve()
  this._historyLoaded = false
  var url =
    this._baseUrl +
    "/widget/conversations/" +
    this.conversationId +
    "/messages?embed_key=" +
    encodeURIComponent(this.embedKey)
  return fetch(url)
    .then(function (res) {
      if (!res.ok) throw new Error("History fetch failed: " + res.status)
      return res.json()
    })
    .then(function (data) {
      var msgs = data.messages || []
      msgs.forEach(function (m) {
        if (m.message_type === "activity" || m.sender_type === "system") {
          self._addActivity(m.content)
        } else {
          var senderType = m.sender_type === "contact" ? "contact" : "agent"
          self._addMessage(m.content, senderType)
        }
      })
      self._historyLoaded = true
    })
    .catch(function (err) {
      self._emit("error", err)
    })
}

Widget.prototype._subscribeSSE = function () {
  if (!this.conversationId) return
  if (this._eventSource) return

  var self = this
  var url =
    this._baseUrl +
    "/widget/conversations/" +
    this.conversationId +
    "/sse?embed_key=" +
    encodeURIComponent(this.embedKey)

  this._eventSource = new EventSource(url)

  this._eventSource.addEventListener("message", function (e) {
    try {
      var data = JSON.parse(e.data)
      if (data.message_type === "activity" || data.sender_type === "system") {
        self._addActivity(data.content)
        self._emit("message", data)
      } else if (data.sender_type !== "contact") {
        self._addMessage(data.content, "agent")
        self._emit("message", data)
      }
    } catch (_) {
      /* ignore malformed data */
    }
  })

  this._eventSource.addEventListener("error", function () {
    /* EventSource auto-reconnects */
  })
}

Widget.prototype._unsubscribeSSE = function () {
  if (this._eventSource) {
    this._eventSource.close()
    this._eventSource = null
  }
}

Widget.prototype.identify = function (userId, userHash) {
  var self = this
  if (!userId || !userHash) return Promise.reject(new Error("userId and userHash required"))

  return fetch(this._baseUrl + "/widget/" + this.inbox + "/identify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      embed_key: this.embedKey,
      source_id: this.sourceId,
      new_user_id: userId,
      user_hash: userHash,
    }),
  })
    .then(function (res) {
      if (!res.ok) throw new Error("Identify failed: " + res.status)
      return res.json()
    })
    .then(function (data) {
      self._unsubscribeSSE()
      self.conversationId = data.conversation_id
      self.sourceId = data.source_id
      localStorage.setItem(STORAGE_CONV_ID, data.conversation_id)
      localStorage.setItem(STORAGE_SOURCE_ID, data.source_id)
      self._clearMessages()
      self._loadHistory().then(function () {
        self._subscribeSSE()
      })
      self._emit("identified", { conversation_id: data.conversation_id, source_id: data.source_id })
      return data
    })
    .catch(function (err) {
      self._emit("error", err)
      throw err
    })
}

Widget.prototype._clearMessages = function () {
  this._messagesEl.innerHTML = ""
  this._emptyEl = document.createElement("div")
  this._emptyEl.className = "uw-empty"
  this._emptyEl.textContent = "No messages yet"
  this._messagesEl.appendChild(this._emptyEl)
}

Widget.prototype.on = function (event, callback) {
  if (!this._callbacks[event]) this._callbacks[event] = []
  this._callbacks[event].push(callback)
}

Widget.prototype.destroy = function () {
  if (this._destroyed) return
  this._destroyed = true
  this._unsubscribeSSE()
  if (this._onVVResize && window.visualViewport) {
    window.visualViewport.removeEventListener("resize", this._onVVResize)
    window.visualViewport.removeEventListener("scroll", this._onVVResize)
  }
  var el = document.getElementById("unichat-widget")
  if (el && el.parentNode) el.parentNode.removeChild(el)
  var idx = instances.indexOf(this)
  if (idx !== -1) instances.splice(idx, 1)
  if (instances.length === 0) {
    var styleEl = document.getElementById("unichat-widget-styles")
    if (styleEl && styleEl.parentNode) styleEl.parentNode.removeChild(styleEl)
  }
}

Widget.prototype._emit = function (event, data) {
  var list = this._callbacks[event]
  if (list) {
    for (var i = 0; i < list.length; i++) {
      list[i](data)
    }
  }
}

function autoInit() {
  var scripts = document.getElementsByTagName("script")
  for (var i = 0; i < scripts.length; i++) {
    var s = scripts[i]
    var inbox = s.getAttribute("data-inbox")
    var embedKey = s.getAttribute("data-embed-key")
    if (inbox && embedKey) {
      var baseUrl = s.getAttribute("data-base-url") || ""
      var w = new Widget({ inbox: inbox, embedKey: embedKey, baseUrl: baseUrl })
      instances.push(w)
      return w
    }
  }
}

window.UnichatWidget = {
  init: function (options) {
    var w = new Widget(options)
    instances.push(w)
    return w
  },
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", autoInit)
} else {
  autoInit()
}
