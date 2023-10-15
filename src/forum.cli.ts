import * as anchor from '@coral-xyz/anchor';
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { default as fs } from 'fs/promises';
import { default as yargs } from 'yargs';
import { hash } from 'blake3';

import { FORUM_PROG_ID } from './index';
import { IDL as ForumIDL } from './forum.types';
import { ForumClient, Tags } from './forum.client';
import { findQuestionBountyPDA, findForumAuthorityPDA } from './forum.pda';
import { ForumConstants, ForumFees, ReputationMatrix } from './forum.client';
import { stringifyPKsAndBNs } from './render-types';

import { networkConfig } from "./cli_configs/devnet/networkConfig-devnet";
import { forumConfig } from "./cli_configs/devnet/forumConfig-devnet";
import { aboutMeConfig } from "./cli_configs/devnet/aboutMeConfig-devnet";
import { questionConfig } from "./cli_configs/devnet/questionConfig-devnet";
import { answerConfig } from "./cli_configs/devnet/answerConfig-devnet";
import { commentConfig } from "./cli_configs/devnet/commentConfig-devnet";
import { bigNoteConfig } from "./cli_configs/devnet/bigNoteConfig-devnet";

// ----------------------------------------------- Legend ---------------------------------------------------------

// -a answer account address (answer)
// -b big note account address (big note)
// -c comment account address (comment)
// -f forum account address (forum)
// -k pubkey of account being fetched (key)
// -l account comment was left on (left on)
// -m forum manager account address (manager)
// -o user profile owner address (owner)
// -p proposed contribution account address (proposal)
// -q question account address (question)
// -r receiver account address (receiver)
// -s supplementor account address (supplementor)
// -t token mint address (token mint)
// -u user profile account address (user profile)
// -x supplemental bounty amount (eXtra)
// -z dryRun



const parser = yargs(process.argv.slice(2)).options({
    dryRun: {
        alias: 'z',
        type: 'boolean',
        default: false,
        description: 'set Dry Run flag'
    },
})



// --------------------------------------------- forum manager instructions ------------------------------------------------------



// Initialize forum account (payer = forum manager)
// Must config forum parameters in forumConfig
    .command('init-forum', 'Initialize a forum account', {
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const forumClient: ForumClient = new ForumClient(
                     rpcConn,
                     wallet,
                     ForumIDL,
                     FORUM_PROG_ID,
                 );

                 const forum = Keypair.generate();
                 const forumFees: ForumFees = forumConfig.forumFees;
                 const forumConstants: ForumConstants = forumConfig.forumConstants;
                 const reputationMatrix: ReputationMatrix = forumConfig.reputationMatrix;

                 if (!argv.dryRun) {
                     const forumInstance = await forumClient.initForum(
                         forum,
                         wallet.payer,
                         forumFees,
                         forumConstants,
                         reputationMatrix,
                     );
                     console.log(stringifyPKsAndBNs(forumInstance));
                 } else {
                     console.log('Initializing forum account with pubkey', stringifyPKsAndBNs(forum));
                 }
             })



// Update forum parameters
// Must config forum parameters in forumConfig
    .command('update-forum-params', 'Update forum parameters', {
        forumPubkey: {
            alias: 'f',
            type: 'string',
            demandOption: true,
            description: 'forum account pubkey'
        },
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const forumClient: ForumClient = new ForumClient(
                     rpcConn,
                     wallet,
                     ForumIDL,
                     FORUM_PROG_ID,
                 );

                 const forumKey = new PublicKey(argv.forumPubkey);
                 const forumFees: ForumFees = forumConfig.forumFees;
                 const forumConstants: ForumConstants = forumConfig.forumConstants;
                 const reputationMatrix: ReputationMatrix = forumConfig.reputationMatrix;

                 if (!argv.dryRun) {
                     const updateForumParamsInstance = await forumClient.updateForumParams(
                         forumKey,
                         wallet.payer,
                         forumFees,
                         forumConstants,
                         reputationMatrix,
                     );
                     console.log(stringifyPKsAndBNs(updateForumParamsInstance));
                 } else {
                     console.log('Updating forum parameters of forum account with pubkey', forumKey.toBase58());
                 }
             })



// Payout from treasury
    .command('payout-from-treasury', 'Payout from forum treasury', {
        forumPubkey: {
            alias: 'f',
            type: 'string',
            demandOption: true,
            description: 'forum account pubkey'
        },
        receiverPubkey: {
            alias: 'r',
            type: 'string',
            demandOption: false,
            description: 'receiver account pubkey for reclaimed rent lamports'
        }
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const forumClient: ForumClient = new ForumClient(
                     rpcConn,
                     wallet,
                     ForumIDL,
                     FORUM_PROG_ID,
                 );

                 const forumKey = new PublicKey(argv.forumPubkey);
                 const receiverKey: PublicKey = argv.receiverPubkey? new PublicKey(argv.receiverPubkey) : wallet.publicKey;

                 if (!argv.dryRun) {
                     const payoutInstance = await forumClient.payoutFromTreasury(
                         forumKey,
                         wallet.payer,
                         receiverKey,
                     );
                     console.log(stringifyPKsAndBNs(payoutInstance));
                 } else {
                     console.log('Paying out from treasury of forum account with pubkey', forumKey.toBase58());
                 }
             })



// Close forum
    .command('close-forum', 'Close a forum account', {
        forumPubkey: {
            alias: 'f',
            type: 'string',
            demandOption: true,
            description: 'forum account pubkey'
        },
        receiverPubkey: {
            alias: 'r',
            type: 'string',
            demandOption: false,
            description: 'receiver account pubkey for reclaimed rent lamports'
        }
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const forumClient: ForumClient = new ForumClient(
                     rpcConn,
                     wallet,
                     ForumIDL,
                     FORUM_PROG_ID,
                 );

                 const forumKey: PublicKey = new PublicKey(argv.forumPubkey);
                 const receiverKey: PublicKey = argv.receiverPubkey ? new PublicKey(argv.receiverPubkey) : wallet.publicKey;

                 if (!argv.dryRun) {
                     const closeForumInstance = await forumClient.closeForum(
                         forumKey,
                         wallet.payer,
                         receiverKey,
                     );
                     console.log(stringifyPKsAndBNs(closeForumInstance));
                 } else {
                     console.log('Closing forum account with pubkey:', forumKey.toBase58());
                 }
             })



// ---------------------------------------------- user profile instructions ------------------------------------------------------



// Create user profile account (payer = profile owner)
    .command('create-profile', 'Create a user profile account', {
        forumPubkey: {
            alias: 'f',
            type: 'string',
            demandOption: true,
            description: 'forum account pubkey'
        }
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const forumClient: ForumClient = new ForumClient(
                     rpcConn,
                     wallet,
                     ForumIDL,
                     FORUM_PROG_ID,
                 );

                 const forumKey = new PublicKey(argv.forumPubkey);

                 if (!argv.dryRun) {
                     const profileInstance = await forumClient.createUserProfile(
                         forumKey,
                         wallet.payer
                     );
                     console.log(stringifyPKsAndBNs(profileInstance));
                 } else {
                     console.log('Creating user profile account for wallet with pubkey', stringifyPKsAndBNs(wallet.publicKey));
                 }
             })



// Edit user profile account
    .command('edit-profile', 'Edit a user profile account', {
        forumPubkey: {
            alias: 'f',
            type: 'string',
            demandOption: true,
            description: 'forum account pubkey'
        },
        tokenMint: {
            alias: 't',
            type: 'string',
            demandOption: true,
            description: 'token mint account address'
        }
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const forumClient: ForumClient = new ForumClient(
                     rpcConn,
                     wallet,
                     ForumIDL,
                     FORUM_PROG_ID,
                 );

                 const forumKey = new PublicKey(argv.forumPubkey);
                 const tokenMintKey = new PublicKey(argv.tokenMint);

                 if (!argv.dryRun) {
                     const editInstance = await forumClient.editUserProfile(
                         forumKey,
                         wallet.payer,
                         tokenMintKey
                     );
                     console.log(stringifyPKsAndBNs(editInstance));
                 } else {
                     console.log('Editing user profile account for wallet with pubkey', stringifyPKsAndBNs(wallet.publicKey));
                 }
             })



// Delete user profile account
    .command('delete-profile', 'Delete a user profile account', {
        forumPubkey: {
            alias: 'f',
            type: 'string',
            demandOption: true,
            description: 'forum account pubkey'
        },
        receiverPubkey: {
            alias: 'r',
            type: 'string',
            demandOption: false,
            description: 'receiver account pubkey for reclaimed rent lamports'
        }
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const forumClient: ForumClient = new ForumClient(
                     rpcConn,
                     wallet,
                     ForumIDL,
                     FORUM_PROG_ID,
                 );

                 const forumKey: PublicKey = new PublicKey(argv.forumPubkey);
                 const receiverKey: PublicKey = argv.receiverPubkey ? new PublicKey(argv.receiverPubkey) : wallet.publicKey;

                 if (!argv.dryRun) {
                     const deleteInstance = await forumClient.deleteUserProfile(
                         forumKey,
                         wallet.payer,
                         receiverKey
                     );
                     console.log(stringifyPKsAndBNs(deleteInstance));
                 } else {
                     console.log('Deleting user profile account for wallet with pubkey', stringifyPKsAndBNs(wallet.publicKey));
                 }
             })



// Create user about me account (payer = profile owner)
// Must config about me parameters in aboutMeConfig
    .command('create-about-me', 'Create a user about me account', {
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const forumClient: ForumClient = new ForumClient(
                     rpcConn,
                     wallet,
                     ForumIDL,
                     FORUM_PROG_ID,
                 );

                 const forumKey = aboutMeConfig.forum;

                 const contentString = aboutMeConfig.content;
                 const hashResult = hash(contentString);
                 const contentDataHash: PublicKey = new PublicKey(hashResult);


                 if (!argv.dryRun) {
                     const aboutMeInstance = await forumClient.createAboutMe(
                         forumKey,
                         wallet.payer,
                         contentDataHash,
                     );
                     console.log(stringifyPKsAndBNs(aboutMeInstance));
                 } else {
                     console.log('Creating about me account for user profile account with owner address', stringifyPKsAndBNs(wallet.publicKey));
                 }
             })



// Edit user about me account
// Must config about me parameters in aboutMeConfig
    .command('edit-about-me', 'Edit a user about me account', {
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const forumClient: ForumClient = new ForumClient(
                     rpcConn,
                     wallet,
                     ForumIDL,
                     FORUM_PROG_ID,
                 );

                 const forumKey = aboutMeConfig.forum;

                 const newContentString: string = aboutMeConfig.content;
                 const hashResult = hash(newContentString);
                 const newContentDataHash: PublicKey = new PublicKey(hashResult);

                 if (!argv.dryRun) {
                     const editAboutMeInstance = await forumClient.editAboutMe(
                         forumKey,
                         wallet.payer,
                         newContentDataHash
                     );
                     console.log(stringifyPKsAndBNs(editAboutMeInstance));
                 } else {
                     console.log('Editing about me account for user profile account with owner address', stringifyPKsAndBNs(wallet.publicKey));
                 }
             })



