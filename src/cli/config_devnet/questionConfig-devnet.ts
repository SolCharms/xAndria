import { BN } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import { Tags } from '../../forum/forum.client';

type QuestionConfig = {
    forum: PublicKey,
    title: string,
    content: string,
    tags: any,
    bountyAmount: BN
}

export const questionConfig: QuestionConfig =
    {
        forum: new PublicKey("FwvVcNLHdw4fo1B6jhEGpJoa8jXD493jNWmGnWy31Cmf"),
        title: "Fetch all() isn't working in Anchor Client",
        content: " I am trying to fetch all accounts owned by my program using all() method but it is giving me this nasty error: \n ```Uncaught (in promise) ReferenceError: Buffer is not defined at AccountClient.all``` \n" +
            " Code: \n ```const accounts = await program.account.user.all(); ``` \n " +
            " It works if I try to fetch a single account like this: \n ```const account = await program.account.user.fetch(new PublicKey(\"...\"));``` ",
        tags: Tags.Development,
        bountyAmount: new BN(150_000_000)
    }


// export const questionConfig: QuestionConfig =
//     {
//         forum: new PublicKey("5FN8oZPWyaqV79cSTRVVFkQGiq6WBjGgvhePaHw1pfMp"),
//         title: "This is the second test question, but the first edited question",
//         content: "Gentlemen, I would like to take the time to congratulate you on your efforts thus far. I know the journey has been long and arduous, and there is yet much more work to do." +
//             "But for now we celebrate our achievements. Here is a toast to the second question posted towards our vision of bringing education tooling to the Solana blockchain." +
//             " \n " +
//             "I now draw your attention to the fact that this question has also been edited and the field mostRecentEngagementTs lists the time at which this edit has occurred." +
//             "Although this is still in testing phase, I seem to have solved the issue I was having with packing the new data into the account",
//         tags: Tags.Development,
//         bountyAmount: new BN(150_000_000)
//     }

// export const questionConfig: QuestionConfig =
//     {
//         forum: new PublicKey("5FN8oZPWyaqV79cSTRVVFkQGiq6WBjGgvhePaHw1pfMp"),
//         title: "0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345",
//         content: "01234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789A",
//         tags: Tags.Development,
//         bountyAmount: new BN(250_000_000)
//     }

export const additionalQuestionContent: string[] =
    [
        "Somebody please help! (This is some additional content to add to the already existing content in the question)"
    ]
