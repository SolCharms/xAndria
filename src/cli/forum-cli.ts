import { ForumClient } from '../forum';
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
// import * as SPLToken from "@solana/spl-token";
import { default as fs } from 'fs/promises';
import { default as yargs } from 'yargs';
import * as anchor from '@coral-xyz/anchor';
import { IDL as ForumIDL } from '../types/forum';
import { FORUM_PROG_ID } from '../index';
import { stringifyPKsAndBNs } from '../prog-common';
import { findBountyPDA, findForumAuthorityPDA } from '../forum/forum.pda';
import { ForumFees, ReputationMatrix } from '../forum/forum.client';
import { hash } from 'blake3';

import { networkConfig } from "../cli/config_devnet/networkConfig-devnet";
import { forumConfig } from "../cli/config_devnet/forumConfig-devnet";
import { aboutMeConfig } from "../cli/config_devnet/aboutMeConfig-devnet";
import { questionConfig } from "../cli/config_devnet/questionConfig-devnet";
import { answerConfig } from "../cli/config_devnet/answerConfig-devnet";
import { commentConfig } from "../cli/config_devnet/commentConfig-devnet";
import { bigNoteConfig } from "../cli/config_devnet/bigNoteConfig-devnet";

// ----------------------------------------------- Legend ---------------------------------------------------------

// -a answer account address (answer)
// -b big note account address (big note)
// -c comment account address (comment)
// -d destination (token) account address (destination)
// -f forum account address (forum)
// -k pubkey of account being fetched (key)
// -l account comment was left on (left)
// -m forum manager account address (manager)
// -o user profile owner address (owner)
// -p user profile account address (profile)
// -q question account address (question)
// -r receiver account address (receiver)
// -s token account address (spl-token)
// -t token mint address (minT)
// -u unix timestamp (unix)
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



// --------------------------------------------- forum manager instructions ---------------------------------------------



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
                 const reputationMatrix: ReputationMatrix = forumConfig.reputationMatrix;

                 if (!argv.dryRun) {
                     const forumInstance = await forumClient.initForum(
                         forum,
                         wallet.payer,
                         forumFees,
                         reputationMatrix,
                     );
                     console.log(stringifyPKsAndBNs(forumInstance));
                 } else {
                     console.log('Initializing forum account with account pubkey', stringifyPKsAndBNs(forum));
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
                 const reputationMatrix: ReputationMatrix = forumConfig.reputationMatrix;

                 if (!argv.dryRun) {
                     const updateForumParamsInstance = await forumClient.updateForumParams(
                         forumKey,
                         wallet.payer,
                         forumFees,
                         reputationMatrix,
                     );
                     console.log(stringifyPKsAndBNs(updateForumParamsInstance));
                 } else {
                     console.log('Updating forum parameters of forum account with pubkey', forumKey.toBase58());
                 }
             })