// Delete user about me account
    .command('delete-about-me', 'Delete a user about me account', {
        receiverPubkey: {
            alias: 'r',
            type: 'string',
            demandOption: false,
            description: 'receiver account pubkey for reclaimed rent lamports'
        }
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const forumClient: ForumClient = new ForumClient(
                     rpcConn,
                     wallet,
                     ForumIDL,
                     FORUM_PROG_ID,
                 );

                 const forumKey = aboutMeConfig.forum;
                 const receiverKey: PublicKey = argv.receiverPubkey ? new PublicKey(argv.receiverPubkey) : wallet.publicKey;

                 if (!argv.dryRun) {
                     const deleteAboutMeInstance = await forumClient.deleteAboutMe(
                         forumKey,
                         wallet.payer,
                         receiverKey
                     );
                     console.log(stringifyPKsAndBNs(deleteAboutMeInstance));
                 } else {
                     console.log('Deleting about me account for user profile account with owner address', stringifyPKsAndBNs(wallet.publicKey));
                 }
             })



// Delete user profile and about me accounts
    .command('delete-user-profile-and-about-me', 'Delete user profile and about me accounts simultaneously', {
        receiverPubkey: {
            alias: 'r',
            type: 'string',
            demandOption: false,
            description: 'receiver account pubkey for reclaimed rent lamports'
        }
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const forumClient: ForumClient = new ForumClient(
                     rpcConn,
                     wallet,
                     ForumIDL,
                     FORUM_PROG_ID,
                 );

                 const forumKey = aboutMeConfig.forum;
                 const receiverKey: PublicKey = argv.receiverPubkey ? new PublicKey(argv.receiverPubkey) : wallet.publicKey;

                 if (!argv.dryRun) {
                     const deleteUserProfileAndAboutMeInstance = await forumClient.deleteUserProfileAndAboutMe(
                         forumKey,
                         wallet.payer,
                         receiverKey
                     );
                     console.log(stringifyPKsAndBNs(deleteUserProfileAndAboutMeInstance));
                 } else {
                     console.log('Deleting user profile and about me account for user profile account with owner address', stringifyPKsAndBNs(wallet.publicKey));
                 }
             })



// ------------------------------------------- adding/removing moderator privilege instructions ----------------------------------



// Add moderator privilege to a user profile account
    .command('add-moderator', 'Add moderator privilege to a user profile account', {
        userProfilePubkey: {
            alias: 'u',
            type: 'string',
            demandOption: true,
            description: 'user profile account pubkey'
        }
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const forumClient: ForumClient = new ForumClient(
                     rpcConn,
                     wallet,
                     ForumIDL,
                     FORUM_PROG_ID,
                 );

                 const userProfileKey = new PublicKey(argv.userProfilePubkey);

                 if (!argv.dryRun) {
                     const addModeratorInstance = await forumClient.addModerator(
                         userProfileKey,
                         wallet.payer,
                     );
                     console.log(stringifyPKsAndBNs(addModeratorInstance));
                 } else {
                     console.log('Adding moderator privilege to user profile account with address', userProfileKey.toBase58());
                 }
             })



// Remove moderator privilege from a user profile account
    .command('remove-moderator', 'Remove moderator privilege from a user profile account', {
        userProfilePubkey: {
            alias: 'u',
            type: 'string',
            demandOption: true,
            description: 'user profile account pubkey'
        }
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const forumClient: ForumClient = new ForumClient(
                     rpcConn,
                     wallet,
                     ForumIDL,
                     FORUM_PROG_ID,
                 );

                 const userProfileKey = new PublicKey(argv.userProfilePubkey);

                 if (!argv.dryRun) {
                     const removeModeratorInstance = await forumClient.removeModerator(
                         userProfileKey,
                         wallet.payer,
                     );
                     console.log(stringifyPKsAndBNs(removeModeratorInstance));
                 } else {
                     console.log('Removing moderator privilege from user profile account with address', userProfileKey.toBase58());
                 }
             })



// -------------------------------------------------- question related instructions ----------------------------------------------



// Ask question
// Must config question parameters in questionConfig
    .command('ask-question', 'Ask a question', {
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const forumClient: ForumClient = new ForumClient(
                     rpcConn,
                     wallet,
                     ForumIDL,
                     FORUM_PROG_ID,
                 );

                 const forumKey: PublicKey = questionConfig.forum;
                 const tags: Tags[] = questionConfig.tags;
                 const title: string = questionConfig.title;
                 const contentDataUrl = questionConfig.contentDataUrl;
                 const bountyAmount: anchor.BN = questionConfig.bountyAmount;

                 const contentString: string = questionConfig.content;
                 const hashResult = hash(contentString);
                 const contentDataHash: PublicKey = new PublicKey(hashResult);

                 console.log(stringifyPKsAndBNs(contentDataHash));

                 if (!argv.dryRun) {
                     const questionInstance = await forumClient.askQuestion(
                         forumKey,
                         wallet.payer,
                         contentDataHash,
                         tags,
                         title,
                         contentDataUrl,
                         bountyAmount
                     );
                     console.log(stringifyPKsAndBNs(questionInstance));
                 } else {
                     console.log('Creating question for user profile with owner pubkey', stringifyPKsAndBNs(wallet.publicKey));
                 }
             })



// Edit question
// Must config question parameters in questionConfig
    .command('edit-question', 'Edit a question', {
        questionPubkey: {
            alias: 'q',
            type: 'string',
            demandOption: true,
            description: 'question account pubkey'
        },
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const forumClient: ForumClient = new ForumClient(
                     rpcConn,
                     wallet,
                     ForumIDL,
                     FORUM_PROG_ID,
                 );

                 const questionKey = new PublicKey(argv.questionPubkey);

                 const newTags: Tags[] = questionConfig.tags;
                 const newTitle: string = questionConfig.title;
                 const newContentDataUrl: string = questionConfig.contentDataUrl;

                 const newContentString: string = questionConfig.content;
                 const hashResult = hash(newContentString);
                 const newContentDataHash: PublicKey = new PublicKey(hashResult);

                 if (!argv.dryRun) {
                     const editQuestionInstance = await forumClient.editQuestion(
                         questionKey,
                         wallet.payer,
                         newContentDataHash,
                         newTags,
                         newTitle,
                         newContentDataUrl,
                     );
                     console.log(stringifyPKsAndBNs(editQuestionInstance));
                 } else {
                     console.log('Editing question account with address', questionKey.toBase58());
                 }
             })



// Edit question moderator
// Must config question parameters in questionConfig
    .command('edit-question-moderator', 'Moderator account edits question', {
        questionPubkey: {
            alias: 'q',
            type: 'string',
            demandOption: true,
            description: 'question account pubkey'
        },
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const forumClient: ForumClient = new ForumClient(
                     rpcConn,
                     wallet,
                     ForumIDL,
                     FORUM_PROG_ID,
                 );

                 const questionKey = new PublicKey(argv.questionPubkey);

                 const newTags: Tags[] = questionConfig.tags;
                 const newTitle: string = questionConfig.title;
                 const newContentDataUrl: string = questionConfig.contentDataUrl;

                 const newContentString: string = questionConfig.content;
                 const hashResult = hash(newContentString);
                 const newContentDataHash: PublicKey = new PublicKey(hashResult);

                 if (!argv.dryRun) {
                     const editQuestionModeratorInstance = await forumClient.editQuestionModerator(
                         questionKey,
                         wallet.payer,
                         newContentDataHash,
                         newTags,
                         newTitle,
                         newContentDataUrl
                     );
                     console.log(stringifyPKsAndBNs(editQuestionModeratorInstance));
                 } else {
                     console.log('Moderator editing question account with address', questionKey.toBase58());
                 }
             })



// Delete question (signer required: moderator)
    .command('delete-question-moderator', 'Moderator account deletes question', {
        questionPubkey: {
            alias: 'q',
            type: 'string',
            demandOption: true,
            description: 'question account pubkey'
        },
        receiverPubkey: {
            alias: 'r',
            type: 'string',
            demandOption: false,
            description: 'receiver account pubkey for reclaimed rent lamports'
        }
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const forumClient: ForumClient = new ForumClient(
                     rpcConn,
                     wallet,
                     ForumIDL,
                     FORUM_PROG_ID,
                 );

                 const questionKey = new PublicKey(argv.questionPubkey);
                 const receiverKey: PublicKey = argv.receiverPubkey ? new PublicKey(argv.receiverPubkey) : wallet.publicKey;

                 if (!argv.dryRun) {
                     const deleteQuestionInstance = await forumClient.deleteQuestionModerator(
                         questionKey,
                         wallet.payer,
                         receiverKey
                     );
                     console.log(stringifyPKsAndBNs(deleteQuestionInstance));
                 } else {
                     console.log('Moderator deleting question account with address', questionKey.toBase58());
                 }
             })



// Supplement question bounty
    .command('supplement-question-bounty', 'Supplement question bounty', {
        questionPubkey: {
            alias: 'q',
            type: 'string',
            demandOption: true,
            description: 'question account pubkey'
        },
        supplementalBountyAmount: {
            alias: 'x',
            type: 'string',
            demandOption: true,
            description: 'supplemental bounty amount'
        }
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const forumClient: ForumClient = new ForumClient(
                     rpcConn,
                     wallet,
                     ForumIDL,
                     FORUM_PROG_ID,
                 );

                 const questionKey = new PublicKey(argv.questionPubkey);
                 const supplementalBountyAmount = new anchor.BN(argv.supplementalBountyAmount);

                 if (!argv.dryRun) {
                     const supplementQuestionBountyInstance = await forumClient.supplementQuestionBounty(
                         questionKey,
                         wallet.payer,
                         supplementalBountyAmount,
                     );
                     console.log(stringifyPKsAndBNs(supplementQuestionBountyInstance));
                 } else {
                     console.log('Supplementing question account with address', questionKey.toBase58(),
                                 'for', stringifyPKsAndBNs(supplementalBountyAmount));
                 }
             })



// Refund question bounty (signer required: moderator)
    .command('refund-question-bounty-moderator', 'Moderator refund question bounty to supplementor', {
        questionPubkey: {
            alias: 'q',
            type: 'string',
            demandOption: true,
            description: 'question account pubkey'
        },
        supplementorPubkey: {
            alias: 's',
            type: 'string',
            demandOption: true,
            description: 'supplementor account pubkey'
        }
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const forumClient: ForumClient = new ForumClient(
                     rpcConn,
                     wallet,
                     ForumIDL,
                     FORUM_PROG_ID,
                 );

                 const questionKey = new PublicKey(argv.questionPubkey);
                 const supplementorKey = new PublicKey(argv.supplementorPubkey);

                 if (!argv.dryRun) {
                     const refundQuestionBountyInstance = await forumClient.refundQuestionBountySupplementorModerator(
                         questionKey,
                         wallet.payer,
                         supplementorKey,
                     );
                     console.log(stringifyPKsAndBNs(refundQuestionBountyInstance));
                 } else {
                     console.log('Refunding question bounty for supplementor with address', supplementorKey.toBase58());
                 }
             })



