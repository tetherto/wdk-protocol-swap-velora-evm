// Copyright 2024 Tether Operations Limited
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict'

import { SwapProtocol } from '@tetherto/wdk-wallet/protocols'
import { WalletAccountEvm } from '@tetherto/wdk-wallet-evm'
import { WalletAccountEvmErc4337, WalletAccountReadOnlyEvmErc4337 } from '@tetherto/wdk-wallet-evm-erc-4337'

import { JsonRpcProvider, BrowserProvider } from 'ethers'

import { constructSimpleSDK } from '@velora-dex/sdk'

/** @typedef {import('@tetherto/wdk-wallet/protocols').SwapProtocolConfig} SwapProtocolConfig */
/** @typedef {import('@tetherto/wdk-wallet/protocols').SwapOptions} SwapOptions */
/** @typedef {import('@tetherto/wdk-wallet/protocols').SwapResult} SwapResult */

/** @typedef {import('@tetherto/wdk-wallet-evm').WalletAccountReadOnlyEvm} WalletAccountReadOnlyEvm */

/** @typedef {import('@tetherto/wdk-wallet-evm-erc-4337').EvmErc4337WalletConfig} EvmErc4337WalletConfig */

export default class VeloraProtocolEvm extends SwapProtocol {
  /**
   * Creates a new read-only interface to the Velora protocol for evm blockchains.
   *
   * @overload
   * @param {WalletAccountReadOnlyEvm | WalletAccountReadOnlyEvmErc4337} account - The wallet account to use to interact with the protocol.
   * @param {SwapProtocolConfig} [config] - The swap protocol configuration.
   */

  /**
   * Creates a new interface to the Velora protocol for evm blockchains.
   *
   * @overload
   * @param {WalletAccountEvm | WalletAccountEvmErc4337} account - The wallet account to use to interact with the protocol.
   * @param {SwapProtocolConfig} [config] - The swap protocol configuration.
   */
  constructor (account, config) {
    super(account, config)

    /** @private */
    this._veloraSdk = undefined

    if (account._config.provider) {
      const { provider } = account._config

      /** @private */
      this._provider = typeof provider === 'string'
        ? new JsonRpcProvider(provider)
        : new BrowserProvider(provider)
    }
  }

  /**
   * Swaps a pair of tokens.
   *
   * Users must first approve the necessary amount of input tokens to the Velora protocol using the {@link WalletAccountEvm#approve} or the {@link WalletAccountEvmErc4337#approve} method.
   *
   * @param {SwapOptions} options - The swap's options.
   * @param {Pick<EvmErc4337WalletConfig, 'paymasterToken'> & Pick<SwapProtocolConfig, 'swapMaxFee'>} [config] - If the protocol has
   *   been initialized with an erc-4337 wallet account, overrides the 'paymasterToken' option defined in its configuration and the
   *   'swapMaxFee' option defined in the protocol configuration.
   * @returns {Promise<SwapResult>} The swap's result.
   */
  async swap (options, config) {
    if (!(this._account instanceof WalletAccountEvm) && !(this._account instanceof WalletAccountEvmErc4337)) {
      throw new Error("The 'swap(options)' method requires the protocol to be initialized with a non read-only account.")
    }

    if (!this._provider) {
      throw new Error('The wallet must be connected to a provider in order to perform swap operations.')
    }

    const { swapTx, tokenInAmount, tokenOutAmount } = await this._getSwapTransactions(options)

    if (this._account instanceof WalletAccountEvmErc4337) {
      const { swapMaxFee } = config ?? this._config

      const { fee } = await this._account.quoteSendTransaction([swapTx], config)

      if (swapMaxFee !== undefined && fee >= swapMaxFee) {
        throw new Error('Exceeded maximum fee cost for swap operation.')
      }

      const { hash } = await this._account.sendTransaction([swapTx], config)

      return { hash, fee, tokenInAmount, tokenOutAmount }
    }

    const { fee } = await this._account.quoteSendTransaction(swapTx)

    if (this._config.swapMaxFee !== undefined && fee >= this._config.swapMaxFee) {
      throw new Error('Exceeded maximum fee cost for swap operation.')
    }

    const { hash } = await this._account.sendTransaction(swapTx)

    return { hash, fee, tokenInAmount, tokenOutAmount }
  }

  /**
   * Quotes the costs of a swap operation.
   *
   * Users must first approve the necessary amount of input tokens to the Velora protocol using the {@link WalletAccountEvm#approve} or the {@link WalletAccountEvmErc4337#approve} method.
   *
   * @param {SwapOptions} options - The swap's options.
   * @param {Pick<EvmErc4337WalletConfig, 'paymasterToken'>} [config] - If the protocol has been initialized with an erc-4337
   *   wallet account, overrides the 'paymasterToken' option defined in its configuration.
   * @returns {Promise<Omit<SwapResult, 'hash'>>} The swap's quotes.
   */
  async quoteSwap (options, config) {
    if (!this._provider) {
      throw new Error('The wallet must be connected to a provider in order to quote swap operations.')
    }

    const { swapTx, tokenInAmount, tokenOutAmount } = await this._getSwapTransactions(options)

    if (this._account instanceof WalletAccountReadOnlyEvmErc4337) {
      const { fee } = await this._account.quoteSendTransaction([swapTx], config)

      return { fee, tokenInAmount, tokenOutAmount }
    }

    const { fee } = await this._account.quoteSendTransaction(swapTx)

    return { fee, tokenInAmount, tokenOutAmount }
  }

  /** @private */
  async _getVeloraSdk () {
    if (!this._veloraSdk) {
      const network = await this._provider.getNetwork()

      this._veloraSdk = constructSimpleSDK({
        fetch,
        chainId: Number(network.chainId)
      })
    }

    return this._veloraSdk
  }

  /** @private */
  async _getSwapTransactions ({ tokenIn, tokenOut, tokenInAmount, tokenOutAmount, to }) {
    const veloraSdk = await this._getVeloraSdk()

    const { side, amount } = tokenInAmount
      ? { side: 'SELL', amount: tokenInAmount }
      : { side: 'BUY', amount: tokenOutAmount }

    const priceRoute = await veloraSdk.swap.getRate({
      srcToken: tokenIn,
      destToken: tokenOut,
      amount: amount.toString(),
      side
    })

    const address = await this._account.getAddress()

    const swapTx = await veloraSdk.swap.buildTx({
      partner: 'wdk',
      srcToken: priceRoute.srcToken,
      destToken: priceRoute.destToken,
      srcAmount: priceRoute.srcAmount,
      destAmount: priceRoute.destAmount,
      userAddress: address,
      receiver: to,
      priceRoute
    }, {
      ignoreChecks: true
    })

    return {
      swapTx,
      tokenInAmount: BigInt(priceRoute.srcAmount),
      tokenOutAmount: BigInt(priceRoute.destAmount)
    }
  }
}