// Payout from treasury
    .command('payout-from-treasury', 'Payout from treasury', {
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

                 const rentBytes: number = 16;

                 const forumKey = new PublicKey(argv.forumPubkey);
                 const receiverKey: PublicKey = argv.receiverPubkey? new PublicKey(argv.receiverPubkey) : wallet.publicKey;
                 const minimumBalanceForRentExemption: anchor.BN = new anchor.BN(await rpcConn.getMinimumBalanceForRentExemption(rentBytes));

                 console.log('Minimum balance for rent exemption for a data size of', rentBytes,
                             'bytes is: ', stringifyPKsAndBNs(minimumBalanceForRentExemption));

                 if (!argv.dryRun) {
                     const payoutInstance = await forumClient.payoutFromTreasury(
                         forumKey,
                         wallet.payer,
                         receiverKey,
                         minimumBalanceForRentExemption
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



// ---------------------------------------------- user profile instructions ------------------------------------------



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
                     console.log('Creating user about me account for user profile account with wallet address', stringifyPKsAndBNs(wallet.publicKey));
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
                     console.log('Editing a user about me account for user profile account with wallet address', stringifyPKsAndBNs(wallet.publicKey));
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
                     console.log('Deleting a user about me account for user profile account with wallet address', stringifyPKsAndBNs(wallet.publicKey));
                 }
             })



// ---------------------------------------------- adding/removing moderator privilege instructions ------------------------------------------



// Add moderator privilege to a user profile account
    .command('add-moderator', 'Add moderator privilege to a user profile account', {
        forumPubkey: {
            alias: 'f',
            type: 'string',
            demandOption: true,
            description: 'forum account pubkey'
        },
        userProfilePubkey: {
            alias: 'p',
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

                 const forumKey = new PublicKey(argv.forumPubkey);
                 const userProfileKey = new PublicKey(argv.userProfilePubkey);
                 const userProfileAcct = await forumClient.fetchUserProfileAccount(userProfileKey);
                 const profileOwnerKey = userProfileAcct.profileOwner;

                 if (!argv.dryRun) {
                     const addModeratorInstance = await forumClient.addModerator(
                         forumKey,
                         wallet.payer,
                         profileOwnerKey
                     );
                     console.log(stringifyPKsAndBNs(addModeratorInstance));
                 } else {
                     console.log('Adding moderator privilege to user profile account with address', userProfileKey.toBase58());
                 }
             })



// Remove moderator privilege from a user profile account
    .command('remove-moderator', 'Remove moderator privilege from a user profile account', {
        forumPubkey: {
            alias: 'f',
            type: 'string',
            demandOption: true,
            description: 'forum account pubkey'
        },
        userProfilePubkey: {
            alias: 'p',
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

                 const forumKey = new PublicKey(argv.forumPubkey);
                 const userProfileKey = new PublicKey(argv.userProfilePubkey);
                 const userProfileAcct = await forumClient.fetchUserProfileAccount(userProfileKey);
                 const profileOwnerKey = userProfileAcct.profileOwner;

                 if (!argv.dryRun) {
                     const removeModeratorInstance = await forumClient.removeModerator(
                         forumKey,
                         wallet.payer,
                         profileOwnerKey
                     );
                     console.log(stringifyPKsAndBNs(removeModeratorInstance));
                 } else {
                     console.log('Removing moderator privilege from user profile account with address', userProfileKey.toBase58());
                 }
             })



// -------------------------------------------------- user interaction instructions ------------------------------------------



// Ask question
// Must config question parameters in questionConfig
    .command('ask-question', 'Ask question', {
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
                 const title: string = questionConfig.title;
                 const tags = questionConfig.tags;
                 const bountyAmount: anchor.BN = questionConfig.bountyAmount;

                 const contentString: string = questionConfig.content;
                 const hashResult = hash(contentString);
                 const contentDataHash: PublicKey = new PublicKey(hashResult);

                 if (!argv.dryRun) {
                     const questionInstance = await forumClient.askQuestion(
                         forumKey,
                         wallet.payer,
                         contentDataHash,
                         title,
                         tags,
                         bountyAmount
                     );
                     console.log(stringifyPKsAndBNs(questionInstance));
                 } else {
                     console.log('Asking question for user profile with wallet pubkey', stringifyPKsAndBNs(wallet.publicKey));
                 }
             })



// Edit question
// Must config question parameters in questionConfig
    .command('edit-question', 'Edit question', {
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

                 const forumKey: PublicKey = questionConfig.forum;
                 const newTitle: string = questionConfig.title;
                 const newTags = questionConfig.tags;

                 const newContentString: string = questionConfig.content;
                 const hashResult = hash(newContentString);
                 const newContentDataHash: PublicKey = new PublicKey(hashResult);

                 const questionKey = new PublicKey(argv.questionPubkey);
                 const questionAcct = await forumClient.fetchQuestionAccount(questionKey);
                 const questionSeed = questionAcct.questionSeed;

                 if (!argv.dryRun) {
                     const editQuestionInstance = await forumClient.editQuestion(
                         forumKey,
                         wallet.payer,
                         questionSeed,
                         newContentDataHash,
                         newTitle,
                         newTags,
                     );
                     console.log(stringifyPKsAndBNs(editQuestionInstance));
                 } else {
                     console.log('Editing question with account address', questionKey.toBase58());
                 }
             })



// Delete question (signer required: moderator)
    .command('delete-question', 'Delete question', {
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

                 const receiverKey: PublicKey = argv.receiverPubkey ? new PublicKey(argv.receiverPubkey) : wallet.publicKey;

                 const questionKey = new PublicKey(argv.questionPubkey);
                 const questionAcct = await forumClient.fetchQuestionAccount(questionKey);
                 const questionSeed = questionAcct.questionSeed;
                 const forumKey = questionAcct.forum;
                 const userProfileKey = questionAcct.userProfile;

                 const userProfileAcct = await forumClient.fetchUserProfileAccount(userProfileKey);
                 const profileOwnerKey = userProfileAcct.profileOwner;

                 if (!argv.dryRun) {
                     const deleteQuestionInstance = await forumClient.deleteQuestion(
                         forumKey,
                         wallet.payer,
                         profileOwnerKey,
                         questionSeed,
                         receiverKey
                     );
                     console.log(stringifyPKsAndBNs(deleteQuestionInstance));
                 } else {
                     console.log('Deleting question with account address', questionKey.toBase58());
                 }
             })



// Supplement question bounty (signer required: moderator)
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

                 const supplementalBountyAmount = new anchor.BN(argv.supplementalBountyAmount);

                 const questionKey = new PublicKey(argv.questionPubkey);
                 const questionAcct = await forumClient.fetchQuestionAccount(questionKey);
                 const questionSeed = questionAcct.questionSeed;
                 const forumKey = questionAcct.forum;
                 const userProfileKey = questionAcct.userProfile;

                 const userProfileAcct = await forumClient.fetchUserProfileAccount(userProfileKey);
                 const profileOwnerKey = userProfileAcct.profileOwner;

                 if (!argv.dryRun) {
                     const supplementQuestionBountyInstance = await forumClient.supplementQuestionBounty(
                         forumKey,
                         wallet.payer,
                         profileOwnerKey,
                         questionSeed,
                         supplementalBountyAmount,
                     );
                     console.log(stringifyPKsAndBNs(supplementQuestionBountyInstance));
                 } else {
                     console.log('Deleting question with account address', questionKey.toBase58());
                 }
             })



// Accept answer
    .command('accept-answer', 'Accept answer', {
        questionPubkey: {
            alias: 'q',
            type: 'string',
            demandOption: true,
            description: 'question account pubkey'
        },
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

                 const receiverKey: PublicKey = argv.receiverPubkey ? new PublicKey(argv.receiverPubkey) : wallet.publicKey;

                 const questionKey = new PublicKey(argv.questionPubkey);
                 const questionAcct = await forumClient.fetchQuestionAccount(questionKey);
                 const questionSeed = questionAcct.questionSeed;
                 const forumKey = questionAcct.forum;

                 const answerKey = new PublicKey(argv.answerPubkey);
                 const answerAcct = await forumClient.fetchAnswerAccount(answerKey);
                 const answerSeed = answerAcct.answerSeed;
                 const answerUserProfile = answerAcct.userProfile;

                 const answerUserProfileAcct = await forumClient.fetchUserProfileAccount(answerUserProfile);
                 const answerProfileOwnerKey = answerUserProfileAcct.profileOwner;

                 // const rentBytes: number = 8;
                 // const minimumBalanceForRentExemption: anchor.BN = new anchor.BN(await rpcConn.getMinimumBalanceForRentExemption(rentBytes));

                 if (!argv.dryRun) {
                     const acceptAnswerInstance = await forumClient.acceptAnswer(
                         forumKey,
                         wallet.payer,
                         answerProfileOwnerKey,
                         questionSeed,
                         answerSeed,
                         receiverKey,
                     );
                     console.log(stringifyPKsAndBNs(acceptAnswerInstance));
                 } else {
                     console.log('Accepting answer with account address', answerKey.toBase58());
                 }
             })



// Answer Question
// Must config answer parameters in answerConfig
    .command('answer-question', 'Answer question', {
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

                 const forumKey: PublicKey = answerConfig.forum;
                 const questionKey: PublicKey = answerConfig.question;

                 const contentString: string = answerConfig.content;
                 const hashResult = hash(contentString);
                 const contentDataHash: PublicKey = new PublicKey(hashResult);

                 if (!argv.dryRun) {
                     const answerInstance = await forumClient.answerQuestion(
                         forumKey,
                         questionKey,
                         wallet.payer,
                         contentDataHash,
                     );
                     console.log(stringifyPKsAndBNs(answerInstance));
                 } else {
                     console.log('Answering question with account address', stringifyPKsAndBNs(questionKey));
                 }
             })



// Edit answer
// Must config answer parameters in answerConfig
    .command('edit-answer', 'Edit answer', {
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
                 const answerAcct = await forumClient.fetchAnswerAccount(answerKey);
                 const answerSeed = answerAcct.answerSeed;

                 const questionKey: PublicKey = answerAcct.question;
                 const questionAcct = await forumClient.fetchQuestionAccount(questionKey);
                 const forumKey = questionAcct.forum;

                 const newContentString: string = answerConfig.content;
                 const hashResult = hash(newContentString);
                 const newContentDataHash: PublicKey = new PublicKey(hashResult);

                 if (!argv.dryRun) {
                     const editAnswerInstance = await forumClient.editAnswer(
                         forumKey,
                         wallet.payer,
                         answerSeed,
                         newContentDataHash
                     );
                     console.log(stringifyPKsAndBNs(editAnswerInstance));
                 } else {
                     console.log('Editing answer with account address', stringifyPKsAndBNs(answerKey));
                 }
             })



// Delete answer (signer required: moderator)
    .command('delete-answer', 'Delete answer', {
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

                 const receiverKey: PublicKey = argv.receiverPubkey ? new PublicKey(argv.receiverPubkey) : wallet.publicKey;

                 const answerKey = new PublicKey(argv.answerPubkey);
                 const answerAcct = await forumClient.fetchAnswerAccount(answerKey);
                 const answerSeed = answerAcct.answerSeed;
                 const userProfileKey = answerAcct.userProfile;

                 const questionKey: PublicKey = answerAcct.question;
                 const questionAcct = await forumClient.fetchQuestionAccount(questionKey);
                 const forumKey = questionAcct.forum;

                 const userProfileAcct = await forumClient.fetchUserProfileAccount(userProfileKey);
                 const profileOwnerKey = userProfileAcct.profileOwner;

                 if (!argv.dryRun) {
                     const deleteAnswerInstance = await forumClient.deleteAnswer(
                         forumKey,
                         wallet.payer,
                         profileOwnerKey,
                         answerSeed,
                         receiverKey
                     );
                     console.log(stringifyPKsAndBNs(deleteAnswerInstance));
                 } else {
                     console.log('Deleting answer with account address', answerKey.toBase58());
                 }
             })



// Leave Comment
// Must config comment parameters in commentConfig
    .command('leave-comment', 'Leave comment', {
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

                 const commentedOnKey: PublicKey = commentConfig.commentedOn;
                 const forumKey: PublicKey = commentConfig.forum;

                 const contentString: string = commentConfig.content;
                 const hashResult = hash(contentString);
                 const contentDataHash: PublicKey = new PublicKey(hashResult);

                 if (!argv.dryRun) {
                     const commentInstance = await forumClient.leaveComment(
                         forumKey,
                         wallet.payer,
                         commentedOnKey,
                         contentDataHash,
                     );
                     console.log(stringifyPKsAndBNs(commentInstance));
                 } else {
                     console.log('Leaving comment on account with address', stringifyPKsAndBNs(commentedOnKey));
                 }
             })



// Edit comment
// Must config comment parameters in commentConfig
    .command('edit-comment', 'Edit comment', {
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
                 const commentAcct = await forumClient.fetchCommentAccount(commentKey);
                 const forumKey = commentAcct.forum;
                 const commentSeed = commentAcct.commentSeed;

                 const newContentString: string = commentConfig.content;
                 const hashResult = hash(newContentString);
                 const newContentDataHash: PublicKey = new PublicKey(hashResult);

                 if (!argv.dryRun) {
                     const editCommentInstance = await forumClient.editComment(
                         forumKey,
                         wallet.payer,
                         commentSeed,
                         newContentDataHash,
                     );
                     console.log(stringifyPKsAndBNs(editCommentInstance));
                 } else {
                     console.log('Editing comment with account address', stringifyPKsAndBNs(commentKey));
                 }
             })



// Delete comment (signer required: moderator)
    .command('delete-comment', 'Delete comment', {
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

                 const receiverKey: PublicKey = argv.receiverPubkey ? new PublicKey(argv.receiverPubkey) : wallet.publicKey;

                 const commentKey = new PublicKey(argv.commentPubkey);
                 const commentAcct = await forumClient.fetchCommentAccount(commentKey);
                 const forumKey = commentAcct.forum;
                 const commentSeed = commentAcct.commentSeed;
                 const userProfileKey = commentAcct.userProfile;

                 const userProfileAcct = await forumClient.fetchUserProfileAccount(userProfileKey);
                 const profileOwnerKey = userProfileAcct.profileOwner;

                 if (!argv.dryRun) {
                     const deleteCommentInstance = await forumClient.deleteComment(
                         forumKey,
                         wallet.payer,
                         profileOwnerKey,
                         commentSeed,
                         receiverKey
                     );
                     console.log(stringifyPKsAndBNs(deleteCommentInstance));
                 } else {
                     console.log('Deleting comment with account address', commentKey.toBase58());
                 }
             })



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
                 const title: string = bigNoteConfig.title;
                 const tags = bigNoteConfig.tags;

                 const contentString: string = bigNoteConfig.content;
                 const hashResult = hash(contentString);
                 const contentDataHash: PublicKey = new PublicKey(hashResult);

                 if (!argv.dryRun) {
                     const bigNoteInstance = await forumClient.createBigNote(
                         forumKey,
                         wallet.payer,
                         contentDataHash,
                         title,
                         tags,
                     );
                     console.log(stringifyPKsAndBNs(bigNoteInstance));
                 } else {
                     console.log('Creating big note for user profile with wallet pubkey', stringifyPKsAndBNs(wallet.publicKey));
                 }
             })



