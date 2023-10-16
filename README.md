# xAndria SDK

### Decentralized Educational Information and Tooling - DeEdIT - codenamed and marketed as "xAndria".

This README is intended to cater to experienced developers with a focus on protocol level program interactions. As the front end application is still under construction, end users will have to wait until it is completed to try our product.

## Deployments

Devnet: FoRUMwAz6uhSqf8uvG94nkeYdKM326mKzZazrh2Z4sZS

## Disclaimer 

October 15 2023:

The project, codenamed xAndria, is still un-audited open-source software. As it stands, the program has only been deployed to devnet. As such, no real harm can result from it's use. However, any use of this software via a Mainnet deploy is done so at your own risk and the developer induces zero liabilty in doing so. (Edit: Indeed, see the Program Improvements / Debugging section at the end of this readme to grasp how much was learned just in the process of this demonstration and how much is left to do to have a fully 'fleshed-out' product).

Furthermore, any speculative positions in this demo are purely hypothetical and intended for use as educational tools only. They are not to be construed as having any financial relevance whatsoever, nor insight into the financial markets, nor financial advice.

## Prelude

Open the terminal and cd into the desired working directory (For me it's ~/Development/Solana/SDKs).

Clone the Repository using the command 'git clone'. You should now have a local copy of the project as something like ~/Development/Solana/SDKs/xAndria/

To conveniently use the program's CLI functionality from any directory without having to account for relative paths or typing out the absolute path to the CLI's directory every time, we will create a shorthand path alias. Open your .bashrc file (located in the Home directory) and add the following line at the bottom of the textfile:

    alias forum-cli='ts-node ~/Development/Solana/SDKs/xAndria/src/forum.cli.ts'

accounting for the fact that your path to the forum.cli.ts file may be slightly different depending on where in your filesystem you put the cloned repository.

The remainder of this demonstration assumes a familiarity with Solana's CLI. You will need to create filesystem wallet keypairs and airdrop yourself some Solana to follow along with the demo.

## Configuration

In order to use the program we need to create some filesystem wallets and then configure the .ts files in ../xAndria/src/cli-configs/devnet/

To make filesystem wallets run the Solana CLI command:

    solana-keygen new --outfile ~/path-to-file/name-of-file.json
    
I've gone ahead and created 6 wallets and airdropped each of them about 5-10 Sol.

- /home/SolCharms/.config/solana/devnet-forum/forum_manager.json
- /home/SolCharms/.config/solana/devnet-forum/user_1.json
- ...
- ...
- ...
- /home/SolCharms/.config/solana/devnet-forum/user_5.json

There are 10 configuration files and we will edit them as needed throughout the demonstration. They are:

   - the network configuration
   - the forum configuration
   - the about me configuration
   - the question configuration
   - the answer configuration
   - the comment configuration
   - the big note configuration
   - the proposed contribution configuration
   - the challenge configuration
   - the submission configuration
   
The choice for using configuration files, at least from a protocol management perspective, was two-fold. For one, since there are often multiple public keys / numerical values required by many of the commands, and managers can have a multitude of accounts of each type, storage files would be necessary anyways. And secondly, entering multiple options in the process of a command would require a tedious copying/pasting process which configuration files ultimately forego. Nonetheless, the command line interface built here tries to be as flexible as possible, forcing you to use configuration files when it is absolutely in your best interest and otherwise giving you the flexibility to enter options manually.

The network configuration (../cli_configs/devnet/networkConfig-devnet.ts) is necessary right away. We will first set up the configuration from the perspective of someone who will initialize and manage a forum, i.e the forum manager. (Later we will also do it from the perspective of other users including protocol moderators). Two inputs are required:

    the clusterApiUrl
    the signerKeypair

Here's what mine looks like:

![Screenshot from 2023-03-13 21-31-11](https://user-images.githubusercontent.com/97003046/224869092-1d86e36f-8f70-4864-8437-141710e0e624.png)

## Initializing a Forum

The forum is where all the business takes place. It is an account that stores all the data needed protocol-wide including managerial pubkeys, protocol fees, reputation points for various actions, and account field size constraints. To initialize a forum account, one must decide on all the protocol fees and all the ways reputation can be earned. To configure a forum, we need to input all the required parameters into the config file (../cli_configs/devnet/forumConfig-devnet.ts). Here's mine:

![Screenshot from 2023-10-15 19-20-27](https://github.com/SolCharms/xAndria/assets/97003046/43d2c329-f1e4-4e10-945a-160544a1cc63)

Notice that all quantities of Sol are entered in terms of Lamports (the conversion is 1 Sol = 10^9 Lamports). This holds true for any SPL-Tokens as well. That is, as integer multiples of their respective smallest denomination and their conversion follows 10^n where n is the token's number of decimals.  

Once this file is configured, we will run the command 

    forum-cli init-forum

The output to the terminal, upon successful transaction, should appear as:

![Screenshot from 2023-10-15 19-09-44](https://github.com/SolCharms/xAndria/assets/97003046/b3a7f3cd-dde6-4ced-a294-48f246ead9e2)

We can view all the forums associated to this manager's pubkey by running

    forum-cli fetch-all-forums

which produces an output as:

![Screenshot from 2023-10-15 19-22-16](https://github.com/SolCharms/xAndria/assets/97003046/b32ea95f-b41f-42f1-80b8-631b75a4bf30)

where we can see all chosen fee and reputation parameters reflected in the account's data. 

Suppose however, that we wanted to change some of the parameters (say, big note verification repuatation to 100 and forum big notes submission fee to 0.05 Sol). Updating the config file to reflect the changes

![Screenshot from 2023-10-15 19-26-42](https://github.com/SolCharms/xAndria/assets/97003046/0e096b80-8cff-40f7-822a-6230cf2d6c71)

and running the command (with the -f option necessary and being the forum pubkey)

    forum-cli update-forum-params -f DW54MCjXco2rJEJdkCUV1JsZJyQykgoKCtgm6E49dbDg

A successful transaction outputs the transaction signature

![Screenshot from 2023-10-15 19-28-18](https://github.com/SolCharms/xAndria/assets/97003046/94c3e544-1538-4d4a-be0d-4d717d4100f8)

and subsequently running the command

    forum-cli fetch-forum-by-key -k DW54MCjXco2rJEJdkCUV1JsZJyQykgoKCtgm6E49dbDg

displays the changes reflected:

![Screenshot from 2023-10-15 19-29-23](https://github.com/SolCharms/xAndria/assets/97003046/c4698a59-5c52-4803-816c-72e86e129902)

## Creating a User Profile

To create a user profile, we will change the network config's signer keypair as follows:

![Screenshot from 2023-03-13 22-23-41](https://user-images.githubusercontent.com/97003046/224876580-f7ba3ffc-1d74-499d-857d-809f0bcc8765.png)

Running the command

    forum-cli create-profile -f DW54MCjXco2rJEJdkCUV1JsZJyQykgoKCtgm6E49dbDg

the output to the terminal should appear as something like 

![Screenshot from 2023-10-15 19-34-53](https://github.com/SolCharms/xAndria/assets/97003046/1d289b12-b2d0-4f40-ada0-0e20c855adce)

We can fetch the user profile by running the command

    forum-cli fetch-profile-by-key -k G59DTTBjKtmBD47ibjNDDfDPutb4xqD4NSZuL1pFVUUY

which displays the user profile state account to the terminal as something like

![Screenshot from 2023-10-15 19-35-31](https://github.com/SolCharms/xAndria/assets/97003046/4ec2830f-a557-4a52-b038-2350bd9549a4)

Fetching the forum account, we see that there is now 1 forum profile account present:

![Screenshot from 2023-10-15 19-36-22](https://github.com/SolCharms/xAndria/assets/97003046/5ef927b2-2674-40f4-95c5-aa9682acfc1b)

The next step after a user's profile has been created is to create an 'about me'. This first requires configuring the file (../cli_configs/devnet/aboutMeConfig-devnet.ts) to add the necessary about me text

![Screenshot from 2023-10-15 21-23-47](https://github.com/SolCharms/xAndria/assets/97003046/2cc840f6-82d4-48c7-a494-bd66711de942)

and then by running the command

    forum-cli create-about-me

obtaining an output similar to

![Screenshot from 2023-10-15 21-25-44](https://github.com/SolCharms/xAndria/assets/97003046/0deede49-687c-4042-b93d-f4ffb3069bcd)

Fetching the user profile

![Screenshot from 2023-10-15 21-26-34](https://github.com/SolCharms/xAndria/assets/97003046/15a4a854-2a7e-4777-a1f0-8a923ea899f1)

we now see that the user profile has an about me and has earned 100 reputation!

We can also view the about me state account by running the command (with the -u option necessary and being the pubkey of the user profile state account)

    forum-cli fetch-about-me-by-profile -u G59DTTBjKtmBD47ibjNDDfDPutb4xqD4NSZuL1pFVUUY

which displays the following output to the terminal

![Screenshot from 2023-10-15 21-29-43](https://github.com/SolCharms/xAndria/assets/97003046/f3100d9e-e905-4eb7-a9e0-762b9cb3a6a6)

To edit the about me, change the content in the config file and execute

    forum-cli edit-about-me

I'll later create the remaining user profiles, as necessary. Let's do one last thing before moving on. Since user 1 now has the most reputation of any user on the protocol (by default), let's give user 1 moderator privileges. 

First, set the network config so that the signer is again the forum manager's keypair filepath since only the forum manager has the authority to assign user's the moderator role. Run the command 

    forum-cli add-moderator -u G59DTTBjKtmBD47ibjNDDfDPutb4xqD4NSZuL1pFVUUY

Upon transaction success, one should observe an output to the terminal similar to:

![Screenshot from 2023-10-15 21-50-56](https://github.com/SolCharms/xAndria/assets/97003046/a78269ac-48f9-4ec3-b791-e0c389f6b963)

Fetching the user profile state account again with

    forum-cli fetch-profile-by-key -k G59DTTBjKtmBD47ibjNDDfDPutb4xqD4NSZuL1pFVUUY 

we see that the user profile has indeed been given moderator privileges

![Screenshot from 2023-10-15 22-25-18](https://github.com/SolCharms/xAndria/assets/97003046/f9221c77-3fdc-4108-8ea5-3b1f75a8f85e)

## Asking a Question, Providing an Answer, or Leaving a Comment

I've gone ahead and made user profiles 2,3, and 4.

To ask a question on the forum, we must first configure the question config file (../cli_configs/devnet/questionConfig-devnet.ts). I've gone ahead and grabbed a question off of solana stack exchange as an homage to the inspiriation for xAndria. Here's what the config looks like:

![Screenshot from 2023-10-15 22-56-48](https://github.com/SolCharms/xAndria/assets/97003046/7c01e1ec-7a02-42f3-a3f1-b58b9f7f4bd8)

Note that the URL would typically be a link to the question on our FE application, but since we currently don't have one, I've just used the URL for the original question on Solana Stack Exchange in its place. It is important to note that the question state account generated by the onchain program does not store the content of the question but rather, a hash of its data - input as a string of characters into a hashing function, and whose output is a pubkey. This design was specifically chosen since storing enormous strings of text onchain would be very, very costly, even on Solana. Moreover, with a decentralized storage solution of the content data, along with the URL to it's location, we determined that the data could always be hashed by any 3rd party and verified to be good and true or not, and thus, completely trustless and secure.

Running the command

    forum-cli ask-question

the output to the terminal upon a successful transaction is something of the form

![Screenshot from 2023-10-15 23-27-23](https://github.com/SolCharms/xAndria/assets/97003046/5e9c8186-34c1-462a-840f-4ff376a405c1)

We can fetch the question either by fetching all questions for a given user profile or by the question account's pubkey. Here, running

    forum-cli fetch-question-by-key -k AWfY9S8GmdQfCJa4bdcTRwZMpnWQLcJfzaqTUbRmf2Mw

the question state account displays to the terminal as

![Screenshot from 2023-10-15 23-29-15](https://github.com/SolCharms/xAndria/assets/97003046/e1689f72-8577-4367-b870-c4b6bd2220ea)

Fetching the forum account again, 

![Screenshot from 2023-10-15 23-30-25](https://github.com/SolCharms/xAndria/assets/97003046/336cbe3e-97db-4e8a-91c4-3a8022f32acb)

we see that there are now 4 profiles and 1 question in it's counts.

Now, another user may come along and take interest your question. Being also particularly interested in knowing the answer, the user may choose to supplement the question bounty with 1 SOL to help drive engagement. Switching the network config to user 3 and running

    forum-cli supplement-question-bounty -q AWfY9S8GmdQfCJa4bdcTRwZMpnWQLcJfzaqTUbRmf2Mw -x 1000000000

The output to the terminal appears as (note 1000000000 SOL now corrected to say 1000000000 Lamports)

![Screenshot from 2023-10-15 23-34-23](https://github.com/SolCharms/xAndria/assets/97003046/698f197d-770f-4227-a2f6-4f8b4b1eefaa)

and the question account's state is then

![Screenshot from 2023-10-15 23-37-18](https://github.com/SolCharms/xAndria/assets/97003046/01a620c8-da7d-40b7-9101-5df340c1ab55)

which reflects the supplemental bounty contribution. 

REMARK: An improtant comment to make in passing is that this bounty is held onchain in a PDA account and is automatically released to the owner of the user profile who provided an answer which is deemed the 'accepted answer' by the question poster. Otherwise, the only mechanisms for bounty refund occur either when enough time has elapsed without any engagement on the question or if deemed necessary by a protocol moderator (who at all times have the authority to return bounties to supplementors).

Providing an answer or leaving a comment (on either a question or an answer) goes much the same way as asking a question does; by first updating the config file, either (../cli_configs/devnet/answerConfig-devnet.ts) or (../cli_configs/devnet/commentConfig-devnet.ts). Here is an example for an answer config file for a user intending to answer the question posted earlier:

![Screenshot from 2023-10-16 00-03-23](https://github.com/SolCharms/xAndria/assets/97003046/a5568666-b545-4759-8289-ae858b4b10fd)

Switching the network config to user 4 and running

    forum-cli answer-question

we get an output for a successful transaction as

![Screenshot from 2023-10-16 00-08-30](https://github.com/SolCharms/xAndria/assets/97003046/d8d9dd92-e72a-45af-b3c2-5a6c211f7c14)

and the answer state account can be fetched by running

    forum-cli fetch-answer-by-key -k 7KevVgZyhART5EyRBrZdL97yvV1jykK9g8aKJtuxV32J
    
which gives

![Screenshot from 2023-10-16 00-09-39](https://github.com/SolCharms/xAndria/assets/97003046/643a2630-953a-4a49-b30a-726e751618de)

I'll go ahead and post some comments without going through all of the details, but to give you an idea of what a typical question stack would look like, here is the following series of interactions following the posted question which can be fetched by running

    forum-cli fetch-question-stack -q AWfY9S8GmdQfCJa4bdcTRwZMpnWQLcJfzaqTUbRmf2Mw

![Screenshot from 2023-10-16 00-24-06](https://github.com/SolCharms/xAndria/assets/97003046/7520e27c-8b17-447c-8b0c-0fc4fc4e5e1c)
![Screenshot from 2023-10-16 00-24-41](https://github.com/SolCharms/xAndria/assets/97003046/e4f4c770-a894-4f15-90f3-a3e899e3640c)

Obviously, a front-end application with nice graphical interfaces will present the relevent data to the user in a much more appealing way, with the unhashed content data, but that's neither here nor there for the moment. To accept an answer, the poster of the question (user 2) can run the command

    forum-cli accept-answer -q AWfY9S8GmdQfCJa4bdcTRwZMpnWQLcJfzaqTUbRmf2Mw -a 7KevVgZyhART5EyRBrZdL97yvV1jykK9g8aKJtuxV32J

with output to the terminal as follows

![Screenshot from 2023-10-16 00-29-37](https://github.com/SolCharms/xAndria/assets/97003046/bc6011d8-3b10-4702-9333-cf5f3f93071a)

We then see that both the question and the accepted answer have been updated to reflect the fact that there is now an accepted answer along with the user profiles

![Screenshot from 2023-10-16 00-31-01](https://github.com/SolCharms/xAndria/assets/97003046/ed19acb2-8e4f-4893-bb51-722c3b93b95a)
![Screenshot from 2023-10-16 00-31-40](https://github.com/SolCharms/xAndria/assets/97003046/22688159-a09a-4e2f-8a64-f9d25411a0f4)
![Screenshot from 2023-10-16 02-23-34](https://github.com/SolCharms/xAndria/assets/97003046/7fa9e8ec-aef1-4aeb-9037-f099b80be07d)

The bounty is transferred to the account owner of the user profile which posted the accepted answer. Here is the transaction signature which you can use to verify it yourself:

    txSig: LR5eShjQ6VdEsf7PwxFGqB5nv8d9rp9Fuq4CCLKicazBNiCLX5iEUf9gsSS6CuPuanuMUa9Vfmt47gjvr5FTiYH

## Interacting with The Library (creating BigNotes, soliciting Contributions, etc..)





## Creating Challenges / Submissions (The Gauntlet)






## Program ToDo's / Improvements / Debugging

1. Institute instruction fees for certain of the remaining IX's

2. Implement bounty refund instructions initiated by OP's for questions / big notes that have not received engagement for sufficiently long periods of time. 

3. Consider implications of allowing users to close accounts with seed dependents (current protocol structure)
   - Pros: Users can independently close accounts (despite seed dependents)
   - Cons: Obtain stale data which need new IX's to handle closing such accounts

4. Build the FE application

The timeframe to complete such work is estimated to be 30-60 days. That is, one can expect a mainnet deploy before Q1 2024.
