import * as anchor from '@coral-xyz/anchor';
import { AnchorProvider, BN, Idl, IdlTypes, Program } from '@coral-xyz/anchor';
import { Connection, Keypair, PublicKey, SystemProgram } from '@solana/web3.js';
import { Forum } from './forum.types';
import {
    findForumAuthorityPDA,
    findForumTreasuryPDA,
    findUserProfilePDA,
    findAboutMePDA,
    findQuestionPDA,
    findAnswerPDA,
    findCommentPDA,
    findBigNotePDA,
    findBigNoteVerificationApplicationPDA,
    findProposedContributionPDA,
    findChallengePDA,
    findSubmissionPDA,
    findQuestionBountyPDA,
    findBigNoteBountyPDA,
    findVerificationFeePDA,
} from './forum.pda';

// Enum: BigNoteType
export const bigNoteTypeValues = {
    OpenContribution: {openContribution: {}},
    CreatorCurated: {creatorCurated: {}}
}

// Enum: BigNoteVerificationState
export const bigNoteVerificationStateValues = {
    Unverified: {unverified: {}},
    AppliedForVerification: {appliedForVerification: {}},
    Verified: {verified: {}}
}

// Enum: BountyContributionState
export const bountyContributionStateValues = {
    Available: {available: {}},
    Awarded: {awarded: {}},
    Refunded: {refunded: {}}
}

// Enum: ProposedContributionState
export const proposedContributionStateValues = {
    Accepted: {accepted: {}},
    Rejected: {rejected: {}},
    Pending: {pending: {}}
}

// Enum: SubmissionState
export const submissionStateValues = {
    Completed: {completed: {}},
    Rejected: {rejected: {}},
    Pending: {pending: {}}
}

// Enum: Tags
export const tagValues = {
    DaosAndGovernance: { daosAndGovernance: {}},
    DataAndAnalytics: { dataAndAnalytics: {}},
    DeFi: { deFi: {}},
    Development: { development: {}},
    Gaming: { gaming: {}},
    Mobile: { mobile: {}},
    Nfts: { nfts: {}},
    Payments: { payments: {}},
    ToolsAndInfrastructure: { toolsAndInfrastructure: {}},
    Trading: { trading:{}}
}

export type BigNoteType = IdlTypes<Forum>['BigNoteType'];
export type BigNoteVerificationState = IdlTypes<Forum>['BigNoteVerificationState'];
export type BountyContributionState = IdlTypes<Forum>['BountyContributionState'];
export type ProposedContributionState = IdlTypes<Forum>['ProposedContributionState'];
export type SubmissionState = IdlTypes<Forum>['SubmissionState'];
export type Tags = IdlTypes<Forum>['Tags']

export interface BountyContribution {
    bountyContributor: PublicKey;
    bountyAmount: BN;
    forumBountyMinimum: BN;
    bountyContributionRep: BN;
    bountyContributionState: BountyContributionState;
}

export interface ForumConstants {
    maxTagsLength: BN;
    maxTitleLength: BN;
    maxUrlLength: BN;
    minInactivityPeriod: BN;
}

export interface ForumCounts {
    forumProfileCount: BN;
    forumQuestionCount: BN;
    forumAnswerCount: BN;
    forumCommentCount: BN;
    forumBigNotesCount: BN;
    forumProposedContributionCount: BN;
    forumChallengeCount: BN;
    forumSubmissionCount: BN;
}

export interface ForumFees {
    forumProfileFee: BN;
    forumQuestionFee: BN;
    forumBigNotesSubmissionFee: BN;
    forumBigNotesSolicitationFee: BN;
    forumBigNotesVerificationFee: BN;
    forumChallengeSubmissionFee: BN;
    forumQuestionBountyMinimum: BN;
    forumBigNotesBountyMinimum: BN;
}

export interface ReputationMatrix {
    aboutMeRep: BN;
    questionRep: BN;
    answerRep: BN;
    commentRep: BN;
    acceptedAnswerRep: BN;
    createBigNotesRep: BN;
    bigNotesVerificationRep: BN;
    proposedBigNotesContributionRep: BN;
    acceptedBigNotesContributionProposalRep: BN;
    bountyContributionRep: BN;
}

function isKp(toCheck: PublicKey | Keypair) {
    return typeof (<Keypair>toCheck).publicKey !== 'undefined';
}

export class ForumClient {
    connection: Connection;
    wallet: anchor.Wallet;
    provider!: anchor.Provider;
    forumProgram!: anchor.Program<Forum>;

    constructor(
        connection: Connection,
        wallet: anchor.Wallet,
        idl?: Idl,
        programId?: PublicKey
    ) {
        this.connection = connection;
        this.wallet = wallet;
        this.setProvider();
        this.setForumProgram(idl, programId);
    }

    setProvider() {
        this.provider = new AnchorProvider(
            this.connection,
            this.wallet,
            AnchorProvider.defaultOptions()
        );
        anchor.setProvider(this.provider);
    }

    setForumProgram(idl?: Idl, programId?: PublicKey) {
        //instantiating program depends on the environment
        if (idl && programId) {
            //means running in prod
            this.forumProgram = new anchor.Program<Forum>(
                idl as any,
                programId,
                this.provider
            );
        } else {
            //means running inside test suite
            this.forumProgram = anchor.workspace.Forum as Program<Forum>;
        }
    }

    // -------------------------------------------------------- fetch deserialized accounts

    async fetchForumAccount(forum: PublicKey) {
        return this.forumProgram.account.forum.fetch(forum);
    }

    async fetchUserProfileAccount(userProfile: PublicKey) {
        return this.forumProgram.account.userProfile.fetch(userProfile);
    }

    async fetchAboutMeAccount(aboutMe: PublicKey) {
        return this.forumProgram.account.aboutMe.fetch(aboutMe);
    }

    async fetchQuestionAccount(question: PublicKey) {
        return this.forumProgram.account.question.fetch(question);
    }

    async fetchAnswerAccount(answer: PublicKey) {
        return this.forumProgram.account.answer.fetch(answer);
    }

    async fetchCommentAccount(comment: PublicKey) {
        return this.forumProgram.account.comment.fetch(comment);
    }

    async fetchBigNoteAccount(bigNote: PublicKey) {
        return this.forumProgram.account.bigNote.fetch(bigNote);
    }

    async fetchBigNoteVerificationApplicationAccount(verificationApplication: PublicKey) {
        return this.forumProgram.account.bigNoteVerificationApplication.fetch(verificationApplication);
    }

    async fetchProposedContributionAccount(proposedContribution: PublicKey) {
        return this.forumProgram.account.proposedContribution.fetch(proposedContribution);
    }

    async fetchChallengeAccount(challenge: PublicKey) {
        return this.forumProgram.account.challenge.fetch(challenge);
    }

    async fetchSubmissionAccount(submission: PublicKey) {
        return this.forumProgram.account.submission.fetch(submission);
    }

    async fetchTreasuryBalance(forum: PublicKey) {
        const [treasury] = await findForumTreasuryPDA(forum);
        return this.connection.getBalance(treasury);
    }

    async fetchQuestionBountyPDABalance(question: PublicKey) {
        const [bountyPda] = await findQuestionBountyPDA(question);
        return this.connection.getBalance(bountyPda);
    }

    async fetchBigNoteBountyPDABalance(bigNote: PublicKey) {
        const [bountyPda] = await findBigNoteBountyPDA(bigNote);
        return this.connection.getBalance(bountyPda);
    }

    async fetchVerificationFeePDABalance(bigNote: PublicKey) {
        const [verificationFeePda] = await findVerificationFeePDA(bigNote);
        return this.connection.getBalance(verificationFeePda);
    }

    // -------------------------------------------------------- get all PDAs by type

    async fetchAllForumPDAs(forumManager?: PublicKey) {
        const filter = forumManager
            ? [
                {
                    memcmp: {
                        offset: 10, // need to prepend 8 bytes for anchor's disc and 2 for version: u16
                        bytes: forumManager.toBase58(),
                    },
                },
            ]
            : [];
        const pdas = await this.forumProgram.account.forum.all(filter);
        if (forumManager) {
            console.log('Found a total of', pdas.length, 'forum PDAs for forum manager with address', forumManager.toBase58());
        }
        else {
            console.log('Found a total of', pdas.length, 'forum PDAs');
        }
        return pdas;
    }

    async fetchAllUserProfilePDAs(forum?: PublicKey) {
        const filter = forum
            ? [
                {
                    memcmp: {
                        offset: 40, // need to prepend 8 bytes for anchor's disc and 32 for profile owner pubkey
                        bytes: forum.toBase58(),
                    },
                },
            ]
            : [];
        const pdas = await this.forumProgram.account.userProfile.all(filter);
        if (forum) {
            console.log('Found a total of', pdas.length, 'user profile PDAs for forum with address', forum.toBase58());
        }
        else {
            console.log('Found a total of', pdas.length, 'user profile PDAs');
        }
        return pdas;
    }

    async fetchAllUserProfilePDAsByProfileOwner(profileOwner?: PublicKey) {
        const filter = profileOwner
            ? [
                {
                    memcmp: {
                        offset: 8, // need to prepend 8 bytes for anchor's disc
                        bytes: profileOwner.toBase58(),
                    },
                },
            ]
            : [];
        const pdas = await this.forumProgram.account.userProfile.all(filter);
        if (profileOwner) {
            console.log('Found a total of', pdas.length, 'user profile PDAs for profile owner with address', profileOwner.toBase58());
        }
        else {
            console.log('Found a total of', pdas.length, 'user profile PDAs');
        }
        return pdas;
    }

    async fetchAllAboutMePDAs(userProfile?: PublicKey) {
        const filter = userProfile
            ? [
                {
                    memcmp: {
                        offset: 8, // need to prepend 8 bytes for anchor's disc
                        bytes: userProfile.toBase58(),
                    },
                },
            ]
            : [];
        const pdas = await this.forumProgram.account.aboutMe.all(filter);
        if (userProfile) {
            console.log('Found a total of', pdas.length, 'about me PDAs for user profile with address', userProfile.toBase58());
        }
        else {
            console.log('Found a total of', pdas.length, 'about me PDAs');
        }
        return pdas;
    }

    async fetchAllQuestionPDAs(forum?: PublicKey) {
        const filter = forum
            ? [
                {
                    memcmp: {
                        offset: 8, // need to prepend 8 bytes for anchor's disc
                        bytes: forum.toBase58(),
                    },
                },
            ]
            : [];
        const pdas = await this.forumProgram.account.question.all(filter);
        if (forum) {
            console.log('Found a total of', pdas.length, 'question PDAs for forum with address', forum.toBase58());
        }
        else {
            console.log('Found a total of', pdas.length, 'question PDAs');
        }
        return pdas;
    }

    async fetchAllQuestionPDAsByUserProfile(userProfile?: PublicKey) {
        const filter = userProfile
            ? [
                {
                    memcmp: {
                        offset: 40, // need to prepend 8 bytes for anchor's disc and 32 for forum pubkey
                        bytes: userProfile.toBase58(),
                    },
                },
            ]
            : [];
        const pdas = await this.forumProgram.account.question.all(filter);
        if (userProfile) {
            console.log('Found a total of', pdas.length, 'question PDAs for user profile with address', userProfile.toBase58());
        }
        else {
            console.log('Found a total of', pdas.length, 'question PDAs');
        }
        return pdas;
    }

    async fetchAllAnswerPDAs(question?: PublicKey) {
        const filter = question
            ? [
                {
                    memcmp: {
                        offset: 8, // need to prepend 8 bytes for anchor's disc
                        bytes: question.toBase58(),
                    },
                },
            ]
            : [];
        const pdas = await this.forumProgram.account.answer.all(filter);
        if (question) {
            console.log('Found a total of', pdas.length, 'answer PDAs for question account with address', question.toBase58());
        }
        else {
            console.log('Found a total of', pdas.length, 'answer PDAs');
        }
        return pdas;
    }

    async fetchAllAnswerPDAsByUserProfile(userProfile?: PublicKey) {
        const filter = userProfile
            ? [
                {
                    memcmp: {
                        offset: 40, // need to prepend 8 bytes for anchor's disc and 32 for forum pubkey
                        bytes: userProfile.toBase58(),
                    },
                },
            ]
            : [];
        const pdas = await this.forumProgram.account.answer.all(filter);
        if (userProfile) {
            console.log('Found a total of', pdas.length, 'answer PDAs for user profile with address', userProfile.toBase58());
        }
        else {
            console.log('Found a total of', pdas.length, 'answer PDAs');
        }
        return pdas;
    }

    async fetchAllCommentPDAs(accountCommentedOn?: PublicKey) {
        const filter = accountCommentedOn
            ? [
                {
                    memcmp: {
                        offset: 8, // need to prepend 8 bytes for anchor's disc
                        bytes: accountCommentedOn.toBase58(),
                    },
                },
            ]
            : [];
        const pdas = await this.forumProgram.account.comment.all(filter);
        if (accountCommentedOn) {
            console.log('Found a total of', pdas.length, 'comment PDAs for account with address', accountCommentedOn.toBase58());
        }
        else{
            console.log('Found a total of', pdas.length, 'comment PDAs');
        }
        return pdas;
    }

    async fetchAllCommentPDAsByUserProfile(userProfile?: PublicKey) {
        const filter = userProfile
            ? [
                {
                    memcmp: {
                        offset: 40, // need to prepend 8 bytes for anchor's disc and 32 for account commented on pubkey
                        bytes: userProfile.toBase58(),
                    },
                },
            ]
            : [];
        const pdas = await this.forumProgram.account.comment.all(filter);
        if (userProfile) {
            console.log('Found a total of', pdas.length, 'comment PDAs for user profile with address', userProfile.toBase58());
        }
        else {
            console.log('Found a total of', pdas.length, 'comment PDAs');
        }
        return pdas;
    }

    async fetchAllBigNotePDAs(forum?: PublicKey) {
        const filter = forum
            ? [
                {
                    memcmp: {
                        offset: 8, // need to prepend 8 bytes for anchor's disc
                        bytes: forum.toBase58(),
                    },
                },
            ]
            : [];
        const pdas = await this.forumProgram.account.bigNote.all(filter);
        if (forum) {
            console.log('Found a total of', pdas.length, 'big note PDAs for forum with address', forum.toBase58());
        }
        else{
            console.log('Found a total of', pdas.length, 'big note PDAs');
        }
        return pdas;
    }

    async fetchAllBigNotePDAsByUserProfile(userProfile?: PublicKey) {
        const filter = userProfile
            ? [
                {
                    memcmp: {
                        offset: 40, // need to prepend 8 bytes for anchor's disc and 32 for forum pubkey
                        bytes: userProfile.toBase58(),
                    },
                },
            ]
            : [];
        const pdas = await this.forumProgram.account.bigNote.all(filter);
        if (userProfile) {
            console.log('Found a total of', pdas.length, 'big note PDAs for user profile with address', userProfile.toBase58());
        }
        else{
            console.log('Found a total of', pdas.length, 'big note PDAs');
        }
        return pdas;
    }

    async fetchAllProposedContributionPDAs(bigNote?: PublicKey) {
        const filter = bigNote
            ? [
                {
                    memcmp: {
                        offset: 8, // need to prepend 8 bytes for anchor's disc
                        bytes: bigNote.toBase58(),
                    },
                },
            ]
            : [];
        const pdas = await this.forumProgram.account.proposedContribution.all(filter);
        if (bigNote) {
            console.log('Found a total of', pdas.length, 'proposed contribution PDAs for big note with address', bigNote.toBase58());
        }
        else{
            console.log('Found a total of', pdas.length, 'proposed contribution PDAs');
        }
        return pdas;
    }

    async fetchAllProposedContributionPDAsByUserProfile(userProfile?: PublicKey) {
        const filter = userProfile
            ? [
                {
                    memcmp: {
                        offset: 40, // need to prepend 8 bytes for anchor's disc and 32 for forum pubkey
                        bytes: userProfile.toBase58(),
                    },
                },
            ]
            : [];
        const pdas = await this.forumProgram.account.proposedContribution.all(filter);
        if (userProfile) {
            console.log('Found a total of', pdas.length, 'proposed contribution PDAs for user profile with address', userProfile.toBase58());
        }
        else{
            console.log('Found a total of', pdas.length, 'proposed contribution PDAs');
        }
        return pdas;
    }