// Edit big note
// Must config big note parameters in bigNoteConfig
    .command('edit-big-note', 'Edit big note', {
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

                 const forumKey: PublicKey = bigNoteConfig.forum;
                 const newTitle: string = bigNoteConfig.title;
                 const newTags = bigNoteConfig.tags;

                 const newContentString: string = bigNoteConfig.content;
                 const hashResult = hash(newContentString);
                 const newContentDataHash: PublicKey = new PublicKey(hashResult);

                 const bigNoteKey = new PublicKey(argv.bigNotePubkey);
                 const bigNoteAcct = await forumClient.fetchBigNoteAccount(bigNoteKey);
                 const bigNoteSeed = bigNoteAcct.bigNoteSeed;

                 if (!argv.dryRun) {
                     const editBigNoteInstance = await forumClient.editBigNote(
                         forumKey,
                         wallet.payer,
                         bigNoteSeed,
                         newContentDataHash,
                         newTitle,
                         newTags,
                     );
                     console.log(stringifyPKsAndBNs(editBigNoteInstance));
                 } else {
                     console.log('Editing big note with account address', bigNoteKey.toBase58());
                 }
             })



// Delete big note (signer required: moderator)
    .command('delete-bignote', 'Delete big note', {
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

                 const forumKey: PublicKey = bigNoteConfig.forum;
                 const receiverKey: PublicKey = argv.receiverPubkey ? new PublicKey(argv.receiverPubkey) : wallet.publicKey;

                 const bigNoteKey = new PublicKey(argv.bigNotePubkey);
                 const bigNoteAcct = await forumClient.fetchBigNoteAccount(bigNoteKey);
                 const bigNoteSeed = bigNoteAcct.bigNoteSeed;
                 const userProfileKey = bigNoteAcct.userProfile;

                 const userProfileAcct = await forumClient.fetchUserProfileAccount(userProfileKey);
                 const profileOwnerKey = userProfileAcct.profileOwner;

                 if (!argv.dryRun) {
                     const deleteQuestionInstance = await forumClient.deleteBigNote(
                         forumKey,
                         wallet.payer,
                         profileOwnerKey,
                         bigNoteSeed,
                         receiverKey
                     );
                     console.log(stringifyPKsAndBNs(deleteQuestionInstance));
                 } else {
                     console.log('Deleting big note with account address', bigNoteKey.toBase58());
                 }
             })



