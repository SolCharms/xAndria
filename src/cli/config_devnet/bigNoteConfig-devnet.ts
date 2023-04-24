import { PublicKey } from '@solana/web3.js';
import { Tags } from '../../forum/forum.client';

type BigNoteConfig = {
    forum: PublicKey,
    title: string,
    content: string,
    tags: Tags[],
}

// User 2
export const bigNoteConfig: BigNoteConfig =
    {
        forum: new PublicKey("J462agvz9tZyNFYgBgPwbnXDvf1qhGpwGrmEYowQrky3"),
        title: "xAndria Onchain",
        content: "Welcome to xAndria Onchain - Solana's de facto onchain, community-driven, educational and technical resource platform." +
            "/n" +
            "Est. 2023, the founding members of Proof Protocol are Karsa, Charms, and Logan." +
            "BACKGROUNND: " +
            "\n \n" +
            "The idea was originally conceptualized by Karsa, who identified the problem of fractionalized knowledge in the ecosystem, and was submitted to the Sandstorm hack-a-thon as 'Magic Solana Bus'" +
            "Later joined by Charms, who brought the technical expertise necessary to put the concept of 'proof of work' on-chain, the idea morphed into what xAndria is today" +
            "Logan was then recruited during the hype up to Grizzlython to bring the idea to life from a UI/UX perspective, providing his experience working with BigTech and Start-Up companies alike" +
            "For the xAndria Onchain web app visit https://xandriaonchain.vercel.app/forum" +
            "With an honorable mention in Grizzlython, the team placed well and got some well deserved recognition, but winning money would have been nice",
        tags: [{toolsAndInfrastructure: {}} as never, {development: {}} as never]
    }
