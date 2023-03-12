import { PublicKey } from '@solana/web3.js';

type AboutMeConfig = {
    forum: PublicKey,
    content: string
}

export const aboutMeConfig: AboutMeConfig =
    {
        forum: new PublicKey("FwvVcNLHdw4fo1B6jhEGpJoa8jXD493jNWmGnWy31Cmf"),
        content: "Yo yo yo yo, it's your boy Charms, the most underrated developer on all of Solana. AKA the Command Line Captain. \n" +
            "Founder of PROOF PROTOCOL, inventor of DeEdITs, veteran of the blockchain."
    }
