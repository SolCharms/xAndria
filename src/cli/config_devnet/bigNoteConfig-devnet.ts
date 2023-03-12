import { PublicKey } from '@solana/web3.js';
import { Tags } from '../../forum/forum.client';

type BigNoteConfig = {
    forum: PublicKey,
    title: string,
    content: string,
    tags: any,
}

export const bigNoteConfig: BigNoteConfig =
    {
        forum: new PublicKey("FwvVcNLHdw4fo1B6jhEGpJoa8jXD493jNWmGnWy31Cmf"),
        title: "Proof Protocol",
        content: "Welcome to Proof Protocol - Solana's de facto on-chain, community-driven, educational and technical resource platform." +
            "/n" +
            "Est. 2023, the founding members of Proof Protocol are Karsa, Charms, and Logan.",
        tags: Tags.Development
    }




export const additionalBigNoteContent: string[] =
    [
        "BACKGROUNND: " +
            "\n \n" +
            "The idea was originally conceptualized by Karsa, who identified the problem of fractionalized knowledge in the ecosystem, and was submitted to the Sandstorm hack-a-thon as 'Magic Solana Bus'" +
            "Later joined by Charms, who brought the technical expertise necessary to put Proof on-chain, the idea morphed into what Proof is today" +
            "Logan was then recruited during the hype up to Grizzly-thon to bring the idea to life from a UI/UX perspective, providing his experience working with BigTech and Start-Up companies alike",
        "For more information on Proof Protocol visit proofprotocol.io",
    ]
