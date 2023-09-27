import { PublicKey } from '@solana/web3.js';

type CommentConfig = {
    commentedOn: PublicKey,
    forum: PublicKey,
    content: string,
}

// // User 1
// export const commentConfig: CommentConfig =
//     {
//         commentedOn:  new PublicKey("7JUWv7LtxSWWCZPaNUjQvxn9tS69iXcV9B66CaYWBVvd"), // must be question or answer account key
//         forum: new PublicKey("J462agvz9tZyNFYgBgPwbnXDvf1qhGpwGrmEYowQrky3"),
//         content: "Please remove the excess tags which do not apply.",
//     }

// // User 4
// export const commentConfig: CommentConfig =
//     {
//         commentedOn:  new PublicKey("7JUWv7LtxSWWCZPaNUjQvxn9tS69iXcV9B66CaYWBVvd"), // must be question or answer account key
//         forum: new PublicKey("J462agvz9tZyNFYgBgPwbnXDvf1qhGpwGrmEYowQrky3"),
//         content: "Hey, leave my engagement farming alone! I'm just here trying to get some alpha.",
//     }

// User 2
export const commentConfig: CommentConfig =
    {
        commentedOn:  new PublicKey("DZGzyKtKjSnR6Q4A29n1nc7RsLKsCqGm7GsKb4pY4fRd"), // must be question or answer account key
        forum: new PublicKey("J462agvz9tZyNFYgBgPwbnXDvf1qhGpwGrmEYowQrky3"),
        content: "LOL! DeGods are long gone dude.",
    }
