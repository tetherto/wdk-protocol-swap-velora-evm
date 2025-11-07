export default class VeloraProtocolEvm extends SwapProtocol {
    /**
     * Creates a new read-only interface to the Velora protocol for evm blockchains.
     *
     * @overload
     * @param {WalletAccountReadOnlyEvm | WalletAccountReadOnlyEvmErc4337} account - The wallet account to use to interact with the protocol.
     * @param {SwapProtocolConfig} [config] - The swap protocol configuration.
     */
    constructor(account: WalletAccountReadOnlyEvm | WalletAccountReadOnlyEvmErc4337, config?: SwapProtocolConfig);
    /**
     * Creates a new interface to the Velora protocol for evm blockchains.
     *
     * @overload
     * @param {WalletAccountEvm | WalletAccountEvmErc4337} account - The wallet account to use to interact with the protocol.
     * @param {SwapProtocolConfig} [config] - The swap protocol configuration.
     */
    constructor(account: WalletAccountEvm | WalletAccountEvmErc4337, config?: SwapProtocolConfig);
    /** @private */
    private _veloraSdk;
    /** @private */
    private _provider;
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
    swap(options: SwapOptions, config?: Pick<EvmErc4337WalletConfig, "paymasterToken"> & Pick<SwapProtocolConfig, "swapMaxFee">): Promise<SwapResult>;
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
    quoteSwap(options: SwapOptions, config?: Pick<EvmErc4337WalletConfig, "paymasterToken">): Promise<Omit<SwapResult, "hash">>;
    /** @private */
    private _getVeloraSdk;
    /** @private */
    private _getSwapTransactions;
}
export type SwapProtocolConfig = import("@tetherto/wdk-wallet/protocols").SwapProtocolConfig;
export type SwapOptions = import("@tetherto/wdk-wallet/protocols").SwapOptions;
export type SwapResult = import("@tetherto/wdk-wallet/protocols").SwapResult;
export type WalletAccountReadOnlyEvm = import("@tetherto/wdk-wallet-evm").WalletAccountReadOnlyEvm;
export type EvmErc4337WalletConfig = import("@tetherto/wdk-wallet-evm-erc-4337").EvmErc4337WalletConfig;
import { SwapProtocol } from '@tetherto/wdk-wallet/protocols';
import { WalletAccountEvm } from '@tetherto/wdk-wallet-evm';
import { WalletAccountReadOnlyEvmErc4337, WalletAccountEvmErc4337 } from '@tetherto/wdk-wallet-evm-erc-4337';
