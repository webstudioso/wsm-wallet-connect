import Plugin from "../index"

describe("Wallet Connect plugin", () => {

    describe("Invokes editor setup with blocks and properties", () => {

        it("Has properties defined", async () => {
            const editor = {
              BlockManager: {
                add: jest.fn()
              },
              DomComponents: {
                addType: jest.fn()
              }
            }
            Plugin(editor)
            expect(editor.BlockManager.add).toHaveBeenCalled()
            expect(editor.DomComponents.addType).toHaveBeenCalled()
        })
    })
})