// Accept answer
    .command('accept-answer', 'Accept an answer', {
        answerPubkey: {
            alias: 'a',
            type: 'string',
            demandOption: true,
            description: 'answer account pubkey'
        },
        receiverPubkey: {
            alias: 'r',
            type: 'string',
            demandOption: false,
            description: 'receiver account pubkey for reclaimed rent lamports'
        }
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const forumClient: ForumClient = new ForumClient(
                     rpcConn,
                     wallet,
                     ForumIDL,
                     FORUM_PROG_ID,
                 );

                 const answerKey = new PublicKey(argv.answerPubkey);
                 const receiverKey: PublicKey = argv.receiverPubkey ? new PublicKey(argv.receiverPubkey) : wallet.publicKey;

                 if (!argv.dryRun) {
                     const acceptAnswerInstance = await forumClient.acceptAnswer(
                         answerKey,
                         wallet.payer,
                         receiverKey,
                     );
                     console.log(stringifyPKsAndBNs(acceptAnswerInstance));
                 } else {
                     console.log('Accepting answer for answer account with address', answerKey.toBase58());
                 }
             })



// -------------------------------------------------- answer related instructions ------------------------------------------------



// Answer Question
// Must config answer parameters in answerConfig
    .command('answer-question', 'Answer a question', {
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const forumClient: ForumClient = new ForumClient(
                     rpcConn,
                     wallet,
                     ForumIDL,
                     FORUM_PROG_ID,
                 );

                 const questionKey: PublicKey = answerConfig.question;

                 const contentString: string = answerConfig.content;
                 const hashResult = hash(contentString);
                 const contentDataHash: PublicKey = new PublicKey(hashResult);

                 if (!argv.dryRun) {
                     const answerInstance = await forumClient.answerQuestion(
                         questionKey,
                         wallet.payer,
                         contentDataHash,
                     );
                     console.log(stringifyPKsAndBNs(answerInstance));
                 } else {
                     console.log('Answering question account with address', stringifyPKsAndBNs(questionKey));
                 }
             })



// Edit answer
// Must config answer parameters in answerConfig
    .command('edit-answer', 'Edit an answer', {
        answerPubkey: {
            alias: 'a',
            type: 'string',
            demandOption: true,
            description: 'answer account pubkey'
        }
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const forumClient: ForumClient = new ForumClient(
                     rpcConn,
                     wallet,
                     ForumIDL,
                     FORUM_PROG_ID,
                 );

                 const answerKey: PublicKey = new PublicKey(argv.answerPubkey);

                 const newContentString: string = answerConfig.content;
                 const hashResult = hash(newContentString);
                 const newContentDataHash: PublicKey = new PublicKey(hashResult);

                 if (!argv.dryRun) {
                     const editAnswerInstance = await forumClient.editAnswer(
                         answerKey,
                         wallet.payer,
                         newContentDataHash
                     );
                     console.log(stringifyPKsAndBNs(editAnswerInstance));
                 } else {
                     console.log('Editing answer account with address', stringifyPKsAndBNs(answerKey));
                 }
             })



// Edit answer moderator (signer required: moderator)
// Must config answer parameters in answerConfig
    .command('edit-answer-moderator', 'Moderator account edits answer', {
        answerPubkey: {
            alias: 'a',
            type: 'string',
            demandOption: true,
            description: 'answer account pubkey'
        }
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const forumClient: ForumClient = new ForumClient(
                     rpcConn,
                     wallet,
                     ForumIDL,
                     FORUM_PROG_ID,
                 );

                 const answerKey: PublicKey = new PublicKey(argv.answerPubkey);

                 const newContentString: string = answerConfig.content;
                 const hashResult = hash(newContentString);
                 const newContentDataHash: PublicKey = new PublicKey(hashResult);

                 if (!argv.dryRun) {
                     const editAnswerModeratorInstance = await forumClient.editAnswerModerator(
                         answerKey,
                         wallet.payer,
                         newContentDataHash
                     );
                     console.log(stringifyPKsAndBNs(editAnswerModeratorInstance));
                 } else {
                     console.log('Moderator editing answer account with address', stringifyPKsAndBNs(answerKey));
                 }
             })



// Delete answer
    .command('delete-answer', 'Delete an answer', {
        answerPubkey: {
            alias: 'a',
            type: 'string',
            demandOption: true,
            description: 'answer account pubkey'
        },
        receiverPubkey: {
            alias: 'r',
            type: 'string',
            demandOption: false,
            description: 'receiver account pubkey for reclaimed rent lamports'
        }
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const forumClient: ForumClient = new ForumClient(
                     rpcConn,
                     wallet,
                     ForumIDL,
                     FORUM_PROG_ID,
                 );

                 const answerKey = new PublicKey(argv.answerPubkey);
                 const receiverKey: PublicKey = argv.receiverPubkey ? new PublicKey(argv.receiverPubkey) : wallet.publicKey;

                 if (!argv.dryRun) {
                     const deleteAnswerInstance = await forumClient.deleteAnswer(
                         answerKey,
                         wallet.payer,
                         receiverKey
                     );
                     console.log(stringifyPKsAndBNs(deleteAnswerInstance));
                 } else {
                     console.log('Deleting answer account with address', answerKey.toBase58());
                 }
             })



// Delete answer moderator (signer required: moderator)
    .command('delete-answer-moderator', 'Moderator deletes answer', {
        answerPubkey: {
            alias: 'a',
            type: 'string',
            demandOption: true,
            description: 'answer account pubkey'
        },
        receiverPubkey: {
            alias: 'r',
            type: 'string',
            demandOption: false,
            description: 'receiver account pubkey for reclaimed rent lamports'
        }
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const forumClient: ForumClient = new ForumClient(
                     rpcConn,
                     wallet,
                     ForumIDL,
                     FORUM_PROG_ID,
                 );

                 const answerKey = new PublicKey(argv.answerPubkey);
                 const receiverKey: PublicKey = argv.receiverPubkey ? new PublicKey(argv.receiverPubkey) : wallet.publicKey;

                 if (!argv.dryRun) {
                     const deleteAnswerInstance = await forumClient.deleteAnswer(
                         answerKey,
                         wallet.payer,
                         receiverKey
                     );
                     console.log(stringifyPKsAndBNs(deleteAnswerInstance));
                 } else {
                     console.log('Moderator deleting answer account with address', answerKey.toBase58());
                 }
             })



// -------------------------------------------------- comment related instructions -----------------------------------------------



// Leave Comment on Question
// Must config comment parameters in commentConfig
    .command('leave-comment-on-question', 'Leave comment on question', {
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const forumClient: ForumClient = new ForumClient(
                     rpcConn,
                     wallet,
                     ForumIDL,
                     FORUM_PROG_ID,
                 );

                 const questionKey: PublicKey = commentConfig.commentedOn;

                 const contentString: string = commentConfig.content;
                 const hashResult = hash(contentString);
                 const contentDataHash: PublicKey = new PublicKey(hashResult);

                 if (!argv.dryRun) {
                     const commentInstance = await forumClient.leaveCommentOnQuestion(
                         questionKey,
                         wallet.payer,
                         contentDataHash,
                     );
                     console.log(stringifyPKsAndBNs(commentInstance));
                 } else {
                     console.log('Leaving comment on question account with address', stringifyPKsAndBNs(questionKey));
                 }
             })



// Edit comment on Question
// Must config comment parameters in commentConfig
    .command('edit-comment-on-question', 'Edit comment on question', {
        commentPubkey: {
            alias: 'c',
            type: 'string',
            demandOption: true,
            description: 'comment account pubkey'
        }
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const forumClient: ForumClient = new ForumClient(
                     rpcConn,
                     wallet,
                     ForumIDL,
                     FORUM_PROG_ID,
                 );

                 const commentKey: PublicKey = new PublicKey(argv.commentPubkey);

                 const newContentString: string = commentConfig.content;
                 const hashResult = hash(newContentString);
                 const newContentDataHash: PublicKey = new PublicKey(hashResult);

                 if (!argv.dryRun) {
                     const editCommentInstance = await forumClient.editCommentOnQuestion(
                         commentKey,
                         wallet.payer,
                         newContentDataHash,
                     );
                     console.log(stringifyPKsAndBNs(editCommentInstance));
                 } else {
                     console.log('Editing comment account with address', stringifyPKsAndBNs(commentKey));
                 }
             })



// Edit Comment on Question Moderator
// Must config comment parameters in commentConfig
    .command('edit-comment-on-question-moderator', 'Moderator edits comment on question', {
        commentPubkey: {
            alias: 'c',
            type: 'string',
            demandOption: true,
            description: 'comment account pubkey'
        }
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const forumClient: ForumClient = new ForumClient(
                     rpcConn,
                     wallet,
                     ForumIDL,
                     FORUM_PROG_ID,
                 );

                 const commentKey: PublicKey = new PublicKey(argv.commentPubkey);

                 const newContentString: string = commentConfig.content;
                 const hashResult = hash(newContentString);
                 const newContentDataHash: PublicKey = new PublicKey(hashResult);

                 if (!argv.dryRun) {
                     const editCommentModeratorInstance = await forumClient.editCommentOnQuestionModerator(
                         commentKey,
                         wallet.payer,
                         newContentDataHash,
                     );
                     console.log(stringifyPKsAndBNs(editCommentModeratorInstance));
                 } else {
                     console.log('Moderator editing comment account with address', stringifyPKsAndBNs(commentKey));
                 }
             })



// Delete Comment on Question
    .command('delete-comment-on-question', 'Delete comment on question', {
        commentPubkey: {
            alias: 'c',
            type: 'string',
            demandOption: true,
            description: 'comment account pubkey'
        },
        receiverPubkey: {
            alias: 'r',
            type: 'string',
            demandOption: false,
            description: 'receiver account pubkey for reclaimed rent lamports'
        }
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const forumClient: ForumClient = new ForumClient(
                     rpcConn,
                     wallet,
                     ForumIDL,
                     FORUM_PROG_ID,
                 );

                 const commentKey = new PublicKey(argv.commentPubkey);
                 const receiverKey: PublicKey = argv.receiverPubkey ? new PublicKey(argv.receiverPubkey) : wallet.publicKey;

                 if (!argv.dryRun) {
                     const deleteCommentInstance = await forumClient.deleteCommentOnQuestion(
                         commentKey,
                         wallet.payer,
                         receiverKey
                     );
                     console.log(stringifyPKsAndBNs(deleteCommentInstance));
                 } else {
                     console.log('Deleting comment account with address', commentKey.toBase58());
                 }
             })



// Delete Comment on Question Moderator (signer required: moderator)
    .command('delete-comment-on-question-moderator', 'Moderator deletes comment on question', {
        commentPubkey: {
            alias: 'c',
            type: 'string',
            demandOption: true,
            description: 'comment account pubkey'
        },
        receiverPubkey: {
            alias: 'r',
            type: 'string',
            demandOption: false,
            description: 'receiver account pubkey for reclaimed rent lamports'
        }
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const forumClient: ForumClient = new ForumClient(
                     rpcConn,
                     wallet,
                     ForumIDL,
                     FORUM_PROG_ID,
                 );

                 const commentKey = new PublicKey(argv.commentPubkey);
                 const receiverKey: PublicKey = argv.receiverPubkey ? new PublicKey(argv.receiverPubkey) : wallet.publicKey;

                 if (!argv.dryRun) {
                     const deleteCommentModeratorInstance = await forumClient.deleteCommentOnQuestionModerator(
                         commentKey,
                         wallet.payer,
                         receiverKey
                     );
                     console.log(stringifyPKsAndBNs(deleteCommentModeratorInstance));
                 } else {
                     console.log('Moderator deleting comment account with address', commentKey.toBase58());
                 }
             })