    async fetchAllChallengePDAs(forum?: PublicKey) {
        const filter = forum
            ? [
                {
                    memcmp: {
                        offset: 8, // need to prepend 8 bytes for anchor's disc
                        bytes: forum.toBase58(),
                    },
                },
            ]
            : [];
        const pdas = await this.forumProgram.account.challenge.all(filter);
        if (forum) {
            console.log('Found a total of', pdas.length, 'challenge PDAs for forum with address', forum.toBase58());
        }
        else{
            console.log('Found a total of', pdas.length, 'challenge PDAs');
        }
        return pdas;
    }

    async fetchAllSubmissionPDAs(challenge?: PublicKey) {
        const filter = challenge
            ? [
                {
                    memcmp: {
                        offset: 8, // need to prepend 8 bytes for anchor's disc
                        bytes: challenge.toBase58(),
                    },
                },
            ]
            : [];
        const pdas = await this.forumProgram.account.submission.all(filter);
        if (challenge) {
            console.log('Found a total of', pdas.length, 'submission PDAs for challenge with address', challenge.toBase58());
        }
        else{
            console.log('Found a total of', pdas.length, 'submission PDAs');
        }
        return pdas;
    }

    // -------------------------------------------------------- execute ixs

    async initForum(
        forum: Keypair,
        forumManager: PublicKey | Keypair,
        forumFees: ForumFees,
        forumConstants: ForumConstants,
        reputationMatrix: ReputationMatrix,
    ) {
        // Derive PDAs
        const [forumAuthority, forumAuthBump] = await findForumAuthorityPDA(forum.publicKey);
        const [forumTreasury, forumTreasuryBump] = await findForumTreasuryPDA(forum.publicKey);

        // Create Signers Array
        const signers = [forum];
        if (isKp(forumManager)) signers.push(<Keypair>forumManager);

        console.log('initializing forum account with pubkey: ', forum.publicKey.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .initForum(
                forumAuthBump,
                forumFees,
                forumConstants,
                reputationMatrix,
            )
            .accounts({
                forum: forum.publicKey,
                forumManager: isKp(forumManager)? (<Keypair>forumManager).publicKey : <PublicKey>forumManager,
                forumAuthority: forumAuthority,
                forumTreasury: forumTreasury,
                rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            forumAuthority,
            forumAuthBump,
            forumTreasury,
            forumTreasuryBump,
            txSig
        }
    }

    async updateForumParams(
        forum: PublicKey,
        forumManager: PublicKey | Keypair,
        newForumFees: ForumFees,
        newForumConstants: ForumConstants,
        newReputationMatrix: ReputationMatrix,
    ) {
        // Create Signers Array
        const signers = [];
        if (isKp(forumManager)) signers.push(<Keypair>forumManager);

        console.log('updating forum parameters for forum account with pubkey: ', forum.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .updateForumParams(
                newForumFees,
                newForumConstants,
                newReputationMatrix,
            )
            .accounts({
                forum: forum,
                forumManager: isKp(forumManager)? (<Keypair>forumManager).publicKey : <PublicKey>forumManager,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            txSig
        }
    }

    async payoutFromTreasury(
        forum: PublicKey,
        forumManager: PublicKey | Keypair,
        receiver: PublicKey,
    ) {
        // Derive PDAs
        const [forumTreasury, forumTreasuryBump] = await findForumTreasuryPDA(forum);

        // Create Signers Array
        const signers = [];
        if (isKp(forumManager)) signers.push(<Keypair>forumManager);

        console.log('paying out from treasury for forum account with pubkey: ', forum.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .payoutFromTreasury(
                forumTreasuryBump,
            )
            .accounts({
                forum: forum,
                forumManager: isKp(forumManager)? (<Keypair>forumManager).publicKey : <PublicKey>forumManager,
                forumTreasury: forumTreasury,
                receiver: receiver,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            forumTreasury,
            forumTreasuryBump,
            txSig
        }
    }

    async closeForum(
        forum: PublicKey,
        forumManager: PublicKey | Keypair,
        receiver: PublicKey,
    ) {
        // Derive PDAs
        const [forumTreasury, forumTreasuryBump] = await findForumTreasuryPDA(forum);

        // Create Signers Array
        const signers = [];
        if (isKp(forumManager)) signers.push(<Keypair>forumManager);

        console.log('closing forum account with pubkey: ', forum.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .closeForum(
                forumTreasuryBump,
            )
            .accounts({
                forum: forum,
                forumManager: isKp(forumManager)? (<Keypair>forumManager).publicKey : <PublicKey>forumManager,
                forumTreasury: forumTreasury,
                receiver: receiver,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            forumTreasury,
            forumTreasuryBump,
            txSig
        }
    }

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    async createUserProfile(
        forum: PublicKey,
        profileOwner: PublicKey | Keypair
    ) {
        const profileOwnerKey = isKp(profileOwner) ? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner;

        // Derive PDAs
        const [forumTreasury, forumTreasuryBump] = await findForumTreasuryPDA(forum);
        const [userProfile, userProfileBump] = await findUserProfilePDA(forum, profileOwnerKey);

        // Create Signers Array
        const signers = [];
        if (isKp(profileOwner)) signers.push(<Keypair>profileOwner);

        console.log('creating user profile account with pubkey: ', userProfile.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .createUserProfile(
                forumTreasuryBump,
            )
            .accounts({
                forum: forum,
                forumTreasury: forumTreasury,
                profileOwner: isKp(profileOwner)? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner,
                userProfile: userProfile,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            forumTreasury,
            forumTreasuryBump,
            userProfile,
            userProfileBump,
            txSig
        }
    }

    async editUserProfile(
        forum: PublicKey,
        profileOwner: PublicKey | Keypair,
        nft_token_mint: PublicKey,
    ) {
        const profileOwnerKey = isKp(profileOwner) ? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner;

        // Derive PDAs
        const [userProfile, userProfileBump] = await findUserProfilePDA(forum, profileOwnerKey);

        // Create Signers Array
        const signers = [];
        if (isKp(profileOwner)) signers.push(<Keypair>profileOwner);

        console.log('editing nft pfp for user profile account with pubkey: ', userProfile.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .editUserProfile(
                userProfileBump
            )
            .accounts({
                forum: forum,
                profileOwner: isKp(profileOwner)? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner,
                userProfile: userProfile,
                nftPfpTokenMint: nft_token_mint,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            userProfile,
            userProfileBump,
            txSig
        }
    }

    async deleteUserProfile(
        forum: PublicKey,
        profileOwner: PublicKey | Keypair,
        receiver: PublicKey,
    ) {
        const profileOwnerKey = isKp(profileOwner) ? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner;

        // Derive PDAs
        const [userProfile, userProfileBump] = await findUserProfilePDA(forum, profileOwnerKey);

        // Create Signers Array
        const signers = [];
        if (isKp(profileOwner)) signers.push(<Keypair>profileOwner);

        console.log('deleting user profile account with pubkey: ', userProfile.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .deleteUserProfile(
                userProfileBump
            )
            .accounts({
                forum: forum,
                profileOwner: isKp(profileOwner)? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner,
                userProfile: userProfile,
                receiver: receiver,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            userProfile,
            userProfileBump,
            txSig
        }
    }

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    async createAboutMe(
        forum: PublicKey,
        profileOwner: PublicKey | Keypair,
        contentDataHash: PublicKey,
    ) {
        const profileOwnerKey = isKp(profileOwner) ? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner;

        // Derive PDAs
        const [userProfile, userProfileBump] = await findUserProfilePDA(forum, profileOwnerKey);
        const [aboutMe, aboutMeBump] = await findAboutMePDA(userProfile);

        // Create Signers Array
        const signers = [];
        if (isKp(profileOwner)) signers.push(<Keypair>profileOwner);

        console.log('creating about me for user profile account with pubkey: ', userProfile.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .createAboutMe(
                userProfileBump
            )
            .accounts({
                forum: forum,
                profileOwner: isKp(profileOwner)? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner,
                userProfile: userProfile,
                aboutMe: aboutMe,
                contentDataHash: contentDataHash,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            userProfile,
            userProfileBump,
            aboutMe,
            aboutMeBump,
            txSig
        }
    }

    async editAboutMe(
        forum: PublicKey,
        profileOwner: PublicKey | Keypair,
        newContentDataHash: PublicKey,
    ) {
        const profileOwnerKey = isKp(profileOwner) ? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner;

        // Derive PDAs
        const [userProfile, userProfileBump] = await findUserProfilePDA(forum, profileOwnerKey);
        const [aboutMe, aboutMeBump] = await findAboutMePDA(userProfile);

        // Create Signers Array
        const signers = [];
        if (isKp(profileOwner)) signers.push(<Keypair>profileOwner);

        console.log('editing about me for user profile account with pubkey: ', userProfile.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .editAboutMe(
                userProfileBump,
                aboutMeBump,
            )
            .accounts({
                forum: forum,
                profileOwner: isKp(profileOwner)? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner,
                userProfile: userProfile,
                aboutMe: aboutMe,
                newContentDataHash: newContentDataHash,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            userProfile,
            userProfileBump,
            aboutMe,
            aboutMeBump,
            txSig
        }
    }

    async deleteAboutMe(
        forum: PublicKey,
        profileOwner: PublicKey | Keypair,
        receiver: PublicKey
    ) {
        const profileOwnerKey = isKp(profileOwner) ? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner;

        // Derive PDAs
        const [userProfile, userProfileBump] = await findUserProfilePDA(forum, profileOwnerKey);
        const [aboutMe, aboutMeBump] = await findAboutMePDA(userProfile);

        // Create Signers Array
        const signers = [];
        if (isKp(profileOwner)) signers.push(<Keypair>profileOwner);

        console.log('deleting about me for user profile account with pubkey: ', userProfile.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .deleteAboutMe(
                userProfileBump,
                aboutMeBump,
            )
            .accounts({
                forum: forum,
                profileOwner: isKp(profileOwner)? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner,
                userProfile: userProfile,
                aboutMe: aboutMe,
                receiver: receiver,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            userProfile,
            userProfileBump,
            aboutMe,
            aboutMeBump,
            txSig
        }
    }

    async deleteUserProfileAndAboutMe(
        forum: PublicKey,
        profileOwner: PublicKey | Keypair,
        receiver: PublicKey
    ) {
        const profileOwnerKey = isKp(profileOwner) ? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner;

        // Derive PDAs
        const [userProfile, userProfileBump] = await findUserProfilePDA(forum, profileOwnerKey);
        const [aboutMe, aboutMeBump] = await findAboutMePDA(userProfile);

        // Create Signers Array
        const signers = [];
        if (isKp(profileOwner)) signers.push(<Keypair>profileOwner);

        console.log('deleting user profile and about me for user profile account with pubkey: ', userProfile.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .deleteUserProfileAndAboutMe(
                userProfileBump,
                aboutMeBump,
            )
            .accounts({
                forum: forum,
                profileOwner: isKp(profileOwner)? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner,
                userProfile: userProfile,
                aboutMe: aboutMe,
                receiver: receiver,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            userProfile,
            userProfileBump,
            aboutMe,
            aboutMeBump,
            txSig
        }
    }

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    async addModerator(
        userProfile: PublicKey,
        forumManager: PublicKey | Keypair,
    ) {
        const userProfileAcct = await this.fetchUserProfileAccount(userProfile);
        const forum = userProfileAcct.forum;
        const profileOwner = userProfileAcct.profileOwner;

        // Derive PDAs
        const [userProfileKey, userProfileBump] = await findUserProfilePDA(forum, profileOwner);

        // Create Signers Array
        const signers = [];
        if (isKp(forumManager)) signers.push(<Keypair>forumManager);

        console.log('adding moderator status to user profile account with pubkey: ', userProfile.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .addModerator(
                userProfileBump,
            )
            .accounts({
                forum: forum,
                forumManager: isKp(forumManager)? (<Keypair>forumManager).publicKey : <PublicKey>forumManager,
                profileOwner: profileOwner,
                userProfile: userProfile,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            userProfileKey,
            userProfileBump,
            txSig
        }
    }

    async removeModerator(
        userProfile: PublicKey,
        forumManager: PublicKey | Keypair,
    ) {
        const userProfileAcct = await this.fetchUserProfileAccount(userProfile);
        const forum = userProfileAcct.forum;
        const profileOwner = userProfileAcct.profileOwner;

        // Derive PDAs
        const [userProfileKey, userProfileBump] = await findUserProfilePDA(forum, profileOwner);

        // Create Signers Array
        const signers = [];
        if (isKp(forumManager)) signers.push(<Keypair>forumManager);

        console.log('removing moderator status from user profile account with pubkey: ', userProfile.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .removeModerator(
                userProfileBump,
            )
            .accounts({
                forum: forum,
                forumManager: isKp(forumManager)? (<Keypair>forumManager).publicKey : <PublicKey>forumManager,
                profileOwner: profileOwner,
                userProfile: userProfile,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            userProfileKey,
            userProfileBump,
            txSig
        }
    }

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    async askQuestion(
        forum: PublicKey,
        profileOwner: PublicKey | Keypair,
        contentDataHash: PublicKey,
        tags: Tags[],
        title: string,
        contentDataUrl: string,
        bountyAmount: BN,
    ) {
        const questionSeedKeypair = Keypair.generate();
        const questionSeed: PublicKey = questionSeedKeypair.publicKey;

        const profileOwnerKey = isKp(profileOwner) ? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner;

        // Derive PDAs
        const [forumTreasury, forumTreasuryBump] = await findForumTreasuryPDA(forum);
        const [userProfile, userProfileBump] = await findUserProfilePDA(forum, profileOwnerKey);
        const [question, questionBump] = await findQuestionPDA(forum, userProfile, questionSeed);
        const [bountyPda, bountyPdaBump] = await findQuestionBountyPDA(question);

        // Create Signers Array
        const signers = [];
        if (isKp(profileOwner)) signers.push(<Keypair>profileOwner);

        console.log('creating question with pubkey: ', question.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .askQuestion(
                forumTreasuryBump,
                userProfileBump,
                tags,
                title,
                contentDataUrl,
                bountyAmount,
            )
            .accounts({
                forum: forum,
                forumTreasury: forumTreasury,
                profileOwner: isKp(profileOwner)? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner,
                userProfile: userProfile,
                question: question,
                questionSeed: questionSeed,
                contentDataHash: contentDataHash,
                bountyPda: bountyPda,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            forumTreasury,
            forumTreasuryBump,
            userProfile,
            userProfileBump,
            question,
            questionBump,
            bountyPda,
            bountyPdaBump,
            questionSeed,
            txSig
        }
    }

    async editQuestion(
        question: PublicKey,
        profileOwner: PublicKey | Keypair,
        newContentDataHash: PublicKey,
        newTags: Tags[],
        newTitle: string,
        newContentDataUrl: string,
    ) {
        const profileOwnerKey = isKp(profileOwner) ? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner;

        const questionAcct = await this.fetchQuestionAccount(question);
        const forum = questionAcct.forum;
        const questionSeed = questionAcct.questionSeed;

        // Derive PDAs
        const [userProfile, userProfileBump] = await findUserProfilePDA(forum, profileOwnerKey);
        const [questionKey, questionBump] = await findQuestionPDA(forum, userProfile, questionSeed);

        // Create Signers Array
        const signers = [];
        if (isKp(profileOwner)) signers.push(<Keypair>profileOwner);

        console.log('editing question with pubkey: ', question.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .editQuestion(
                userProfileBump,
                questionBump,
                newTags,
                newTitle,
                newContentDataUrl,
            )
            .accounts({
                forum: forum,
                profileOwner: isKp(profileOwner)? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner,
                userProfile: userProfile,
                question: question,
                questionSeed: questionSeed,
                newContentDataHash: newContentDataHash,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            userProfile,
            userProfileBump,
            questionKey,
            questionBump,
            txSig
        }
    }

    async editQuestionModerator(
        question: PublicKey,
        moderator: PublicKey | Keypair,
        newContentDataHash: PublicKey,
        newTags: Tags[],
        newTitle: string,
        newContentDataUrl: string,
    ) {
        const moderatorKey = isKp(moderator) ? (<Keypair>moderator).publicKey : <PublicKey>moderator;

        const questionAcct = await this.fetchQuestionAccount(question);
        const forum = questionAcct.forum;
        const questionSeed = questionAcct.questionSeed;
        const userProfile = questionAcct.userProfile;

        const userProfileAcct = await this.fetchUserProfileAccount(userProfile);
        const profileOwner = userProfileAcct.profileOwner;

        // Derive PDAs
        const [moderatorProfile, moderatorProfileBump] = await findUserProfilePDA(forum, moderatorKey);
        const [userProfileKey, userProfileBump] = await findUserProfilePDA(forum, profileOwner);
        const [questionKey, questionBump] = await findQuestionPDA(forum, userProfile, questionSeed);

        // Create Signers Array
        const signers = [];
        if (isKp(moderator)) signers.push(<Keypair>moderator);

        console.log('moderator editing question with pubkey: ', question.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .editQuestionModerator(
                moderatorProfileBump,
                userProfileBump,
                questionBump,
                newTags,
                newTitle,
                newContentDataUrl,
            )
            .accounts({
                forum: forum,
                moderator: isKp(moderator)? (<Keypair>moderator).publicKey : <PublicKey>moderator,
                moderatorProfile: moderatorProfile,
                profileOwner: profileOwner,
                userProfile: userProfile,
                question: question,
                questionSeed: questionSeed,
                newContentDataHash: newContentDataHash,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            moderatorProfile,
            moderatorProfileBump,
            userProfileKey,
            userProfileBump,
            questionKey,
            questionBump,
            txSig
        }
    }

    async deleteQuestionModerator(
        question: PublicKey,
        moderator: PublicKey | Keypair,
        receiver: PublicKey,
    ) {
        const moderatorKey = isKp(moderator) ? (<Keypair>moderator).publicKey : <PublicKey>moderator;

        const questionAcct = await this.fetchQuestionAccount(question);
        const forum = questionAcct.forum;
        const questionSeed = questionAcct.questionSeed;
        const userProfile = questionAcct.userProfile;

        const userProfileAcct = await this.fetchUserProfileAccount(userProfile);
        const profileOwner = userProfileAcct.profileOwner;

        // Derive PDAs
        const [moderatorProfile, moderatorProfileBump] = await findUserProfilePDA(forum, moderatorKey);
        const [userProfileKey, userProfileBump] = await findUserProfilePDA(forum, profileOwner);
        const [questionKey, questionBump] = await findQuestionPDA(forum, userProfile, questionSeed);

        // Create Signers Array
        const signers = [];
        if (isKp(moderator)) signers.push(<Keypair>moderator);

        console.log('moderator deleting question with pubkey: ', question.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .deleteQuestionModerator(
                moderatorProfileBump,
                userProfileBump,
                questionBump
            )
            .accounts({
                forum: forum,
                moderator: isKp(moderator)? (<Keypair>moderator).publicKey : <PublicKey>moderator,
                moderatorProfile: moderatorProfile,
                profileOwner: profileOwner,
                userProfile: userProfile,
                question: question,
                questionSeed: questionSeed,
                receiver: receiver,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            moderatorProfile,
            moderatorProfileBump,
            userProfileKey,
            userProfileBump,
            questionKey,
            questionBump,
            txSig
        }
    }

    async supplementQuestionBounty(
        question: PublicKey,
        supplementor: PublicKey | Keypair,
        supplementalBountyAmount: BN,
    ) {
        const supplementorKey = isKp(supplementor) ? (<Keypair>supplementor).publicKey : <PublicKey>supplementor;

        const questionAcct = await this.fetchQuestionAccount(question);
        const forum = questionAcct.forum;
        const questionSeed = questionAcct.questionSeed;
        const userProfile = questionAcct.userProfile;

        const userProfileAcct = await this.fetchUserProfileAccount(userProfile);
        const profileOwner = userProfileAcct.profileOwner;

        // Derive PDAs
        const [forumTreasury, forumTreasuryBump] = await findForumTreasuryPDA(forum);
        const [supplementorProfile, supplementorProfileBump] = await findUserProfilePDA(forum, supplementorKey);
        const [userProfileKey, userProfileBump] = await findUserProfilePDA(forum, profileOwner);
        const [questionKey, questionBump] = await findQuestionPDA(forum, userProfile, questionSeed);
        const [bountyPda, bountyPdaBump] = await findQuestionBountyPDA(question);

        // Create Signers Array
        const signers = [];
        if (isKp(supplementor)) signers.push(<Keypair>supplementor);

        console.log('supplementing bounty for question with pubkey: ', question.toBase58(),
                    'with:', supplementalBountyAmount.toString(), 'Sol');

        // Transaction
        const txSig = await this.forumProgram.methods
            .supplementQuestionBounty(
                forumTreasuryBump,
                supplementorProfileBump,
                userProfileBump,
                questionBump,
                bountyPdaBump,
                supplementalBountyAmount,
            )
            .accounts({
                forum: forum,
                forumTreasury: forumTreasury,
                supplementor: isKp(supplementor)? (<Keypair>supplementor).publicKey : <PublicKey>supplementor,
                supplementorProfile: supplementorProfile,
                profileOwner: profileOwner,
                userProfile: userProfile,
                question: question,
                questionSeed: questionSeed,
                bountyPda: bountyPda,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            supplementorProfile,
            supplementorProfileBump,
            userProfileKey,
            userProfileBump,
            questionKey,
            questionBump,
            bountyPda,
            bountyPdaBump,
            txSig
        }
    }

    async refundQuestionBountySupplementorModerator(
        question: PublicKey,
        moderator: PublicKey | Keypair,
        supplementor: PublicKey,
    ) {
        const moderatorKey = isKp(moderator) ? (<Keypair>moderator).publicKey : <PublicKey>moderator;

        const questionAcct = await this.fetchQuestionAccount(question);
        const forum = questionAcct.forum;
        const questionSeed = questionAcct.questionSeed;
        const userProfile = questionAcct.userProfile;

        const userProfileAcct = await this.fetchUserProfileAccount(userProfile);
        const profileOwner = userProfileAcct.profileOwner;

        // Derive PDAs
        const [moderatorProfile, moderatorProfileBump] = await findUserProfilePDA(forum, moderatorKey);
        const [userProfileKey, userProfileBump] = await findUserProfilePDA(forum, profileOwner);
        const [supplementorProfile, supplementorProfileBump] = await findUserProfilePDA(forum, supplementor);
        const [questionKey, questionBump] = await findQuestionPDA(forum, userProfile, questionSeed);
        const [bountyPda, bountyPdaBump] = await findQuestionBountyPDA(question);

        // Create Signers Array
        const signers = [];
        if (isKp(moderator)) signers.push(<Keypair>moderator);

        console.log('refunding user profile account with pubkey: ', userProfile.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .refundQuestionBountySupplementorModerator(
                moderatorProfileBump,
                userProfileBump,
                supplementorProfileBump,
                questionBump,
                bountyPdaBump,
            )
            .accounts({
                forum: forum,
                moderator: isKp(moderator)? (<Keypair>moderator).publicKey : <PublicKey>moderator,
                moderatorProfile: moderatorProfile,
                profileOwner: profileOwner,
                userProfile: userProfile,
                supplementor: supplementor,
                supplementorProfile: supplementorProfile,
                question: question,
                questionSeed: questionSeed,
                bountyPda: bountyPda,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            moderatorProfile,
            moderatorProfileBump,
            userProfileKey,
            userProfileBump,
            supplementorProfile,
            supplementorProfileBump,
            questionKey,
            questionBump,
            bountyPda,
            bountyPdaBump,
            txSig
        }
    }

    async acceptAnswer(
        answer: PublicKey,
        profileOwner: PublicKey | Keypair,
        receiver: PublicKey,
    ) {
        const profileOwnerKey = isKp(profileOwner) ? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner;

        const answerAcct = await this.fetchAnswerAccount(answer);
        const question = answerAcct.question;
        const answerSeed = answerAcct.answerSeed;
        const answerUserProfile = answerAcct.userProfile;

        const questionAcct = await this.fetchQuestionAccount(question);
        const forum = questionAcct.forum;
        const questionSeed = questionAcct.questionSeed;

        const answerUserProfileAcct = await this.fetchUserProfileAccount(answerUserProfile);
        const answerProfileOwner = answerUserProfileAcct.profileOwner;

        // Derive PDAs
        const [userProfile, userProfileBump] = await findUserProfilePDA(forum, profileOwnerKey);
        const [answerUserProfileKey, answerUserProfileBump] = await findUserProfilePDA(forum, answerProfileOwner);
        const [questionKey, questionBump] = await findQuestionPDA(forum, userProfile, questionSeed);
        const [bountyPda, bountyPdaBump] = await findQuestionBountyPDA(question);
        const [answerKey, answerBump] = await findAnswerPDA(forum, answerUserProfile, answerSeed);

        // Create Signers Array
        const signers = [];
        if (isKp(profileOwner)) signers.push(<Keypair>profileOwner);

        console.log('accepting answer with pubkey: ', answer.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .acceptAnswer(
                userProfileBump,
                questionBump,
                bountyPdaBump,
                answerUserProfileBump,
                answerBump,
            )
            .accounts({
                forum: forum,
                profileOwner: isKp(profileOwner)? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner,
                userProfile: userProfile,
                question: question,
                questionSeed: questionSeed,
                bountyPda: bountyPda,
                answerProfileOwner: answerProfileOwner,
                answerUserProfile: answerUserProfile,
                answer: answer,
                answerSeed: answerSeed,
                receiver: receiver,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            userProfile,
            userProfileBump,
            answerUserProfileKey,
            answerUserProfileBump,
            questionKey,
            questionBump,
            bountyPda,
            bountyPdaBump,
            answerKey,
            answerBump,
            txSig
        }
    }

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    async answerQuestion(
        question: PublicKey,
        profileOwner: PublicKey | Keypair,
        contentDataHash: PublicKey,
    ) {
        const answerSeedKeypair = Keypair.generate();
        const answerSeed: PublicKey = answerSeedKeypair.publicKey;

        const questionAcct = await this.fetchQuestionAccount(question);
        const forum = questionAcct.forum;

        const profileOwnerKey = isKp(profileOwner) ? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner;

        // Derive PDAs
        const [userProfile, userProfileBump] = await findUserProfilePDA(forum, profileOwnerKey);
        const [answer, answerBump] = await findAnswerPDA(forum, userProfile, answerSeed);

        // Create Signers Array
        const signers = [];
        if (isKp(profileOwner)) signers.push(<Keypair>profileOwner);

        console.log('creating answer with pubkey: ', answer.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .answerQuestion(
                userProfileBump,
            )
            .accounts({
                forum: forum,
                profileOwner: isKp(profileOwner)? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner,
                userProfile: userProfile,
                question: question,
                answer: answer,
                answerSeed: answerSeed,
                contentDataHash: contentDataHash,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            userProfile,
            userProfileBump,
            answer,
            answerBump,
            answerSeed,
            txSig
        }
    }

    async editAnswer(
        answer: PublicKey,
        profileOwner: PublicKey | Keypair,
        newContentDataHash: PublicKey,
    ) {
        const profileOwnerKey = isKp(profileOwner) ? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner;

        const answerAcct = await this.fetchAnswerAccount(answer);
        const answerSeed = answerAcct.answerSeed;
        const question = answerAcct.question;

        const questionAcct = await this.fetchQuestionAccount(question);
        const forum = questionAcct.forum;

        // Derive PDAs
        const [userProfile, userProfileBump] = await findUserProfilePDA(forum, profileOwnerKey);
        const [answerKey, answerBump] = await findAnswerPDA(forum, userProfile, answerSeed);

        // Create Signers Array
        const signers = [];
        if (isKp(profileOwner)) signers.push(<Keypair>profileOwner);

        console.log('editing answer with pubkey: ', answer.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .editAnswer(
                userProfileBump,
                answerBump,
            )
            .accounts({
                forum: forum,
                profileOwner: isKp(profileOwner)? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner,
                userProfile: userProfile,
                question: question,
                answer: answer,
                answerSeed: answerSeed,
                newContentDataHash: newContentDataHash,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            userProfile,
            userProfileBump,
            answerKey,
            answerBump,
            txSig
        }
    }

    async editAnswerModerator(
        answer: PublicKey,
        moderator: PublicKey | Keypair,
        newContentDataHash: PublicKey,
    ) {
        const moderatorKey = isKp(moderator) ? (<Keypair>moderator).publicKey : <PublicKey>moderator;

        const answerAcct = await this.fetchAnswerAccount(answer);
        const answerSeed = answerAcct.answerSeed;
        const userProfile = answerAcct.userProfile;
        const question = answerAcct.question;

        const questionAcct = await this.fetchQuestionAccount(question);
        const forum = questionAcct.forum;

        const userProfileAcct = await this.fetchUserProfileAccount(userProfile);
        const profileOwner = userProfileAcct.profileOwner;

        // Derive PDAs
        const [moderatorProfile, moderatorProfileBump] = await findUserProfilePDA(forum, moderatorKey);
        const [userProfileKey, userProfileBump] = await findUserProfilePDA(forum, profileOwner);
        const [answerKey, answerBump] = await findAnswerPDA(forum, userProfile, answerSeed);

        // Create Signers Array
        const signers = [];
        if (isKp(moderator)) signers.push(<Keypair>moderator);

        console.log('moderator editing answer with pubkey: ', answer.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .editAnswerModerator(
                moderatorProfileBump,
                userProfileBump,
                answerBump,
            )
            .accounts({
                forum: forum,
                moderator: isKp(moderator)? (<Keypair>moderator).publicKey : <PublicKey>moderator,
                moderatorProfile: moderatorProfile,
                profileOwner: profileOwner,
                userProfile: userProfile,
                question: question,
                answer: answer,
                answerSeed: answerSeed,
                newContentDataHash: newContentDataHash,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            moderatorProfile,
            moderatorProfileBump,
            userProfileKey,
            userProfileBump,
            answerKey,
            answerBump,
            txSig
        }
    }

    async deleteAnswer(
        answer: PublicKey,
        profileOwner: PublicKey | Keypair,
        receiver: PublicKey,
    ) {
        const profileOwnerKey = isKp(profileOwner) ? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner;

        const answerAcct = await this.fetchAnswerAccount(answer);
        const answerSeed = answerAcct.answerSeed;
        const question = answerAcct.question;

        const questionAcct = await this.fetchQuestionAccount(question);
        const forum = questionAcct.forum;

        // Derive PDAs
        const [userProfile, userProfileBump] = await findUserProfilePDA(forum, profileOwnerKey);
        const [answerKey, answerBump] = await findAnswerPDA(forum, userProfile, answerSeed);

        // Create Signers Array
        const signers = [];
        if (isKp(profileOwner)) signers.push(<Keypair>profileOwner);

        console.log('deleting answer with pubkey: ', answer.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .deleteAnswer(
                userProfileBump,
                answerBump
            )
            .accounts({
                forum: forum,
                profileOwner: isKp(profileOwner)? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner,
                userProfile: userProfile,
                question: question,
                answer: answer,
                answerSeed: answerSeed,
                receiver: receiver,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            userProfile,
            userProfileBump,
            answerKey,
            answerBump,
            txSig
        }
    }

    async deleteAnswerModerator(
        answer: PublicKey,
        moderator: PublicKey | Keypair,
        receiver: PublicKey,
    ) {
        const moderatorKey = isKp(moderator) ? (<Keypair>moderator).publicKey : <PublicKey>moderator;

        const answerAcct = await this.fetchAnswerAccount(answer);
        const answerSeed = answerAcct.answerSeed;
        const userProfile = answerAcct.userProfile;
        const question = answerAcct.question;

        const questionAcct = await this.fetchQuestionAccount(question);
        const forum = questionAcct.forum;

        const userProfileAcct = await this.fetchUserProfileAccount(userProfile);
        const profileOwner = userProfileAcct.profileOwner;

        // Derive PDAs
        const [moderatorProfile, moderatorProfileBump] = await findUserProfilePDA(forum, moderatorKey);
        const [userProfileKey, userProfileBump] = await findUserProfilePDA(forum, profileOwner);
        const [answerKey, answerBump] = await findAnswerPDA(forum, userProfile, answerSeed);

        // Create Signers Array
        const signers = [];
        if (isKp(moderator)) signers.push(<Keypair>moderator);

        console.log('moderator deleting answer with pubkey: ', answer.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .deleteAnswerModerator(
                moderatorProfileBump,
                userProfileBump,
                answerBump
            )
            .accounts({
                forum: forum,
                moderator: isKp(moderator)? (<Keypair>moderator).publicKey : <PublicKey>moderator,
                moderatorProfile: moderatorProfile,
                profileOwner: profileOwner,
                userProfile: userProfile,
                question: question,
                answer: answer,
                answerSeed: answerSeed,
                receiver: receiver,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            moderatorProfile,
            moderatorProfileBump,
            userProfileKey,
            userProfileBump,
            answerKey,
            answerBump,
            txSig
        }
    }

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    async leaveCommentOnQuestion(
        question: PublicKey,
        profileOwner: PublicKey | Keypair,
        contentDataHash: PublicKey,
    ) {
        const commentSeedKeypair = Keypair.generate();
        const commentSeed: PublicKey = commentSeedKeypair.publicKey;

        const profileOwnerKey = isKp(profileOwner) ? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner;

        const questionAcct = await this.fetchQuestionAccount(question);
        const forum = questionAcct.forum;

        // Derive PDAs
        const [userProfile, userProfileBump] = await findUserProfilePDA(forum, profileOwnerKey);
        const [comment, commentBump] = await findCommentPDA(forum, userProfile, commentSeed);

        // Create Signers Array
        const signers = [];
        if (isKp(profileOwner)) signers.push(<Keypair>profileOwner);

        console.log('creating comment with pubkey: ', comment.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .leaveCommentOnQuestion(
                userProfileBump,
            )
            .accounts({
                forum: forum,
                profileOwner: isKp(profileOwner)? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner,
                userProfile: userProfile,
                question: question,
                comment: comment,
                commentSeed: commentSeed,
                contentDataHash: contentDataHash,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            userProfile,
            userProfileBump,
            comment,
            commentBump,
            commentSeed,
            txSig
        }
    }

    async editCommentOnQuestion(
        comment: PublicKey,
        profileOwner: PublicKey | Keypair,
        newContentDataHash: PublicKey,
    ) {
        const profileOwnerKey = isKp(profileOwner) ? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner;

        const commentAcct = await this.fetchCommentAccount(comment);
        const commentSeed = commentAcct.commentSeed;
        const question = commentAcct.commentedOn;

        const questionAcct = await this.fetchQuestionAccount(question);
        const forum = questionAcct.forum;

        // Derive PDAs
        const [userProfile, userProfileBump] = await findUserProfilePDA(forum, profileOwnerKey);
        const [commentKey, commentBump] = await findCommentPDA(forum, userProfile, commentSeed);

        // Create Signers Array
        const signers = [];
        if (isKp(profileOwner)) signers.push(<Keypair>profileOwner);

        console.log('editing comment with pubkey: ', comment.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .editCommentOnQuestion(
                userProfileBump,
                commentBump,
            )
            .accounts({
                forum: forum,
                profileOwner: isKp(profileOwner)? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner,
                userProfile: userProfile,
                question: question,
                comment: comment,
                commentSeed: commentSeed,
                newContentDataHash: newContentDataHash,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            userProfile,
            userProfileBump,
            commentKey,
            commentBump,
            txSig
        }
    }

    async editCommentOnQuestionModerator(
        comment: PublicKey,
        moderator: PublicKey | Keypair,
        newContentDataHash: PublicKey,
    ) {
        const moderatorKey = isKp(moderator) ? (<Keypair>moderator).publicKey : <PublicKey>moderator;

        const commentAcct = await this.fetchCommentAccount(comment);
        const commentSeed = commentAcct.commentSeed;
        const question = commentAcct.commentedOn;
        const userProfile = commentAcct.userProfile;

        const questionAcct = await this.fetchQuestionAccount(question);
        const forum = questionAcct.forum;

        const userProfileAcct = await this.fetchUserProfileAccount(userProfile);
        const profileOwner = userProfileAcct.profileOwner;

        // Derive PDAs
        const [moderatorProfile, moderatorProfileBump] = await findUserProfilePDA(forum, moderatorKey);
        const [userProfileKey, userProfileBump] = await findUserProfilePDA(forum, profileOwner);
        const [commentKey, commentBump] = await findCommentPDA(forum, userProfile, commentSeed);

        // Create Signers Array
        const signers = [];
        if (isKp(moderator)) signers.push(<Keypair>moderator);

        console.log('moderator editing comment with pubkey: ', comment.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .editCommentOnQuestionModerator(
                moderatorProfileBump,
                userProfileBump,
                commentBump,
            )
            .accounts({
                forum: forum,
                moderator: isKp(moderator)? (<Keypair>moderator).publicKey : <PublicKey>moderator,
                moderatorProfile: moderatorProfile,
                profileOwner: profileOwner,
                userProfile: userProfile,
                question: question,
                comment: comment,
                commentSeed: commentSeed,
                newContentDataHash: newContentDataHash,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            moderatorProfile,
            moderatorProfileBump,
            userProfileKey,
            userProfileBump,
            commentKey,
            commentBump,
            txSig
        }
    }

    async deleteCommentOnQuestion(
        comment: PublicKey,
        profileOwner: PublicKey | Keypair,
        receiver: PublicKey,
    ) {
        const profileOwnerKey = isKp(profileOwner) ? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner;

        const commentAcct = await this.fetchCommentAccount(comment);
        const commentSeed = commentAcct.commentSeed;
        const question = commentAcct.commentedOn;

        const questionAcct = await this.fetchQuestionAccount(question);
        const forum = questionAcct.forum;

        // Derive PDAs
        const [userProfile, userProfileBump] = await findUserProfilePDA(forum, profileOwnerKey);
        const [commentKey, commentBump] = await findCommentPDA(forum, userProfile, commentSeed);

        // Create Signers Array
        const signers = [];
        if (isKp(profileOwner)) signers.push(<Keypair>profileOwner);

        console.log('deleting comment with pubkey: ', comment.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .deleteCommentOnQuestion(
                userProfileBump,
                commentBump
            )
            .accounts({
                forum: forum,
                profileOwner: isKp(profileOwner)? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner,
                userProfile: userProfile,
                question: question,
                comment: comment,
                commentSeed: commentSeed,
                receiver: receiver,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            userProfile,
            userProfileBump,
            commentKey,
            commentBump,
            txSig
        }
    }

    async deleteCommentOnQuestionModerator(
        comment: PublicKey,
        moderator: PublicKey | Keypair,
        receiver: PublicKey,
    ) {
        const moderatorKey = isKp(moderator) ? (<Keypair>moderator).publicKey : <PublicKey>moderator;

        const commentAcct = await this.fetchCommentAccount(comment);
        const commentSeed = commentAcct.commentSeed;
        const question = commentAcct.commentedOn;
        const userProfile = commentAcct.userProfile;

        const questionAcct = await this.fetchQuestionAccount(question);
        const forum = questionAcct.forum;

        const userProfileAcct = await this.fetchUserProfileAccount(userProfile);
        const profileOwner = userProfileAcct.profileOwner;

        // Derive PDAs
        const [moderatorProfile, moderatorProfileBump] = await findUserProfilePDA(forum, moderatorKey);
        const [userProfileKey, userProfileBump] = await findUserProfilePDA(forum, profileOwner);
        const [commentKey, commentBump] = await findCommentPDA(forum, userProfile, commentSeed);

        // Create Signers Array
        const signers = [];
        if (isKp(moderator)) signers.push(<Keypair>moderator);

        console.log('moderator deleting comment with pubkey: ', comment.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .deleteCommentOnQuestionModerator(
                moderatorProfileBump,
                userProfileBump,
                commentBump
            )
            .accounts({
                forum: forum,
                moderator: isKp(moderator)? (<Keypair>moderator).publicKey : <PublicKey>moderator,
                moderatorProfile: moderatorProfile,
                profileOwner: profileOwner,
                userProfile: userProfile,
                question: question,
                comment: comment,
                commentSeed: commentSeed,
                receiver: receiver,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            moderatorProfile,
            moderatorProfileBump,
            userProfileKey,
            userProfileBump,
            commentKey,
            commentBump,
            txSig
        }
    }

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    async leaveCommentOnAnswer(
        answer: PublicKey,
        profileOwner: PublicKey | Keypair,
        contentDataHash: PublicKey,
    ) {
        const commentSeedKeypair = Keypair.generate();
        const commentSeed: PublicKey = commentSeedKeypair.publicKey;

        const profileOwnerKey = isKp(profileOwner) ? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner;

        const answerAcct = await this.fetchAnswerAccount(answer);
        const question = answerAcct.question;

        const questionAcct = await this.fetchQuestionAccount(question);
        const forum = questionAcct.forum;

        // Derive PDAs
        const [userProfile, userProfileBump] = await findUserProfilePDA(forum, profileOwnerKey);
        const [comment, commentBump] = await findCommentPDA(forum, userProfile, commentSeed);

        // Create Signers Array
        const signers = [];
        if (isKp(profileOwner)) signers.push(<Keypair>profileOwner);

        console.log('creating comment with pubkey: ', comment.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .leaveCommentOnAnswer(
                userProfileBump,
            )
            .accounts({
                forum: forum,
                profileOwner: isKp(profileOwner)? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner,
                userProfile: userProfile,
                question: question,
                answer: answer,
                comment: comment,
                commentSeed: commentSeed,
                contentDataHash: contentDataHash,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            userProfile,
            userProfileBump,
            comment,
            commentBump,
            commentSeed,
            txSig
        }
    }

    async editCommentOnAnswer(
        comment: PublicKey,
        profileOwner: PublicKey | Keypair,
        newContentDataHash: PublicKey,
    ) {
        const profileOwnerKey = isKp(profileOwner) ? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner;

        const commentAcct = await this.fetchCommentAccount(comment);
        const commentSeed = commentAcct.commentSeed;
        const answer = commentAcct.commentedOn;

        const answerAcct = await this.fetchAnswerAccount(answer);
        const question = answerAcct.question;

        const questionAcct = await this.fetchQuestionAccount(question);
        const forum = questionAcct.forum;

        // Derive PDAs
        const [userProfile, userProfileBump] = await findUserProfilePDA(forum, profileOwnerKey);
        const [commentKey, commentBump] = await findCommentPDA(forum, userProfile, commentSeed);

        // Create Signers Array
        const signers = [];
        if (isKp(profileOwner)) signers.push(<Keypair>profileOwner);

        console.log('editing comment with pubkey: ', comment.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .editCommentOnAnswer(
                userProfileBump,
                commentBump,
            )
            .accounts({
                forum: forum,
                profileOwner: isKp(profileOwner)? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner,
                userProfile: userProfile,
                question: question,
                answer: answer,
                comment: comment,
                commentSeed: commentSeed,
                newContentDataHash: newContentDataHash,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            userProfile,
            userProfileBump,
            commentKey,
            commentBump,
            txSig
        }
    }

    async editCommentOnAnswerModerator(
        comment: PublicKey,
        moderator: PublicKey | Keypair,
        newContentDataHash: PublicKey,
    ) {
        const moderatorKey = isKp(moderator) ? (<Keypair>moderator).publicKey : <PublicKey>moderator;

        const commentAcct = await this.fetchCommentAccount(comment);
        const commentSeed = commentAcct.commentSeed;
        const answer = commentAcct.commentedOn;
        const userProfile = commentAcct.userProfile;

        const answerAcct = await this.fetchAnswerAccount(answer);
        const question = answerAcct.question;

        const questionAcct = await this.fetchQuestionAccount(question);
        const forum = questionAcct.forum;

        const userProfileAcct = await this.fetchUserProfileAccount(userProfile);
        const profileOwner = userProfileAcct.profileOwner;

        // Derive PDAs
        const [moderatorProfile, moderatorProfileBump] = await findUserProfilePDA(forum, moderatorKey);
        const [userProfileKey, userProfileBump] = await findUserProfilePDA(forum, profileOwner);
        const [commentKey, commentBump] = await findCommentPDA(forum, userProfile, commentSeed);

        // Create Signers Array
        const signers = [];
        if (isKp(moderator)) signers.push(<Keypair>moderator);

        console.log('moderator editing comment with pubkey: ', comment.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .editCommentOnAnswerModerator(
                moderatorProfileBump,
                userProfileBump,
                commentBump,
            )
            .accounts({
                forum: forum,
                moderator: isKp(moderator)? (<Keypair>moderator).publicKey : <PublicKey>moderator,
                moderatorProfile: moderatorProfile,
                profileOwner: profileOwner,
                userProfile: userProfile,
                question: question,
                answer: answer,
                comment: comment,
                commentSeed: commentSeed,
                newContentDataHash: newContentDataHash,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            moderatorProfile,
            moderatorProfileBump,
            userProfileKey,
            userProfileBump,
            commentKey,
            commentBump,
            txSig
        }
    }

    async deleteCommentOnAnswer(
        comment: PublicKey,
        profileOwner: PublicKey | Keypair,
        receiver: PublicKey,
    ) {
        const profileOwnerKey = isKp(profileOwner) ? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner;

        const commentAcct = await this.fetchCommentAccount(comment);
        const commentSeed = commentAcct.commentSeed;
        const answer = commentAcct.commentedOn;

        const answerAcct = await this.fetchAnswerAccount(answer);
        const question = answerAcct.question;

        const questionAcct = await this.fetchQuestionAccount(question);
        const forum = questionAcct.forum;

        // Derive PDAs
        const [userProfile, userProfileBump] = await findUserProfilePDA(forum, profileOwnerKey);
        const [commentKey, commentBump] = await findCommentPDA(forum, userProfile, commentSeed);

        // Create Signers Array
        const signers = [];
        if (isKp(profileOwner)) signers.push(<Keypair>profileOwner);

        console.log('deleting comment with pubkey: ', comment.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .deleteCommentOnAnswer(
                userProfileBump,
                commentBump
            )
            .accounts({
                forum: forum,
                profileOwner: isKp(profileOwner)? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner,
                userProfile: userProfile,
                question: question,
                answer: answer,
                comment: comment,
                commentSeed: commentSeed,
                receiver: receiver,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            userProfile,
            userProfileBump,
            commentKey,
            commentBump,
            txSig
        }
    }

    async deleteCommentOnAnswerModerator(
        comment: PublicKey,
        moderator: PublicKey | Keypair,
        receiver: PublicKey,
    ) {
        const moderatorKey = isKp(moderator) ? (<Keypair>moderator).publicKey : <PublicKey>moderator;

        const commentAcct = await this.fetchCommentAccount(comment);
        const commentSeed = commentAcct.commentSeed;
        const answer = commentAcct.commentedOn;
        const userProfile = commentAcct.userProfile;

        const answerAcct = await this.fetchAnswerAccount(answer);
        const question = answerAcct.question;

        const questionAcct = await this.fetchQuestionAccount(question);
        const forum = questionAcct.forum;

        const userProfileAcct = await this.fetchUserProfileAccount(userProfile);
        const profileOwner = userProfileAcct.profileOwner;

        // Derive PDAs
        const [moderatorProfile, moderatorProfileBump] = await findUserProfilePDA(forum, moderatorKey);
        const [userProfileKey, userProfileBump] = await findUserProfilePDA(forum, profileOwner);
        const [commentKey, commentBump] = await findCommentPDA(forum, userProfile, commentSeed);

        // Create Signers Array
        const signers = [];
        if (isKp(moderator)) signers.push(<Keypair>moderator);

        console.log('moderator deleting comment with pubkey: ', comment.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .deleteCommentOnAnswerModerator(
                moderatorProfileBump,
                userProfileBump,
                commentBump
            )
            .accounts({
                forum: forum,
                moderator: isKp(moderator)? (<Keypair>moderator).publicKey : <PublicKey>moderator,
                moderatorProfile: moderatorProfile,
                profileOwner: profileOwner,
                userProfile: userProfile,
                question: question,
                answer: answer,
                comment: comment,
                commentSeed: commentSeed,
                receiver: receiver,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            moderatorProfile,
            moderatorProfileBump,
            userProfileKey,
            userProfileBump,
            commentKey,
            commentBump,
            txSig
        }
    }

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    async createBigNote(
        forum: PublicKey,
        profileOwner: PublicKey | Keypair,
        contentDataHash: PublicKey,
        bigNoteType: BigNoteType,
        tags: Tags[],
        title: string,
        contentDataUrl: string,
    ) {
        const bigNoteSeedKeypair = Keypair.generate();
        const bigNoteSeed: PublicKey = bigNoteSeedKeypair.publicKey;

        const profileOwnerKey = isKp(profileOwner) ? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner;

        // Derive PDAs
        const [forumTreasury, forumTreasuryBump] = await findForumTreasuryPDA(forum);
        const [userProfile, userProfileBump] = await findUserProfilePDA(forum, profileOwnerKey);
        const [bigNote, bigNoteBump] = await findBigNotePDA(forum, userProfile, bigNoteSeed);
        const [bountyPda, bountyPdaBump] = await findBigNoteBountyPDA(bigNote);

        // Create Signers Array
        const signers = [];
        if (isKp(profileOwner)) signers.push(<Keypair>profileOwner);

        console.log('creating big note with pubkey: ', bigNote.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .createBigNote(
                forumTreasuryBump,
                userProfileBump,
                bigNoteType,
                tags,
                title,
                contentDataUrl,
            )
            .accounts({
                forum: forum,
                forumTreasury: forumTreasury,
                profileOwner: isKp(profileOwner)? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner,
                userProfile: userProfile,
                bigNote: bigNote,
                bigNoteSeed: bigNoteSeed,
                contentDataHash: contentDataHash,
                bountyPda: bountyPda,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            forumTreasury,
            forumTreasuryBump,
            userProfile,
            userProfileBump,
            bigNote,
            bigNoteBump,
            bountyPda,
            bountyPdaBump,
            bigNoteSeed,
            txSig
        }

    }

    async editBigNoteOpenContribution(
        bigNote: PublicKey,
        editor: PublicKey | Keypair,
        newContentDataHash: PublicKey,
        newTags: Tags[],
        newTitle: string,
        newContentDataUrl: string,
    ) {
        const editorKey = isKp(editor) ? (<Keypair>editor).publicKey : <PublicKey>editor;

        const bigNoteAcct = await this.fetchBigNoteAccount(bigNote);
        const bigNoteSeed = bigNoteAcct.bigNoteSeed;
        const forum = bigNoteAcct.forum;
        const userProfile = bigNoteAcct.userProfile;

        const userProfileAcct = await this.fetchUserProfileAccount(userProfile);
        const profileOwner = userProfileAcct.profileOwner;

        // Derive PDAs
        const [editorProfile, editorProfileBump] = await findUserProfilePDA(forum, editorKey);
        const [userProfileKey, userProfileBump] = await findUserProfilePDA(forum, profileOwner);
        const [bigNoteKey, bigNoteBump] = await findBigNotePDA(forum, userProfile, bigNoteSeed);

        // Create Signers Array
        const signers = [];
        if (isKp(editor)) signers.push(<Keypair>editor);

        console.log('editing big note of type open contribution with pubkey: ', bigNote.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .editBigNoteOpenContribution(
                editorProfileBump,
                userProfileBump,
                bigNoteBump,
                newTags,
                newTitle,
                newContentDataUrl,
            )
            .accounts({
                forum: forum,
                editor: isKp(editor) ? (<Keypair>editor).publicKey : <PublicKey>editor,
                editorProfile: editorProfile,
                profileOwner: profileOwner,
                userProfile: userProfile,
                bigNote: bigNote,
                bigNoteSeed: bigNoteSeed,
                newContentDataHash: newContentDataHash,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            editorProfile,
            editorProfileBump,
            userProfileKey,
            userProfileBump,
            bigNoteKey,
            bigNoteBump,
            txSig
        }
    }

    async editBigNoteCreatorCurated(
        bigNote: PublicKey,
        profileOwner: PublicKey | Keypair,
        newContentDataHash: PublicKey,
        newTags: Tags[],
        newTitle: string,
        newContentDataUrl: string,
    ) {
        const profileOwnerKey = isKp(profileOwner) ? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner;

        const bigNoteAcct = await this.fetchBigNoteAccount(bigNote);
        const bigNoteSeed = bigNoteAcct.bigNoteSeed;
        const forum = bigNoteAcct.forum;

        // Derive PDAs
        const [userProfile, userProfileBump] = await findUserProfilePDA(forum, profileOwnerKey);
        const [bigNoteKey, bigNoteBump] = await findBigNotePDA(forum, userProfile, bigNoteSeed);

        // Create Signers Array
        const signers = [];
        if (isKp(profileOwner)) signers.push(<Keypair>profileOwner);

        console.log('editing big note of type creator curated with pubkey: ', bigNote.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .editBigNoteCreatorCurated(
                userProfileBump,
                bigNoteBump,
                newTags,
                newTitle,
                newContentDataUrl,
            )
            .accounts({
                forum: forum,
                profileOwner: isKp(profileOwner) ? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner,
                userProfile: userProfile,
                bigNote: bigNote,
                bigNoteSeed: bigNoteSeed,
                newContentDataHash: newContentDataHash,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            userProfile,
            userProfileBump,
            bigNoteKey,
            bigNoteBump,
            txSig
        }
    }

    async editBigNoteModerator(
        bigNote: PublicKey,
        moderator: PublicKey | Keypair,
        newContentDataHash: PublicKey,
        newTags: Tags[],
        newTitle: string,
        newContentDataUrl: string,
    ) {
        const moderatorKey = isKp(moderator) ? (<Keypair>moderator).publicKey : <PublicKey>moderator;

        const bigNoteAcct = await this.fetchBigNoteAccount(bigNote);
        const bigNoteSeed = bigNoteAcct.bigNoteSeed;
        const forum = bigNoteAcct.forum;
        const userProfile = bigNoteAcct.userProfile;

        const userProfileAcct = await this.fetchUserProfileAccount(userProfile);
        const profileOwner = userProfileAcct.profileOwner;

        // Derive PDAs
        const [moderatorProfile, moderatorProfileBump] = await findUserProfilePDA(forum, moderatorKey);
        const [userProfileKey, userProfileBump] = await findUserProfilePDA(forum, profileOwner);
        const [bigNoteKey, bigNoteBump] = await findBigNotePDA(forum, userProfile, bigNoteSeed);

        // Create Signers Array
        const signers = [];
        if (isKp(moderator)) signers.push(<Keypair>moderator);

        console.log('moderator editing big note with pubkey: ', bigNote.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .editBigNoteModerator(
                moderatorProfileBump,
                userProfileBump,
                bigNoteBump,
                newTags,
                newTitle,
                newContentDataUrl,
            )
            .accounts({
                forum: forum,
                moderator: isKp(moderator)? (<Keypair>moderator).publicKey : <PublicKey>moderator,
                moderatorProfile: moderatorProfile,
                profileOwner: profileOwner,
                userProfile: userProfile,
                bigNote: bigNote,
                bigNoteSeed: bigNoteSeed,
                newContentDataHash: newContentDataHash,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            moderatorProfile,
            moderatorProfileBump,
            userProfileKey,
            userProfileBump,
            bigNoteKey,
            bigNoteSeed,
            txSig
        }
    }

    async deleteBigNoteModerator(
        bigNote: PublicKey,
        moderator: PublicKey | Keypair,
        receiver: PublicKey,
    ) {
        const moderatorKey = isKp(moderator) ? (<Keypair>moderator).publicKey : <PublicKey>moderator;

        const bigNoteAcct = await this.fetchBigNoteAccount(bigNote);
        const bigNoteSeed = bigNoteAcct.bigNoteSeed;
        const forum = bigNoteAcct.forum;
        const userProfile = bigNoteAcct.userProfile;

        const userProfileAcct = await this.fetchUserProfileAccount(userProfile);
        const profileOwner = userProfileAcct.profileOwner;

        // Derive PDAs
        const [moderatorProfile, moderatorProfileBump] = await findUserProfilePDA(forum, moderatorKey);
        const [userProfileKey, userProfileBump] = await findUserProfilePDA(forum, profileOwner);
        const [bigNoteKey, bigNoteBump] = await findBigNotePDA(forum, userProfile, bigNoteSeed);

        // Create Signers Array
        const signers = [];
        if (isKp(moderator)) signers.push(<Keypair>moderator);

        console.log('moderator deleting big note with pubkey: ', bigNote.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .deleteBigNoteModerator(
                moderatorProfileBump,
                userProfileBump,
                bigNoteBump
            )
            .accounts({
                forum: forum,
                moderator: isKp(moderator)? (<Keypair>moderator).publicKey : <PublicKey>moderator,
                moderatorProfile: moderatorProfile,
                profileOwner: profileOwner,
                userProfile: userProfile,
                bigNote: bigNote,
                bigNoteSeed: bigNoteSeed,
                receiver: receiver,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            userProfileKey,
            userProfileBump,
            bigNoteKey,
            bigNoteBump,
            txSig
        }
    }

    async supplementBigNoteBounty(
        bigNote: PublicKey,
        supplementor: PublicKey | Keypair,
        supplementalBountyAmount: BN,
    ) {
        const supplementorKey = isKp(supplementor) ? (<Keypair>supplementor).publicKey : <PublicKey>supplementor;

        const bigNoteAcct = await this.fetchBigNoteAccount(bigNote);
        const forum = bigNoteAcct.forum;
        const bigNoteSeed = bigNoteAcct.questionSeed;
        const userProfile = bigNoteAcct.userProfile;

        const userProfileAcct = await this.fetchUserProfileAccount(userProfile);
        const profileOwner = userProfileAcct.profileOwner;

        // Derive PDAs
        const [forumTreasury, forumTreasuryBump] = await findForumTreasuryPDA(forum);
        const [supplementorProfile, supplementorProfileBump] = await findUserProfilePDA(forum, supplementorKey);
        const [userProfileKey, userProfileBump] = await findUserProfilePDA(forum, profileOwner);
        const [bigNoteKey, bigNoteBump] = await findBigNotePDA(forum, userProfile, bigNoteSeed);
        const [bountyPda, bountyPdaBump] = await findBigNoteBountyPDA(bigNote);

        // Create Signers Array
        const signers = [];
        if (isKp(supplementor)) signers.push(<Keypair>supplementor);

        console.log('supplementing bounty for big note with pubkey: ', bigNote.toBase58(),
                    'with:', supplementalBountyAmount.toString(), 'Sol');

        // Transaction
        const txSig = await this.forumProgram.methods
            .supplementBigNoteBounty(
                forumTreasuryBump,
                supplementorProfileBump,
                userProfileBump,
                bigNoteBump,
                bountyPdaBump,
                supplementalBountyAmount,
            )
            .accounts({
                forum: forum,
                forumTreasury: forumTreasury,
                supplementor: isKp(supplementor)? (<Keypair>supplementor).publicKey : <PublicKey>supplementor,
                supplementorProfile: supplementorProfile,
                profileOwner: profileOwner,
                userProfile: userProfile,
                bigNote: bigNote,
                bigNoteSeed: bigNoteSeed,
                bountyPda: bountyPda,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            supplementorProfile,
            supplementorProfileBump,
            userProfileKey,
            userProfileBump,
            bigNoteKey,
            bigNoteBump,
            bountyPda,
            bountyPdaBump,
            txSig
        }
    }

    async refundBigNoteBountySupplementorModerator(
        bigNote: PublicKey,
        moderator: PublicKey | Keypair,
        supplementor: PublicKey,
    ) {
        const moderatorKey = isKp(moderator) ? (<Keypair>moderator).publicKey : <PublicKey>moderator;

        const bigNoteAcct = await this.fetchBigNoteAccount(bigNote);
        const forum = bigNoteAcct.forum;
        const bigNoteSeed = bigNoteAcct.bigNoteSeed;
        const userProfile = bigNoteAcct.userProfile;

        const userProfileAcct = await this.fetchUserProfileAccount(userProfile);
        const profileOwner = userProfileAcct.profileOwner;

        // Derive PDAs
        const [moderatorProfile, moderatorProfileBump] = await findUserProfilePDA(forum, moderatorKey);
        const [userProfileKey, userProfileBump] = await findUserProfilePDA(forum, profileOwner);
        const [supplementorProfile, supplementorProfileBump] = await findUserProfilePDA(forum, supplementor);
        const [bigNoteKey, bigNoteBump] = await findBigNotePDA(forum, userProfile, bigNoteSeed);
        const [bountyPda, bountyPdaBump] = await findBigNoteBountyPDA(bigNote);

        // Create Signers Array
        const signers = [];
        if (isKp(moderator)) signers.push(<Keypair>moderator);

        console.log('refunding user profile account with pubkey: ', userProfile.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .refundBigNoteBountySupplementorModerator(
                moderatorProfileBump,
                userProfileBump,
                supplementorProfileBump,
                bigNoteBump,
                bountyPdaBump,
            )
            .accounts({
                forum: forum,
                moderator: isKp(moderator)? (<Keypair>moderator).publicKey : <PublicKey>moderator,
                moderatorProfile: moderatorProfile,
                profileOwner: profileOwner,
                userProfile: userProfile,
                supplementor: supplementor,
                supplementorProfile: supplementorProfile,
                bigNote: bigNote,
                bigNoteSeed: bigNoteSeed,
                bountyPda: bountyPda,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            moderatorProfile,
            moderatorProfileBump,
            userProfileKey,
            userProfileBump,
            supplementorProfile,
            supplementorProfileBump,
            bigNoteKey,
            bigNoteSeed,
            bountyPda,
            bountyPdaBump,
            txSig
        }
    }

    async acceptProposedContribution(
        proposedContribution: PublicKey,
        profileOwner: PublicKey | Keypair,
        receiver: PublicKey,
    ) {
        const profileOwnerKey = isKp(profileOwner) ? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner;

        const proposedContributionAcct = await this.fetchProposedContributionAccount(proposedContribution);
        const bigNote = proposedContributionAcct.bigNote;
        const proposedContributionSeed = proposedContributionAcct.proposedContributionSeed;
        const proposalUserProfile = proposedContributionAcct.userProfile;

        const bigNoteAcct = await this.fetchBigNoteAccount(bigNote);
        const forum = bigNoteAcct.forum;
        const bigNoteSeed = bigNoteAcct.bigNoteSeed;

        const proposalUserProfileAcct = await this.fetchUserProfileAccount(proposalUserProfile);
        const proposalProfileOwner = proposalUserProfileAcct.profileOwner;

        // Derive PDAs
        const [userProfile, userProfileBump] = await findUserProfilePDA(forum, profileOwnerKey);
        const [proposalUserProfileKey, proposalUserProfileBump] = await findUserProfilePDA(forum, proposalProfileOwner);
        const [bigNoteKey, bigNoteBump] = await findBigNotePDA(forum, userProfile, bigNoteSeed);
        const [bountyPda, bountyPdaBump] = await findBigNoteBountyPDA(bigNote);
        const [proposedContributionKey, proposedContributionBump] = await findProposedContributionPDA(forum, proposalUserProfile, proposedContributionSeed);

        // Create Signers Array
        const signers = [];
        if (isKp(profileOwner)) signers.push(<Keypair>profileOwner);

        console.log('accepting proposed contribution with pubkey: ', proposedContribution.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .acceptProposedContribution(
                userProfileBump,
                bigNoteBump,
                bountyPdaBump,
                proposalUserProfileBump,
                proposedContributionBump,
            )
            .accounts({
                forum: forum,
                profileOwner: isKp(profileOwner)? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner,
                userProfile: userProfile,
                bigNote: bigNote,
                bigNoteSeed: bigNoteSeed,
                bountyPda: bountyPda,
                proposalProfileOwner: proposalProfileOwner,
                proposalUserProfile: proposalUserProfile,
                proposedContribution: proposedContribution,
                proposedContributionSeed: proposedContributionSeed,
                receiver: receiver,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            userProfile,
            userProfileBump,
            proposalUserProfileKey,
            proposalUserProfileBump,
            bigNoteKey,
            bigNoteBump,
            bountyPda,
            bountyPdaBump,
            proposedContributionKey,
            proposedContributionSeed,
            txSig
        }
    }

    async rejectProposedContribution(
        proposedContribution: PublicKey,
        profileOwner: PublicKey | Keypair,
    ) {
        const profileOwnerKey = isKp(profileOwner) ? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner;

        const proposedContributionAcct = await this.fetchProposedContributionAccount(proposedContribution);
        const bigNote = proposedContributionAcct.bigNote;
        const proposedContributionSeed = proposedContributionAcct.proposedContributionSeed;
        const proposalUserProfile = proposedContributionAcct.userProfile;

        const bigNoteAcct = await this.fetchBigNoteAccount(bigNote);
        const forum = bigNoteAcct.forum;
        const bigNoteSeed = bigNoteAcct.bigNoteSeed;

        const proposalUserProfileAcct = await this.fetchUserProfileAccount(proposalUserProfile);
        const proposalProfileOwner = proposalUserProfileAcct.profileOwner;

        // Derive PDAs
        const [userProfile, userProfileBump] = await findUserProfilePDA(forum, profileOwnerKey);
        const [proposalUserProfileKey, proposalUserProfileBump] = await findUserProfilePDA(forum, proposalProfileOwner);
        const [bigNoteKey, bigNoteBump] = await findBigNotePDA(forum, userProfile, bigNoteSeed);
        const [proposedContributionKey, proposedContributionBump] = await findProposedContributionPDA(forum, proposalUserProfile, proposedContributionSeed);

        // Create Signers Array
        const signers = [];
        if (isKp(profileOwner)) signers.push(<Keypair>profileOwner);

        console.log('accepting proposed contribution with pubkey: ', proposedContribution.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .rejectProposedContribution(
                userProfileBump,
                bigNoteBump,
                proposalUserProfileBump,
                proposedContributionBump,
            )
            .accounts({
                forum: forum,
                profileOwner: isKp(profileOwner)? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner,
                userProfile: userProfile,
                bigNote: bigNote,
                bigNoteSeed: bigNoteSeed,
                proposalProfileOwner: proposalProfileOwner,
                proposalUserProfile: proposalUserProfile,
                proposedContribution: proposedContribution,
                proposedContributionSeed: proposedContributionSeed,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            userProfile,
            userProfileBump,
            proposalUserProfileKey,
            proposalUserProfileBump,
            bigNoteKey,
            bigNoteBump,
            proposedContributionKey,
            proposedContributionSeed,
            txSig
        }
    }

    async applyForBigNoteVerification(
        bigNote: PublicKey,
        profileOwner: PublicKey | Keypair,
    ) {
        const profileOwnerKey = isKp(profileOwner) ? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner;

        const bigNoteAcct = await this.fetchBigNoteAccount(bigNote);
        const forum = bigNoteAcct.forum;
        const bigNoteSeed = bigNoteAcct.bigNoteSeed;

        // Derive PDAs
        const [userProfile, userProfileBump] = await findUserProfilePDA(forum, profileOwnerKey);
        const [bigNoteKey, bigNoteBump] = await findBigNotePDA(forum, userProfile, bigNoteSeed);
        const [verificationApplication, verificationApplicationBump] = await findBigNoteVerificationApplicationPDA(bigNote);
        const [verificationFeePda, verificationFeePdaBump] = await findVerificationFeePDA(bigNote);

        // Create Signers Array
        const signers = [];
        if (isKp(profileOwner)) signers.push(<Keypair>profileOwner);

        console.log('applying for verification for big note with pubkey: ', bigNote.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .applyForBigNoteVerification(
                userProfileBump,
                bigNoteBump,
            )
            .accounts({
                forum: forum,
                profileOwner: isKp(profileOwner)? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner,
                userProfile: userProfile,
                bigNote: bigNote,
                bigNoteSeed: bigNoteSeed,
                verificationApplication: verificationApplication,
                verificationFeePda: verificationFeePda,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            userProfile,
            userProfileBump,
            bigNoteKey,
            bigNoteBump,
            verificationApplication,
            verificationApplicationBump,
            verificationFeePda,
            verificationFeePdaBump,
            txSig
        }
    }

    async deleteBigNoteVerificationApplication(
        bigNote: PublicKey,
        profileOwner: PublicKey | Keypair,
    ) {
        const profileOwnerKey = isKp(profileOwner) ? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner;

        const bigNoteAcct = await this.fetchBigNoteAccount(bigNote);
        const forum = bigNoteAcct.forum;
        const bigNoteSeed = bigNoteAcct.bigNoteSeed;

        // Derive PDAs
        const [userProfile, userProfileBump] = await findUserProfilePDA(forum, profileOwnerKey);
        const [bigNoteKey, bigNoteBump] = await findBigNotePDA(forum, userProfile, bigNoteSeed);
        const [verificationApplication, verificationApplicationBump] = await findBigNoteVerificationApplicationPDA(bigNote);
        const [verificationFeePda, verificationFeePdaBump] = await findVerificationFeePDA(bigNote);

        // Create Signers Array
        const signers = [];
        if (isKp(profileOwner)) signers.push(<Keypair>profileOwner);

        console.log('deleting verification application for big note with pubkey: ', bigNote.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .deleteBigNoteVerificationApplication(
                userProfileBump,
                bigNoteBump,
                verificationApplicationBump,
                verificationFeePdaBump,
            )
            .accounts({
                forum: forum,
                profileOwner: isKp(profileOwner)? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner,
                userProfile: userProfile,
                bigNote: bigNote,
                bigNoteSeed: bigNoteSeed,
                verificationApplication: verificationApplication,
                verificationFeePda: verificationFeePda,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            userProfile,
            userProfileBump,
            bigNoteKey,
            bigNoteBump,
            verificationApplication,
            verificationApplicationBump,
            verificationFeePda,
            verificationFeePdaBump,
            txSig
        }
    }

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    async acceptBigNoteVerificationApplication(
        verificationApplication: PublicKey,
        moderator: PublicKey | Keypair,
    ) {
        const moderatorKey = isKp(moderator) ? (<Keypair>moderator).publicKey : <PublicKey>moderator;

        const verificationApplicationAcct = await this.fetchBigNoteVerificationApplicationAccount(verificationApplication);
        const bigNote = verificationApplicationAcct.bigNote;
        const verificationFeePda = verificationApplicationAcct.verificationFeePda;

        const bigNoteAcct = await this.fetchBigNoteAccount(bigNote);
        const forum = bigNoteAcct.forum;
        const userProfile = bigNoteAcct.userProfile;
        const bigNoteSeed = bigNoteAcct.bigNoteSeed;

        const userProfileAcct = await this.fetchUserProfileAccount(userProfile);
        const profileOwner = userProfileAcct.profileOwner;

        // Derive PDAs
        const [forumTreasury, forumTreasuryBump] = await findForumTreasuryPDA(forum);
        const [moderatorProfile, moderatorProfileBump] = await findUserProfilePDA(forum, moderatorKey);
        const [userProfileKey, userProfileBump] = await findUserProfilePDA(forum, profileOwner);
        const [bigNoteKey, bigNoteBump] = await findBigNotePDA(forum, userProfile, bigNoteSeed);
        const [verificationApplicationKey, verificationApplicationBump] = await findBigNoteVerificationApplicationPDA(bigNote);
        const [verificationFeePdaKey, verificationFeePdaBump] = await findVerificationFeePDA(bigNote);

        // Create Signers Array
        const signers = [];
        if (isKp(moderator)) signers.push(<Keypair>moderator);

        console.log('accepting big note verification application for big note with pubkey: ', bigNote.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .acceptBigNoteVerificationApplication(
                forumTreasuryBump,
                moderatorProfileBump,
                userProfileBump,
                bigNoteBump,
                verificationApplicationBump,
                verificationFeePdaBump,
            )
            .accounts({
                forum: forum,
                forumTreasury: forumTreasury,
                moderator: isKp(moderator)? (<Keypair>moderator).publicKey : <PublicKey>moderator,
                moderatorProfile: moderatorProfile,
                profileOwner: profileOwner,
                userProfile: userProfile,
                bigNote: bigNote,
                bigNoteSeed: bigNoteSeed,
                verificationApplication: verificationApplication,
                verificationFeePda: verificationFeePda,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            forumTreasury,
            forumTreasuryBump,
            moderatorProfile,
            moderatorProfileBump,
            userProfileKey,
            userProfileBump,
            bigNoteKey,
            bigNoteBump,
            verificationApplicationKey,
            verificationApplicationBump,
            verificationFeePdaKey,
            verificationFeePdaBump,
            txSig
        }
    }

    async rejectBigNoteVerificationApplication(
        verificationApplication: PublicKey,
        moderator: PublicKey | Keypair,
    ) {
        const moderatorKey = isKp(moderator) ? (<Keypair>moderator).publicKey : <PublicKey>moderator;

        const verificationApplicationAcct = await this.fetchBigNoteVerificationApplicationAccount(verificationApplication);
        const bigNote = verificationApplicationAcct.bigNote;
        const verificationFeePda = verificationApplicationAcct.verificationFeePda;

        const bigNoteAcct = await this.fetchBigNoteAccount(bigNote);
        const forum = bigNoteAcct.forum;
        const userProfile = bigNoteAcct.userProfile;
        const bigNoteSeed = bigNoteAcct.bigNoteSeed;

        const userProfileAcct = await this.fetchUserProfileAccount(userProfile);
        const profileOwner = userProfileAcct.profileOwner;

        // Derive PDAs
        const [moderatorProfile, moderatorProfileBump] = await findUserProfilePDA(forum, moderatorKey);
        const [userProfileKey, userProfileBump] = await findUserProfilePDA(forum, profileOwner);
        const [bigNoteKey, bigNoteBump] = await findBigNotePDA(forum, userProfile, bigNoteSeed);
        const [verificationApplicationKey, verificationApplicationBump] = await findBigNoteVerificationApplicationPDA(bigNote);
        const [verificationFeePdaKey, verificationFeePdaBump] = await findVerificationFeePDA(bigNote);

        // Create Signers Array
        const signers = [];
        if (isKp(moderator)) signers.push(<Keypair>moderator);

        console.log('rejecting big note verification application for big note with pubkey: ', bigNote.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .rejectBigNoteVerificationApplication(
                moderatorProfileBump,
                userProfileBump,
                bigNoteBump,
                verificationApplicationBump,
                verificationFeePdaBump,
            )
            .accounts({
                forum: forum,
                moderator: isKp(moderator)? (<Keypair>moderator).publicKey : <PublicKey>moderator,
                moderatorProfile: moderatorProfile,
                profileOwner: profileOwner,
                userProfile: userProfile,
                bigNote: bigNote,
                bigNoteSeed: bigNoteSeed,
                verificationApplication: verificationApplication,
                verificationFeePda: verificationFeePda,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            moderatorProfile,
            moderatorProfileBump,
            userProfileKey,
            userProfileBump,
            bigNoteKey,
            bigNoteBump,
            verificationApplicationKey,
            verificationApplicationBump,
            verificationFeePdaKey,
            verificationFeePdaBump,
            txSig
        }
    }

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    async proposeContribution(
        bigNote: PublicKey,
        profileOwner: PublicKey | Keypair,
        contentDataHash: PublicKey,
    ) {
        const proposedContributionSeedKeypair = Keypair.generate();
        const proposedContributionSeed: PublicKey = proposedContributionSeedKeypair.publicKey;

        const profileOwnerKey = isKp(profileOwner) ? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner;

        const bigNoteAcct = await this.fetchBigNoteAccount(bigNote);
        const forum = bigNoteAcct.forum;
        const bigNoteSeed = bigNoteAcct.bigNoteSeed;

        // Derive PDAs
        const [userProfile, userProfileBump] = await findUserProfilePDA(forum, profileOwnerKey);
        const [bigNoteKey, bigNoteBump] = await findBigNotePDA(forum, userProfile, bigNoteSeed);
        const [proposedContribution, proposedContributionBump] = await findProposedContributionPDA(forum, userProfile, proposedContributionSeed);

        // Create Signers Array
        const signers = [];
        if (isKp(profileOwner)) signers.push(<Keypair>profileOwner);

        console.log('creating proposed contribution with pubkey: ', proposedContribution.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .proposeContribution(
                userProfileBump,
            )
            .accounts({
                forum: forum,
                profileOwner: isKp(profileOwner)? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner,
                userProfile: userProfile,
                bigNote: bigNote,
                proposedContribution: proposedContribution,
                proposedContributionSeed: proposedContributionSeed,
                contentDataHash: contentDataHash,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            userProfile,
            userProfileBump,
            bigNoteKey,
            bigNoteBump,
            proposedContribution,
            proposedContributionBump,
            txSig
        }
    }

    async editProposedContribution(
        proposedContribution: PublicKey,
        profileOwner: PublicKey | Keypair,
        newContentDataHash: PublicKey,
    ) {
        const profileOwnerKey = isKp(profileOwner) ? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner;

        const proposedContributionAcct = await this.fetchProposedContributionAccount(proposedContribution);
        const bigNote = proposedContributionAcct.bigNote;
        const proposedContributionSeed = proposedContributionAcct.proposedContributionSeed;

        const bigNoteAcct = await this.fetchBigNoteAccount(bigNote);
        const forum = bigNoteAcct.forum;
        const bigNoteSeed = bigNoteAcct.bigNoteSeed;

        // Derive PDAs
        const [userProfile, userProfileBump] = await findUserProfilePDA(forum, profileOwnerKey);
        const [bigNoteKey, bigNoteBump] = await findBigNotePDA(forum, userProfile, bigNoteSeed);
        const [proposedContributionKey, proposedContributionBump] = await findProposedContributionPDA(forum, userProfile, proposedContributionSeed);

        // Create Signers Array
        const signers = [];
        if (isKp(profileOwner)) signers.push(<Keypair>profileOwner);

        console.log('editing proposed contribution with pubkey: ', proposedContribution.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .editProposedContribution(
                userProfileBump,
                proposedContributionBump,
            )
            .accounts({
                forum: forum,
                profileOwner: isKp(profileOwner)? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner,
                userProfile: userProfile,
                bigNote: bigNote,
                proposedContribution: proposedContribution,
                proposedContributionSeed: proposedContributionSeed,
                newContentDataHash: newContentDataHash,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            userProfile,
            userProfileBump,
            bigNoteKey,
            bigNoteBump,
            proposedContributionKey,
            proposedContributionBump,
            txSig
        }
    }

    async editProposedContributionModerator(
        proposedContribution: PublicKey,
        moderator: PublicKey | Keypair,
        newContentDataHash: PublicKey,
    ) {
        const moderatorKey = isKp(moderator) ? (<Keypair>moderator).publicKey : <PublicKey>moderator;

        const proposedContributionAcct = await this.fetchProposedContributionAccount(proposedContribution);
        const bigNote = proposedContributionAcct.bigNote;
        const userProfile = proposedContributionAcct.userProfile;
        const proposedContributionSeed = proposedContributionAcct.proposedContributionSeed;

        const userProfileAcct = await this.fetchUserProfileAccount(userProfile);
        const profileOwner = userProfileAcct.profileOwner;

        const bigNoteAcct = await this.fetchBigNoteAccount(bigNote);
        const forum = bigNoteAcct.forum;
        const bigNoteSeed = bigNoteAcct.bigNoteSeed;

        // Derive PDAs
        const [moderatorProfile, moderatorProfileBump] = await findUserProfilePDA(forum, moderatorKey);
        const [userProfileKey, userProfileBump] = await findUserProfilePDA(forum, profileOwner);
        const [bigNoteKey, bigNoteBump] = await findBigNotePDA(forum, userProfile, bigNoteSeed);
        const [proposedContributionKey, proposedContributionBump] = await findProposedContributionPDA(forum, userProfile, proposedContributionSeed);

        // Create Signers Array
        const signers = [];
        if (isKp(moderator)) signers.push(<Keypair>moderator);

        console.log('moderator editing proposed contribution with pubkey: ', proposedContribution.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .editProposedContributionModerator(
                moderatorProfileBump,
                userProfileBump,
                proposedContributionBump,
            )
            .accounts({
                forum: forum,
                moderator: isKp(moderator) ? (<Keypair>moderator).publicKey : <PublicKey>moderator,
                moderatorProfile: moderatorProfile,
                profileOwner: profileOwner,
                userProfile: userProfile,
                bigNote: bigNote,
                proposedContribution: proposedContribution,
                proposedContributionSeed: proposedContributionSeed,
                newContentDataHash: newContentDataHash,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            moderatorProfile,
            moderatorProfileBump,
            userProfileKey,
            userProfileBump,
            bigNoteKey,
            bigNoteBump,
            proposedContributionKey,
            proposedContributionBump,
            txSig
        }
    }

    async deleteProposedContribution(
        proposedContribution: PublicKey,
        profileOwner: PublicKey | Keypair,
        receiver: PublicKey,
    ) {
        const profileOwnerKey = isKp(profileOwner) ? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner;

        const proposedContributionAcct = await this.fetchProposedContributionAccount(proposedContribution);
        const bigNote = proposedContributionAcct.bigNote;
        const proposedContributionSeed = proposedContributionAcct.proposedContributionSeed;

        const bigNoteAcct = await this.fetchBigNoteAccount(bigNote);
        const forum = bigNoteAcct.forum;
        const bigNoteSeed = bigNoteAcct.bigNoteSeed;

        // Derive PDAs
        const [userProfile, userProfileBump] = await findUserProfilePDA(forum, profileOwnerKey);
        const [bigNoteKey, bigNoteBump] = await findBigNotePDA(forum, userProfile, bigNoteSeed);
        const [proposedContributionKey, proposedContributionBump] = await findProposedContributionPDA(forum, userProfile, proposedContributionSeed);

        // Create Signers Array
        const signers = [];
        if (isKp(profileOwner)) signers.push(<Keypair>profileOwner);

        console.log('deleting proposed contribution with pubkey: ', proposedContribution.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .deleteProposedContribution(
                userProfileBump,
                proposedContributionBump,
            )
            .accounts({
                forum: forum,
                profileOwner: isKp(profileOwner)? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner,
                userProfile: userProfile,
                bigNote: bigNote,
                proposedContribution: proposedContribution,
                proposedContributionSeed: proposedContributionSeed,
                receiver: receiver,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            userProfile,
            userProfileBump,
            bigNoteKey,
            bigNoteBump,
            proposedContributionKey,
            proposedContributionBump,
            txSig
        }
    }

    async deleteProposedContributionModerator(
        proposedContribution: PublicKey,
        moderator: PublicKey | Keypair,
        receiver: PublicKey,
    ) {
        const moderatorKey = isKp(moderator) ? (<Keypair>moderator).publicKey : <PublicKey>moderator;

        const proposedContributionAcct = await this.fetchProposedContributionAccount(proposedContribution);
        const bigNote = proposedContributionAcct.bigNote;
        const userProfile = proposedContributionAcct.userProfile;
        const proposedContributionSeed = proposedContributionAcct.proposedContributionSeed;

        const userProfileAcct = await this.fetchUserProfileAccount(userProfile);
        const profileOwner = userProfileAcct.profileOwner;

        const bigNoteAcct = await this.fetchBigNoteAccount(bigNote);
        const forum = bigNoteAcct.forum;
        const bigNoteSeed = bigNoteAcct.bigNoteSeed;

        // Derive PDAs
        const [moderatorProfile, moderatorProfileBump] = await findUserProfilePDA(forum, moderatorKey);
        const [userProfileKey, userProfileBump] = await findUserProfilePDA(forum, profileOwner);
        const [bigNoteKey, bigNoteBump] = await findBigNotePDA(forum, userProfile, bigNoteSeed);
        const [proposedContributionKey, proposedContributionBump] = await findProposedContributionPDA(forum, userProfile, proposedContributionSeed);

        // Create Signers Array
        const signers = [];
        if (isKp(moderator)) signers.push(<Keypair>moderator);

        console.log('moderator deleting proposed contribution with pubkey: ', proposedContribution.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .deleteProposedContributionModerator(
                moderatorProfileBump,
                userProfileBump,
                proposedContributionBump,
            )
            .accounts({
                forum: forum,
                moderator: isKp(moderator) ? (<Keypair>moderator).publicKey : <PublicKey>moderator,
                moderatorProfile: moderatorProfile,
                profileOwner: profileOwner,
                userProfile: userProfile,
                bigNote: bigNote,
                proposedContribution: proposedContribution,
                proposedContributionSeed: proposedContributionSeed,
                receiver: receiver,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            moderatorProfile,
            moderatorProfileBump,
            userProfileKey,
            userProfileBump,
            bigNoteKey,
            bigNoteBump,
            proposedContributionKey,
            proposedContributionBump,
            txSig
        }
    }


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    async leaveCommentOnBigNote(
        bigNote: PublicKey,
        profileOwner: PublicKey | Keypair,
        contentDataHash: PublicKey,
    ) {
        const commentSeedKeypair = Keypair.generate();
        const commentSeed: PublicKey = commentSeedKeypair.publicKey;

        const profileOwnerKey = isKp(profileOwner) ? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner;

        const bigNoteAcct = await this.fetchBigNoteAccount(bigNote);
        const forum = bigNoteAcct.forum;

        // Derive PDAs
        const [userProfile, userProfileBump] = await findUserProfilePDA(forum, profileOwnerKey);
        const [comment, commentBump] = await findCommentPDA(forum, userProfile, commentSeed);

        // Create Signers Array
        const signers = [];
        if (isKp(profileOwner)) signers.push(<Keypair>profileOwner);

        console.log('creating comment with pubkey: ', comment.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .leaveCommentOnBigNote(
                userProfileBump,
            )
            .accounts({
                forum: forum,
                profileOwner: isKp(profileOwner)? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner,
                userProfile: userProfile,
                bigNote: bigNote,
                comment: comment,
                commentSeed: commentSeed,
                contentDataHash: contentDataHash,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            userProfile,
            userProfileBump,
            comment,
            commentBump,
            commentSeed,
            txSig
        }
    }

    async editCommentOnBigNote(
        comment: PublicKey,
        profileOwner: PublicKey | Keypair,
        newContentDataHash: PublicKey,
    ) {
        const profileOwnerKey = isKp(profileOwner) ? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner;

        const commentAcct = await this.fetchCommentAccount(comment);
        const commentSeed = commentAcct.commentSeed;
        const bigNote = commentAcct.commentedOn;

        const bigNoteAcct = await this.fetchBigNoteAccount(bigNote);
        const forum = bigNoteAcct.forum;

        // Derive PDAs
        const [userProfile, userProfileBump] = await findUserProfilePDA(forum, profileOwnerKey);
        const [commentKey, commentBump] = await findCommentPDA(forum, userProfile, commentSeed);

        // Create Signers Array
        const signers = [];
        if (isKp(profileOwner)) signers.push(<Keypair>profileOwner);

        console.log('editing comment with pubkey: ', comment.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .editCommentOnBigNote(
                userProfileBump,
                commentBump,
            )
            .accounts({
                forum: forum,
                profileOwner: isKp(profileOwner)? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner,
                userProfile: userProfile,
                bigNote: bigNote,
                comment: comment,
                commentSeed: commentSeed,
                newContentDataHash: newContentDataHash,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            userProfile,
            userProfileBump,
            commentKey,
            commentBump,
            txSig
        }
    }

    async editCommentOnBigNoteModerator(
        comment: PublicKey,
        moderator: PublicKey | Keypair,
        newContentDataHash: PublicKey,
    ) {
        const moderatorKey = isKp(moderator) ? (<Keypair>moderator).publicKey : <PublicKey>moderator;

        const commentAcct = await this.fetchCommentAccount(comment);
        const commentSeed = commentAcct.commentSeed;
        const bigNote = commentAcct.commentedOn;
        const userProfile = commentAcct.userProfile;

        const bigNoteAcct = await this.fetchBigNoteAccount(bigNote);
        const forum = bigNoteAcct.forum;

        const userProfileAcct = await this.fetchUserProfileAccount(userProfile);
        const profileOwner = userProfileAcct.profileOwner;

        // Derive PDAs
        const [moderatorProfile, moderatorProfileBump] = await findUserProfilePDA(forum, moderatorKey);
        const [userProfileKey, userProfileBump] = await findUserProfilePDA(forum, profileOwner);
        const [commentKey, commentBump] = await findCommentPDA(forum, userProfile, commentSeed);

        // Create Signers Array
        const signers = [];
        if (isKp(moderator)) signers.push(<Keypair>moderator);

        console.log('moderator editing comment with pubkey: ', comment.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .editCommentOnBigNoteModerator(
                moderatorProfileBump,
                userProfileBump,
                commentBump,
            )
            .accounts({
                forum: forum,
                moderator: isKp(moderator)? (<Keypair>moderator).publicKey : <PublicKey>moderator,
                moderatorProfile: moderatorProfile,
                profileOwner: profileOwner,
                userProfile: userProfile,
                bigNote: bigNote,
                comment: comment,
                commentSeed: commentSeed,
                newContentDataHash: newContentDataHash,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            moderatorProfile,
            moderatorProfileBump,
            userProfileKey,
            userProfileBump,
            commentKey,
            commentBump,
            txSig
        }
    }

    async deleteCommentOnBigNote(
        comment: PublicKey,
        profileOwner: PublicKey | Keypair,
        receiver: PublicKey,
    ) {
        const profileOwnerKey = isKp(profileOwner) ? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner;

        const commentAcct = await this.fetchCommentAccount(comment);
        const commentSeed = commentAcct.commentSeed;
        const bigNote = commentAcct.commentedOn;

        const bigNoteAcct = await this.fetchBigNoteAccount(bigNote);
        const forum = bigNoteAcct.forum;

        // Derive PDAs
        const [userProfile, userProfileBump] = await findUserProfilePDA(forum, profileOwnerKey);
        const [commentKey, commentBump] = await findCommentPDA(forum, userProfile, commentSeed);

        // Create Signers Array
        const signers = [];
        if (isKp(profileOwner)) signers.push(<Keypair>profileOwner);

        console.log('deleting comment with pubkey: ', comment.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .deleteCommentOnBigNote(
                userProfileBump,
                commentBump
            )
            .accounts({
                forum: forum,
                profileOwner: isKp(profileOwner)? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner,
                userProfile: userProfile,
                bigNote: bigNote,
                comment: comment,
                commentSeed: commentSeed,
                receiver: receiver,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            userProfile,
            userProfileBump,
            commentKey,
            commentBump,
            txSig
        }
    }

    async deleteCommentOnBigNoteModerator(
        comment: PublicKey,
        moderator: PublicKey | Keypair,
        receiver: PublicKey,
    ) {
        const moderatorKey = isKp(moderator) ? (<Keypair>moderator).publicKey : <PublicKey>moderator;

        const commentAcct = await this.fetchCommentAccount(comment);
        const commentSeed = commentAcct.commentSeed;
        const bigNote = commentAcct.commentedOn;
        const userProfile = commentAcct.userProfile;

        const bigNoteAcct = await this.fetchBigNoteAccount(bigNote);
        const forum = bigNoteAcct.forum;

        const userProfileAcct = await this.fetchUserProfileAccount(userProfile);
        const profileOwner = userProfileAcct.profileOwner;

        // Derive PDAs
        const [moderatorProfile, moderatorProfileBump] = await findUserProfilePDA(forum, moderatorKey);
        const [userProfileKey, userProfileBump] = await findUserProfilePDA(forum, profileOwner);
        const [commentKey, commentBump] = await findCommentPDA(forum, userProfile, commentSeed);

        // Create Signers Array
        const signers = [];
        if (isKp(moderator)) signers.push(<Keypair>moderator);

        console.log('moderator deleting comment with pubkey: ', comment.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .deleteCommentOnBigNoteModerator(
                moderatorProfileBump,
                userProfileBump,
                commentBump
            )
            .accounts({
                forum: forum,
                moderator: isKp(moderator)? (<Keypair>moderator).publicKey : <PublicKey>moderator,
                moderatorProfile: moderatorProfile,
                profileOwner: profileOwner,
                userProfile: userProfile,
                bigNote: bigNote,
                comment: comment,
                commentSeed: commentSeed,
                receiver: receiver,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            moderatorProfile,
            moderatorProfileBump,
            userProfileKey,
            userProfileBump,
            commentKey,
            commentBump,
            txSig
        }
    }

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    async leaveCommentOnProposedContribution(
        proposedContribution: PublicKey,
        profileOwner: PublicKey | Keypair,
        contentDataHash: PublicKey,
    ) {
        const commentSeedKeypair = Keypair.generate();
        const commentSeed: PublicKey = commentSeedKeypair.publicKey;

        const profileOwnerKey = isKp(profileOwner) ? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner;

        const proposedContributionAcct = await this.fetchProposedContributionAccount(proposedContribution);
        const bigNote = proposedContributionAcct.bigNote;

        const bigNoteAcct = await this.fetchBigNoteAccount(bigNote);
        const forum = bigNoteAcct.forum;

        // Derive PDAs
        const [userProfile, userProfileBump] = await findUserProfilePDA(forum, profileOwnerKey);
        const [comment, commentBump] = await findCommentPDA(forum, userProfile, commentSeed);

        // Create Signers Array
        const signers = [];
        if (isKp(profileOwner)) signers.push(<Keypair>profileOwner);

        console.log('creating comment with pubkey: ', comment.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .leaveCommentOnProposedContribution(
                userProfileBump,
            )
            .accounts({
                forum: forum,
                profileOwner: isKp(profileOwner)? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner,
                userProfile: userProfile,
                bigNote: bigNote,
                proposedContribution: proposedContribution,
                comment: comment,
                commentSeed: commentSeed,
                contentDataHash: contentDataHash,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            userProfile,
            userProfileBump,
            comment,
            commentBump,
            commentSeed,
            txSig
        }
    }

    async editCommentOnProposedContribution(
        comment: PublicKey,
        profileOwner: PublicKey | Keypair,
        newContentDataHash: PublicKey,
    ) {
        const profileOwnerKey = isKp(profileOwner) ? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner;

        const commentAcct = await this.fetchCommentAccount(comment);
        const commentSeed = commentAcct.commentSeed;
        const proposedContribution = commentAcct.commentedOn;

        const proposedContributionAcct = await this.fetchProposedContributionAccount(proposedContribution);
        const bigNote = proposedContributionAcct.bigNote;

        const bigNoteAcct = await this.fetchBigNoteAccount(bigNote);
        const forum = bigNoteAcct.forum;

        // Derive PDAs
        const [userProfile, userProfileBump] = await findUserProfilePDA(forum, profileOwnerKey);
        const [commentKey, commentBump] = await findCommentPDA(forum, userProfile, commentSeed);

        // Create Signers Array
        const signers = [];
        if (isKp(profileOwner)) signers.push(<Keypair>profileOwner);

        console.log('editing comment with pubkey: ', comment.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .editCommentOnProposedContribution(
                userProfileBump,
                commentBump,
            )
            .accounts({
                forum: forum,
                profileOwner: isKp(profileOwner)? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner,
                userProfile: userProfile,
                bigNote: bigNote,
                proposedContribution: proposedContribution,
                comment: comment,
                commentSeed: commentSeed,
                newContentDataHash: newContentDataHash,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            userProfile,
            userProfileBump,
            commentKey,
            commentBump,
            txSig
        }
    }

    async editCommentOnProposedContributionModerator(
        comment: PublicKey,
        moderator: PublicKey | Keypair,
        newContentDataHash: PublicKey,
    ) {
        const moderatorKey = isKp(moderator) ? (<Keypair>moderator).publicKey : <PublicKey>moderator;

        const commentAcct = await this.fetchCommentAccount(comment);
        const commentSeed = commentAcct.commentSeed;
        const proposedContribution = commentAcct.commentedOn;
        const userProfile = commentAcct.userProfile;

        const proposedContributionAcct = await this.fetchProposedContributionAccount(proposedContribution);
        const bigNote = proposedContributionAcct.bigNote;

        const bigNoteAcct = await this.fetchBigNoteAccount(bigNote);
        const forum = bigNoteAcct.forum;

        const userProfileAcct = await this.fetchUserProfileAccount(userProfile);
        const profileOwner = userProfileAcct.profileOwner;

        // Derive PDAs
        const [moderatorProfile, moderatorProfileBump] = await findUserProfilePDA(forum, moderatorKey);
        const [userProfileKey, userProfileBump] = await findUserProfilePDA(forum, profileOwner);
        const [commentKey, commentBump] = await findCommentPDA(forum, userProfile, commentSeed);

        // Create Signers Array
        const signers = [];
        if (isKp(moderator)) signers.push(<Keypair>moderator);

        console.log('moderator editing comment with pubkey: ', comment.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .editCommentOnProposedContributionModerator(
                moderatorProfileBump,
                userProfileBump,
                commentBump,
            )
            .accounts({
                forum: forum,
                moderator: isKp(moderator)? (<Keypair>moderator).publicKey : <PublicKey>moderator,
                moderatorProfile: moderatorProfile,
                profileOwner: profileOwner,
                userProfile: userProfile,
                bigNote: bigNote,
                proposedContribution: proposedContribution,
                comment: comment,
                commentSeed: commentSeed,
                newContentDataHash: newContentDataHash,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            moderatorProfile,
            moderatorProfileBump,
            userProfileKey,
            userProfileBump,
            commentKey,
            commentBump,
            txSig
        }
    }

    async deleteCommentOnProposedContribution(
        comment: PublicKey,
        profileOwner: PublicKey | Keypair,
        receiver: PublicKey,
    ) {
        const profileOwnerKey = isKp(profileOwner) ? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner;

        const commentAcct = await this.fetchCommentAccount(comment);
        const commentSeed = commentAcct.commentSeed;
        const proposedContribution = commentAcct.commentedOn;

        const proposedContributionAcct = await this.fetchProposedContributionAccount(proposedContribution);
        const bigNote = proposedContributionAcct.bigNote;

        const bigNoteAcct = await this.fetchBigNoteAccount(bigNote);
        const forum = bigNoteAcct.forum;

        // Derive PDAs
        const [userProfile, userProfileBump] = await findUserProfilePDA(forum, profileOwnerKey);
        const [commentKey, commentBump] = await findCommentPDA(forum, userProfile, commentSeed);

        // Create Signers Array
        const signers = [];
        if (isKp(profileOwner)) signers.push(<Keypair>profileOwner);

        console.log('deleting comment with pubkey: ', comment.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .deleteCommentOnProposedContribution(
                userProfileBump,
                commentBump
            )
            .accounts({
                forum: forum,
                profileOwner: isKp(profileOwner)? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner,
                userProfile: userProfile,
                bigNote: bigNote,
                proposedContribution: proposedContribution,
                comment: comment,
                commentSeed: commentSeed,
                receiver: receiver,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            userProfile,
            userProfileBump,
            commentKey,
            commentBump,
            txSig
        }
    }

    async deleteCommentOnProposedContributionModerator(
        comment: PublicKey,
        moderator: PublicKey | Keypair,
        receiver: PublicKey,
    ) {
        const moderatorKey = isKp(moderator) ? (<Keypair>moderator).publicKey : <PublicKey>moderator;

        const commentAcct = await this.fetchCommentAccount(comment);
        const commentSeed = commentAcct.commentSeed;
        const proposedContribution = commentAcct.commentedOn;
        const userProfile = commentAcct.userProfile;

        const proposedContributionAcct = await this.fetchProposedContributionAccount(proposedContribution);
        const bigNote = proposedContributionAcct.bigNote;

        const bigNoteAcct = await this.fetchBigNoteAccount(bigNote);
        const forum = bigNoteAcct.forum;

        const userProfileAcct = await this.fetchUserProfileAccount(userProfile);
        const profileOwner = userProfileAcct.profileOwner;

        // Derive PDAs
        const [moderatorProfile, moderatorProfileBump] = await findUserProfilePDA(forum, moderatorKey);
        const [userProfileKey, userProfileBump] = await findUserProfilePDA(forum, profileOwner);
        const [commentKey, commentBump] = await findCommentPDA(forum, userProfile, commentSeed);

        // Create Signers Array
        const signers = [];
        if (isKp(moderator)) signers.push(<Keypair>moderator);

        console.log('moderator deleting comment with pubkey: ', comment.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .deleteCommentOnProposedContributionModerator(
                moderatorProfileBump,
                userProfileBump,
                commentBump
            )
            .accounts({
                forum: forum,
                moderator: isKp(moderator)? (<Keypair>moderator).publicKey : <PublicKey>moderator,
                moderatorProfile: moderatorProfile,
                profileOwner: profileOwner,
                userProfile: userProfile,
                bigNote: bigNote,
                proposedContribution: proposedContribution,
                comment: comment,
                commentSeed: commentSeed,
                receiver: receiver,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            moderatorProfile,
            moderatorProfileBump,
            userProfileKey,
            userProfileBump,
            commentKey,
            commentBump,
            txSig
        }
    }

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    async createChallenge(
        forum: PublicKey,
        moderator: PublicKey | Keypair,
        contentDataHash: PublicKey,
        tags: Tags[],
        title: string,
        contentDataUrl: string,
        challengeExpiresTs: BN,
        reputation: BN,
    ) {
        const challengeSeedKeypair = Keypair.generate();
        const challengeSeed: PublicKey = challengeSeedKeypair.publicKey;

        const moderatorKey = isKp(moderator) ? (<Keypair>moderator).publicKey : <PublicKey>moderator;

        // Derive PDAs
        const [moderatorProfile, moderatorProfileBump] = await findUserProfilePDA(forum, moderatorKey);
        const [challenge, challengeBump] = await findChallengePDA(forum, challengeSeed);

        // Create Signers Array
        const signers = [];
        if (isKp(moderator)) signers.push(<Keypair>moderator);

        console.log('creating challenge with pubkey: ', challenge.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .createChallenge(
                moderatorProfileBump,
                tags,
                title,
                contentDataUrl,
                challengeExpiresTs,
                reputation,
            )
            .accounts({
                forum: forum,
                moderator: isKp(moderator)? (<Keypair>moderator).publicKey : <PublicKey>moderator,
                moderatorProfile: moderatorProfile,
                challenge: challenge,
                challengeSeed: challengeSeed,
                contentDataHash: contentDataHash,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            moderatorProfile,
            moderatorProfileBump,
            challenge,
            challengeBump,
            txSig
        }
    }

    async editChallenge(
        challenge: PublicKey,
        moderator: PublicKey | Keypair,
        newContentDataHash: PublicKey,
        newTags: Tags[],
        newTitle: string,
        newContentDataUrl: string,
        newChallengeExpiresTs: BN,
        newReputation: BN,
    ) {
        const moderatorKey = isKp(moderator) ? (<Keypair>moderator).publicKey : <PublicKey>moderator;

        const challengeAcct = await this.fetchChallengeAccount(challenge);
        const forum = challengeAcct.forum;
        const challengeSeed = challengeAcct.challengeSeed;

        // Derive PDAs
        const [moderatorProfile, moderatorProfileBump] = await findUserProfilePDA(forum, moderatorKey);
        const [challengeKey, challengeBump] = await findChallengePDA(forum, challengeSeed);

        // Create Signers Array
        const signers = [];
        if (isKp(moderator)) signers.push(<Keypair>moderator);

        console.log('moderator editing challenge with pubkey: ', challenge.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .editChallenge(
                moderatorProfileBump,
                challengeBump,
                newTags,
                newTitle,
                newContentDataUrl,
                newChallengeExpiresTs,
                newReputation,
            )
            .accounts({
                forum: forum,
                moderator: isKp(moderator)? (<Keypair>moderator).publicKey : <PublicKey>moderator,
                moderatorProfile: moderatorProfile,
                challenge: challenge,
                challengeSeed: challengeSeed,
                newContentDataHash: newContentDataHash,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            moderatorProfile,
            moderatorProfileBump,
            challengeKey,
            challengeBump,
            txSig
        }
    }

    async deleteChallenge(
        challenge: PublicKey,
        moderator: PublicKey | Keypair,
        receiver: PublicKey,
    ) {
        const moderatorKey = isKp(moderator) ? (<Keypair>moderator).publicKey : <PublicKey>moderator;

        const challengeAcct = await this.fetchChallengeAccount(challenge);
        const forum = challengeAcct.forum;
        const challengeSeed = challengeAcct.challengeSeed;

        // Derive PDAs
        const [moderatorProfile, moderatorProfileBump] = await findUserProfilePDA(forum, moderatorKey);
        const [challengeKey, challengeBump] = await findChallengePDA(forum, challengeSeed);

        // Create Signers Array
        const signers = [];
        if (isKp(moderator)) signers.push(<Keypair>moderator);

        console.log('moderator deleting challenge with pubkey: ', challenge.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .deleteChallenge(
                moderatorProfileBump,
                challengeBump,
            )
            .accounts({
                forum: forum,
                moderator: isKp(moderator)? (<Keypair>moderator).publicKey : <PublicKey>moderator,
                moderatorProfile: moderatorProfile,
                challenge: challenge,
                challengeSeed: challengeSeed,
                receiver: receiver,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            moderatorProfile,
            moderatorProfileBump,
            challengeKey,
            challengeBump,
            txSig
        }
    }

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    async createSubmission(
        challenge: PublicKey,
        profileOwner: PublicKey | Keypair,
        contentDataHash: PublicKey,
    ) {
        const profileOwnerKey = isKp(profileOwner) ? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner;

        const challengeAcct = await this.fetchChallengeAccount(challenge);
        const forum = challengeAcct.forum;
        const challengeSeed = challengeAcct.challengeSeed;

        // Derive PDAs
        const [forumTreasury, forumTreasuryBump] = await findForumTreasuryPDA(forum);
        const [userProfile, userProfileBump] = await findUserProfilePDA(forum, profileOwnerKey);
        const [challengeKey, challengeBump] = await findChallengePDA(forum, challengeSeed);
        const [submission, submissionBump] = await findSubmissionPDA(challenge, userProfile);

        // Create Signers Array
        const signers = [];
        if (isKp(profileOwner)) signers.push(<Keypair>profileOwner);

        console.log('creating submission with pubkey: ', challenge.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .createSubmission(
                forumTreasuryBump,
                userProfileBump,
                challengeBump,
            )
            .accounts({
                forum: forum,
                forumTreasury: forumTreasury,
                profileOwner: isKp(profileOwner)? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner,
                userProfile: userProfile,
                challenge: challenge,
                challengeSeed: challengeSeed,
                submission: submission,
                contentDataHash: contentDataHash,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            forumTreasury,
            forumTreasuryBump,
            userProfile,
            userProfileBump,
            challengeKey,
            challengeBump,
            submission,
            submissionBump,
            txSig
        }
    }

    async editSubmission(
        submission: PublicKey,
        profileOwner: PublicKey | Keypair,
        newContentDataHash: PublicKey,
    ) {
        const profileOwnerKey = isKp(profileOwner) ? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner;

        const submissionAcct = await this.fetchSubmissionAccount(submission);
        const challenge = submissionAcct.challenge;

        const challengeAcct = await this.fetchChallengeAccount(challenge);
        const forum = challengeAcct.forum;
        const challengeSeed = challengeAcct.challengeSeed;

        // Derive PDAs
        const [userProfile, userProfileBump] = await findUserProfilePDA(forum, profileOwnerKey);
        const [challengeKey, challengeBump] = await findChallengePDA(forum, challengeSeed);
        const [submissionKey, submissionBump] = await findSubmissionPDA(challenge, userProfile);

        // Create Signers Array
        const signers = [];
        if (isKp(profileOwner)) signers.push(<Keypair>profileOwner);

        console.log('editing submission with pubkey: ', submission.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .editSubmission(
                userProfileBump,
                challengeBump,
                submissionBump,
            )
            .accounts({
                forum: forum,
                profileOwner: isKp(profileOwner)? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner,
                userProfile: userProfile,
                challenge: challenge,
                challengeSeed: challengeSeed,
                submission: submission,
                newContentDataHash: newContentDataHash,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            userProfile,
            userProfileBump,
            challengeKey,
            challengeBump,
            submissionKey,
            submissionBump,
            txSig
        }
    }

    async editSubmissionModerator(
        submission: PublicKey,
        moderator: PublicKey | Keypair,
        newContentDataHash: PublicKey,
    ) {
        const moderatorKey = isKp(moderator) ? (<Keypair>moderator).publicKey : <PublicKey>moderator;

        const submissionAcct = await this.fetchSubmissionAccount(submission);
        const userProfile = submissionAcct.userProfile;
        const challenge = submissionAcct.challenge;

        const challengeAcct = await this.fetchChallengeAccount(challenge);
        const forum = challengeAcct.forum;
        const challengeSeed = challengeAcct.challengeSeed;

        const userProfileAcct = await this.fetchUserProfileAccount(userProfile);
        const profileOwner = userProfileAcct.profileOwner;

        // Derive PDAs
        const [moderatorProfile, moderatorProfileBump] = await findUserProfilePDA(forum, moderatorKey);
        const [userProfileKey, userProfileBump] = await findUserProfilePDA(forum, profileOwner);
        const [challengeKey, challengeBump] = await findChallengePDA(forum, challengeSeed);
        const [submissionKey, submissionBump] = await findSubmissionPDA(challenge, userProfile);

        // Create Signers Array
        const signers = [];
        if (isKp(moderator)) signers.push(<Keypair>moderator);

        console.log('moderator editing submission with pubkey: ', submission.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .editSubmissionModerator(
                moderatorProfileBump,
                userProfileBump,
                challengeBump,
                submissionBump,
            )
            .accounts({
                forum: forum,
                moderator: isKp(moderator)? (<Keypair>moderator).publicKey : <PublicKey>moderator,
                moderatorProfile: moderatorProfile,
                profileOwner: profileOwner,
                userProfile: userProfile,
                challenge: challenge,
                challengeSeed: challengeSeed,
                submission: submission,
                newContentDataHash: newContentDataHash,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            moderatorProfile,
            moderatorProfileBump,
            userProfileKey,
            userProfileBump,
            challengeKey,
            challengeBump,
            submissionKey,
            submissionBump,
            txSig
        }
    }

    async deleteSubmission(
        submission: PublicKey,
        profileOwner: PublicKey | Keypair,
        receiver: PublicKey,
    ) {
        const profileOwnerKey = isKp(profileOwner) ? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner;

        const submissionAcct = await this.fetchSubmissionAccount(submission);
        const challenge = submissionAcct.challenge;

        const challengeAcct = await this.fetchChallengeAccount(challenge);
        const forum = challengeAcct.forum;
        const challengeSeed = challengeAcct.challengeSeed;

        // Derive PDAs
        const [userProfile, userProfileBump] = await findUserProfilePDA(forum, profileOwnerKey);
        const [challengeKey, challengeBump] = await findChallengePDA(forum, challengeSeed);
        const [submissionKey, submissionBump] = await findSubmissionPDA(challenge, userProfile);

        // Create Signers Array
        const signers = [];
        if (isKp(profileOwner)) signers.push(<Keypair>profileOwner);

        console.log('deleting submission with pubkey: ', submission.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .deleteSubmission(
                userProfileBump,
                challengeBump,
                submissionBump
            )
            .accounts({
                forum: forum,
                profileOwner: isKp(profileOwner)? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner,
                userProfile: userProfile,
                challenge: challenge,
                challengeSeed: challengeSeed,
                submission: submission,
                receiver: receiver,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            userProfile,
            userProfileBump,
            challengeKey,
            challengeBump,
            submissionKey,
            submissionBump,
            txSig
        }
    }

    async deleteSubmissionModerator(
        submission: PublicKey,
        moderator: PublicKey | Keypair,
        receiver: PublicKey,
    ) {
        const moderatorKey = isKp(moderator) ? (<Keypair>moderator).publicKey : <PublicKey>moderator;

        const submissionAcct = await this.fetchSubmissionAccount(submission);
        const userProfile = submissionAcct.userProfile;
        const challenge = submissionAcct.challenge;

        const challengeAcct = await this.fetchChallengeAccount(challenge);
        const forum = challengeAcct.forum;
        const challengeSeed = challengeAcct.challengeSeed;

        const userProfileAcct = await this.fetchUserProfileAccount(userProfile);
        const profileOwner = userProfileAcct.profileOwner;

        // Derive PDAs
        const [moderatorProfile, moderatorProfileBump] = await findUserProfilePDA(forum, moderatorKey);
        const [userProfileKey, userProfileBump] = await findUserProfilePDA(forum, profileOwner);
        const [challengeKey, challengeBump] = await findChallengePDA(forum, challengeSeed);
        const [submissionKey, submissionBump] = await findSubmissionPDA(challenge, userProfile);

        // Create Signers Array
        const signers = [];
        if (isKp(moderator)) signers.push(<Keypair>moderator);

        console.log('moderator deleting submission with pubkey: ', submission.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .deleteSubmissionModerator(
                moderatorProfileBump,
                userProfileBump,
                challengeBump,
                submissionBump,
            )
            .accounts({
                forum: forum,
                moderator: isKp(moderator)? (<Keypair>moderator).publicKey : <PublicKey>moderator,
                moderatorProfile: moderatorProfile,
                profileOwner: profileOwner,
                userProfile: userProfile,
                challenge: challenge,
                challengeSeed: challengeSeed,
                submission: submission,
                receiver: receiver,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            moderatorProfile,
            moderatorProfileBump,
            userProfileKey,
            userProfileBump,
            challengeKey,
            challengeBump,
            submissionKey,
            submissionBump,
            txSig
        }
    }

    // -------------------------------------------------------- devnet testing phase ixs

    async closeAccount(
        accountToClose: PublicKey,
        signer: PublicKey | Keypair,
    ) {
        // Create Signers Array
        const signers = [];
        if (isKp(signer)) signers.push(<Keypair>signer);

        console.log('closing account with pubkey: ', accountToClose.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .closeAccount()
            .accounts({
                signer: isKp(signer) ? (<Keypair>signer).publicKey : <PublicKey>signer,
                accountToClose: accountToClose,
                systemProgram: SystemProgram.programId
            })
            .signers(signers)
            .rpc();

        return {
            txSig
        }
    }

}
