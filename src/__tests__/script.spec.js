import script from "../script";

describe("Wallet Connect script", () => {

    let spyFind, spyAddListener, mockElement, mockText, modalConnectFn, onConnect;

    beforeEach(() => {
        mockElement = document.createElement('button')
        mockElement.id = "wsm-wallet-connect"
        // Text
        mockText = document.createElement('span')
        mockElement.appendChild(mockText)

        spyAddListener = jest.spyOn(mockElement, 'addEventListener')
        spyFind = jest.spyOn(document, 'getElementById')
        spyFind.mockReturnValue(mockElement)
        onConnect = jest.fn()
        modalConnectFn = jest.fn().mockReturnValue({ then: onConnect })
        window.webstudio = {
            Web3Modal: jest.fn().mockReturnValue({ connect: modalConnectFn }),
            WalletConnectProvider: jest.fn(),
            UAuthWeb3Modal: {
                display: jest.fn(),
                connector: jest.fn(),
                registerWeb3Modal: jest.fn()
            },
            UAuthSPA: jest.fn()
        }
        process.env.INFURA_KEY = 'abc'
        const localStorageMock = {
            getItem: jest.fn(),
            setItem: jest.fn(),
            clear: jest.fn(),
            removeItem: jest.fn()
          };
        global.localStorage = localStorageMock;
    })

    afterEach(() => {
        jest.clearAllMocks()
        window.walletProvider = null
    })

    describe("getComponent", () => {
        it("Finds parent toast", async () => {
            const fn = new script({ isEdit: false })
            const component = fn.getComponent()
            expect(component).toBe(mockElement)
        })
    })

    describe("setupEditMode", () => {
        it("Setups up listener if not en edit mode", () => {
            new script({isEdit:false})
            expect(spyFind).toHaveBeenCalled()
            expect(spyAddListener).toHaveBeenCalled()
        })

        it("Does not setup listener if in edit mode", () => {
            new script({isEdit:true})
            expect(spyFind).toHaveBeenCalled()
            expect(spyAddListener).not.toHaveBeenCalled()
        })
    })

    describe("getModal", () => {
        it("Calls Web3Modal", () => {
            const logic = new script({ isEdit: false })
            logic.getModal()
            expect(window.webstudio.Web3Modal).toHaveBeenCalled()
        })
    })

    describe("formatAddress", () => {
        it("crops correctly a 0x Address to display", () => {
            const logic = new script({isEdit: false})
            const addr = logic.formatAddress('0x7e38bB683C72f02c8FaFe2e06E193c27e182bb7B')
            expect(addr).toBe('0x7e38...bb7B')
        })
    })

    describe("getProviderOptions", () => {
        it("Returns json object with connection data", () => {
            const logic = new script({ isEdit: false })
            const options = logic.getProviderOptions()
            const expected = {
                "walletconnect": {
                    "options": {
                        "infuraId": "abc", 
                        "rpc": {
                            "1": "https://mainnet.infura.io/v3/abc", 
                            "137": "https://polygon-mainnet.infura.io/v3/abc", 
                            "42": "https://kovan.infura.io/v3/abc", 
                            "80001": "https://matic-mumbai.chainstacklabs.com"}
                        }, 
                        "package": window.webstudio.WalletConnectProvider
                    }
            }
            expect(options).toEqual(expected)
        })  

        it("Includes Unstoppable Domains parameters if included in the component attributes", () => {
            const logic = new script({ isEdit: false, udAppId: '123', udCallback: 'abcd' })
            const options = logic.getProviderOptions()
            const expected = {
                "walletconnect": {
                    "options": {
                        "infuraId": "abc", 
                        "rpc": {
                            "1": "https://mainnet.infura.io/v3/abc", 
                            "137": "https://polygon-mainnet.infura.io/v3/abc", 
                            "42": "https://kovan.infura.io/v3/abc", 
                            "80001": "https://matic-mumbai.chainstacklabs.com"}
                        }, 
                    "package": window.webstudio.WalletConnectProvider
                },
                "custom-uauth": {
                    "display": window.webstudio.UAuthWeb3Modal.display,
                    "connector": window.webstudio.UAuthWeb3Modal.connector,
                    "package": window.webstudio.UAuthSPA,
                    "options": {
                        "clientID": '123',
                        "scope": 'openid wallet',
                        "redirectUri": 'abcd'
                    },
                }
            }
            expect(options).toEqual(expected)
        }) 
    })

    describe("handleToggleConnect", () => {
        it("Connects if disconnected", () => {
            const logic = new script({ isEdit: false })
            logic.connect = jest.fn()
            logic.handleToggleConnect()
            expect(logic.connect).toHaveBeenCalled()
        })

        it("Disconnects if connected", () => {
            window.walletProvider = { test: 1 }
            const logic = new script({ isEdit: false })
            logic.disconnect = jest.fn()
            logic.handleToggleConnect()
            expect(logic.disconnect).toHaveBeenCalled()
        })
    })

    describe("initialize", () => {
        it("Finds and attaches click behavior to button parent component if not in edit mode", async () => {
            new script({ isEdit: false })
            expect(spyFind).toHaveBeenCalled()
            expect(spyAddListener).toHaveBeenCalled()
        })

        it("Registers modal in UD modal if using the UD configuration", async () => {
            const logic = new script({ isEdit: false, udAppId: 1 })
            logic.getCachedProvider = jest.fn().mockReturnValue({ value: true})
            logic.connect = jest.fn()
            logic.initialize()
            expect(window.webstudio.UAuthWeb3Modal.registerWeb3Modal).toHaveBeenCalled()
            expect(logic.connect).toHaveBeenCalled()
        })
    })

    describe("connect", () => {
        it("Assings window.walletProvider successfully on connection", () => {
            window.walletProvider = undefined
            const logic = new script({ isEdit: false })
            const connect = jest.fn().mockReturnValue({ then: jest.fn() })
            logic.getModal = jest.fn().mockReturnValue({ connect })
            logic.connect()
            expect(logic.getModal).toHaveBeenCalled()
        })

        it("Emits onToast event with failure message if error", () => {
            const spy = jest.spyOn(document, 'dispatchEvent')
            window.walletProvider = null
            const logic = new script({ isEdit: false })
            logic.getModal = jest.fn().mockReturnValue(null)
            logic.connect()
            expect(logic.getModal).toHaveBeenCalled()
            expect(spy).toHaveBeenCalled()
        })
    })

    describe("onConnect", () => {
        it("Sets window provider and dipatches on connection event", () => {
            const spy = jest.spyOn(document, 'dispatchEvent')
            window.walletProvider = null;
            const logic = new script({ isEdit: false })
            const mockProvider = { test: true, on: jest.fn() }
            logic.setupProviderListeners = jest.fn()
            logic.fetchAccountData = jest.fn()
            logic.onConnect(mockProvider)
            expect(window.walletProvider).toBe(mockProvider)
            expect(spy).toHaveBeenCalled()
            expect(logic.setupProviderListeners).toHaveBeenCalled()
            expect(logic.fetchAccountData).toHaveBeenCalled()
        })
    })

    describe("disconnect", () => {
        it("Emits onDisconnect event", () => {
            const spy = jest.spyOn(document, 'dispatchEvent')
            const close = jest.fn()
            window.walletProvider = { test: 1, close }
            const logic = new script({ isEdit: false })
            const clearCachedProvider = jest.fn()
            logic.getModal = () => {
                return {
                    clearCachedProvider
                }
            }
            logic.disconnect()
            expect(spy).toHaveBeenCalled()
            expect(window.walletProvider).toBe(null)
        })

        it("On error emits onToast notification with message", () => {
            const spy = jest.spyOn(document, 'dispatchEvent')
            window.walletProvider = { test: 1 }
            const logic = new script({ isEdit: false })
            const clearCachedProvider = { close: 1 }
            logic.getModal = () => {
                return {
                    clearCachedProvider
                }
            }
            logic.disconnect()
            expect(spy).toHaveBeenCalled()
        })
    })

    describe("setupProviderListeners", () => {
        it("Reacts to events on account, network or chain changes", () => {
            const logic = new script({ isEdit: false })
            window.walletProvider = { test: true, on: jest.fn() }
            logic.setupProviderListeners()
            expect(window.walletProvider.on).toHaveBeenCalledWith("accountsChanged", expect.anything())
            expect(window.walletProvider.on).toHaveBeenCalledWith("chainChanged", expect.anything())
            expect(window.walletProvider.on).toHaveBeenCalledWith("networkChanged", expect.anything())
        })
    })

    describe('handleAccountChanged', () => {
        it("Emits account changed event and reloads user data", () => {
            const spy = jest.spyOn(document, 'dispatchEvent')
            const logic = new script({ isEdit: false })
            logic.fetchAccountData = jest.fn()
            logic.handleAccountChanged({evt:1})
            expect(spy).toHaveBeenCalled()
            expect(logic.fetchAccountData).toHaveBeenCalled()
        })
    })

    describe('handleChainChanged', () => {
        it("Emits chain changed event and reloads user data", () => {
            const spy = jest.spyOn(document, 'dispatchEvent')
            const logic = new script({ isEdit: false })
            logic.fetchAccountData = jest.fn()
            logic.handleChainChanged({evt:1})
            expect(spy).toHaveBeenCalled()
            expect(logic.fetchAccountData).toHaveBeenCalled()
        })
    })

    describe('handleNetworkChanged', () => {
        it("Emits network changed event and reloads user data", () => {
            const spy = jest.spyOn(document, 'dispatchEvent')
            const logic = new script({ isEdit: false })
            logic.fetchAccountData = jest.fn()
            logic.handleNetworkChanged({evt:1})
            expect(spy).toHaveBeenCalled()
            expect(logic.fetchAccountData).toHaveBeenCalled()
        })
    })

    describe("setButtonText", () => {
        it("Correctly sets the button text as the formatted address of current user", async() => {
            const logic = new script({isEdit:false})
            logic.setButtonText("Test")
            expect(mockText.textContent).toBe("Test")
        })
    })

    describe("fetchAccountData", () => {
        it("Obtains wallet address and sets as text of button", async() => {
            const then = jest.fn()
            const getAddress = jest.fn().mockReturnValue({
                then
            })
            const getSigner = jest.fn().mockReturnValue({
                getAddress
            })
            window.ethers = {
                providers: {
                    Web3Provider: jest.fn().mockReturnValue({
                        getSigner
                    })
                }
            }
            const logic = new script({isEdit:false})
            logic.fetchAccountData()
        })
    })

    describe("handleGetAddress", () => {
        it("Format address and sets as button text", () => {
            const logic = new script({isEdit:false})
            const expected = "0x1234567890";
            logic.setButtonText = jest.fn()
            logic.formatAddress = jest.fn().mockReturnValue(expected)
            logic.handleGetAddress(expected)
            expect(logic.setButtonText).toHaveBeenCalledWith(expected)
        })
    })
})
