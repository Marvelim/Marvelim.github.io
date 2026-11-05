---
title: Quick notes
date: 2026-11-05
---

**Optimal action values.** $Q^*(s,a)$ is the maximum expected discounted return obtainable by taking action $a$ in state $s$ and following an optimal policy thereafter:

$$
Q^*(s,a)=\max_\pi\mathbb{E}_\pi\!\left[\sum_{t=0}^{\infty}\gamma^t R_{t+1}\mid S_0=s, A_0=a\right],\qquad 0\leq\gamma<1.
$$

For **deterministic** transitions, the next state $s'=f(s,a)$ is fixed, so a direct dynamic programming (DP) update suffices:

$$
Q_{k+1}(s,a)=r(s,a)+\gamma\max_{a'}Q_k(f(s,a),a').
$$

For **non-deterministic (stochastic)** transitions, taking the same step $(s,a)$ can lead to different states at the next stage, so the update must average over those possible next states:

$$
Q_{k+1}(s,a)=r(s,a)+\gamma\sum_{s'}P(s'\mid s,a)\max_{a'}Q_k(s',a').
$$

Here $r(s,a)=\mathbb{E}[R_{t+1}\mid S_t=s,A_t=a]$, and $k$ indexes DP iterations. At convergence, $Q_k=Q_{k+1}=Q^*$. An optimal policy always selects an action maximizing $Q^*(s,a)$ in state $s$:

$$
\pi^*(s)\in\operatorname*{arg\,max}_a Q^*(s,a).
$$

Ties may be broken arbitrarily, or a stochastic optimal policy may randomize among maximizing actions.
