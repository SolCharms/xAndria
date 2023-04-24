import { PublicKey } from '@solana/web3.js';

type AboutMeConfig = {
    forum: PublicKey,
    content: string
}

// // User 1
// export const aboutMeConfig: AboutMeConfig =
//     {
//         forum: new PublicKey("J462agvz9tZyNFYgBgPwbnXDvf1qhGpwGrmEYowQrky3"),
//         content: "I am an xAndria onchain protocol moderator. Don't @ me because I deleted your SHIT content."
//     }

// // User 2
// export const aboutMeConfig: AboutMeConfig =
//     {
//         forum: new PublicKey("J462agvz9tZyNFYgBgPwbnXDvf1qhGpwGrmEYowQrky3"),
//         content: "Yo yo yo yo, it's your boy Charms, the most underrated developer on all of Solana. AKA the Command Line Captain. \n " +
//             "Founder of xAndria Onchain, inventor of DeEdITs, veteran of the blockchain. I will FUD your garbage project."
//     }

// User 3
export const aboutMeConfig: AboutMeConfig =
    {
        forum: new PublicKey("J462agvz9tZyNFYgBgPwbnXDvf1qhGpwGrmEYowQrky3"),
        content: "I'm a solana n00b."
    }
