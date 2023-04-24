import { BN } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import { Tags } from '../../forum/forum.client';

type QuestionConfig = {
    forum: PublicKey,
    title: string,
    content: string,
    tags: Tags[],
    bountyAmount: BN
}

// // user 4
// export const questionConfig: QuestionConfig =
//     {
//         forum: new PublicKey("J462agvz9tZyNFYgBgPwbnXDvf1qhGpwGrmEYowQrky3"),
//         title: "What are the best NFTs to buy right now, in the bear market?",
//         content: "I've been grinding day & night and I've acquired enough Solana to invest into 5-10 blue chip project NFTs." +
//             "I want community feedback into what NFTs to buy and why. 0.5 Sol goes to the best answer.",
//         tags: [{daosAndGovernance: {}} as never, {dataAndAnalytics: {}} as never, {deFi: {}} as never, {nfts: {}} as never, {trading: {}} as never],
//         bountyAmount: new BN(500_000_000)
//     }


// // user 5
// export const questionConfig: QuestionConfig =
//     {
//         forum: new PublicKey("J462agvz9tZyNFYgBgPwbnXDvf1qhGpwGrmEYowQrky3"),
//         title: "What are the Instructions required to create an SFT?",
//         content: "This question was taken from https://solana.stackexchange.com/questions/6066/what-are-the-instructions-required-to-create-a-sft \n" +
//             "I am not sure on what are the instruction's that goes into creating a Semi Fungible Token on Solana. Will really appriciate if anyone can guide me on the right instruction's for creating one.",
//         tags: [{development: {}} as never, {gaming: {}} as never, {toolsAndInfrastructure: {}} as never],
//         bountyAmount: new BN(1_500_000_000)
//     }


// User 5
export const questionConfig: QuestionConfig =
    {
        forum: new PublicKey("J462agvz9tZyNFYgBgPwbnXDvf1qhGpwGrmEYowQrky3"),
        title: "Fetch all() isn't working in Anchor Client",
        content: " I am trying to fetch all accounts owned by my program using all() method but it is giving me this nasty error: \n ```Uncaught (in promise) ReferenceError: Buffer is not defined at AccountClient.all``` \n" +
            " Code: \n ```const accounts = await program.account.user.all(); ``` \n " +
            " It works if I try to fetch a single account like this: \n ```const account = await program.account.user.fetch(new PublicKey(\"...\"));``` ",
        tags: [{mobile: {}} as never, {payments: {}} as never, {development: {}} as never],
        bountyAmount: new BN(750_000_000)
    }

