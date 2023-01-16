# k8z: kubernetes business layer

K8Z 意在 k8s 业务层面，提供一个方便好用的 k8s 集群可视化工具集

# Features
- 终端：连接到集群任意 POD 容器上，方便调试
- Tcpdump：对集群内容器进行 tcpdump 抓包，可直接展示抓包信息，也可拉起 wireshark 实时分析
- Files：可将本机文件上传至集群 POD 里或从集群 POD 上下载文件
- Profiling： 对开启了 pprof 的 go 服务进行 profile，请求 profile 并绘制火焰图方便分析
- POD HTTP proxy: 代理 http 请求到集群内 POD 上，方便一些本地网络和集群 POD 网络不通的场景调试接口使用
- Debug：复制一个 POD 并新建一个终端连接上去，方便针对 crash 的 POD 手动调试故障
- ConfigMap：提供方便的编辑器来管理集群内的configMap
- 更多工具开发中 ...

# Demo
![k8z-demo](https://user-images.githubusercontent.com/9847143/212584308-777becf0-5283-4a67-bb1f-b854080078d6.gif)
