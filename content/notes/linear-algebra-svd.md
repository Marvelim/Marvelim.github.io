---
title: The singular value decomposition
course: Linear Algebra
date: 2026-07-02
summary: Every matrix is a rotation, a scaling, and another rotation.
---

# The singular value decomposition

Any real matrix $A \in \mathbb{R}^{m \times n}$ factors as

$$A = U \Sigma V^\top,$$

where $U$ and $V$ are orthogonal and $\Sigma$ is diagonal with non-negative
entries (the singular values). Geometrically: rotate, scale each axis, rotate again.

The columns of $V$ are the directions the unit sphere gets stretched along, and
the singular values say by how much.
