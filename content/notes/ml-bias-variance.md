---
title: The bias–variance tradeoff
course: Machine Learning
date: 2026-07-05
summary: Why a more flexible model isn't always a better one.
---

# The bias–variance tradeoff

Expected test error decomposes into three pieces:

$$\mathbb{E}\big[(y - \hat f(x))^2\big] = \underbrace{\text{Bias}^2}_{\text{too simple}} + \underbrace{\text{Var}}_{\text{too sensitive}} + \underbrace{\sigma^2}_{\text{irreducible}}.$$

Simple models miss the signal (high bias); flexible models chase the noise
(high variance). The sweet spot minimizes their sum, not either alone.
