import block from "../block"

describe("Wallet Connect block", () => {

    describe("block", () => {
        it("Has id, label, category and content set", async () => {
            expect(block.id).toEqual(`section-${process.env.MODULE_ID}`)
            expect(block.category).toEqual('Web3')
            expect(block.content).toBeTruthy()
        })
    })
})
