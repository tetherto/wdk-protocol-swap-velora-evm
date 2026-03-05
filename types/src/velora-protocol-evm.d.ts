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
     * @param {Partial<EvmErc4337WalletPaymasterTokenConfig | EvmErc4337WalletSponsorshipPolicyConfig | EvmErc4337WalletNativeCoinsConfig> & Pick<SwapProtocolConfig, 'swapMaxFee'>} [config] - Allows
     *   to override the 'swapMaxFee' option. If the protocol has been initialized with an erc-4337 wallet account, it also allows to override its configuration options.
     * @returns {Promise<SwapResult>} The swap's result.
     */
    swap(options: SwapOptions, config?: Partial<EvmErc4337WalletPaymasterTokenConfig | EvmErc4337WalletSponsorshipPolicyConfig | EvmErc4337WalletNativeCoinsConfig> & Pick<SwapProtocolConfig, "swapMaxFee">): Promise<SwapResult>;
    /**
     * Quotes the costs of a swap operation.
     *
     * Users must first approve the necessary amount of input tokens to the Velora protocol using the {@link WalletAccountEvm#approve} or the {@link WalletAccountEvmErc4337#approve} method.
     *
     * @param {SwapOptions} options - The swap's options.
     * @param {Partial<EvmErc4337WalletPaymasterTokenConfig | EvmErc4337WalletSponsorshipPolicyConfig | EvmErc4337WalletNativeCoinsConfig>} [config] - If the protocol has been initialized with
     *   an erc-4337 wallet account, allows to override its configuration options.
     * @returns {Promise<Omit<SwapResult, 'hash'>>} The swap's quotes.
     */
    quoteSwap(options: SwapOptions, config?: Partial<EvmErc4337WalletPaymasterTokenConfig | EvmErc4337WalletSponsorshipPolicyConfig | EvmErc4337WalletNativeCoinsConfig>): Promise<Omit<SwapResult, "hash">>;
    /** @private */
    private _getVeloraSdk;
    /** @private */
    private _getSwapTransactions;
}
export type SwapProtocolConfig = import("@tetherto/wdk-wallet/protocols").SwapProtocolConfig;
export type SwapOptions = import("@tetherto/wdk-wallet/protocols").SwapOptions;
export type SwapResult = import("@tetherto/wdk-wallet/protocols").SwapResult;
export type WalletAccountReadOnlyEvm = import("@tetherto/wdk-wallet-evm").WalletAccountReadOnlyEvm;
export type EvmErc4337WalletPaymasterTokenConfig = import("@tetherto/wdk-wallet-evm-erc-4337").EvmErc4337WalletPaymasterTokenConfig;
export type EvmErc4337WalletSponsorshipPolicyConfig = import("@tetherto/wdk-wallet-evm-erc-4337").EvmErc4337WalletSponsorshipPolicyConfig;
export type EvmErc4337WalletNativeCoinsConfig = import("@tetherto/wdk-wallet-evm-erc-4337").EvmErc4337WalletNativeCoinsConfig;
import { SwapProtocol } from '@tetherto/wdk-wallet/protocols';
import { WalletAccountEvm } from '@tetherto/wdk-wallet-evm';
import { WalletAccountReadOnlyEvmErc4337, WalletAccountEvmErc4337 } from '@tetherto/wdk-wallet-evm-erc-4337';