// -------------------------------------------------- comment related instructions -----------------------------------------------



// Leave Comment on Answer
// Must config comment parameters in commentConfig
    .command('leave-comment-on-answer', 'Leave comment on answer', {
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const forumClient: ForumClient = new ForumClient(
                     rpcConn,
                     wallet,
                     ForumIDL,
                     FORUM_PROG_ID,
                 );

                 const answerKey: PublicKey = commentConfig.commentedOn;

                 const contentString: string = commentConfig.content;
                 const hashResult = hash(contentString);
                 const contentDataHash: PublicKey = new PublicKey(hashResult);

                 if (!argv.dryRun) {
                     const commentInstance = await forumClient.leaveCommentOnAnswer(
                         answerKey,
                         wallet.payer,
                         contentDataHash,
                     );
                     console.log(stringifyPKsAndBNs(commentInstance));
                 } else {
                     console.log('Leaving comment on answer account with address', stringifyPKsAndBNs(answerKey));
                 }
             })



// Edit Comment on Answer
// Must config comment parameters in commentConfig
    .command('edit-comment-on-answer', 'Edit comment on answer', {
        commentPubkey: {
            alias: 'c',
            type: 'string',
            demandOption: true,
            description: 'comment account pubkey'
        }
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const forumClient: ForumClient = new ForumClient(
                     rpcConn,
                     wallet,
                     ForumIDL,
                     FORUM_PROG_ID,
                 );

                 const commentKey: PublicKey = new PublicKey(argv.commentPubkey);

                 const newContentString: string = commentConfig.content;
                 const hashResult = hash(newContentString);
                 const newContentDataHash: PublicKey = new PublicKey(hashResult);

                 if (!argv.dryRun) {
                     const editCommentInstance = await forumClient.editCommentOnAnswer(
                         commentKey,
                         wallet.payer,
                         newContentDataHash,
                     );
                     console.log(stringifyPKsAndBNs(editCommentInstance));
                 } else {
                     console.log('Editing comment account with address', stringifyPKsAndBNs(commentKey));
                 }
             })



// Edit Comment on Answer Moderator
// Must config comment parameters in commentConfig
    .command('edit-comment-on-answer-moderator', 'Moderator edits comment on answer', {
        commentPubkey: {
            alias: 'c',
            type: 'string',
            demandOption: true,
            description: 'comment account pubkey'
        }
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const forumClient: ForumClient = new ForumClient(
                     rpcConn,
                     wallet,
                     ForumIDL,
                     FORUM_PROG_ID,
                 );

                 const commentKey: PublicKey = new PublicKey(argv.commentPubkey);

                 const newContentString: string = commentConfig.content;
                 const hashResult = hash(newContentString);
                 const newContentDataHash: PublicKey = new PublicKey(hashResult);

                 if (!argv.dryRun) {
                     const editCommentModeratorInstance = await forumClient.editCommentOnAnswerModerator(
                         commentKey,
                         wallet.payer,
                         newContentDataHash,
                     );
                     console.log(stringifyPKsAndBNs(editCommentModeratorInstance));
                 } else {
                     console.log('Moderator editing comment account with address', stringifyPKsAndBNs(commentKey));
                 }
             })



// Delete Comment on Answer
    .command('delete-comment-on-answer', 'Delete comment on answer', {
        commentPubkey: {
            alias: 'c',
            type: 'string',
            demandOption: true,
            description: 'comment account pubkey'
        },
        receiverPubkey: {
            alias: 'r',
            type: 'string',
            demandOption: false,
            description: 'receiver account pubkey for reclaimed rent lamports'
        }
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const forumClient: ForumClient = new ForumClient(
                     rpcConn,
                     wallet,
                     ForumIDL,
                     FORUM_PROG_ID,
                 );

                 const commentKey = new PublicKey(argv.commentPubkey);
                 const receiverKey: PublicKey = argv.receiverPubkey ? new PublicKey(argv.receiverPubkey) : wallet.publicKey;

                 if (!argv.dryRun) {
                     const deleteCommentInstance = await forumClient.deleteCommentOnAnswer(
                         commentKey,
                         wallet.payer,
                         receiverKey
                     );
                     console.log(stringifyPKsAndBNs(deleteCommentInstance));
                 } else {
                     console.log('Deleting comment account with address', commentKey.toBase58());
                 }
             })



// Delete Comment on Answer Moderator (signer required: moderator)
    .command('delete-comment-on-answer-moderator', 'Moderator deletes comment on answer', {
        commentPubkey: {
            alias: 'c',
            type: 'string',
            demandOption: true,
            description: 'comment account pubkey'
        },
        receiverPubkey: {
            alias: 'r',
            type: 'string',
            demandOption: false,
            description: 'receiver account pubkey for reclaimed rent lamports'
        }
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const forumClient: ForumClient = new ForumClient(
                     rpcConn,
                     wallet,
                     ForumIDL,
                     FORUM_PROG_ID,
                 );

                 const commentKey = new PublicKey(argv.commentPubkey);
                 const receiverKey: PublicKey = argv.receiverPubkey ? new PublicKey(argv.receiverPubkey) : wallet.publicKey;

                 if (!argv.dryRun) {
                     const deleteCommentModeratorInstance = await forumClient.deleteCommentOnQuestionModerator(
                         commentKey,
                         wallet.payer,
                         receiverKey
                     );
                     console.log(stringifyPKsAndBNs(deleteCommentModeratorInstance));
                 } else {
                     console.log('Moderator deleting comment account with address', commentKey.toBase58());
                 }
             })



// -------------------------------------------------- big note related instructions -----------------------------------------------



// Create Big Note
// Must config big note parameters in bigNoteConfig
    .command('create-bignote', 'Create a big note', {
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const forumClient: ForumClient = new ForumClient(
                     rpcConn,
                     wallet,
                     ForumIDL,
                     FORUM_PROG_ID,
                 );

                 const forumKey: PublicKey = bigNoteConfig.forum;
                 const bigNoteType = bigNoteConfig.bigNoteType;
                 const tags = bigNoteConfig.tags;
                 const title: string = bigNoteConfig.title;
                 const contentDataUrl: string = bigNoteConfig.contentDataUrl;

                 const contentString: string = bigNoteConfig.content;
                 const hashResult = hash(contentString);
                 const contentDataHash: PublicKey = new PublicKey(hashResult);

                 if (!argv.dryRun) {
                     const bigNoteInstance = await forumClient.createBigNote(
                         forumKey,
                         wallet.payer,
                         contentDataHash,
                         bigNoteType,
                         tags,
                         title,
                         contentDataUrl,
                     );
                     console.log(stringifyPKsAndBNs(bigNoteInstance));
                 } else {
                     console.log('Creating big note for user profile with owner pubkey', stringifyPKsAndBNs(wallet.publicKey));
                 }
             })



// Edit big note of type 'open contribution'
// Must config big note parameters in bigNoteConfig
    .command('edit-bignote-open-contribution', 'Edit a big note of type open contribution', {
        bigNotePubkey: {
            alias: 'b',
            type: 'string',
            demandOption: true,
            description: 'big note account pubkey'
        },
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const forumClient: ForumClient = new ForumClient(
                     rpcConn,
                     wallet,
                     ForumIDL,
                     FORUM_PROG_ID,
                 );

                 const bigNoteKey = new PublicKey(argv.bigNotePubkey);

                 const newTags = bigNoteConfig.tags;
                 const newTitle: string = bigNoteConfig.title;
                 const newContentDataUrl: string = bigNoteConfig.contentDataUrl;

                 const newContentString: string = bigNoteConfig.content;
                 const hashResult = hash(newContentString);
                 const newContentDataHash: PublicKey = new PublicKey(hashResult);

                 if (!argv.dryRun) {
                     const editBigNoteInstance = await forumClient.editBigNoteOpenContribution(
                         bigNoteKey,
                         wallet.payer,
                         newContentDataHash,
                         newTags,
                         newTitle,
                         newContentDataUrl,
                     );
                     console.log(stringifyPKsAndBNs(editBigNoteInstance));
                 } else {
                     console.log('Editing big note account of type open contribution with address', bigNoteKey.toBase58());
                 }
             })



// Edit big note of type 'creator curated'
// Must config big note parameters in bigNoteConfig
    .command('edit-bignote-creator-curated', 'Edit a big note of type creator curated', {
        bigNotePubkey: {
            alias: 'b',
            type: 'string',
            demandOption: true,
            description: 'big note account pubkey'
        },
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const forumClient: ForumClient = new ForumClient(
                     rpcConn,
                     wallet,
                     ForumIDL,
                     FORUM_PROG_ID,
                 );

                 const bigNoteKey = new PublicKey(argv.bigNotePubkey);

                 const newTags = bigNoteConfig.tags;
                 const newTitle: string = bigNoteConfig.title;
                 const newContentDataUrl: string = bigNoteConfig.contentDataUrl;

                 const newContentString: string = bigNoteConfig.content;
                 const hashResult = hash(newContentString);
                 const newContentDataHash: PublicKey = new PublicKey(hashResult);

                 if (!argv.dryRun) {
                     const editBigNoteInstance = await forumClient.editBigNoteCreatorCurated(
                         bigNoteKey,
                         wallet.payer,
                         newContentDataHash,
                         newTags,
                         newTitle,
                         newContentDataUrl,
                     );
                     console.log(stringifyPKsAndBNs(editBigNoteInstance));
                 } else {
                     console.log('Editing big note account of type creator curated with address', bigNoteKey.toBase58());
                 }
             })



// Edit big note (signer required: moderator)
// Must config big note parameters in bigNoteConfig
    .command('edit-bignote-moderator', 'Moderator edits big note', {
        bigNotePubkey: {
            alias: 'b',
            type: 'string',
            demandOption: true,
            description: 'big note account pubkey'
        },
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const forumClient: ForumClient = new ForumClient(
                     rpcConn,
                     wallet,
                     ForumIDL,
                     FORUM_PROG_ID,
                 );

                 const bigNoteKey = new PublicKey(argv.bigNotePubkey);

                 const newTags = bigNoteConfig.tags;
                 const newTitle: string = bigNoteConfig.title;
                 const newContentDataUrl: string = bigNoteConfig.contentDataUrl;

                 const newContentString: string = bigNoteConfig.content;
                 const hashResult = hash(newContentString);
                 const newContentDataHash: PublicKey = new PublicKey(hashResult);


                 if (!argv.dryRun) {
                     const editBigNoteModeratorInstance = await forumClient.editBigNoteModerator(
                         bigNoteKey,
                         wallet.payer,
                         newContentDataHash,
                         newTags,
                         newTitle,
                         newContentDataUrl,
                     );
                     console.log(stringifyPKsAndBNs(editBigNoteModeratorInstance));
                 } else {
                     console.log('Moderator editing big note account with address', bigNoteKey.toBase58());
                 }
             })



