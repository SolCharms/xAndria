import { PublicKey } from '@solana/web3.js';

type AnswerConfig = {
    question: PublicKey,
    content: string,
}


export const answerConfig: AnswerConfig =
    {
        // question:  new PublicKey("8SMeMaXARPZDJHyBtoPiZiGXW89c731UjKAgqyUdgiLi"),
        // question: new PublicKey("Bc8NE1D3kR4DFNk1bQPptH1doppdVBzo2wzyCmEtex1x"),
        question: new PublicKey("FUUMzmSwpbEye1UP1dcBUe4KodQDi2u4xwwzn7LZZcav"),
        content: "The answer to your question can be found here: https://docs.metaplex.com/programs/token-metadata/overview#semi-fungible-tokens. \n" +
            "If you have a general understanding of how to make NFTs, then making SFTs will be easy. \n " +
            "Edit: The main difference between SFTs and NFTs is supply. While NFTs are limited to a supply of 1, SFTs are allowed to have a supply greater than 1.",
    }


export const additionalAnswerContent: string[] =
    [
        "\n " +
            "The main difference between SFTs and NFTs is supply. While NFTs are limited to a supply of 1, SFTs are allowed to have a supply greater than 1."
    ]










