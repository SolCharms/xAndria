import { PublicKey } from '@solana/web3.js';

type AnswerConfig = {
    forum: PublicKey,
    question: PublicKey,
    content: string,
}

// // User 2
// export const answerConfig: AnswerConfig =
//     {
//         forum: new PublicKey("J462agvz9tZyNFYgBgPwbnXDvf1qhGpwGrmEYowQrky3"),
//         question: new PublicKey("7JUWv7LtxSWWCZPaNUjQvxn9tS69iXcV9B66CaYWBVvd"),
//         content: "The best value proposition right now is Cyber Frogs. Andy is a beast and IMO the frogs are undervalued at their current price. Actually FREE." +
//             "The project has always had blue chip alpha energy after Andy and his team Derugged. Buying frogs is the giga-Chad move here, don't paper hands this project.",
//     }

// User 3
export const answerConfig: AnswerConfig =
    {
        forum: new PublicKey("J462agvz9tZyNFYgBgPwbnXDvf1qhGpwGrmEYowQrky3"),
        question: new PublicKey("7JUWv7LtxSWWCZPaNUjQvxn9tS69iXcV9B66CaYWBVvd"),
        content: "Bruh. Everyone knows that the best project on Solana is DeGods. I said what I said!",
    }

// // User 2
// export const answerConfig: AnswerConfig =
//     {
//         forum: new PublicKey("J462agvz9tZyNFYgBgPwbnXDvf1qhGpwGrmEYowQrky3"),
//         question: new PublicKey("J4pa8J96cuuq7njStt5vdub7RN1X3aPJxxutnKxk5Jyz"),
//         content: "The answer to your question can be found here: https://docs.metaplex.com/programs/token-metadata/overview#semi-fungible-tokens. \n" +
//             "If you have a general understanding of how to make NFTs, then making SFTs will be easy. \n " +
//             "The main difference between SFTs and NFTs is supply. While NFTs are limited to a supply of 1, SFTs are allowed to have a supply greater than 1.",
//     }