// Delete big note (signer required: moderator)
    .command('delete-bignote-moderator', 'Moderator deletes a big note', {
        bigNotePubkey: {
            alias: 'b',
            type: 'string',
            demandOption: true,
            description: 'big note account pubkey'
        },
        receiverPubkey: {
            alias: 'r',
            type: 'string',
            demandOption: false,
            description: 'receiver account pubkey for reclaimed rent lamports'
        }
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const forumClient: ForumClient = new ForumClient(
                     rpcConn,
                     wallet,
                     ForumIDL,
                     FORUM_PROG_ID,
                 );

                 const bigNoteKey = new PublicKey(argv.bigNotePubkey);
                 const receiverKey: PublicKey = argv.receiverPubkey ? new PublicKey(argv.receiverPubkey) : wallet.publicKey;

                 if (!argv.dryRun) {
                     const deleteBigNoteInstance = await forumClient.deleteBigNoteModerator(
                         bigNoteKey,
                         wallet.payer,
                         receiverKey
                     );
                     console.log(stringifyPKsAndBNs(deleteBigNoteInstance));
                 } else {
                     console.log('Moderator deleting big note account with address', bigNoteKey.toBase58());
                 }
             })



// Supplement big note bounty
    .command('supplement-bignote-bounty', 'Supplement big note bounty', {
        bigNotePubkey: {
            alias: 'b',
            type: 'string',
            demandOption: true,
            description: 'big note account pubkey'
        },
        supplementalBountyAmount: {
            alias: 'x',
            type: 'string',
            demandOption: true,
            description: 'supplemental bounty amount'
        }
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const forumClient: ForumClient = new ForumClient(
                     rpcConn,
                     wallet,
                     ForumIDL,
                     FORUM_PROG_ID,
                 );

                 const bigNoteKey = new PublicKey(argv.bigNotePubkey);
                 const supplementalBountyAmount = new anchor.BN(argv.supplementalBountyAmount);

                 if (!argv.dryRun) {
                     const supplementBigNoteBountyInstance = await forumClient.supplementQuestionBounty(
                         bigNoteKey,
                         wallet.payer,
                         supplementalBountyAmount,
                     );
                     console.log(stringifyPKsAndBNs(supplementBigNoteBountyInstance));
                 } else {
                     console.log('Supplementing big note account with address', bigNoteKey.toBase58(),
                                 'for', stringifyPKsAndBNs(supplementalBountyAmount));
                 }
             })



// Refund big note bounty supplementor (signer required: moderator)
    .command('refund-bignote-bounty-moderator', 'Moderator refund big note bounty to supplementor', {
        bigNotePubkey: {
            alias: 'b',
            type: 'string',
            demandOption: true,
            description: 'question account pubkey'
        },
        supplementorPubkey: {
            alias: 's',
            type: 'string',
            demandOption: true,
            description: 'supplementor account pubkey'
        }
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const forumClient: ForumClient = new ForumClient(
                     rpcConn,
                     wallet,
                     ForumIDL,
                     FORUM_PROG_ID,
                 );

                 const bigNoteKey = new PublicKey(argv.bigNotePubkey);
                 const supplementorKey = new PublicKey(argv.supplementorPubkey);

                 if (!argv.dryRun) {
                     const refundBigNoteBountyInstance = await forumClient.refundBigNoteBountySupplementorModerator(
                         bigNoteKey,
                         wallet.payer,
                         supplementorKey,
                     );
                     console.log(stringifyPKsAndBNs(refundBigNoteBountyInstance));
                 } else {
                     console.log('Refunding big note bounty for supplementor with address', supplementorKey.toBase58());
                 }
             })



// Accept proposed contribution
    .command('accept-proposed-contribution', 'Accept a big note contribution proposal', {
        proposedContributionPubkey: {
            alias: 'p',
            type: 'string',
            demandOption: true,
            description: 'proposed contribution account pubkey'
        },
        receiverPubkey: {
            alias: 'r',
            type: 'string',
            demandOption: false,
            description: 'receiver account pubkey for reclaimed rent lamports'
        }
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const forumClient: ForumClient = new ForumClient(
                     rpcConn,
                     wallet,
                     ForumIDL,
                     FORUM_PROG_ID,
                 );

                 const proposedContributionKey = new PublicKey(argv.proposedContributionPubkey);
                 const receiverKey: PublicKey = argv.receiverPubkey ? new PublicKey(argv.receiverPubkey) : wallet.publicKey;

                 if (!argv.dryRun) {
                     const acceptProposedContributionInstance = await forumClient.acceptProposedContribution(
                         proposedContributionKey,
                         wallet.payer,
                         receiverKey,
                     );
                     console.log(stringifyPKsAndBNs(acceptProposedContributionInstance));
                 } else {
                     console.log('Accepting big note proposed contribution account with address', proposedContributionKey.toBase58());
                 }
             })



// Reject proposed contribution
    .command('reject-proposed-contribution', 'Reject a big note contribution proposal', {
        proposedContributionPubkey: {
            alias: 'p',
            type: 'string',
            demandOption: true,
            description: 'proposed contribution account pubkey'
        }
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const forumClient: ForumClient = new ForumClient(
                     rpcConn,
                     wallet,
                     ForumIDL,
                     FORUM_PROG_ID,
                 );

                 const proposedContributionKey = new PublicKey(argv.proposedContributionPubkey);

                 if (!argv.dryRun) {
                     const rejectProposedContributionInstance = await forumClient.rejectProposedContribution(
                         proposedContributionKey,
                         wallet.payer,
                     );
                     console.log(stringifyPKsAndBNs(rejectProposedContributionInstance));
                 } else {
                     console.log('Rejecting big note proposed contribution account with address', proposedContributionKey.toBase58());
                 }
             })



// Apply for big note verification
    .command('apply-for-bignote-verification', 'Apply a big note for verification', {
        bigNotePubkey: {
            alias: 'b',
            type: 'string',
            demandOption: true,
            description: 'big note account pubkey'
        }
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const forumClient: ForumClient = new ForumClient(
                     rpcConn,
                     wallet,
                     ForumIDL,
                     FORUM_PROG_ID,
                 );

                 const bigNoteKey = new PublicKey(argv.bigNotePubkey);

                 if (!argv.dryRun) {
                     const applyForBigNoteVerificationInstance = await forumClient.applyForBigNoteVerification(
                         bigNoteKey,
                         wallet.payer,
                     );
                     console.log(stringifyPKsAndBNs(applyForBigNoteVerificationInstance));
                 } else {
                     console.log('Applying for verification for big note account with address', bigNoteKey.toBase58());
                 }
             })



// Delete big note verification application
    .command('delete-bignote-verification-application', 'Delete big note verification application', {
        bigNotePubkey: {
            alias: 'b',
            type: 'string',
            demandOption: true,
            description: 'big note account pubkey'
        }
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const forumClient: ForumClient = new ForumClient(
                     rpcConn,
                     wallet,
                     ForumIDL,
                     FORUM_PROG_ID,
                 );

                 const bigNoteKey = new PublicKey(argv.bigNotePubkey);

                 if (!argv.dryRun) {
                     const deleteBigNoteVerificationApplicationInstance = await forumClient.deleteBigNoteVerificationApplication(
                         bigNoteKey,
                         wallet.payer,
                     );
                     console.log(stringifyPKsAndBNs(deleteBigNoteVerificationApplicationInstance));
                 } else {
                     console.log('Delete verification application for big note account with address', bigNoteKey.toBase58());
                 }
             })



// Delete big note verification application (signer required: moderator)
    .command('delete-bignote-verification-application-moderator', 'Moderator delete big note verification application', {
        bigNotePubkey: {
            alias: 'b',
            type: 'string',
            demandOption: true,
            description: 'big note account pubkey'
        }
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const forumClient: ForumClient = new ForumClient(
                     rpcConn,
                     wallet,
                     ForumIDL,
                     FORUM_PROG_ID,
                 );

                 const bigNoteKey = new PublicKey(argv.bigNotePubkey);

                 if (!argv.dryRun) {
                     const deleteBigNoteVerificationApplicationModeratorInstance = await forumClient.deleteBigNoteVerificationApplicationModerator(
                         bigNoteKey,
                         wallet.payer,
                     );
                     console.log(stringifyPKsAndBNs(deleteBigNoteVerificationApplicationModeratorInstance));
                 } else {
                     console.log('Delete verification application for big note account with address', bigNoteKey.toBase58());
                 }
             })



// -------------------------------------------------- Close Account IX -----------------------------------------------------------



    .command('close-account', 'Close PDA account', {
        accountPubkey: {
            alias: 'k',
            type: 'string',
            demandOption: true,
            description: 'account pubkey'
        }
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const forumClient: ForumClient = new ForumClient(
                     rpcConn,
                     wallet,
                     ForumIDL,
                     FORUM_PROG_ID,
                 );

                 const accountKey: PublicKey = new PublicKey(argv.accountPubkey);

                 if (!argv.dryRun) {

                     const closeAccountInstance = await forumClient.closeAccount(
                         accountKey,
                         wallet.payer,
                     );
                     console.log(stringifyPKsAndBNs(closeAccountInstance));
                 } else {
                     console.log('Closing account with pubkey:', accountKey.toBase58());
                 }
             })



// Close all program accounts
    .command('close-all-accounts', 'Close all PDA accounts', {
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const forumClient: ForumClient = new ForumClient(
                     rpcConn,
                     wallet,
                     ForumIDL,
                     FORUM_PROG_ID,
                 );

                 if (!argv.dryRun) {

                     // Close all big notes
                     console.log('Fetching all big note PDAs');
                     const bigNotePDAs = await forumClient.fetchAllBigNotePDAs();

                     // Loop over all big note PDAs and close each big note PDA account
                     for (let num = 1; num <= bigNotePDAs.length; num++) {
                         const closeAccountInstance = await forumClient.closeAccount(
                             bigNotePDAs[num - 1].publicKey,
                             wallet.payer,
                         );
                         console.log(stringifyPKsAndBNs(closeAccountInstance));
                     }

                     // Close all comments
                     console.log('Fetching all comment PDAs');
                     const commentPDAs = await forumClient.fetchAllCommentPDAs();

                     // Loop over all comment PDAs and close each comment PDA account
                     for (let num = 1; num <= commentPDAs.length; num++) {
                         const closeAccountInstance = await forumClient.closeAccount(
                             commentPDAs[num - 1].publicKey,
                             wallet.payer,
                         );
                         console.log(stringifyPKsAndBNs(closeAccountInstance));
                     }

                     // Close all answers
                     console.log('Fetching all answer PDAs');
                     const answerPDAs = await forumClient.fetchAllAnswerPDAs();

                     // Loop over all answer PDAs and close each answer PDA account
                     for (let num = 1; num <= answerPDAs.length; num++) {
                         const closeAccountInstance = await forumClient.closeAccount(
                             answerPDAs[num - 1].publicKey,
                             wallet.payer,
                         );
                         console.log(stringifyPKsAndBNs(closeAccountInstance));
                     }

                     // Close all questions
                     console.log('Fetching all question PDAs');
                     const questionPDAs = await forumClient.fetchAllQuestionPDAs();

                     // Loop over all question PDAs and close each question PDA account
                     for (let num = 1; num <= questionPDAs.length; num++) {
                         const closeAccountInstance = await forumClient.closeAccount(
                             questionPDAs[num - 1].publicKey,
                             wallet.payer,
                         );
                         console.log(stringifyPKsAndBNs(closeAccountInstance));
                     }

                     // Close all about me's
                     console.log('Fetching all about me PDAs');
                     const aboutMePDAs = await forumClient.fetchAllAboutMePDAs();

                     // Loop over all about me PDAs and close each about me PDA account
                     for (let num = 1; num <= aboutMePDAs.length; num++) {
                         const closeAccountInstance = await forumClient.closeAccount(
                             aboutMePDAs[num - 1].publicKey,
                             wallet.payer,
                         );
                         console.log(stringifyPKsAndBNs(closeAccountInstance));
                     }

                     // Close all user profiles
                     console.log('Fetching all user profile PDAs');
                     const userProfilePDAs = await forumClient.fetchAllUserProfilePDAs();

                     // Loop over all user profile PDAs and close each user profile PDA account
                     for (let num = 1; num <= userProfilePDAs.length; num++) {
                         const closeAccountInstance = await forumClient.closeAccount(
                             userProfilePDAs[num - 1].publicKey,
                             wallet.payer,
                         );
                         console.log(stringifyPKsAndBNs(closeAccountInstance));
                     }

                 } else {
                     console.log('Closing all accounts');
                 }
             })



