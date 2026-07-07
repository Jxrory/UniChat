---
status: accepted
---

# Echo AgentBot 替身走自环回 HTTP（不直调 ReplyReceiver）

Echo 替身（issue #34）的作用是在非生产环境模拟 AgentBot 行为：收到通知后原样返回消息。它需要走真实的 notify→reply 链路，而不是跳过中间环节直接落库。

这是 surprising without context 的：未来开发者看到 UniChat 向自己发 POST 的第一反应是 "简化"为应用内直调。但直调会跳过 notify 序列化、reply 鉴权、reply 请求解析这三段代码——恰好是真正外部 AgentBot 所依赖的全部路径。环回 HTTP 保证 echo 替身和真实 AgentBot 经过了完全相同的代码路径。

是 real trade-off：备选方案是让 echo 替身订阅 Incoming bus 接收通知，然后直接调 `ReplyReceiver.handle_reply()` 落库。这条路更简单、更快、不需要启动额外 HTTP 服务，但失去了 notify→reply 合约的端到端覆盖。

Echo 替身只应在非生产环境启动。其入口函数需做 `env != "production"` 守卫，使生产部署无论在什么配置下都不会无意启动环回路由。
