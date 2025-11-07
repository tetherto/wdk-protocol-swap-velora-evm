import { beforeEach, describe, expect, jest, test } from '@jest/globals'

import * as ethers from 'ethers'

import * as veloraDexSdk from '@velora-dex/sdk'

import { WalletAccountEvm, WalletAccountReadOnlyEvm } from '@tetherto/wdk-wallet-evm'

import { WalletAccountEvmErc4337, WalletAccountReadOnlyEvmErc4337 } from '@tetherto/wdk-wallet-evm-erc-4337'

const { SwapSide } = veloraDexSdk

const SEED = 'cook voyage document eight skate token alien guide drink uncle term abuse'

const USER_ADDRESS = '0xa460AEbce0d3A4BecAd8ccf9D6D4861296c503Bd'

const TOKEN_IN = '0x9e6b38E072f624fdC4Fbaf7bB12a7D9e657435ce'
const TOKEN_OUT = '0x73091d62F1F11DCb172530126E9630e327770e05'
const VELORA = '0xf90e98F3D8Dce44632E5020ABF2E122E0f99DFAb'

const getRateMock = jest.fn()

const buildTxMock = jest.fn()

jest.unstable_mockModule('ethers', () => ({
  ...ethers,
  JsonRpcProvider: jest.fn().mockImplementation(() => ({
    getNetwork: jest.fn().mockResolvedValue({ chainId: 1n })
  }))
}))

jest.unstable_mockModule('@velora-dex/sdk', () => ({
  ...veloraDexSdk,
  constructSimpleSDK: jest.fn().mockReturnValue({
    chainId: 1,
    swap: {
      getRate: getRateMock,
      buildTx: buildTxMock
    }
  })
}))

const { default: VeloraProtocolEvm } = await import('../index.js')

