import { PublicKey } from '@solana/web3.js';

type AboutMeConfig = {
    forum: PublicKey,
    content: string
}

export const aboutMeConfig: AboutMeConfig =
    {
        forum: new PublicKey("5FN8oZPWyaqV79cSTRVVFkQGiq6WBjGgvhePaHw1pfMp"),
        content: "Yo yo yo yo, it's your boy Charms, the most underrated developer on all of Solana. AKA the Command Line Captain. \n" +
            "Founder of PROOF PROTOCOL, inventor of DeEdITs, veteran of the blockchain."
    }
