---
layout: post
title: Computer Networks Lab 1
date: 2026-03-15 18:00:00+08:00
description: 计算机网络（春季）Lab 1 Solution
password: "cnl1"
tags: [computer_networks]
categories: [courses]
---

# HTTP 访问解析

## Q1

**Q.** 完成函数 `Q1` 调用的函数 `MySniff`。要求：持续抓包 $5$ 秒，结果存为文件 `http.cap`（程序中 `Trace1` 变量）。

**A.** 一个包分为 header（头）和 payload（负载）两部分。使用 `scapy` 的 `sniff(timeout = 5)` 可以记录一段时间内的所有包。使用 `wrpcap` 可以存储为 `cap/pcap` 文件。

```python
def MySniff():
    print("sniffing start")
    #################################
    ###### start of your code #######
    #################################
    packets = sniff(timeout=5)
    wrpcap(Trace1, packets)
    #################################
    ###### end of your code #########
    #################################
    print("sniffing stop")
```

## Q2

**Q.** 完成函数 `Q2`，要求：在 `http.cap` 中寻找第一个目的端口为 $80$ 的 `TCP` 分组，并返回该分组的源 `MAC` 地址和目的 `MAC` 地址（字符串格式）。  
注：该分组即第一个 `HTTP` 请求分组。

**A.** 需要知道一个 packet 的层级结构。可以表示为：

```text
p1 = [ Ethernet Header ] + [ IP Header ] + [ TCP Header ] + [ HTTP Data ]
```

例如：

```text
###[ Ethernet ]###
  dst       = 2e:ca:16:e5:5b:64
  src       = 6e:e4:ce:74:a1:f3
  type      = IPv4
###[ IP ]###
     version   = 4
     ihl       = 5
     tos       = 0x0
     len       = 52           <-- 变化1：总长度增加了
     id        = 1234
     flags     = DF
     frag      = 0
     ttl       = 64
     proto     = tcp
     chksum    = 0x84fb
     src       = 192.168.64.2
     dst       = 110.242.70.57
     \options   \
###[ TCP ]###
        sport     = 50894
        dport     = https
        seq       = 4016742112
        ack       = 203847291    <-- 变化2：通常会有确认号
        dataofs   = 5
        reserved  = 0
        flags     = PA           <-- 变化3：标志位改变
        window    = 64240
        chksum    = 0x1234
        urgptr    = 0
        options   = []
###[ Raw ]###                    <-- 变化4：新增了数据层
           load      = 'Hello World!'
```

需要知道的几个事实：

1. Ethernet 的 src 和 dst: 网卡的 MAC 地址（物理硬件地址），只在同一个物理局域网下有效。

2. IP 的 src 和 dst：绝对 IP 地址。

3. sport 和 dport: 分别开启的发送方 / 接收方端口，用于辨别是传给主机中的哪个程序/进程的。

4. seq: 该包所发送的内容在原始字节流中的位置。比如说有 300 字节的东西，可能 seq 分别为 $X, X+101, X+201$ 这样（X 是因为可能有一个随机的位移，不过这个概念是相对的所以没啥影响）

对一个包 p1, 调用 `TCP in p1` 可以判断是否有 TCP 层，`p1[TCP]` 可以把除了 TCP 以外的其他 header 都剥开，因此代码为

```python
def Q2():
    src_mac = ""
    dst_mac = ""
    #################################
    ###### start of your code #######
    #################################
    packets = rdpcap(Trace1)
    for p1 in packets: # Ethernet
        if TCP in p1 and p1[TCP].dport == 80:
                src_mac = p1.src
                dst_mac = p1.dst
                break
    #################################
    ###### end of your code #########
    #################################
    return src_mac, dst_mac
```

## Q3

**Q.** 完成函数 `Q3`，要求：返回 `Q2` 中分组对应的应答分组（`ACK` 分组）的二层 `type` 字段、三层 `proto` 字段（整数格式）以及报文时间戳。

**A.** 首先要知道什么是 $A$ 的 `ACK` 分组 $B$。这个分组就像回执一样，是 D 发给 S 的，证明自己【已经收到了对应内容】。因此这个包的 src, dst IP 和 sport, dport 必须和原包完全反转。除此之外 $B$ 必须要包含 ACK 标志。

这并不足够，因为不知道是回应谁的。对此，B 包还有一个 ack 量，其量应当等于 `A.seq + len(A)`, 代表“下一次我接收内容应该是接收这个字节流”。其中，`len(A)` 代表 raw data 的字节数，也就是 IP 层总长度 - IP header 长度 - TCP header 长度。

然而如果是 SYN (Synchronize，同步序列号) 或 FIN (Finish，完成发送任务) 包的时候 len(A) 要 $+1$，这可以由标记位确定。由此，可以写出以下代码

