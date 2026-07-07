(function () {
  'use strict'

  var STORAGE_SOURCE_ID = 'unichat_widget_source_id'
  var STORAGE_CONV_ID = 'unichat_widget_conversation_id'
  var STORAGE_INBOX = 'unichat_widget_inbox'

  var instances = []

  function uuid() {
    if (crypto && crypto.randomUUID) return crypto.randomUUID()
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
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
    if (document.getElementById('unichat-widget-styles')) return
    var el = document.createElement('style')
    el.id = 'unichat-widget-styles'
    el.textContent = css
    document.head.appendChild(el)
  }

  function iconChat() {
    return (
      '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>' +
      '</svg>'
    )
  }

  function iconClose() {
    return (
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>' +
      '</svg>'
    )
  }

  function iconSend() {
    return (
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>' +
      '</svg>'
    )
  }

  var styles = [
    '#unichat-widget * { box-sizing:border-box; margin:0; padding:0; }',
    '#unichat-widget {',
    '  font-family: var(--widget-font-family, system-ui, -apple-system, sans-serif);',
    '  position: fixed;',
    '  bottom: var(--widget-position-bottom, 20px);',
    '  right: var(--widget-position-right, 20px);',
    '  z-index: 2147483645;',
    '}',
    '#unichat-widget .uw-btn {',
    '  width: 60px; height: 60px; border-radius: 50%;',
    '  background: var(--widget-primary-color, #4F46E5);',
    '  border: none; cursor: pointer;',
    '  display: flex; align-items: center; justify-content: center;',
    '  box-shadow: 0 4px 12px rgba(0,0,0,0.15);',
    '  transition: transform 0.2s, box-shadow 0.2s;',
    '}',
    '#unichat-widget .uw-btn:hover {',
    '  transform: scale(1.05);',
    '  box-shadow: 0 6px 20px rgba(0,0,0,0.2);',
    '}',
    '#unichat-widget .uw-panel {',
    '  position: absolute; bottom: 70px; right: 0;',
    '  width: 320px; height: 450px;',
    '  background: #fff; border-radius: 12px;',
    '  box-shadow: 0 8px 32px rgba(0,0,0,0.15);',
    '  display: none; flex-direction: column; overflow: hidden;',
    '  animation: uw-slide-up 0.2s ease-out;',
    '}',
    '@keyframes uw-slide-up {',
    '  from { opacity:0; transform:translateY(10px); }',
    '  to { opacity:1; transform:translateY(0); }',
    '}',
    '@media (max-width:480px) {',
    '  #unichat-widget .uw-panel {',
    '    position: fixed; top: 0; left: 0;',
    '    width: 100%; height: 100%; border-radius: 0;',
    '  }',
    '}',
    '#unichat-widget .uw-header {',
    '  background: var(--widget-primary-color, #4F46E5);',
    '  color: #fff; padding: 16px; display: flex;',
    '  align-items: center; justify-content: space-between; flex-shrink: 0;',
    '}',
    '#unichat-widget .uw-header h3 { font-size: 16px; font-weight: 600; }',
    '#unichat-widget .uw-close {',
    '  background: none; border: none; color: #fff;',
    '  cursor: pointer; opacity: 0.8; padding: 4px; line-height: 0;',
    '}',
    '#unichat-widget .uw-close:hover { opacity: 1; }',
    '#unichat-widget .uw-messages {',
    '  flex: 1; overflow-y: auto; padding: 16px;',
    '  display: flex; flex-direction: column; gap: 8px;',
    '}',
    '#unichat-widget .uw-msg {',
    '  max-width: 80%; padding: 10px 14px; border-radius: 16px;',
    '  font-size: 14px; line-height: 1.4; word-wrap: break-word;',
    '}',
    '#unichat-widget .uw-msg.contact {',
    '  align-self: flex-end;',
    '  background: var(--widget-primary-color, #4F46E5);',
    '  color: #fff; border-bottom-right-radius: 4px;',
    '}',
    '#unichat-widget .uw-msg.agent {',
    '  align-self: flex-start;',
    '  background: #F3F4F6; color: #111827; border-bottom-left-radius: 4px;',
    '}',
    '#unichat-widget .uw-input-bar {',
    '  display: flex; padding: 12px; gap: 8px;',
    '  border-top: 1px solid #E5E7EB; flex-shrink: 0; background: #fff;',
    '}',
    '#unichat-widget .uw-input {',
    '  flex: 1; border: 1px solid #D1D5DB; border-radius: 20px;',
    '  padding: 8px 14px; font-size: 14px; outline: none; font-family: inherit;',
    '}',
    '#unichat-widget .uw-input:focus { border-color: var(--widget-primary-color, #4F46E5); }',
    '#unichat-widget .uw-input::placeholder { color: #9CA3AF; }',
    '#unichat-widget .uw-send {',
    '  background: var(--widget-primary-color, #4F46E5);',
    '  border: none; color: #fff; width: 36px; height: 36px;',
    '  border-radius: 50%; cursor: pointer;',
    '  display: flex; align-items: center; justify-content: center;',
    '  flex-shrink: 0; transition: opacity 0.2s; line-height: 0;',
    '}',
    '#unichat-widget .uw-send:disabled { opacity: 0.4; cursor: not-allowed; }',
    '#unichat-widget .uw-activity {',
    '  text-align: center; color: #6B7280; font-size: 12px; padding: 4px 16px;',
    '  font-style: italic; line-height: 1.5; word-wrap: break-word;',
    '}',
    '#unichat-widget .uw-empty {',
    '  text-align: center; color: #9CA3AF; font-size: 14px; padding: 40px 16px;',
    '}',
  ].join('\n')

  function Widget(options) {
    var self = this
    this.inbox = options.inbox
    this.embedKey = options.embedKey
    this.sourceId = getSourceId()
    this.conversationId = localStorage.getItem(STORAGE_CONV_ID)
    this._baseUrl = options.baseUrl || ''
    this._eventSource = null
    this._callbacks = {}
    this._panelOpen = false
    this._sending = false
    this._destroyed = false
    this._uiReady = false
    this._historyLoaded = false

    localStorage.setItem(STORAGE_INBOX, this.inbox)
    injectStyles(styles)
    this._buildDOM()
    this._bindEvents()

    if (this.conversationId) {
      this._loadHistory().then(function () {
        self._subscribeSSE()
      })
    }

    this._uiReady = true
    this._emit('ready')
  }

  Widget.prototype._buildDOM = function () {
    var root = document.createElement('div')
    root.id = 'unichat-widget'

    this._btn = document.createElement('button')
    this._btn.className = 'uw-btn'
    this._btn.innerHTML = iconChat()
    this._btn.setAttribute('aria-label', 'Open chat')

    this._panel = document.createElement('div')
    this._panel.className = 'uw-panel'

    var header = document.createElement('div')
    header.className = 'uw-header'
    header.innerHTML = '<h3>Chat</h3>'
    this._closeBtn = document.createElement('button')
    this._closeBtn.className = 'uw-close'
    this._closeBtn.setAttribute('aria-label', 'Close')
    this._closeBtn.innerHTML = iconClose()
    header.appendChild(this._closeBtn)

    this._messagesEl = document.createElement('div')
    this._messagesEl.className = 'uw-messages'

    this._emptyEl = document.createElement('div')
    this._emptyEl.className = 'uw-empty'
    this._emptyEl.textContent = 'No messages yet'
    this._messagesEl.appendChild(this._emptyEl)

    var bar = document.createElement('div')
    bar.className = 'uw-input-bar'

    this._inputEl = document.createElement('input')
    this._inputEl.className = 'uw-input'
    this._inputEl.type = 'text'
    this._inputEl.placeholder = 'Type a message...'
    this._inputEl.autocomplete = 'off'

    this._sendBtn = document.createElement('button')
    this._sendBtn.className = 'uw-send'
    this._sendBtn.setAttribute('aria-label', 'Send')
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

    this._btn.addEventListener('click', function () {
      self.toggle()
    })

    this._closeBtn.addEventListener('click', function () {
      self.close()
    })

    this._inputEl.addEventListener('input', function () {
      self._sendBtn.disabled = !self._inputEl.value.trim()
    })

    this._inputEl.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        self._doSend()
      }
    })

    this._sendBtn.addEventListener('click', function () {
      self._doSend()
    })
  }

  Widget.prototype._doSend = function () {
    if (this._sending) return
    var text = this._inputEl.value.trim()
    if (!text) return
    this._inputEl.value = ''
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
    this._panel.style.display = 'flex'
    this._btn.innerHTML = iconClose()
    this._messagesEl.scrollTop = this._messagesEl.scrollHeight
  }

  Widget.prototype.close = function () {
    this._panelOpen = false
    this._panel.style.display = 'none'
    this._btn.innerHTML = iconChat()
  }

  Widget.prototype.send = function (text) {
    var self = this
    this._sending = true

    var msgEl = this._addMessage(text, 'contact')

    return fetch(this._baseUrl + '/widget/' + this.inbox + '/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embed_key: this.embedKey,
        source_id: this.sourceId,
        content: text,
        content_type: 'text',
      }),
    })
      .then(function (res) {
        if (!res.ok) throw new Error('Send failed: ' + res.status)
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
        self._emit('error', err)
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
    var el = document.createElement('div')
    el.className = 'uw-activity'
    el.textContent = text
    this._messagesEl.appendChild(el)
    this._messagesEl.scrollTop = this._messagesEl.scrollHeight
    return el
  }

  Widget.prototype._addMessage = function (text, senderType) {
    if (this._emptyEl && this._emptyEl.parentNode) {
      this._emptyEl.parentNode.removeChild(this._emptyEl)
      this._emptyEl = null
    }
    var el = document.createElement('div')
    el.className = 'uw-msg ' + senderType
    el.textContent = text
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
      '/widget/conversations/' +
      this.conversationId +
      '/messages?embed_key=' +
      encodeURIComponent(this.embedKey)
    return fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error('History fetch failed: ' + res.status)
        return res.json()
      })
      .then(function (data) {
        var msgs = data.messages || []
        msgs.forEach(function (m) {
          if (m.message_type === 'activity' || m.sender_type === 'system') {
            self._addActivity(m.content)
          } else {
            var senderType = m.sender_type === 'contact' ? 'contact' : 'agent'
            self._addMessage(m.content, senderType)
          }
        })
        self._historyLoaded = true
      })
      .catch(function (err) {
        self._emit('error', err)
      })
  }

  Widget.prototype._subscribeSSE = function () {
    if (!this.conversationId) return
    if (this._eventSource) return

    var self = this
    var url =
      this._baseUrl +
      '/widget/conversations/' +
      this.conversationId +
      '/sse?embed_key=' +
      encodeURIComponent(this.embedKey)

    this._eventSource = new EventSource(url)

    this._eventSource.addEventListener('message', function (e) {
      try {
        var data = JSON.parse(e.data)
        if (data.message_type === 'activity' || data.sender_type === 'system') {
          self._addActivity(data.content)
          self._emit('message', data)
        } else if (data.sender_type !== 'contact') {
          self._addMessage(data.content, 'agent')
          self._emit('message', data)
        }
      } catch (_) {
        /* ignore malformed data */
      }
    })

    this._eventSource.addEventListener('error', function () {
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
    if (!userId || !userHash) return Promise.reject(new Error('userId and userHash required'))

    return fetch(this._baseUrl + '/widget/' + this.inbox + '/identify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embed_key: this.embedKey,
        source_id: this.sourceId,
        new_user_id: userId,
        user_hash: userHash,
      }),
    })
      .then(function (res) {
        if (!res.ok) throw new Error('Identify failed: ' + res.status)
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
        self._emit('identified', { conversation_id: data.conversation_id, source_id: data.source_id })
        return data
      })
      .catch(function (err) {
        self._emit('error', err)
        throw err
      })
  }

  Widget.prototype._clearMessages = function () {
    this._messagesEl.innerHTML = ''
    this._emptyEl = document.createElement('div')
    this._emptyEl.className = 'uw-empty'
    this._emptyEl.textContent = 'No messages yet'
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
    var el = document.getElementById('unichat-widget')
    if (el && el.parentNode) el.parentNode.removeChild(el)
    var idx = instances.indexOf(this)
    if (idx !== -1) instances.splice(idx, 1)
    if (instances.length === 0) {
      var styleEl = document.getElementById('unichat-widget-styles')
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
    var scripts = document.getElementsByTagName('script')
    for (var i = 0; i < scripts.length; i++) {
      var s = scripts[i]
      var inbox = s.getAttribute('data-inbox')
      var embedKey = s.getAttribute('data-embed-key')
      if (inbox && embedKey) {
        var baseUrl = s.getAttribute('data-base-url') || ''
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit)
  } else {
    autoInit()
  }
})()
