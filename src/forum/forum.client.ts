import * as anchor from '@coral-xyz/anchor';
import { AnchorProvider, BN, Idl, Program } from '@coral-xyz/anchor';
import { Connection, Keypair, PublicKey, SystemProgram } from '@solana/web3.js';
import * as SPLToken from "@solana/spl-token";
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { AccountUtils, isKp, stringifyPKsAndBNs } from '../prog-common';
import { Forum } from '../types/forum';
import {
    findForumAuthorityPDA,
    findForumTreasuryPDA,
    findUserProfilePDA,
    findQuestionPDA,
    findBountyPDA,
    findAboutMePDA,
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

    async fetchTreasuryBalance(forum: PublicKey) {
        const [treasury] = await findForumTreasuryPDA(forum);
        return this.getBalance(treasury);
    }

    // -------------------------------------------------------- get all PDAs by type

    async fetchAllForumPDAs(forumManager?: PublicKey) {
        const filter = forumManager
            ? [
                {
                    memcmp: {
                        offset: 10, //need to prepend 8 bytes for anchor's disc and 2 for version: u16
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
                        offset: 8, //need to prepend 8 bytes for anchor's disc
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
                        offset: 8, //need to prepend 8 bytes for anchor's disc
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
                        offset: 8, //need to prepend 8 bytes for anchor's disc and 2 for version: u16
                        bytes: userProfile.toBase58(),
                    },
                },
            ]
            : [];
        const pdas = await this.forumProgram.account.question.all(filter);
        console.log('Found a total of', pdas.length, 'question PDAs for user profile with address', userProfile.toBase58());
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

        console.log('updating forum fees for forum account with pubkey: ', forum.toBase58());

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

        console.log('editing question with pubkey: ', question.toBase58());

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
            userProfile,
            userProfileBump,
            question,
            questionBump,
            txSig
        }
    }









}
