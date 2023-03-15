import { PublicKey } from '@solana/web3.js';

type CommentConfig = {
    commentedOn: PublicKey,
    forum: PublicKey,
    content: string,
}


// export const commentConfig: CommentConfig =
//     {
//         commentedOn:  new PublicKey("23vTfWpPgGzXrhCmHPDD8A7sBsDgNY9AD95p8H9W16zQ"), // must be question or answer account key
//         forum: new PublicKey("5CL3JJC156CrDGvQfWpCcmdW3v2HJQYs6bYe3FhzAJts"),
//         content: "Can you elaborate on the main differences between SFTs and NFTs?",
//     }

export const commentConfig: CommentConfig =
    {
        commentedOn:  new PublicKey("23vTfWpPgGzXrhCmHPDD8A7sBsDgNY9AD95p8H9W16zQ"), // must be question or answer account key
        forum: new PublicKey("5CL3JJC156CrDGvQfWpCcmdW3v2HJQYs6bYe3FhzAJts"),
        content: "Sure, I'll update my answer.",
    }


// export const commentConfig: CommentConfig =
//     {
//         commentedOn:  new PublicKey("8SMeMaXARPZDJHyBtoPiZiGXW89c731UjKAgqyUdgiLi"), // must be question or answer account key
//         forum: new PublicKey("5CL3JJC156CrDGvQfWpCcmdW3v2HJQYs6bYe3FhzAJts"),
//         content: "Great question! I've added 1 Sol to the bounty.",
//     }









export const additionalCommentContent: string[] =
    [
        "."
    ]