// -------------------------------------------------- PDA account fetching instructions ------------------------------------------



// Fetch all forum PDAs for a given manager and display their account info
// Pass in manager pubkey or will default to pubkey of keypair path in networkConfig.ts
    .command('fetch-all-forums', 'Fetch all forum PDA accounts info', {
        managerPubkey: {
            alias: 'm',
            type: 'string',
            demandOption: false,
            description: 'forum manager pubkey'
        }
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const forumClient: ForumClient = new ForumClient(
                     rpcConn,
                     wallet,
                     ForumIDL,
                     FORUM_PROG_ID,
                 );

                 if (argv.managerPubkey) {

                     const managerKey: PublicKey = new PublicKey(argv.managerPubkey);

                     if (!argv.dryRun) {
                         console.log('Fetching all forum PDAs for manager with pubkey:', managerKey.toBase58());
                         const forumPDAs = await forumClient.fetchAllForumPDAs(managerKey);

                         // Loop over all PDAs and display account info
                         for (let num = 1; num <= forumPDAs.length; num++) {
                             console.log('Forum account', num, ':');
                             console.dir(stringifyPKsAndBNs(forumPDAs[num - 1]), {depth: null});
                         }

                     } else {
                         console.log('Found a total of n forum PDAs for manager pubkey:', managerKey.toBase58());
                     }
                 } else {
                     if (!argv.dryRun) {
                         console.log('Fetching all forum PDAs');
                         const forumPDAs = await forumClient.fetchAllForumPDAs();

                         // Loop over all PDAs and display account info
                         for (let num = 1; num <= forumPDAs.length; num++) {
                             console.log('Forum account', num, ':');
                             console.dir(stringifyPKsAndBNs(forumPDAs[num - 1]), {depth: null});
                         }

                     } else {
                         console.log('Found a total of n forum PDAs');
                     }
                 }
             })



// Fetch forum PDA by Pubkey
// Forum account pubkey required in command
    .command('fetch-forum-by-key', 'Fetch forum PDA account info by pubkey', {
        forumPubkey: {
            alias: 'k',
            type: 'string',
            demandOption: true,
            description: 'forum account pubkey'
        }
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const forumClient: ForumClient = new ForumClient(
                     rpcConn,
                     wallet,
                     ForumIDL,
                     FORUM_PROG_ID,
                 );

                 const forumKey: PublicKey = new PublicKey(argv.forumPubkey);

                 if (!argv.dryRun) {

                     const forumPDA = await forumClient.fetchForumAccount(forumKey);

                     console.log('Displaying account info for forum with pubkey: ', forumKey.toBase58());
                     console.dir(stringifyPKsAndBNs(forumPDA), {depth: null});

                 } else {
                     console.log('Found forum PDA for pubkey:', forumKey.toBase58());
                 }
             })



// Fetch all user profile PDAs
    .command('fetch-all-profiles', 'Fetch all user profile PDA accounts info', {
        forumPubkey: {
            alias: 'f',
            type: 'string',
            demandOption: false,
            description: 'forum account pubkey'
        }
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const forumClient: ForumClient = new ForumClient(
                     rpcConn,
                     wallet,
                     ForumIDL,
                     FORUM_PROG_ID,
                 );

                 if (argv.forumPubkey) {

                     const forumKey: PublicKey = new PublicKey(argv.forumPubkey);

                     if (!argv.dryRun) {

                         console.log('Fetching all profile PDAs for forum pubkey:', forumKey.toBase58());
                         const profilePDAs = await forumClient.fetchAllUserProfilePDAs(forumKey);

                         // Loop over all PDAs and display account info
                         for (let num = 1; num <= profilePDAs.length; num++) {
                             console.log('User profile account', num, ':');
                             console.dir(stringifyPKsAndBNs(profilePDAs[num - 1]), {depth: null});
                         }

                     } else {
                         console.log('Found n user profile PDA accounts for forum pubkey:', forumKey.toBase58());
                     }

                 } else {

                     if (!argv.dryRun) {

                         console.log('Fetching all profile PDAs');
                         const profilePDAs = await forumClient.fetchAllUserProfilePDAs();

                         // Loop over all PDAs and display account info
                         for (let num = 1; num <= profilePDAs.length; num++) {
                             console.log('User profile account', num, ':');
                             console.dir(stringifyPKsAndBNs(profilePDAs[num - 1]), {depth: null});
                         }

                     } else {
                         console.log('Found n user profile PDA accounts');
                     }
                 }
             })



// Fetch user profile PDA by Owner Pubkey
// User profile account owner pubkey required in command
    .command('fetch-all-profiles-by-owner', 'Fetch user profile PDA account info by owner pubkey', {
        userProfileOwnerPubkey: {
            alias: 'o',
            type: 'string',
            demandOption: true,
            description: 'user profile account owner pubkey'
        }
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const forumClient: ForumClient = new ForumClient(
                     rpcConn,
                     wallet,
                     ForumIDL,
                     FORUM_PROG_ID,
                 );

                 const profileOwnerKey: PublicKey = new PublicKey(argv.userProfileOwnerPubkey);

                 if (!argv.dryRun) {

                     const profilePDAs = await forumClient.fetchAllUserProfilePDAsByProfileOwner(profileOwnerKey);

                     // Loop over all PDAs and display account info
                     for (let num = 1; num <= profilePDAs.length; num++) {
                         console.log('Displaying account info for user profile with owner pubkey: ', profileOwnerKey.toBase58());
                         console.dir(stringifyPKsAndBNs(profilePDAs[num - 1]), {depth: null});
                     }

                 } else {
                     console.log('Found user profile PDA for owner pubkey:', profileOwnerKey.toBase58());
                 }
             })



// Fetch user profile PDA by Pubkey
// User profile account pubkey required in command
    .command('fetch-profile-by-key', 'Fetch user profile PDA account info by pubkey', {
        userProfilePubkey: {
            alias: 'k',
            type: 'string',
            demandOption: true,
            description: 'user profile account pubkey'
        }
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const forumClient: ForumClient = new ForumClient(
                     rpcConn,
                     wallet,
                     ForumIDL,
                     FORUM_PROG_ID,
                 );

                 const profileKey: PublicKey = new PublicKey(argv.userProfilePubkey);

                 if (!argv.dryRun) {

                     const profilePDA = await forumClient.fetchUserProfileAccount(profileKey);

                     console.log('Displaying account info for user profile with pubkey: ', profileKey.toBase58());
                     console.dir(stringifyPKsAndBNs(profilePDA), {depth: null});

                 } else {
                     console.log('Found user profile PDA for pubkey:', profileKey.toBase58());
                 }
             })



// Fetch all user about me PDAs
    .command('fetch-all-about-mes', 'Fetch all user about me PDA accounts program-wide', {
        userProfilePubkey: {
            alias: 'u',
            type: 'string',
            demandOption: false,
            description: 'user profile account pubkey'
        }
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const forumClient: ForumClient = new ForumClient(
                     rpcConn,
                     wallet,
                     ForumIDL,
                     FORUM_PROG_ID,
                 );

                 if (argv.userProfilePubkey) {

                     const userProfileKey: PublicKey = new PublicKey(argv.userProfilePubkey);

                     if (!argv.dryRun) {

                         console.log('Fetching about me PDA for user profile with pubkey: ', userProfileKey.toBase58());
                         const aboutMePDAs = await forumClient.fetchAllAboutMePDAs(userProfileKey);

                         // Loop over all PDAs and display account info
                         for (let num = 1; num <= aboutMePDAs.length; num++) {
                             console.log('About me account', num, ':');
                             console.dir(stringifyPKsAndBNs(aboutMePDAs[num - 1]), {depth: null});
                         }
                     } else {
                         console.log('Found user about me PDA for user profile with pubkey:', userProfileKey.toBase58());
                     }
                 } else {

                     if (!argv.dryRun) {

                         console.log('Fetching all about me PDAs');
                         const aboutMePDAs = await forumClient.fetchAllAboutMePDAs();

                         // Loop over all PDAs and display account info
                         for (let num = 1; num <= aboutMePDAs.length; num++) {
                             console.log('About me account', num, ':');
                             console.dir(stringifyPKsAndBNs(aboutMePDAs[num - 1]), {depth: null});
                         }
                     } else {
                         console.log('Found n user about me PDAs');
                     }
                 }
             })



// Fetch user about me PDA by user profile
// User profile account pubkey required in command
    .command('fetch-about-me-by-profile', 'Fetch user about me PDA account info by pubkey', {
        userProfilePubkey: {
            alias: 'u',
            type: 'string',
            demandOption: true,
            description: 'user profile account pubkey'
        }
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const forumClient: ForumClient = new ForumClient(
                     rpcConn,
                     wallet,
                     ForumIDL,
                     FORUM_PROG_ID,
                 );

                 const userProfileKey: PublicKey = new PublicKey(argv.userProfilePubkey);

                 if (!argv.dryRun) {

                     console.log('Fetching about me PDA for user profile with pubkey: ', userProfileKey.toBase58());
                     const aboutMePDAs = await forumClient.fetchAllAboutMePDAs(userProfileKey);

                     // Loop over all PDAs and display account info
                     for (let num = 1; num <= aboutMePDAs.length; num++) {
                         console.log('About me account', num, ':');
                         console.dir(stringifyPKsAndBNs(aboutMePDAs[num - 1]), {depth: null});
                     }
                 } else {
                     console.log('Found user about me PDA for user profile with pubkey:', userProfileKey.toBase58());
                 }
             })