// Verify big note (signer required: moderator)
    .command('verify-bignote', 'Verify big note', {
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
                 const bigNoteAcct = await forumClient.fetchBigNoteAccount(bigNoteKey);
                 const bigNoteSeed = bigNoteAcct.bigNoteSeed;
                 const forumKey = bigNoteAcct.forum;
                 const userProfileKey = bigNoteAcct.userProfile;

                 const userProfileAcct = await forumClient.fetchUserProfileAccount(userProfileKey);
                 const profileOwnerKey = userProfileAcct.profileOwner;

                 if (!argv.dryRun) {
                     const deleteQuestionInstance = await forumClient.verifyBigNote(
                         forumKey,
                         wallet.payer,
                         profileOwnerKey,
                         bigNoteSeed
                     );
                     console.log(stringifyPKsAndBNs(deleteQuestionInstance));
                 } else {
                     console.log('Verifying big note with account address', bigNoteKey.toBase58());
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
                         wallet.payer,
                         accountKey
                     );
                     console.log(stringifyPKsAndBNs(closeAccountInstance));
                 } else {
                     console.log('Closing account with pubkey:', accountKey.toBase58());
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
            alias: 'p',
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
            alias: 'p',
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
            alias: 'p',
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
            alias: 'p',
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
            alias: 'p',
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
            alias: 'p',
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
                     const bigNotePDAs = await forumClient.fetchAllBigNotePDAs(userProfileKey);

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
    .command('fetch-bounty-pda', 'Fetch bounty PDA account', {
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

                     const bountyPda = await findBountyPDA(questionKey);

                     console.log('Displaying bounty pda account for question with pubkey: ', questionKey.toBase58());
                     console.log(stringifyPKsAndBNs(bountyPda));

                 } else {
                     console.log('Found bounty pda account for question account with pubkey:', questionKey.toBase58());
                 }
             })



// Fetch bounty pda account balance
// Question account pubkey required in command
    .command('fetch-bounty-pda-balance', 'Fetch bounty PDA account balance', {
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

                     const bountyPdaBalance = await forumClient.fetchBountyPDABalance(questionKey);

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
