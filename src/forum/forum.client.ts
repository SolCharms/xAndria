import * as anchor from '@coral-xyz/anchor';
import { AnchorProvider, BN, Idl, Program } from '@coral-xyz/anchor';
import { Connection, Keypair, PublicKey, SystemProgram } from '@solana/web3.js';
//import * as SPLToken from "@solana/spl-token";
//import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { AccountUtils, isKp, /*stringifyPKsAndBNs*/ } from '../prog-common';
import { Forum } from '../types/forum';
import {
    findForumAuthorityPDA,
    findForumTreasuryPDA,
    findUserProfilePDA,
    findAboutMePDA,
    findBigNotePDA,
    findQuestionPDA,
    findAnswerPDA,
    findBountyPDA,
} from './forum.pda';

// Enum: Tags
export const Tags = {
    DAOsAndGovernance: { daosAndGovernance: {}},
    DataAndAnalytics: { dataAndAnalytics: {}},
    DeFi: { defi: {}},
    Development: { development: {}},
    Gaming: { gaming: {}},
    Mobile: { mobile: {}},
    NFTs: { nfts: {}},
    Payments: { payments: {}},
    Research: { research:{}},
    ToolsAndInfrastructure: { toolsAndInfrastructure: {}},
    Trading: { trading:{}}
}

export interface ForumCounts {
    forumProfileCount: BN;
    forumBigNotesCount: BN;
    forumQuestionCount: BN;
    forumAnswerCount: BN;
    forumCommentCount: BN;
    extraSpace: number[];
}

export interface ForumFees {
    forumProfileFee: BN;
    forumQuestionFee: BN;
    forumBigNotesFee: BN;
    forumQuestionBountyMinimum: BN;
    forumBigNotesBountyMinimum: BN;
    extraSpace: number[];
}

export interface ReputationMatrix {
    aboutMeRep: BN;
    postBigNotesRep: BN;
    contributeBigNotesRep: BN;
    questionRep: BN;
    answerRep: BN;
    commentRep: BN;
    acceptedAnswerRep: BN;
    extraSpace: number[];
}



export class ForumClient extends AccountUtils {
    wallet: anchor.Wallet;
    provider!: anchor.Provider;
    forumProgram!: anchor.Program<Forum>;

    constructor(
        conn: Connection,
        wallet: anchor.Wallet,
        idl?: Idl,
        programId?: PublicKey
    ) {
        super(conn);
        this.wallet = wallet;
        this.setProvider();
        this.setForumProgram(idl, programId);
    }

