import { PublicKey } from '@solana/web3.js';

type AboutMeConfig = {
    forum: PublicKey,
    content: string
}

export const aboutMeConfig: AboutMeConfig =
    {
        forum: new PublicKey("5CL3JJC156CrDGvQfWpCcmdW3v2HJQYs6bYe3FhzAJts"),
        content: "Yo yo yo yo, it's your boy Charms, the most underrated developer on all of Solana. AKA the Command Line Captain. \n" +
            "Founder of xAndria Onchain, inventor of DeEdITs, veteran of the blockchain. \n" +
            "I'm also a Solana MAXI, degenerate crypto bro, in case you didn't already realize."
    }















// export const aboutMeConfig: AboutMeConfig =
//     {
//         forum: new PublicKey("FwvVcNLHdw4fo1B6jhEGpJoa8jXD493jNWmGnWy31Cmf"),
//         content: "Yo yo yo yo, it's your boy Charms, the most underrated developer on all of Solana. AKA the Command Line Captain. \n" +
//             "Founder of xAndria Onchain, inventor of DeEdITs, veteran of the blockchain."
//     }


