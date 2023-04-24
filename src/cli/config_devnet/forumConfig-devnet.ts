import { BN } from '@coral-xyz/anchor';
import { ForumFees, ReputationMatrix } from '../../forum/forum.client';

type ForumConfig = {
    forumFees: ForumFees,
    reputationMatrix: ReputationMatrix
}

export const forumConfig: ForumConfig =
    {
        forumFees: {
            forumProfileFee: new BN(100_000_000), // 0.1 Sol
            forumQuestionFee: new BN(350), // 350 basis points
            forumBigNotesSubmissionFee: new BN(100_000_000), // 0.1 Sol
            forumBigNotesSolicitationFee: new BN(200), // 200 basis points
            forumQuestionBountyMinimum: new BN(100_000_000), // 0.1 Sol
            forumBigNotesBountyMinimum: new BN(500_000_000), // 0.5 Sol
        },
        reputationMatrix: {
            aboutMeRep: new BN(100), // Accessible once, relates to 0.1 Sol profile fee (100 rep per 0.1 Sol, however this content is the least valuable - reason for disproportionate rep)
            postBigNotesRep: new BN(100), // 100 rep for 0.01 Sol flat fee
            contributeBigNotesRep: new BN(100), // 100 rep for each 0.5 Sol multiple (since protocol takes 0.01 of each 0.5 Sol multiple, this gives 100 rep per 0.01 raised)
            questionRep: new BN(100), // 100 rep for each 0.1 Sol multiple (since protocol takes 0.0035 of each 0.1 Sol multiple, this give 100 rep per 0.0035 raised)
            answerRep: new BN(10), // 10 rep since answers are free
            commentRep: new BN(10), // 10 rep since comments are free
            acceptedAnswerRep: new BN(500), // 500 rep for OP merit
        }
    }