    setProvider() {
        this.provider = new AnchorProvider(
            this.conn,
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
            this.forumProgram = anchor.workspace.BountyPool as Program<Forum>;
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
        return this.forumProgram.account.answer.fetch(comment);
    }

    async fetchBigNoteAccount(bigNote: PublicKey) {
        return this.forumProgram.account.bigNote.fetch(bigNote);
    }

    async fetchTreasuryBalance(forum: PublicKey) {
        const [treasury] = await findForumTreasuryPDA(forum);
        return this.getBalance(treasury);
    }

    async fetchBountyPDABalance(question: PublicKey) {
        const [bountyPda] = await findBountyPDA(question);
        return this.getBalance(bountyPda);
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
        console.log('Found a total of', pdas.length, 'forum PDAs');
        return pdas;
    }

    async fetchAllUserProfilePDAs(profileOwner?: PublicKey) {
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
        console.log('Found a total of', pdas.length, 'user profile PDAs');
        return pdas;
    }

    async fetchAboutMeForProfile(userProfile: PublicKey) {
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
        console.log('Found a total of', pdas.length, 'about me PDAs');
        return pdas;
    }

    async fetchAllQuestionPDAs(userProfile?: PublicKey) {
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
        console.log('Found a total of', pdas.length, 'question PDAs for user profile with address', userProfile.toBase58());
        return pdas;
    }

    async fetchAllAnswerPDAsByQuestion(question?: PublicKey) {
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
        console.log('Found a total of', pdas.length, 'answer PDAs for question account with address', question.toBase58());
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
        console.log('Found a total of', pdas.length, 'answer PDAs for user profile with address', userProfile.toBase58());
        return pdas;
    }

    async fetchAllCommentPDAsByAccountCommentedOn(accountCommentedOn: PublicKey) {
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
        console.log('Found a total of', pdas.length, 'comment PDAs for account with address', accountCommentedOn.toBase58());
        return pdas;
    }

    async fetchAllCommentPDAsByUserProfile(userProfile?: PublicKey) {
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
        const pdas = await this.forumProgram.account.comment.all(filter);
        console.log('Found a total of', pdas.length, 'comment PDAs for user profile with address', userProfile.toBase58());
        return pdas;
    }

    async fetchAllBigNotePDAs(userProfile?: PublicKey) {
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
        console.log('Found a total of', pdas.length, 'big note PDAs for user profile with address', userProfile.toBase58());
        return pdas;
    }

    // -------------------------------------------------------- execute ixs

    async initForum(
        forum: Keypair,
        forumManager: PublicKey | Keypair,
        forumFees: ForumFees,
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
        forumFees: ForumFees,
        reputationMatrix: ReputationMatrix,
    ) {
        // Create Signers Array
        const signers = [];
        if (isKp(forumManager)) signers.push(<Keypair>forumManager);

        console.log('updating forum parameters for forum account with pubkey: ', forum.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .updateForumParams(
                forumFees,
                reputationMatrix,
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
        minimumBalanceForRentExemption: BN,
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
                minimumBalanceForRentExemption,
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

    async createUserProfile(
        forum: PublicKey,
        profileOwner: PublicKey | Keypair
    ) {
        const profileOwnerKey = isKp(profileOwner) ? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner;

        // Derive PDAs
        const [forumAuthority, forumAuthBump] = await findForumAuthorityPDA(forum);
        const [forumTreasury, forumTreasuryBump] = await findForumTreasuryPDA(forum);
        const [userProfile, userProfileBump] = await findUserProfilePDA(profileOwnerKey);

        // Create Signers Array
        const signers = [];
        if (isKp(profileOwner)) signers.push(<Keypair>profileOwner);

        console.log('creating user profile account with pubkey: ', userProfile.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .createUserProfile(
                forumAuthBump,
                forumTreasuryBump,
            )
            .accounts({
                forum: forum,
                forumAuthority: forumAuthority,
                forumTreasury: forumTreasury,
                profileOwner: isKp(profileOwner)? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner,
                userProfile: userProfile,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            forumAuthority,
            forumAuthBump,
            forumTreasury,
            forumTreasuryBump,
            userProfile,
            userProfileBump,
            txSig
        }
    }

    async editUserProfile(
        profileOwner: PublicKey | Keypair,
        nft_token_mint: PublicKey,
    ) {
        const profileOwnerKey = isKp(profileOwner) ? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner;

        // Derive PDAs
        const [userProfile, userProfileBump] = await findUserProfilePDA(profileOwnerKey);

        // Create Signers Array
        const signers = [];
        if (isKp(profileOwner)) signers.push(<Keypair>profileOwner);

        console.log('editing user profile account with pubkey: ', userProfile.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .editUserProfile(
                userProfileBump
            )
            .accounts({
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
        const [userProfile, userProfileBump] = await findUserProfilePDA(profileOwnerKey);

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

    async createAboutMe(
        forum: PublicKey,
        profileOwner: PublicKey | Keypair,
        content: string
    ) {
        const profileOwnerKey = isKp(profileOwner) ? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner;

        // Derive PDAs
        const [userProfile, userProfileBump] = await findUserProfilePDA(profileOwnerKey);
        const [aboutMe, aboutMeBump] = await findAboutMePDA(userProfile);

        // Create Signers Array
        const signers = [];
        if (isKp(profileOwner)) signers.push(<Keypair>profileOwner);

        console.log('creating user about me account with pubkey: ', userProfile.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .createAboutMe(
                userProfileBump,
                content
            )
            .accounts({
                forum: forum,
                profileOwner: isKp(profileOwner)? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner,
                userProfile: userProfile,
                aboutMe: aboutMe,
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
        profileOwner: PublicKey | Keypair,
        new_content: string
    ) {
        const profileOwnerKey = isKp(profileOwner) ? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner;

        // Derive PDAs
        const [userProfile, userProfileBump] = await findUserProfilePDA(profileOwnerKey);
        const [aboutMe, aboutMeBump] = await findAboutMePDA(userProfile);

        // Create Signers Array
        const signers = [];
        if (isKp(profileOwner)) signers.push(<Keypair>profileOwner);

        console.log('editing user about me account with pubkey: ', userProfile.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .editAboutMe(
                userProfileBump,
                aboutMeBump,
                new_content
            )
            .accounts({
                profileOwner: isKp(profileOwner)? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner,
                userProfile: userProfile,
                aboutMe: aboutMe,
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
        profileOwner: PublicKey | Keypair,
        receiver: PublicKey
    ) {
        const profileOwnerKey = isKp(profileOwner) ? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner;

        // Derive PDAs
        const [userProfile, userProfileBump] = await findUserProfilePDA(profileOwnerKey);
        const [aboutMe, aboutMeBump] = await findAboutMePDA(userProfile);

        // Create Signers Array
        const signers = [];
        if (isKp(profileOwner)) signers.push(<Keypair>profileOwner);

        console.log('deleting user about me account with pubkey: ', userProfile.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .deleteAboutMe(
                userProfileBump,
                aboutMeBump,
            )
            .accounts({
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

    async addModerator(
        forum: PublicKey,
        forumManager: PublicKey | Keypair,
        profileOwner: PublicKey
    ) {
        // Derive PDAs
        const [userProfile, userProfileBump] = await findUserProfilePDA(profileOwner);

        // Create Signers Array
        const signers = [];
        if (isKp(forumManager)) signers.push(<Keypair>forumManager);

        console.log('adding moderator status to account with pubkey: ', userProfile.toBase58());

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
            userProfile,
            userProfileBump,
            txSig
        }
    }

    async removeModerator(
        forum: PublicKey,
        forumManager: PublicKey | Keypair,
        profileOwner: PublicKey
    ) {
        // Derive PDAs
        const [userProfile, userProfileBump] = await findUserProfilePDA(profileOwner);

        // Create Signers Array
        const signers = [];
        if (isKp(forumManager)) signers.push(<Keypair>forumManager);

        console.log('removing moderator status from account with pubkey: ', userProfile.toBase58());

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
            userProfile,
            userProfileBump,
            txSig
        }
    }

    async askQuestion(
        forum: PublicKey,
        profileOwner: PublicKey | Keypair,
        title: string,
        content: string,
        tags: any,
        bountyAmount: BN,
    ) {
        const questionSeedKeypair = Keypair.generate();
        const questionSeed: PublicKey = questionSeedKeypair.publicKey;

        const profileOwnerKey = isKp(profileOwner) ? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner;

        // Derive PDAs
        const [forumTreasury, forumTreasuryBump] = await findForumTreasuryPDA(forum);
        const [userProfile, userProfileBump] = await findUserProfilePDA(profileOwnerKey);
        const [question, questionBump] = await findQuestionPDA(forum, userProfile, questionSeed);
        const [bountyPda, bountyPdaBump] = await findBountyPDA(question);

        // Create Signers Array
        const signers = [];
        if (isKp(profileOwner)) signers.push(<Keypair>profileOwner);

        console.log('creating question with pubkey: ', question.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .askQuestion(
                forumTreasuryBump,
                userProfileBump,
                title,
                content,
                tags,
                bountyAmount,
            )
            .accounts({
                forum: forum,
                forumTreasury: forumTreasury,
                profileOwner: isKp(profileOwner)? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner,
                userProfile: userProfile,
                question: question,
                questionSeed: questionSeed,
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

    async addContentToQuestion(
        forum: PublicKey,
        profileOwner: PublicKey | Keypair,
        questionSeed: PublicKey,
        newContent: string,
    ) {
        const profileOwnerKey = isKp(profileOwner) ? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner;

        // Derive PDAs
        const [userProfile, userProfileBump] = await findUserProfilePDA(profileOwnerKey);
        const [question, questionBump] = await findQuestionPDA(forum, userProfile, questionSeed);

        // Create Signers Array
        const signers = [];
        if (isKp(profileOwner)) signers.push(<Keypair>profileOwner);

        console.log('adding content to question with pubkey: ', question.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .addContentToQuestion(
                userProfileBump,
                questionBump,
                newContent,
            )
            .accounts({
                forum: forum,
                profileOwner: isKp(profileOwner)? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner,
                userProfile: userProfile,
                question: question,
                questionSeed: questionSeed,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            userProfile,
            userProfileBump,
            question,
            questionBump,
            txSig
        }
    }

    async editQuestion(
        forum: PublicKey,
        profileOwner: PublicKey | Keypair,
        questionSeed: PublicKey,
        title: string,
        content: string,
        tags: any,
    ) {
        const profileOwnerKey = isKp(profileOwner) ? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner;

        // Derive PDAs
        const [userProfile, userProfileBump] = await findUserProfilePDA(profileOwnerKey);
        const [question, questionBump] = await findQuestionPDA(forum, userProfile, questionSeed);

        // Create Signers Array
        const signers = [];
        if (isKp(profileOwner)) signers.push(<Keypair>profileOwner);

        console.log('editing question with pubkey: ', question.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .editQuestion(
                userProfileBump,
                questionBump,
                title,
                content,
                tags,
            )
            .accounts({
                forum: forum,
                profileOwner: isKp(profileOwner)? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner,
                userProfile: userProfile,
                question: question,
                questionSeed: questionSeed,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            userProfile,
            userProfileBump,
            question,
            questionBump,
            txSig
        }
    }

    async deleteQuestion(
        forum: PublicKey,
        moderator: PublicKey | Keypair,
        profileOwner: PublicKey,
        questionSeed: PublicKey,
        receiver: PublicKey,
    ) {
        const moderatorKey = isKp(moderator) ? (<Keypair>moderator).publicKey : <PublicKey>moderator;

        // Derive PDAs
        const [moderatorProfile, moderatorProfileBump] = await findUserProfilePDA(moderatorKey);
        const [userProfile, userProfileBump] = await findUserProfilePDA(profileOwner);
        const [question, questionBump] = await findQuestionPDA(forum, userProfile, questionSeed);

        // Create Signers Array
        const signers = [];
        if (isKp(moderator)) signers.push(<Keypair>moderator);

        console.log('deleting question with pubkey: ', question.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .deleteQuestion(
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
            userProfile,
            userProfileBump,
            question,
            questionBump,
            txSig
        }
    }

    async supplementQuestionBounty(
        forum: PublicKey,
        supplementor: PublicKey | Keypair,
        profileOwner: PublicKey,
        questionSeed: PublicKey,
        supplementalBountyAmount: BN,
    ) {
        const supplementorKey = isKp(supplementor) ? (<Keypair>supplementor).publicKey : <PublicKey>supplementor;

        // Derive PDAs
        const [supplementorProfile, supplementorProfileBump] = await findUserProfilePDA(supplementorKey);
        const [userProfile, userProfileBump] = await findUserProfilePDA(profileOwner);
        const [question, questionBump] = await findQuestionPDA(forum, userProfile, questionSeed);
        const [bountyPda, bountyPdaBump] = await findBountyPDA(question);

        // Create Signers Array
        const signers = [];
        if (isKp(supplementor)) signers.push(<Keypair>supplementor);

        console.log('supplementing bounty for question with pubkey: ', question.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .supplementQuestionBounty(
                supplementorProfileBump,
                userProfileBump,
                questionBump,
                bountyPdaBump,
                supplementalBountyAmount,
            )
            .accounts({
                forum: forum,
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
            userProfile,
            userProfileBump,
            question,
            questionBump,
            bountyPda,
            bountyPdaBump,
            txSig
        }
    }

    async acceptAnswer(
        forum: PublicKey,
        profileOwner: PublicKey | Keypair,
        answerProfileOwner: PublicKey,
        questionSeed: PublicKey,
        answerSeed: PublicKey,
        receiver: PublicKey,
    ) {
        const profileOwnerKey = isKp(profileOwner) ? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner;

        // Derive PDAs
        const [userProfile, userProfileBump] = await findUserProfilePDA(profileOwnerKey);
        const [answerUserProfile, answerUserProfileBump] = await findUserProfilePDA(answerProfileOwner);
        const [question, questionBump] = await findQuestionPDA(forum, userProfile, questionSeed);
        const [bountyPda, bountyPdaBump] = await findBountyPDA(question);
        const [answer, answerBump] = await findAnswerPDA(forum, answerUserProfile, answerSeed)

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
            answerUserProfile,
            answerUserProfileBump,
            question,
            questionBump,
            bountyPda,
            bountyPdaBump,
            answer,
            answerBump,
            txSig
        }
    }

    async answerQuestion(
        question: PublicKey,
        profileOwner: PublicKey | Keypair,
        content: string,
    ) {
        const answerSeedKeypair = Keypair.generate();
        const answerSeed: PublicKey = answerSeedKeypair.publicKey;

        const questionAcct = await this.fetchQuestionAccount(question);
        const forumKey = questionAcct.forum;

        const profileOwnerKey = isKp(profileOwner) ? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner;

        // Derive PDAs
        const [userProfile, userProfileBump] = await findUserProfilePDA(profileOwnerKey);
        const [answer, answerBump] = await findAnswerPDA(forumKey, userProfile, answerSeed);

        // Create Signers Array
        const signers = [];
        if (isKp(profileOwner)) signers.push(<Keypair>profileOwner);

        console.log('creating answer with pubkey: ', answer.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .answerQuestion(
                userProfileBump,
                content,
            )
            .accounts({
                forum: forumKey,
                profileOwner: isKp(profileOwner)? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner,
                userProfile: userProfile,
                question: question,
                answer: answer,
                answerSeed: answerSeed,
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

    async addContentToAnswer(
        forum: PublicKey,
        profileOwner: PublicKey | Keypair,
        answerSeed: PublicKey,
        newContent: string,
    ) {
        const profileOwnerKey = isKp(profileOwner) ? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner;

        // Derive PDAs
        const [userProfile, userProfileBump] = await findUserProfilePDA(profileOwnerKey);
        const [answer, answerBump] = await findAnswerPDA(forum, userProfile, answerSeed);

        // Create Signers Array
        const signers = [];
        if (isKp(profileOwner)) signers.push(<Keypair>profileOwner);

        console.log('adding content to answer with pubkey: ', answer.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .addContentToAnswer(
                userProfileBump,
                answerBump,
                newContent,
            )
            .accounts({
                forum: forum,
                profileOwner: isKp(profileOwner)? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner,
                userProfile: userProfile,
                answer: answer,
                answerSeed: answerSeed,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            userProfile,
            userProfileBump,
            answer,
            answerBump,
            txSig
        }
    }

    async editAnswer(
        forum: PublicKey,
        profileOwner: PublicKey | Keypair,
        answerSeed: PublicKey,
        content: string,
    ) {
        const profileOwnerKey = isKp(profileOwner) ? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner;

        // Derive PDAs
        const [userProfile, userProfileBump] = await findUserProfilePDA(profileOwnerKey);
        const [answer, answerBump] = await findAnswerPDA(forum, userProfile, answerSeed);

        // Create Signers Array
        const signers = [];
        if (isKp(profileOwner)) signers.push(<Keypair>profileOwner);

        console.log('editing answer with pubkey: ', answer.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .editAnswer(
                userProfileBump,
                answerBump,
                content,
            )
            .accounts({
                forum: forum,
                profileOwner: isKp(profileOwner)? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner,
                userProfile: userProfile,
                answer: answer,
                answerSeed: answerSeed,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            userProfile,
            userProfileBump,
            answer,
            answerBump,
            txSig
        }
    }

    async deleteAnswer(
        forum: PublicKey,
        moderator: PublicKey | Keypair,
        profileOwner: PublicKey,
        answerSeed: PublicKey,
        receiver: PublicKey,
    ) {
        const moderatorKey = isKp(moderator) ? (<Keypair>moderator).publicKey : <PublicKey>moderator;

        // Derive PDAs
        const [moderatorProfile, moderatorProfileBump] = await findUserProfilePDA(moderatorKey);
        const [userProfile, userProfileBump] = await findUserProfilePDA(profileOwner);
        const [answer, answerBump] = await findAnswerPDA(forum, userProfile, answerSeed);

        // Create Signers Array
        const signers = [];
        if (isKp(moderator)) signers.push(<Keypair>moderator);

        console.log('deleting answer with pubkey: ', answer.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .deleteAnswer(
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
            userProfile,
            userProfileBump,
            answer,
            answerBump,
            txSig
        }
    }

    async leaveComment(
        forum: PublicKey,
        profileOwner: PublicKey | Keypair,
        commentedOn: PublicKey,
        content: string,
    ) {
        const commentSeedKeypair = Keypair.generate();
        const commentSeed: PublicKey = commentSeedKeypair.publicKey;

        const profileOwnerKey = isKp(profileOwner) ? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner;

        // Derive PDAs
        const [userProfile, userProfileBump] = await findUserProfilePDA(profileOwnerKey);
        const [comment, commentBump] = await findAnswerPDA(forum, userProfile, commentSeed);

        // Create Signers Array
        const signers = [];
        if (isKp(profileOwner)) signers.push(<Keypair>profileOwner);

        console.log('creating comment with pubkey: ', comment.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .leaveComment(
                userProfileBump,
                content,
            )
            .accounts({
                forum: forum,
                profileOwner: isKp(profileOwner)? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner,
                userProfile: userProfile,
                commentedOn: commentedOn,
                comment: comment,
                commentSeed: commentSeed,
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

    async editComment(
        forum: PublicKey,
        profileOwner: PublicKey | Keypair,
        commentSeed: PublicKey,
        content: string,
    ) {
        const profileOwnerKey = isKp(profileOwner) ? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner;

        // Derive PDAs
        const [userProfile, userProfileBump] = await findUserProfilePDA(profileOwnerKey);
        const [comment, commentBump] = await findAnswerPDA(forum, userProfile, commentSeed);

        // Create Signers Array
        const signers = [];
        if (isKp(profileOwner)) signers.push(<Keypair>profileOwner);

        console.log('editing comment with pubkey: ', comment.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .editComment(
                userProfileBump,
                commentBump,
                content,
            )
            .accounts({
                forum: forum,
                profileOwner: isKp(profileOwner)? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner,
                userProfile: userProfile,
                comment: comment,
                commentSeed: commentSeed,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            userProfile,
            userProfileBump,
            comment,
            commentBump,
            txSig
        }
    }

    async deleteComment(
        forum: PublicKey,
        moderator: PublicKey | Keypair,
        profileOwner: PublicKey,
        commentSeed: PublicKey,
        receiver: PublicKey,
    ) {
        const moderatorKey = isKp(moderator) ? (<Keypair>moderator).publicKey : <PublicKey>moderator;

        // Derive PDAs
        const [moderatorProfile, moderatorProfileBump] = await findUserProfilePDA(moderatorKey);
        const [userProfile, userProfileBump] = await findUserProfilePDA(profileOwner);
        const [comment, commentBump] = await findAnswerPDA(forum, userProfile, commentSeed);

        // Create Signers Array
        const signers = [];
        if (isKp(moderator)) signers.push(<Keypair>moderator);

        console.log('deleting comment with pubkey: ', comment.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .deleteComment(
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
            userProfile,
            userProfileBump,
            comment,
            commentBump,
            txSig
        }
    }

    async createBigNote(
        forum: PublicKey,
        profileOwner: PublicKey | Keypair,
        title: string,
        content: string,
        tags: any
    ) {
        const bigNoteSeedKeypair = Keypair.generate();
        const bigNoteSeed: PublicKey = bigNoteSeedKeypair.publicKey;

        const profileOwnerKey = isKp(profileOwner) ? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner;

        // Derive PDAs
        const [forumTreasury, forumTreasuryBump] = await findForumTreasuryPDA(forum);
        const [userProfile, userProfileBump] = await findUserProfilePDA(profileOwnerKey);
        const [bigNote, bigNoteBump] = await findBigNotePDA(forum, userProfile, bigNoteSeed);

        // Create Signers Array
        const signers = [];
        if (isKp(profileOwner)) signers.push(<Keypair>profileOwner);

        console.log('creating big note with pubkey: ', bigNote.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .createBigNote(
                forumTreasuryBump,
                userProfileBump,
                title,
                content,
                tags,
            )
            .accounts({
                forum: forum,
                forumTreasury: forumTreasury,
                profileOwner: isKp(profileOwner)? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner,
                userProfile: userProfile,
                bigNote: bigNote,
                bigNoteSeed: bigNoteSeed,
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
            bigNoteSeed,
            txSig
        }

    }

    async addContentToBigNote(
        forum: PublicKey,
        profileOwner: PublicKey | Keypair,
        bigNoteSeed: PublicKey,
        newContent: string,
    ) {
        const profileOwnerKey = isKp(profileOwner) ? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner;

        // Derive PDAs
        const [userProfile, userProfileBump] = await findUserProfilePDA(profileOwnerKey);
        const [bigNote, bigNoteBump] = await findBigNotePDA(forum, userProfile, bigNoteSeed);

        // Create Signers Array
        const signers = [];
        if (isKp(profileOwner)) signers.push(<Keypair>profileOwner);

        console.log('adding content to big note with pubkey: ', bigNote.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .addContentToBigNote(
                userProfileBump,
                bigNoteBump,
                newContent,
            )
            .accounts({
                forum: forum,
                profileOwner: isKp(profileOwner)? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner,
                userProfile: userProfile,
                bigNote: bigNote,
                bigNoteSeed: bigNoteSeed,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            userProfile,
            userProfileBump,
            bigNote,
            bigNoteBump,
            txSig
        }
    }

    async editBigNote(
        forum: PublicKey,
        profileOwner: PublicKey | Keypair,
        bigNoteSeed: PublicKey,
        title: string,
        content: string,
        tags: any,
    ) {
        const profileOwnerKey = isKp(profileOwner) ? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner;

        // Derive PDAs
        const [userProfile, userProfileBump] = await findUserProfilePDA(profileOwnerKey);
        const [bigNote, bigNoteBump] = await findBigNotePDA(forum, userProfile, bigNoteSeed);

        // Create Signers Array
        const signers = [];
        if (isKp(profileOwner)) signers.push(<Keypair>profileOwner);

        console.log('editing big note with pubkey: ', bigNote.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .editBigNote(
                userProfileBump,
                bigNoteBump,
                title,
                content,
                tags,
            )
            .accounts({
                forum: forum,
                profileOwner: isKp(profileOwner)? (<Keypair>profileOwner).publicKey : <PublicKey>profileOwner,
                userProfile: userProfile,
                bigNote: bigNote,
                bigNoteSeed: bigNoteSeed,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            userProfile,
            userProfileBump,
            bigNote,
            bigNoteSeed,
            txSig
        }
    }

    async deleteBigNote(
        forum: PublicKey,
        moderator: PublicKey | Keypair,
        profileOwner: PublicKey,
        bigNoteSeed: PublicKey,
        receiver: PublicKey,
    ) {
        const moderatorKey = isKp(moderator) ? (<Keypair>moderator).publicKey : <PublicKey>moderator;

        // Derive PDAs
        const [moderatorProfile, moderatorProfileBump] = await findUserProfilePDA(moderatorKey);
        const [userProfile, userProfileBump] = await findUserProfilePDA(profileOwner);
        const [bigNote, bigNoteBump] = await findBigNotePDA(forum, userProfile, bigNoteSeed);

        // Create Signers Array
        const signers = [];
        if (isKp(moderator)) signers.push(<Keypair>moderator);

        console.log('deleting big note with pubkey: ', bigNote.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .deleteBigNote(
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
            userProfile,
            userProfileBump,
            bigNote,
            bigNoteBump,
            txSig
        }
    }

    async verifyBigNote(
        forum: PublicKey,
        moderator: PublicKey | Keypair,
        profileOwner: PublicKey,
        bigNoteSeed: PublicKey,
    ) {
        const moderatorKey = isKp(moderator) ? (<Keypair>moderator).publicKey : <PublicKey>moderator;

        // Derive PDAs
        const [moderatorProfile, moderatorProfileBump] = await findUserProfilePDA(moderatorKey);
        const [userProfile, userProfileBump] = await findUserProfilePDA(profileOwner);
        const [bigNote, bigNoteBump] = await findBigNotePDA(forum, userProfile, bigNoteSeed);

        // Create Signers Array
        const signers = [];
        if (isKp(moderator)) signers.push(<Keypair>moderator);

        console.log('verifying big note with pubkey: ', bigNote.toBase58());

        // Transaction
        const txSig = await this.forumProgram.methods
            .verifyBigNote(
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
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            userProfile,
            userProfileBump,
            bigNote,
            bigNoteBump,
            txSig
        }
    }

}
