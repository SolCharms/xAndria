import { PublicKey } from '@solana/web3.js';

type AnswerConfig = {
    question: PublicKey,
    content: string,
}


export const answerConfig: AnswerConfig =
    {
        question:  new PublicKey("FwvVcNLHdw4fo1B6jhEGpJoa8jXD493jNWmGnWy31Cmf"),
        content: "This is a sample answer to a question.",
    }


export const additionalAnswerContent: string[] =
    [
        "This is additional content to the answer."
    ]