// Fetch user about me PDA by Pubkey
// User about me account pubkey required in command
    .command('fetch-about-me-by-key', 'Fetch user about me PDA account info by pubkey', {
        aboutMePubkey: {
            alias: 'k',
            type: 'string',
            demandOption: true,
            description: 'user about me account pubkey'
        }
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const forumClient: ForumClient = new ForumClient(
                     rpcConn,
                     wallet,
                     ForumIDL,
                     FORUM_PROG_ID,
                 );

                 const aboutMeKey: PublicKey = new PublicKey(argv.aboutMePubkey);

                 if (!argv.dryRun) {

                     const aboutMePDA = await forumClient.fetchAboutMeAccount(aboutMeKey);

                     console.log('Displaying account info for user about me with pubkey: ', aboutMeKey.toBase58());
                     console.dir(stringifyPKsAndBNs(aboutMePDA), {depth: null});

                 } else {
                     console.log('Found user about me PDA for pubkey:', aboutMeKey.toBase58());
                 }
             })



// Fetch all question PDAs
    .command('fetch-all-questions', 'Fetch all question PDA accounts program-wide', {
        forumPubkey: {
            alias: 'f',
            type: 'string',
            demandOption: false,
            description: 'forum account pubkey'
        }
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const forumClient: ForumClient = new ForumClient(
                     rpcConn,
                     wallet,
                     ForumIDL,
                     FORUM_PROG_ID,
                 );

                 if (argv.forumPubkey) {

                     const forumKey: PublicKey = new PublicKey(argv.forumPubkey);

                     if (!argv.dryRun) {

                         console.log('Fetching all question PDAs for forum pubkey:', forumKey.toBase58());
                         const questionPDAs = await forumClient.fetchAllQuestionPDAs(forumKey);

                         // Loop over all PDAs and display account info
                         for (let num = 1; num <= questionPDAs.length; num++) {
                             console.log('Question account', num, ':');
                             console.dir(stringifyPKsAndBNs(questionPDAs[num - 1]), {depth: null});
                         }
                     } else {
                         console.log('Found n question PDA accounts for forum pubkey:', forumKey.toBase58());
                     }
                 } else {
                     if (!argv.dryRun) {

                         console.log('Fetching all question PDAs');
                         const questionPDAs = await forumClient.fetchAllQuestionPDAs();

                         // Loop over all PDAs and display account info
                         for (let num = 1; num <= questionPDAs.length; num++) {
                             console.log('Question account', num, ':');
                             console.dir(stringifyPKsAndBNs(questionPDAs[num - 1]), {depth: null});
                         }
                     } else {
                         console.log('Found n question PDA accounts');
                     }
                 }
             })



// Fetch all question PDAs for a specific user profile account
    .command('fetch-all-questions-by-profile', 'Fetch all question PDA accounts info for a specific user profile account', {
        userProfilePubkey: {
            alias: 'u',
            type: 'string',
            demandOption: true,
            description: 'user profile account pubkey'
        }
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const forumClient: ForumClient = new ForumClient(
                     rpcConn,
                     wallet,
                     ForumIDL,
                     FORUM_PROG_ID,
                 );

                 const userProfileKey: PublicKey = new PublicKey(argv.userProfilePubkey);

                 if (!argv.dryRun) {

                     console.log('Fetching all question PDAs for user profile with pubkey: ', userProfileKey?.toBase58());
                     const questionPDAs = await forumClient.fetchAllQuestionPDAsByUserProfile(userProfileKey);

                     // Loop over all PDAs and display account info
                     for (let num = 1; num <= questionPDAs.length; num++) {
                         console.log('Question account', num, ':');
                         console.dir(stringifyPKsAndBNs(questionPDAs[num - 1]), {depth: null});
                     }
                 } else {
                     console.log('Found n question PDA accounts for user profile with pubkey: ', userProfileKey.toBase58());
                 }
             })



// Fetch question PDA by Pubkey
// Question account pubkey required in command
    .command('fetch-question-by-key', 'Fetch question PDA account info by pubkey', {
        questionPubkey: {
            alias: 'k',
            type: 'string',
            demandOption: true,
            description: 'question account pubkey'
        }
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const forumClient: ForumClient = new ForumClient(
                     rpcConn,
                     wallet,
                     ForumIDL,
                     FORUM_PROG_ID,
                 );

                 const questionKey: PublicKey = new PublicKey(argv.questionPubkey);

                 if (!argv.dryRun) {

                     const questionPDA = await forumClient.fetchQuestionAccount(questionKey);

                     console.log('Displaying account info for question with pubkey: ', questionKey.toBase58());
                     console.dir(stringifyPKsAndBNs(questionPDA), {depth: null});

                 } else {
                     console.log('Found question PDA for pubkey:', questionKey.toBase58());
                 }
             })



// Fetch all answer PDAs
    .command('fetch-all-answers', 'Fetch all answer PDA accounts program-wide', {
        questionPubkey: {
            alias: 'q',
            type: 'string',
            demandOption: false,
            description: 'question account pubkey'
        }
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const forumClient: ForumClient = new ForumClient(
                     rpcConn,
                     wallet,
                     ForumIDL,
                     FORUM_PROG_ID,
                 );

                 if (argv.questionPubkey) {

                     const questionKey: PublicKey = new PublicKey(argv.questionPubkey);

                     if (!argv.dryRun) {

                         console.log('Fetching all answer PDAs for question with pubkey:', questionKey.toBase58());
                         const answerPDAs = await forumClient.fetchAllAnswerPDAs(questionKey);

                         // Loop over all PDAs and display account info
                         for (let num = 1; num <= answerPDAs.length; num++) {
                             console.log('Answer account', num, ':');
                             console.dir(stringifyPKsAndBNs(answerPDAs[num - 1]), {depth: null});
                         }

                     } else {
                         console.log('Found n answer PDA accounts for question with pubkey:', questionKey.toBase58());
                     }
                 } else {

                     if (!argv.dryRun) {

                         console.log('Fetching all answer PDAs');
                         const answerPDAs = await forumClient.fetchAllAnswerPDAs();

                         // Loop over all PDAs and display account info
                         for (let num = 1; num <= answerPDAs.length; num++) {
                             console.log('Answer account', num, ':');
                             console.dir(stringifyPKsAndBNs(answerPDAs[num - 1]), {depth: null});
                         }

                     } else {
                         console.log('Found n answer PDA accounts ');
                     }
                 }
             })



// Fetch all answer PDAs for a specific user profile account
    .command('fetch-all-answers-by-profile', 'Fetch all answer PDA accounts info for a specific user profile', {
        userProfilePubkey: {
            alias: 'u',
            type: 'string',
            demandOption: true,
            description: 'user profile account pubkey'
        }
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const forumClient: ForumClient = new ForumClient(
                     rpcConn,
                     wallet,
                     ForumIDL,
                     FORUM_PROG_ID,
                 );

                 const userProfileKey: PublicKey = new PublicKey(argv.userProfilePubkey);

                 if (!argv.dryRun) {

                     console.log('Fetching all answer PDAs for user profile with pubkey: ', userProfileKey.toBase58());
                     const answerPDAs = await forumClient.fetchAllAnswerPDAsByUserProfile(userProfileKey);

                     // Loop over all PDAs and display account info
                     for (let num = 1; num <= answerPDAs.length; num++) {
                         console.log('Answer account', num, ':');
                         console.dir(stringifyPKsAndBNs(answerPDAs[num - 1]), {depth: null});
                     }

                 } else {
                     console.log('Found n answer PDA accounts for user profile with pubkey: ', userProfileKey.toBase58());
                 }
             })



// Fetch answer PDA by Pubkey
// Answer account pubkey required in command
    .command('fetch-answer-by-key', 'Fetch answer PDA account info by pubkey', {
        answerPubkey: {
            alias: 'k',
            type: 'string',
            demandOption: true,
            description: 'answer account pubkey'
        }
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const forumClient: ForumClient = new ForumClient(
                     rpcConn,
                     wallet,
                     ForumIDL,
                     FORUM_PROG_ID,
                 );

                 const answerKey: PublicKey = new PublicKey(argv.answerPubkey);

                 if (!argv.dryRun) {

                     const answerPDA = await forumClient.fetchAnswerAccount(answerKey);

                     console.log('Displaying account info for answer with pubkey: ', answerKey.toBase58());
                     console.dir(stringifyPKsAndBNs(answerPDA), {depth: null});

                 } else {
                     console.log('Found answer PDA for pubkey:', answerKey.toBase58());
                 }
             })



// Fetch all comment PDAs
    .command('fetch-all-comments', 'Fetch all comment PDA accounts program-wide', {
        accountPubkey: {
            alias: 'l',
            type: 'string',
            demandOption: false,
            description: 'account commented on pubkey (must be question or answer account)'
        }
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const forumClient: ForumClient = new ForumClient(
                     rpcConn,
                     wallet,
                     ForumIDL,
                     FORUM_PROG_ID,
                 );

                 if (argv.accountPubkey) {

                     const accountKey: PublicKey = new PublicKey(argv.accountPubkey);

                     if (!argv.dryRun) {

                         console.log('Fetching all comment PDAs for account commented on with pubkey: ', accountKey.toBase58());
                         const commentPDAs = await forumClient.fetchAllCommentPDAs(accountKey);

                         // Loop over all PDAs and display account info
                         for (let num = 1; num <= commentPDAs.length; num++) {
                             console.log('Comment account', num, ':');
                             console.dir(stringifyPKsAndBNs(commentPDAs[num - 1]), {depth: null});
                         }

                     } else {
                         console.log('Found n comment PDA accounts for account commented on with pubkey: ', accountKey.toBase58());
                     }
                 } else {

                     if (!argv.dryRun) {

                         console.log('Fetching all comment PDAs');
                         const commentPDAs = await forumClient.fetchAllCommentPDAs();

                         // Loop over all PDAs and display account info
                         for (let num = 1; num <= commentPDAs.length; num++) {
                             console.log('Comment account', num, ':');
                             console.dir(stringifyPKsAndBNs(commentPDAs[num - 1]), {depth: null});
                         }

                     } else {
                         console.log('Found n comment PDA accounts');
                     }
                 }
             })



// Fetch all comment PDAs by user profile
    .command('fetch-all-comments-by-profile', 'Fetch all comment PDA accounts info for a specific user profile', {
        userProfilePubkey: {
            alias: 'u',
            type: 'string',
            demandOption: true,
            description: 'user profile account pubkey'
        }
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const forumClient: ForumClient = new ForumClient(
                     rpcConn,
                     wallet,
                     ForumIDL,
                     FORUM_PROG_ID,
                 );

                 const userProfileKey: PublicKey = new PublicKey(argv.userProfilePubkey);

                 if (!argv.dryRun) {

                     console.log('Fetching all comment PDAs for user profile with pubkey: ', userProfileKey.toBase58());
                     const commentPDAs = await forumClient.fetchAllCommentPDAsByUserProfile(userProfileKey);

                     // Loop over all PDAs and display account info
                     for (let num = 1; num <= commentPDAs.length; num++) {
                         console.log('Comment account', num, ':');
                         console.dir(stringifyPKsAndBNs(commentPDAs[num - 1]), {depth: null});
                     }

                 } else {
                     console.log('Found n comment PDA accounts for user profile with pubkey: ', userProfileKey.toBase58());
                 }
             })



