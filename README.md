# @tetherto/wdk-protocol-swap-velora-evm

**Note**: This package is currently in beta. Please test thoroughly in development environments before using in production.

A secure and straightforward package that lets EVM wallet accounts swap tokens using the Velora aggregator. This package provides a clean SDK for token swaps on EVM chains, supporting both standard wallets and ERC-4337 smart accounts.

This module can be managed by the [`@tetherto/wdk`](https://github.com/tetherto/wdk-core) suite, which provides a unified interface for managing multiple WDK wallet and protocol modules across different blockchains.

## 🔍 About WDK

This module is part of the **WDK (Wallet Development Kit)** project, which enables developers to build secure, non-custodial wallets with unified blockchain access and complete user control.

For documentation on the complete WDK ecosystem, see https://docs.wallet.tether.io.

## 🌟 Features

- Token Swapping via Valora Dex
- Account Abstraction: Works with standard EVM wallets and ERC‑4337 smart accounts
- Fee Controls: Optional `swapMaxFee` to cap gas costs
- USDT Mainnet Handling: Allowance reset to 0 before approve when needed
- TypeScript Definitions
- Provider Flexibility: Works with JSON‑RPC URLs and EIP‑1193 providers

## ⬇️ Installation

```bash
npm install @tetherto/wdk-protocol-swap-velora-evm
```

## 🚀 Quick Start

### Direct Usage

```javascript
import ParaSwapProtocolEvm from '@tetherto/wdk-protocol-swap-velora-evm'
import { WalletAccountEvm } from '@tetherto/wdk-wallet-evm'

const seed = 'test only example nut use this real life secret phrase must random'

// Create EVM account (m/44'/60'/0'/0/0)
const account = new WalletAccountEvm(seed, "0'/0/0", {
  provider: 'https://ethereum-rpc.publicnode.com'
})

// Create swap protocol
const swap = new ParaSwapProtocolEvm(account, {
  swapMaxFee: 200000000000000n // Optional: cap fee
})

// Buy: specify exact output amount
const buyResult = await swap.swap({
  tokenIn: '0xTokenIn',
  tokenOut: '0xTokenOut',
  tokenOutAmount: 1000000n // exact out
})

// Sell: specify exact input amount
const sellResult = await swap.swap({
  tokenIn: '0xTokenIn',
  tokenOut: '0xTokenOut',
  tokenInAmount: 1000000n // exact in
})

// Quote before swap
const quote = await swap.quoteSwap({
  tokenIn: '0xTokenIn',
  tokenOut: '0xTokenOut',
  tokenInAmount: 1000000n
})
```

### ERC‑4337 Smart Account

```javascript
import ParaSwapProtocolEvm from '@tetherto/wdk-protocol-swap-paraswap-evm'
import { WalletAccountEvmErc4337 } from '@tetherto/wdk-wallet-evm-erc-4337'

const smart = new WalletAccountEvmErc4337(seed, "0'/0/0", {
  chainId: 1,
  provider: 'https://arb1.arbitrum.io/rpc',
  bundlerUrl: 'YOUR_BUNDLER_URL',
  paymasterUrl: 'YOUR_PAYMASTER_URL'
})

const swap4337 = new ParaSwapProtocolEvm(smart, {
  swapMaxFee: 200000000000000n
})

const result = await swap4337.swap({
  tokenIn: '0xTokenIn',
  tokenOut: '0xTokenOut',
  tokenInAmount: 1000000n
}, {
  paymasterToken: 'USDT', // pay gas with token
  swapMaxFee: 200000000000000n // override cap
})
```

## 📚 API Reference

### ParaSwapProtocolEvm

Main class for ParaSwap token swaps on EVM.

#### Constructor

```javascript
new ParaSwapProtocolEvm(account, config?)
```

Parameters:
- `account` (WalletAccountEvm | WalletAccountEvmErc4337 | WalletAccountReadOnlyEvm | WalletAccountReadOnlyEvmErc4337)
- `config` (object, optional):
  - `swapMaxFee` (bigint, optional): maximum total gas fee allowed

Example:

```javascript
const swap = new ParaSwapProtocolEvm(account, { swapMaxFee: 200000000000000n })
```

### Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `swap(options, config?)` | Swaps a token pair | `Promise<{hash: string, fee: bigint, tokenInAmount: bigint, tokenOutAmount: bigint, approveHash?, resetAllowanceHash?}>` |
| `quoteSwap(options, config?)` | Quotes swap fee and amounts | `Promise<{fee: bigint, tokenInAmount: bigint, tokenOutAmount: bigint}>` |

#### `swap(options, config?)`
Execute a swap.

Options:
- `tokenIn` (string): address of token to sell
- `tokenOut` (string): address of token to buy
- `tokenInAmount` (bigint, optional): exact input amount
- `tokenOutAmount` (bigint, optional): exact output amount
- `to` (string, optional): recipient (default: your address)

Config (ERC‑4337 only):
- `paymasterToken` (string, optional): token to pay gas
- `swapMaxFee` (bigint, optional): override fee cap

Returns:
- Standard account: `{ hash, fee, tokenInAmount, tokenOutAmount, approveHash, resetAllowanceHash? }`
- ERC‑4337 account: `{ hash, fee, tokenInAmount, tokenOutAmount }` (approve bundled)

Notes:
- On Ethereum mainnet, selling USDT may first set allowance to 0, then approve.
- Requires an attached provider.
- Requires a non-read-only account to send swaps.

Example:

```javascript
const tx = await swap.swap({ tokenIn: '0xTokenIn', tokenOut: '0xTokenOut', tokenInAmount: 1000000n })
```

#### `quoteSwap(options, config?)`
Get swap fee and amounts without sending a transaction.

Options are the same as `swap`.

Returns: `{ fee, tokenInAmount, tokenOutAmount }`

Config (ERC‑4337 only):
- `paymasterToken` (string, optional): token to pay gas

Works with read-only accounts.

```javascript
const quote = await swap.quoteSwap({ tokenIn: '0xTokenIn', tokenOut: '0xTokenOut', tokenOutAmount: 500000n })
```

## 🌐 Supported Networks

Works on EVM networks supported by ParaSwap. You will need a working RPC provider.

## 🔒 Security Considerations

- Seed Phrase Security: Keep your seed phrase safe and never share it
- Provider Security: Use trusted RPC endpoints
- Approval Safety: USDT on mainnet may reset allowance to 0 before approval
- Fee Limits: Use `swapMaxFee` to prevent high gas costs
- Quote First: Get a quote before swapping

## 🛠️ Development

### Building

```bash
# Install dependencies
npm install

# Build TypeScript definitions
npm run build:types

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

### Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📜 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🆘 Support

For support, please open an issue on the GitHub repository.