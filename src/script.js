/*eslint no-undef: "off"*/
const script = function (props) {

  this.constants = {
    CACHE: 'WEB3_CONNECT_CACHED_PROVIDER',
    EVENT: {
        CLICK: 'click',
        CONNECTED: 'Connected',
        ACCOUNT_CHANGED: 'accountsChanged',
        CHAIN_CHANGED: 'chainChanged',
        NETWORK_CHANGED: 'networkChanged',
        TOAST: 'onToast',
        DISCONNECTED: 'onDisconnect'
    },
    SEVERITY: {
      ERROR: 'error'
    },
    SCOPE: 'openid wallet',
    CONNECT_WALLET: 'Connect Wallet'
  }

  const {
    EVENT,
    CACHE,
    SEVERITY,
    CONNECT_WALLET,
    SCOPE
  } = this.constants

  const { 
      Web3Modal, 
      WalletConnectProvider,
      UAuthWeb3Modal,
      UAuthSPA
  } = window.webstudio

  const {
    ethers
  } = window

  this.getComponent = () => {
    return document.getElementById(this.id)
  }

  this.originalText = this.getComponent()?.querySelector('span')?.textContent || CONNECT_WALLET;

  this.getProviderOptions = () => {
    const providerOptions = {
        walletconnect: {
            package: WalletConnectProvider,
            options: {
                infuraId: process.env.INFURA_KEY,
                rpc: {
                    1: `https://mainnet.infura.io/v3/${process.env.INFURA_KEY}`,
                    42: `https://kovan.infura.io/v3/${process.env.INFURA_KEY}`,
                    137: `https://polygon-mainnet.infura.io/v3/${process.env.INFURA_KEY}`,
                    80001: "https://matic-mumbai.chainstacklabs.com",
                }
            }
        }
    }
    // Unstoppable Domains support?
    if (props.udAppId) {
        providerOptions["custom-uauth"] = {
            display: UAuthWeb3Modal.display,
            connector: UAuthWeb3Modal.connector,
            package: UAuthSPA,
            options: {
              clientID: props.udAppId,
              scope: SCOPE,
              redirectUri: props.udCallback
            },
        }
    }
    return providerOptions
  }

  this.getModal = () => {
      const providerOptions = this.getProviderOptions()
      const modal = new Web3Modal({
        cacheProvider: true,
        providerOptions,
        disableInjectedProvider: false
      })
      return modal
  }

  this.onConnect = (provider) => {
      window.walletProvider = provider;
      document.dispatchEvent(new Event(EVENT.CONNECTED, window.walletProvider));
      this.setupProviderListeners()
      this.fetchAccountData()
  }

  this.handleAccountChanged = (accounts) => {
      document.dispatchEvent(new Event(EVENT.ACCOUNT_CHANGED, accounts))
      this.fetchAccountData()
  }

  this.handleChainChanged = (chainId) => {
      document.dispatchEvent(new Event(EVENT.CHAIN_CHANGED, chainId))
      this.fetchAccountData()
  }

  this.handleNetworkChanged = (networkId) => {
      document.dispatchEvent(new Event(EVENT.NETWORK_CHANGED, networkId))
      this.fetchAccountData()
  }

  this.setupProviderListeners = () => {
      window.walletProvider.on(EVENT.ACCOUNT_CHANGED, this.handleAccountChanged)
      window.walletProvider.on(EVENT.CHAIN_CHANGED, this.handleChainChanged)
      window.walletProvider.on(EVENT.NETWORK_CHANGED, this.handleNetworkChanged)
  }

  this.setButtonText = (text) => {
      const button = this.getComponent()
      button.querySelector('span').textContent = text
  }

  this.handleGetAddress = (address) => {
      const parsedAddress = this.formatAddress(address)
      this.setButtonText(parsedAddress)
  }

  this.fetchAccountData = () => {
      const wallet = new ethers.providers.Web3Provider(walletProvider)
      const signer = wallet.getSigner()
      signer.getAddress().then(this.handleGetAddress);
  }

  this.connect = () => {
      try {
        const modal = this.getModal()
        modal.connect().then(this.onConnect)
      } catch (e) {
        console.log("Could not get a wallet connection", e)
        this.sendNotification(SEVERITY.ERROR, e.message, null, 5000)
      }
  }

  this.sendNotification = (alertSeverity, message, link, timeout) => {
    const detail = { 
        detail: { 
            alertSeverity, 
            message, 
            link,
            timeout
        }
    }
    const cEvent = new CustomEvent(EVENT.TOAST, detail)
    document.dispatchEvent(cEvent)
  }

  this.disconnect = () => {
    console.log("Disconnecting wallet", walletProvider)
    document.dispatchEvent(new Event(EVENT.DISCONNECTED, walletProvider))
    try {
        localStorage.removeItem(CACHE);
        localStorage.clear();
        window.walletProvider = null
        this.getModal()?.clearCachedProvider();
    } catch (e) {
        console.log("Could not disconnect wallet completly", e)
        this.sendNotification(SEVERITY.ERROR, e.message, null, 5000)
    } finally {
        this.setButtonText(this.originalText)
    }
  }

  this.handleToggleConnect = () => {
    if (window.walletProvider) {
      this.disconnect()
    } else {
      this.connect()
    }
  }

  this.setupEditMode = () => {
    if (!props.isEdit) {
      const button = this.getComponent()
      button.addEventListener(EVENT.CLICK, this.handleToggleConnect)
    }
  }

  this.getCachedProvider = () => {
    return localStorage.getItem(CACHE)
  }

  this.initialize = () => {
      this.setupEditMode();
      const modal = this.getModal()

      if (props.udAppId)
          UAuthWeb3Modal.registerWeb3Modal(modal)

      const cachedProvider = this.getCachedProvider()
      if (cachedProvider) {
        this.connect()
      }
  }

  this.formatAddress = (address) => {
      return `${address.slice(0, 6)}...${address.slice(address.length-4, address.length)}`
  }

  this.initialize();
}

export default script