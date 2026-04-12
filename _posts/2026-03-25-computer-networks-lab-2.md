---
layout: post
title: Computer Networks Lab 2
date: 2026-03-24 9:00+8:00
description: 计算机网络（春季）Lab 2 Solution
password: "cnl2"
tags: [computer_networks]
categories: [courses]
---

# 提权重

```bash
sudo chmod -R 777 .
```

# Request and Response

目标：发一个 request 之后 recv 一个 response. 学习 socket 用法：

```c
ssize_t send(int sockfd, const void *buf, size_t len, int flags); // len 代表实际发送长度
ssize_t recv(int sockfd, void *buf, size_t len, int flags); // len 代表最大接收长度（缓冲区大小）
```

由于 rbuf 只有 RECV_SIZE 大小，因此 recv 时不能超过 RECV_SIZE. 

感觉 recv 应该是能收全的，发的话搞成循环发试一下。


# Establish Connection

使用 getaddrinfo 可以将域名转换为 IP 地址：

```c
int getaddrinfo(
    const char *node, // 域名
    const char *service, // 端口号 or 服务名
    const struct addrinfo *hints,  // 筛选条件
    struct addrinfo **res );
```

需要注意 hint 的写法，目前是 IPv4，因此 family 是 AF_INET. 同时 socktype 是 SOCK_STREAM, 因为 SMTP 是基于 TCP 的。

然后用 connect 函数：

```c
int connect(int sockfd, const struct sockaddr *addr, socklen_t addrlen);
```

需要注意的是要把 addr 转回 sockaddr, 是可以强行转换的。

# Prepare Data

这好像比较简单？反复用 sprintf 和 strcat 即可。需要注意的是 attach_file 怎么写，用 uuencode.

# Send Email

就是一个个 section 发。