```python
def Q3():    
    theType = 0
    theProto = 0
    theTs = 0.0
    #################################
    ###### start of your code #######
    #################################
    packets = rdpcap(Trace1)
    ip_ref = None
    tcp_ref = None
    for p_cur in packets:
        if TCP in p_cur and p_cur[TCP].dport == 80:
            ip_ref = p_cur[IP]
            tcp_ref = p_cur[TCP]
            break

    expected_ack = tcp_ref.seq + len(bytes(tcp_ref.payload))
    if tcp_ref.flags & 0x02:
        expected_ack += 1
    if tcp_ref.flags & 0x01:
        expected_ack += 1

    for p_cur in packets:
        if TCP in p_cur:
            ip_layer = p_cur[IP]
            tcp_layer = p_cur[TCP]
            if (ip_layer.src == ip_ref.dst and ip_layer.dst == ip_ref.src) and \
            (tcp_layer.sport == tcp_ref.dport and tcp_layer.dport == tcp_ref.sport) and \
            tcp_layer.ack == expected_ack:
                    theType = p_cur.type
                    theProto = ip_layer.proto
                    theTs = p_cur.time
                    break
    #################################
    ###### end of your code #########
    #################################
    return theType, theProto, theTs
```

# 校园网数据分析

分析一段校园网捕获的记录。

## Q4

**Q.** 完成函数 `Q4`，要求返回记录中分组数量。

**A.** return len 即可。

```python
def Q4():
    theLength = 0
    #################################
    ###### start of your code #######
    #################################
    packets = rdpcap(Trace2)
    theLength = len(packets)
    #################################
    ###### end of your code #########
    #################################
    return theLength
```

## Q5

**Q.** 完成函数 `Q5`，要求返回记录中 `IP` 分组、`TCP` 分组、`UDP` 分组的数量。

**A.** 使用 `TCP in p1 / UDP in p1` 即可

```python
def Q5():
    num_tcp = 0
    num_udp = 0
    num_ip = 0
    #################################
    ###### start of your code #######
    #################################
    packets = rdpcap(Trace2)
    for p_cur in packets:
        if IP in p_cur:
            num_ip += 1
            if TCP in p_cur:
                num_tcp += 1
            elif UDP in p_cur:
                num_udp += 1
    #################################
    ###### end of your code #########
    #################################
    return num_ip, num_tcp, num_udp
```

## Q6

**Q.** 完成函数 `Q6`，要求返回记录中 `TCP` 流的数量。  
注意：一个 `TCP` 流由服务器 `IP` 和 `Port` 以及客户端 `IP` 和 `Port` 唯一标识，会产生双向分组，但双向分组属于同一个流，不记为不同流。  
例如，一个 `TCP` 流某方向的分组首部为

$$
\langle IP_1, IP_2, Port_1, Port_2 \rangle
$$

返程分组首部为

$$
\langle IP_2, IP_1, Port_2, Port_1 \rangle
$$

两者计入同一个 `TCP` 流，不认为是两个流。

**A.** 只需要去重一下即可

```python
def Q6():
    flows = set()
    #################################
    ###### start of your code #######
    #################################
    packets = rdpcap(Trace2)
    for p_cur in packets:
        if IP in p_cur and TCP in p_cur:
            ip_layer = p_cur[IP]
            tcp_layer = p_cur[TCP]
            ip1, ip2, port1, port2 = ip_layer.src, ip_layer.dst, tcp_layer.sport, tcp_layer.dport
            if ip1 > ip2:
                ip1, ip2 = ip2, ip1
                port1, port2 = port2, port1
            flows.add((ip1, ip2, port1, port2))
    #################################
    ###### end of your code #########
    #################################
    return len(flows)
```

## Q7

**Q.** 完成函数 `Q7`，要求返回记录中所有 `IP` 分组长度的最小值、中位数、最大值。  
`IP` 分组长度定义为

$$
L = L_{\text{Ethernet header}} + L_{\text{IP header}} + L_{\text{IP payload}} + L_{\text{Ethernet trailer}}
$$

提示：`IP` 分组有 `length` 字段，查询其语义并计算上述长度。

补充：有同学反映，小于 $64$ 字节的以太网帧会被自动填充到 $64$ 字节，对于长度计算是否包括填充部分存在疑问；本实验中以 `scapy` 的计算方式为准，不需要增加额外判断逻辑。

**A.** 如果直接使用 `p_cur[IP].length` 会漏算首尾的 Ethernet length. However, 漏算的部分等于 $18$：

1. 目的 MAC + 源 MAC + type: $6 + 6 + 2 = 14$ 字节

2. 尾部：FCS （帧检验序列），$4$ 字节

所以直接把所有值 $+18$ 即可。

```python
def Q7():
    min_length = 0
    max_length = 0
    median_length = 0
    #################################
    ###### start of your code #######
    #################################
    packets = rdpcap(Trace2)
    len_vec = []
    for p_cur in packets:
        if IP in p_cur:
            len_vec.append(p_cur[IP].len + 18)
    min_length = min(len_vec)
    max_length = max(len_vec)
    median_length = statistics.median(len_vec)
    #################################
    ###### end of your code #########
    #################################
    return min_length, median_length, max_length
```

做完啦！
