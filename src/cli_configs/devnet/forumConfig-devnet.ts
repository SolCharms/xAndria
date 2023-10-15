import { BN } from '@coral-xyz/anchor';
import { ForumConstants, ForumFees, ReputationMatrix } from '../../forum.client';

type ForumConfig = {
    forumFees: ForumFees,
    forumConstants: ForumConstants,
    reputationMatrix: ReputationMatrix
}

export const forumConfig: ForumConfig =
    {
        forumFees: {
            forumProfileFee: new BN(100_000_000), // 0.1 Sol
            forumQuestionFee: new BN(500), // 500 basis points
            forumBigNotesSubmissionFee: new BN(10_000_000), // 0.01 Sol
            forumBigNotesSolicitationFee: new BN(500), // 500 basis points
            forumBigNotesVerificationFee: new BN(10_000_000), // 0.01 Sol
            forumChallengeSubmissionFee: new BN(10_000_000), // 0.01 Sol
            forumQuestionBountyMinimum: new BN(100_000_000), // 0.1 Sol
            forumBigNotesBountyMinimum: new BN(500_000_000), // 0.5 Sol
        },
        forumConstants: {
            maxTagsLength: new BN(3),
            maxTitleLength: new BN(256),
            maxUrlLength: new BN(256),
            minInactivityPeriod: new BN(2_592_000), // 30 days in seconds
        },
        reputationMatrix: {
            aboutMeRep: new BN(100), // Accessible once, relates to 0.1 Sol profile fee (100 rep per 0.1 Sol, however this content is the least valuable - reason for disproportionate rep)
            questionRep: new BN(100), // 100 rep for asking question
            answerRep: new BN(10), // 10 rep since answers are free
            commentRep: new BN(10), // 10 rep since comments are free (equal to answers as not to dissuade one option over the other, i.e. if comments are less valuable, users may just answer instead of comment)
            acceptedAnswerRep: new BN(500), // 500 rep for OP merit (i.e most valuable content)
            createBigNotesRep: new BN(100), // 100 rep for 0.1 Sol flat fee
            bigNotesVerificationRep: new BN(50), // 50 rep for 0.01 flat fee
            proposedBigNotesContributionRep: new BN(100), // 100 rep for each 0.5 Sol multiple (since protocol takes 0.01 of each 0.5 Sol multiple, this gives 100 rep per 0.01 raised)
            acceptedBigNotesContributionProposalRep: new BN(200), // 250 rep for valuable contribution
            bountyContributionRep: new BN(100), // 100 rep for each 0.1 Sol multiple (since protocol takes 0.0035 of each 0.1 Sol multiple, this give 100 rep per 0.0035 raised)
        }
    }


