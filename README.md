# Sigil

Sigil is a private identity protocol powered by the Bitcoin Lightning Network. It allows users to authenticate securely and pseudonymously without the need for traditional emails, passwords, or central authorities.

## Overview

The core philosophy of Sigil is sovereignty. By using the LNURL-Auth protocol, Sigil creates a direct cryptographic link between a user's Lightning wallet and their digital presence. This ensures that the user remains the sole owner of their identity.

## Key Features

- Passwordless Authentication: Users log in by signing a cryptographic message with their Lightning wallet.
- Privacy by Design: No personal data, emails, or phone numbers are collected or stored.
- Sovereign Identity: Identity is tied to a public key, making it portable and independent of any central platform.
- Minimalist UI: A clean, performance-oriented interface focused on clarity and speed.
- Zero Tracking: No analytics or third-party tracking scripts are included in the protocol.

## Technical Stack

- Backend: Node.js with Express
- Authentication: Passport.js with passport-lnurl-auth
- Frontend: EJS templates with Tailwind CSS
- Database: In-memory session management (configurable for production)

## Getting Started

### Prerequisites

- Node.js (version 16.x or higher)
- A Lightning wallet that supports LNURL-Auth (such as Alby, Phoenix, or Zeus)

### Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a .env file based on the provided example and configure your environment variables.
4. Start the server:
   ```bash
   npm start
   ```

### Configuration

The protocol requires a base URL to be accessible via HTTPS for LNURL-Auth to function correctly. In a local development environment, tools like Ngrok can be used to expose the local server.

## Security

Sigil does not store private keys. Authentication is handled through a challenge-response mechanism where the signature is verified against the user's public key. All sessions are encrypted and managed through secure cookies.

## License

This project is released under the MIT License.
