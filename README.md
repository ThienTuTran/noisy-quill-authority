# Noisy Quill Authority (JWKS/JWT CTF)

## Description

A deliberately vulnerable JWKS/JWT web/API challenge that simulates a multi-tenant token authority.
Players receive one low-privilege credential (customer:strong@password) and must enumerate the API, understand JOSE basics (JWT, JWKS, iss/aud/kid), and exploit a JWKS cache poisoning flaw to forge an admin token and retrieve the flag.

- Category: Web/API
- Focus: JWKS handling, token verification logic, header/claims interplay
- Difficulty: Medium

## Quick Start

1. Clone the repo
   ```sh
   git clone https://github.com/ThienTuTran/noisy-quill-authority.git
   ```
2. Run with Docker
   ```sh
   docker compose up -d --build
   ```
   The service listens on http://localhost:8080