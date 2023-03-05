import { BN } from '@coral-xyz/anchor';
import { ForumFees, ReputationMatrix } from '../../forum/forum.client';

type ForumConfig = {
    forumFees: ForumFees,
    reputationMatrix: ReputationMatrix
}

export const forumConfig: ForumConfig =
    {
        forumFees: {
            forumProfileFee: new BN(2_500_000_000), // 2.5 Sol
            forumQuestionFee: new BN(1_000_000), // 0.001 Sol
            forumBigNotesFee: new BN(100_000_000), // 0.1 Sol
            forumQuestionBountyMinimum: new BN(100_000_000), // 0.1 Sol
            forumBigNotesBountyMinimum: new BN(2_000_000_000), // 2 Sol
            extraSpace: new Array(64).fill(0),
        },
        reputationMatrix: {
            aboutMeRep: new BN(100),
            postBigNotesRep: new BN(1000),
            contributeBigNotesRep: new BN(100),
            questionRep: new BN(100),
            answerRep: new BN(10),
            commentRep: new BN(2),
            acceptedAnswerRep: new BN(500),
            extraSpace: new Array(64).fill(0),
        }
    }
