import { PublicKey } from '@solana/web3.js';

type CommentConfig = {
    commentedOn: PublicKey,
    forum: PublicKey,
    content: string,
}


export const commentConfig: CommentConfig =
    {
        commentedOn:  new PublicKey("FwvVcNLHdw4fo1B6jhEGpJoa8jXD493jNWmGnWy31Cmf"),
        forum: new PublicKey("FwvVcNLHdw4fo1B6jhEGpJoa8jXD493jNWmGnWy31Cmf"),
        content: "This is a sample answer to a question.",
    }


export const additionalCommentContent: string[] =
    [
        "This is additional content to the comment."
    ]