// Fetch comment PDA by Pubkey
// Comment account pubkey required in command
    .command('fetch-comment-by-key', 'Fetch comment PDA account info by pubkey', {
        commentPubkey: {
            alias: 'k',
            type: 'string',
            demandOption: true,
            description: 'comment account pubkey'
        }
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const forumClient: ForumClient = new ForumClient(
                     rpcConn,
                     wallet,
                     ForumIDL,
                     FORUM_PROG_ID,
                 );

                 const commentKey: PublicKey = new PublicKey(argv.commentPubkey);

                 if (!argv.dryRun) {

                     const commentPDA = await forumClient.fetchCommentAccount(commentKey);

                     console.log('Displaying account info for comment with pubkey: ', commentKey.toBase58());
                     console.dir(stringifyPKsAndBNs(commentPDA), {depth: null});

                 } else {
                     console.log('Found comment PDA for pubkey:', commentKey.toBase58());
                 }
             })



// Fetch question stack by question account pubkey
// Question account pubkey required in command
    .command('fetch-question-stack', 'Fetch question stack by pubkey', {
        questionPubkey: {
            alias: 'q',
            type: 'string',
            demandOption: true,
            description: 'question account pubkey'
        }
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const forumClient: ForumClient = new ForumClient(
                     rpcConn,
                     wallet,
                     ForumIDL,
                     FORUM_PROG_ID,
                 );

                 const questionKey: PublicKey = new PublicKey(argv.questionPubkey);

                 if (!argv.dryRun) {

                     // Fetch and display the question PDA
                     const questionPDA = await forumClient.fetchQuestionAccount(questionKey);

                     console.log('Displaying stack for question with pubkey: ', questionKey.toBase58());
                     console.dir(stringifyPKsAndBNs(questionPDA), {depth: null});

                     // Fetch all comment PDAs on the question
                     const commentOnQuestionPDAs = await forumClient.fetchAllCommentPDAs(questionKey);

                     // Loop over all comment PDAs and display account info
                     for (let num = 1; num <= commentOnQuestionPDAs.length; num++) {
                         console.log('Comment account', num, ':');
                         console.dir(stringifyPKsAndBNs(commentOnQuestionPDAs[num - 1]), {depth: null});
                     }

                     // Fetch all answer PDAs
                     const answerPDAs = await forumClient.fetchAllAnswerPDAs(questionKey);
                     const answersLength = answerPDAs.length;

                     // Loop over all answer PDAs and display account info
                     for (let num = 1; num <= answersLength; num++) {

                         // Display answer PDA account info
                         console.log('Answer account', num, ':');
                         console.dir(stringifyPKsAndBNs(answerPDAs[answersLength - num]), {depth: null});

                         // Fetch all comment PDAs on the answer
                         const commentsOnAnswerPDAs = await forumClient.fetchAllCommentPDAs(answerPDAs[answersLength - num].publicKey);
                         const commentsLength = commentsOnAnswerPDAs.length;

                         // Display all comment PDAs on the answer
                         for (let int = 1; int <= commentsLength; int++) {
                             console.log('Comment account', int, ':');
                             console.dir(stringifyPKsAndBNs(commentsOnAnswerPDAs[commentsLength - int]), {depth: null});
                         }
                     }

                 } else {
                     console.log('Found question stack for question PDA with pubkey:', questionKey.toBase58());
                 }
             })



// Fetch all big note PDAs
    .command('fetch-all-bignotes', 'Fetch all big note PDA accounts info program-wide', {
        forumPubkey: {
            alias: 'f',
            type: 'string',
            demandOption: false,
            description: 'forum account pubkey'
        }
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const forumClient: ForumClient = new ForumClient(
                     rpcConn,
                     wallet,
                     ForumIDL,
                     FORUM_PROG_ID,
                 );

                 if (argv.forumPubkey) {

                     const forumKey: PublicKey = new PublicKey(argv.forumPubkey);

                     if (!argv.dryRun) {

                         console.log('Fetching all big note PDAs for forum pubkey:', forumKey.toBase58());
                         const bigNotePDAs = await forumClient.fetchAllBigNotePDAs(forumKey);

                         // Loop over all PDAs and display account info
                         for (let num = 1; num <= bigNotePDAs.length; num++) {
                             console.log('Big note account', num, ':');
                             console.dir(stringifyPKsAndBNs(bigNotePDAs[num - 1]), {depth: null});
                         }

                     } else {
                         console.log('Found n big note PDA accounts for forum pubkey:', forumKey.toBase58());
                     }
                 } else {
                     if (!argv.dryRun) {

                         console.log('Fetching all big note PDAs');
                         const bigNotePDAs = await forumClient.fetchAllBigNotePDAs();

                         // Loop over all PDAs and display account info
                         for (let num = 1; num <= bigNotePDAs.length; num++) {
                             console.log('Big note account', num, ':');
                             console.dir(stringifyPKsAndBNs(bigNotePDAs[num - 1]), {depth: null});
                         }

                     } else {
                         console.log('Found n big note PDA accounts');
                     }
                 }
             })



// Fetch all big note PDAs for a specific user profile account
    .command('fetch-all-bignotes-by-profile', 'Fetch all big note PDA accounts info', {
        userProfilePubkey: {
            alias: 'u',
            type: 'string',
            demandOption: true,
            description: 'user profile account pubkey'
        }
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const forumClient: ForumClient = new ForumClient(
                     rpcConn,
                     wallet,
                     ForumIDL,
                     FORUM_PROG_ID,
                 );

                 const userProfileKey: PublicKey = new PublicKey(argv.userProfilePubkey);

                 if (!argv.dryRun) {

                     console.log('Fetching all big note PDAs for user profile with pubkey: ', userProfileKey.toBase58());
                     const bigNotePDAs = await forumClient.fetchAllBigNotePDAsByUserProfile(userProfileKey);

                     // Loop over all PDAs and display account info
                     for (let num = 1; num <= bigNotePDAs.length; num++) {
                         console.log('Big note account', num, ':');
                         console.dir(stringifyPKsAndBNs(bigNotePDAs[num - 1]), {depth: null});
                     }

                 } else {
                     console.log('Found n big note PDA accounts for user profile with pubkey: ', userProfileKey.toBase58());
                 }
             })



// Fetch big note PDA by Pubkey
// Big note account pubkey required in command
    .command('fetch-bignote-by-key', 'Fetch big note PDA account info by pubkey', {
        bigNotePubkey: {
            alias: 'k',
            type: 'string',
            demandOption: true,
            description: 'big note account pubkey'
        }
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const forumClient: ForumClient = new ForumClient(
                     rpcConn,
                     wallet,
                     ForumIDL,
                     FORUM_PROG_ID,
                 );

                 const bigNoteKey: PublicKey = new PublicKey(argv.bigNotePubkey);

                 if (!argv.dryRun) {

                     const bigNotePDA = await forumClient.fetchBigNoteAccount(bigNoteKey);

                     console.log('Displaying account info for big note with pubkey: ', bigNoteKey.toBase58());
                     console.dir(stringifyPKsAndBNs(bigNotePDA), {depth: null});

                 } else {
                     console.log('Found big note PDA for pubkey:', bigNoteKey.toBase58());
                 }
             })



// Fetch forum authority PDA
// Forum account pubkey required in command
    .command('fetch-forum-auth', 'Fetch forum authority PDA pubkey', {
        forumPubkey: {
            alias: 'f',
            type: 'string',
            demandOption: true,
            description: 'forum account pubkey'
        }
    },
             async (argv) => {

                 const forumKey: PublicKey = new PublicKey(argv.forumPubkey);

                 if (!argv.dryRun) {

                     const [forumAuthKey, _forumAuthKeyBump] = await findForumAuthorityPDA(forumKey);

                     console.log('Forum authority key is: ', forumAuthKey.toBase58());

                 } else {
                     console.log('Found forum authority key for forum account with pubkey: ', forumKey.toBase58());
                 }
             })



// Fetch treasury balance
// Forum account pubkey required in command
    .command('fetch-treasury-balance', 'Fetch forum account treasury balance', {
        forumPubkey: {
            alias: 'f',
            type: 'string',
            demandOption: true,
            description: 'forum account pubkey'
        },
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const forumClient: ForumClient = new ForumClient(
                     rpcConn,
                     wallet,
                     ForumIDL,
                     FORUM_PROG_ID,
                 );

                 const forumKey: PublicKey = new PublicKey(argv.forumPubkey);

                 if (!argv.dryRun) {

                     const treasuryBalance = await forumClient.fetchTreasuryBalance(forumKey);

                     console.log('Displaying treasury balance for forum account with pubkey: ', forumKey.toBase58());
                     console.log(stringifyPKsAndBNs(treasuryBalance));

                 } else {
                     console.log('Found treasury balance for forum account with pubkey:', forumKey.toBase58());
                 }
             })



// Fetch bounty pda account
// Question account pubkey required in command
    .command('fetch-question-bounty-pda', 'Fetch bounty PDA account', {
        questionPubkey: {
            alias: 'q',
            type: 'string',
            demandOption: true,
            description: 'question account pubkey'
        },
    },
             async (argv) => {
                 const questionKey: PublicKey = new PublicKey(argv.questionPubkey);

                 if (!argv.dryRun) {

                     const bountyPda = await findQuestionBountyPDA(questionKey);

                     console.log('Displaying bounty pda account for question with pubkey: ', questionKey.toBase58());
                     console.log(stringifyPKsAndBNs(bountyPda));

                 } else {
                     console.log('Found bounty pda account for question account with pubkey:', questionKey.toBase58());
                 }
             })



// Fetch bounty pda account balance
// Question account pubkey required in command
    .command('fetch-question-bounty-pda-balance', 'Fetch bounty PDA account balance', {
        questionPubkey: {
            alias: 'q',
            type: 'string',
            demandOption: true,
            description: 'question account pubkey'
        },
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const forumClient: ForumClient = new ForumClient(
                     rpcConn,
                     wallet,
                     ForumIDL,
                     FORUM_PROG_ID,
                 );

                 const questionKey: PublicKey = new PublicKey(argv.questionPubkey);

                 if (!argv.dryRun) {

                     const bountyPdaBalance = await forumClient.fetchQuestionBountyPDABalance(questionKey);

                     console.log('Displaying bounty pda balance for question account with pubkey: ', questionKey.toBase58());
                     console.log(stringifyPKsAndBNs(bountyPdaBalance));

                 } else {
                     console.log('Found bounty pda balance for question account with pubkey:', questionKey.toBase58());
                 }
             })



































// ------------------------------------------------ misc ----------------------------------------------------------
    .usage('Usage: $0 [-d] -c [config_file] <command> <options>')
    .help();



async function loadWallet(fileName: string): Promise<Keypair> {
    let walletBytes = JSON.parse((await fs.readFile(fileName)).toString());
    let privKeyBytes = walletBytes.slice(0,32);
    let keypair = Keypair.fromSeed(Uint8Array.from(privKeyBytes));
    return keypair
}



// Let's go!
(async() => {
    await parser.argv;
    process.exit();
})();