describe('VeloraSwapProtocolEvm', () => {
  const DUMMY_PRICE_ROUTE = {
    srcToken: TOKEN_IN,
    destToken: TOKEN_OUT,
    srcAmount: '100',
    destAmount: '100000'
  }

  const DUMMY_BUILD_TX_INPUT = {
    partner: 'wdk',
    srcToken: DUMMY_PRICE_ROUTE.srcToken,
    destToken: DUMMY_PRICE_ROUTE.destToken,
    srcAmount: DUMMY_PRICE_ROUTE.srcAmount,
    destAmount: DUMMY_PRICE_ROUTE.destAmount,
    userAddress: USER_ADDRESS,
    receiver: undefined,
    priceRoute: DUMMY_PRICE_ROUTE
  }

  const DUMMY_SWAP_TRANSACTION = {
    to: VELORA,
    value: 0,
    data: 'dummy-swap-method-data'
  }

  let account,
      protocol

  describe('with WalletAccountEvm', () => {
    beforeEach(() => {
      account = new WalletAccountEvm(SEED, "0'/0/0", {
        provider: 'https://mock-rpc-url.com'
      })

      account.getAddress = jest.fn().mockResolvedValue(USER_ADDRESS)

      protocol = new VeloraProtocolEvm(account)
    })

    describe('swap', () => {
      beforeEach(() => {
        getRateMock.mockResolvedValue(DUMMY_PRICE_ROUTE)

        buildTxMock.mockResolvedValue(DUMMY_SWAP_TRANSACTION)

        account.quoteSendTransaction = jest.fn()
          .mockResolvedValueOnce({ fee: 12_345n })

        account.sendTransaction = jest.fn()
          .mockResolvedValueOnce({ hash: 'dummy-swap-hash', fee: 12_345n })
      })

      test('should successfully perform a swap operation (buy)', async () => {
        const result = await protocol.swap({
          tokenIn: TOKEN_IN,
          tokenOut: TOKEN_OUT,
          tokenOutAmount: 100_000
        })

        expect(getRateMock).toHaveBeenCalledWith({
          srcToken: TOKEN_IN,
          destToken: TOKEN_OUT,
          amount: '100000',
          side: SwapSide.BUY
        })

        expect(buildTxMock).toHaveBeenCalledWith(DUMMY_BUILD_TX_INPUT, { ignoreChecks: true })

        expect(account.quoteSendTransaction).toHaveBeenCalledWith(DUMMY_SWAP_TRANSACTION)

        expect(account.sendTransaction).toHaveBeenCalledWith(DUMMY_SWAP_TRANSACTION)

        expect(result).toEqual({
          hash: 'dummy-swap-hash',
          fee: 12_345n,
          tokenInAmount: 100n,
          tokenOutAmount: 100_000n
        })
      })

      test('should successfully perform a swap operation (sell)', async () => {
        const result = await protocol.swap({
          tokenIn: TOKEN_IN,
          tokenOut: TOKEN_OUT,
          tokenInAmount: 100
        })

        expect(getRateMock).toHaveBeenCalledWith({
          srcToken: TOKEN_IN,
          destToken: TOKEN_OUT,
          amount: '100',
          side: SwapSide.SELL
        })

        expect(buildTxMock).toHaveBeenCalledWith(DUMMY_BUILD_TX_INPUT, { ignoreChecks: true })

        expect(account.quoteSendTransaction).toHaveBeenCalledWith(DUMMY_SWAP_TRANSACTION)

        expect(account.sendTransaction).toHaveBeenCalledWith(DUMMY_SWAP_TRANSACTION)

        expect(result).toEqual({
          hash: 'dummy-swap-hash',
          fee: 12_345n,
          tokenInAmount: 100n,
          tokenOutAmount: 100_000n
        })
      })

      test('should throw if the swap fee exceeds the swap max fee configuration', async () => {
        const OPTIONS = {
          tokenIn: TOKEN_IN,
          tokenOut: TOKEN_OUT,
          tokenOutAmount: 100_000
        }

        const protocol = new VeloraProtocolEvm(account, {
          swapMaxFee: 0
        })

        await expect(protocol.swap(OPTIONS))
          .rejects.toThrow('Exceeded maximum fee cost for swap operation.')
      })

      test('should throw if the account is read-only', async () => {
        const account = new WalletAccountReadOnlyEvm(USER_ADDRESS, {
          provider: 'https://mock-rpc-url.com'
        })

        const protocol = new VeloraProtocolEvm(account)

        await expect(protocol.swap({ }))
          .rejects.toThrow("The 'swap(options)' method requires the protocol to be initialized with a non read-only account.")
      })

      test('should throw if the account is not connected to a provider', async () => {
        const account = new WalletAccountEvm(SEED, "0'/0/0")

        const protocol = new VeloraProtocolEvm(account)

        await expect(protocol.swap({ }))
          .rejects.toThrow('The wallet must be connected to a provider in order to perform swap operations.')
      })
    })

    describe('quoteSwap', () => {
      beforeEach(() => {
        getRateMock.mockResolvedValue(DUMMY_PRICE_ROUTE)

        buildTxMock.mockResolvedValue(DUMMY_SWAP_TRANSACTION)

        account.quoteSendTransaction = jest.fn()
          .mockResolvedValueOnce({ fee: 12_345n })
      })

      test('should successfully quote a swap operation (buy)', async () => {
        const result = await protocol.quoteSwap({
          tokenIn: TOKEN_IN,
          tokenOut: TOKEN_OUT,
          tokenOutAmount: 100_000
        })

        expect(getRateMock).toHaveBeenCalledWith({
          srcToken: TOKEN_IN,
          destToken: TOKEN_OUT,
          amount: '100000',
          side: SwapSide.BUY
        })

        expect(buildTxMock).toHaveBeenCalledWith(DUMMY_BUILD_TX_INPUT, { ignoreChecks: true })

        expect(account.quoteSendTransaction).toHaveBeenCalledWith(DUMMY_SWAP_TRANSACTION)

        expect(result).toEqual({
          fee: 12_345n,
          tokenInAmount: 100n,
          tokenOutAmount: 100_000n
        })
      })

      test('should successfully quote a swap operation (sell)', async () => {
        const result = await protocol.quoteSwap({
          tokenIn: TOKEN_IN,
          tokenOut: TOKEN_OUT,
          tokenInAmount: 100
        })

        expect(getRateMock).toHaveBeenCalledWith({
          srcToken: TOKEN_IN,
          destToken: TOKEN_OUT,
          amount: '100',
          side: SwapSide.SELL
        })

        expect(buildTxMock).toHaveBeenCalledWith(DUMMY_BUILD_TX_INPUT, { ignoreChecks: true })

        expect(account.quoteSendTransaction).toHaveBeenCalledWith(DUMMY_SWAP_TRANSACTION)

        expect(result).toEqual({
          fee: 12_345n,
          tokenInAmount: 100n,
          tokenOutAmount: 100_000n
        })
      })

      test('should throw if the account is not connected to a provider', async () => {
        const account = new WalletAccountEvm(SEED, "0'/0/0")

        const protocol = new VeloraProtocolEvm(account)

        await expect(protocol.quoteSwap({ }))
          .rejects.toThrow('The wallet must be connected to a provider in order to quote swap operations.')
      })
    })
  })

  describe('with WalletAccountEvmErc4337', () => {
    beforeEach(() => {
      account = new WalletAccountEvmErc4337(SEED, "0'/0/0", {
        chainId: 1,
        provider: 'https://mock-rpc-url.com'
      })

      account.getAddress = jest.fn().mockResolvedValue(USER_ADDRESS)

      protocol = new VeloraProtocolEvm(account)
    })

    describe('swap', () => {
      beforeEach(() => {
        getRateMock.mockResolvedValue(DUMMY_PRICE_ROUTE)

        buildTxMock.mockResolvedValue(DUMMY_SWAP_TRANSACTION)

        account.quoteSendTransaction = jest.fn()
          .mockResolvedValueOnce({ fee: 12_345n })

        account.sendTransaction = jest.fn()
          .mockResolvedValueOnce({ hash: 'dummy-user-operation-hash', fee: 12_345n })
      })

      test('should successfully perform a swap operation (buy)', async () => {
        const result = await protocol.swap({
          tokenIn: TOKEN_IN,
          tokenOut: TOKEN_OUT,
          tokenOutAmount: 100_000
        })

        expect(getRateMock).toHaveBeenCalledWith({
          srcToken: TOKEN_IN,
          destToken: TOKEN_OUT,
          amount: '100000',
          side: SwapSide.BUY
        })

        expect(buildTxMock).toHaveBeenCalledWith(DUMMY_BUILD_TX_INPUT, { ignoreChecks: true })

        expect(account.quoteSendTransaction).toHaveBeenCalledWith([DUMMY_SWAP_TRANSACTION], undefined)

        expect(account.sendTransaction).toHaveBeenCalledWith([DUMMY_SWAP_TRANSACTION], undefined)

        expect(result).toEqual({
          hash: 'dummy-user-operation-hash',
          fee: 12_345n,
          tokenInAmount: 100n,
          tokenOutAmount: 100_000n
        })
      })

      test('should successfully perform a swap operation (sell)', async () => {
        const result = await protocol.swap({
          tokenIn: TOKEN_IN,
          tokenOut: TOKEN_OUT,
          tokenInAmount: 100
        })

        expect(getRateMock).toHaveBeenCalledWith({
          srcToken: TOKEN_IN,
          destToken: TOKEN_OUT,
          amount: '100',
          side: SwapSide.SELL
        })

        expect(buildTxMock).toHaveBeenCalledWith(DUMMY_BUILD_TX_INPUT, { ignoreChecks: true })

        expect(account.quoteSendTransaction).toHaveBeenCalledWith([DUMMY_SWAP_TRANSACTION], undefined)

        expect(account.sendTransaction).toHaveBeenCalledWith([DUMMY_SWAP_TRANSACTION], undefined)

        expect(result).toEqual({
          hash: 'dummy-user-operation-hash',
          fee: 12_345n,
          tokenInAmount: 100n,
          tokenOutAmount: 100_000n
        })
      })

      test('should throw if the swap fee exceeds the swap max fee configuration', async () => {
        const OPTIONS = {
          tokenIn: TOKEN_IN,
          tokenOut: TOKEN_OUT,
          tokenOutAmount: 100_000
        }

        const protocol = new VeloraProtocolEvm(account, {
          swapMaxFee: 0
        })

        await expect(protocol.swap(OPTIONS))
          .rejects.toThrow('Exceeded maximum fee cost for swap operation.')
      })

      test('should throw if the account is read-only', async () => {
        const account = new WalletAccountReadOnlyEvmErc4337(USER_ADDRESS, {
          chainId: 1,
          provider: 'https://mock-rpc-url.com'
        })

        const protocol = new VeloraProtocolEvm(account)

        await expect(protocol.swap({ }))
          .rejects.toThrow("The 'swap(options)' method requires the protocol to be initialized with a non read-only account.")
      })

      test('should throw if the account is not connected to a provider', async () => {
        const account = new WalletAccountEvmErc4337(SEED, "0'/0/0", {
          chainId: 1
        })

        const protocol = new VeloraProtocolEvm(account)

        await expect(protocol.swap({ }))
          .rejects.toThrow('The wallet must be connected to a provider in order to perform swap operations.')
      })
    })

    describe('quoteSwap', () => {
      beforeEach(() => {
        getRateMock.mockResolvedValue(DUMMY_PRICE_ROUTE)

        buildTxMock.mockResolvedValue(DUMMY_SWAP_TRANSACTION)

        account.quoteSendTransaction = jest.fn()
          .mockResolvedValueOnce({ fee: 12_345n })
      })

      test('should successfully quote a swap operation (buy)', async () => {
        const result = await protocol.quoteSwap({
          tokenIn: TOKEN_IN,
          tokenOut: TOKEN_OUT,
          tokenOutAmount: 100_000
        })

        expect(getRateMock).toHaveBeenCalledWith({
          srcToken: TOKEN_IN,
          destToken: TOKEN_OUT,
          amount: '100000',
          side: SwapSide.BUY
        })

        expect(buildTxMock).toHaveBeenCalledWith(DUMMY_BUILD_TX_INPUT, { ignoreChecks: true })

        expect(account.quoteSendTransaction).toHaveBeenCalledWith([DUMMY_SWAP_TRANSACTION], undefined)

        expect(result).toEqual({
          fee: 12_345n,
          tokenInAmount: 100n,
          tokenOutAmount: 100_000n
        })
      })

      test('should successfully quote a swap operation (sell)', async () => {
        const result = await protocol.quoteSwap({
          tokenIn: TOKEN_IN,
          tokenOut: TOKEN_OUT,
          tokenInAmount: 100
        })

        expect(getRateMock).toHaveBeenCalledWith({
          srcToken: TOKEN_IN,
          destToken: TOKEN_OUT,
          amount: '100',
          side: SwapSide.SELL
        })

        expect(buildTxMock).toHaveBeenCalledWith(DUMMY_BUILD_TX_INPUT, { ignoreChecks: true })

        expect(account.quoteSendTransaction).toHaveBeenCalledWith([DUMMY_SWAP_TRANSACTION], undefined)

        expect(result).toEqual({
          fee: 12_345n,
          tokenInAmount: 100n,
          tokenOutAmount: 100_000n
        })
      })

      test('should throw if the account is not connected to a provider', async () => {
        const account = new WalletAccountEvmErc4337(SEED, "0'/0/0", {
          chainId: 1
        })

        const protocol = new VeloraProtocolEvm(account)

        await expect(protocol.quoteSwap({ }))
          .rejects.toThrow('The wallet must be connected to a provider in order to quote swap operations.')
      })
    })
  })
})
