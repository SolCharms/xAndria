# DeEdIT SDK

### A Decentralized Educational Information and Tooling (hence the name DeEdIT) Protocol codenamed and marketed as "xAndria".

This README is intended to cater to experienced developers with a focus on protocol level program interactions. To simply use the protocol as an end-user, visit ------ where you will be greeted with nice graphical interfaces and buttons which do things. 

## Disclaimer 

March 13 2023:

The project, codenamed xAndria is un-audited open-source software. It was built from the ground up by a single developer over a 30 day period (Feb 14 2023 - March 13 2023) for submission in Solana's Grizzlython hackathon. Any use of this software is done so at your own risk and the developer induces zero liabilty in doing so. (Edit: Indeed, see the Program Improvements / Debugging section at the end of this readme to grasp how much was learned just in the process of this demonstration and how much is left to do to have a fully 'fleshed-out' product).

Furthermore, any speculative positions in this demo are purely hypothetical and intended for use as educational tools only. They are not to be construed as having any financial relevance whatsoever, nor insight into the financial markets, nor financial advice.

## Prelude

Open the terminal and cd into the desired working directory (For me it's ~/Development/Solana/SDKs ).

Clone the Repository using the command 'git clone'. You should now have a local copy of the project as something like ~/Development/Solana/SDKs/DeEdIT_SDK/

To conveniently use the program's CLI functionality from any directory without having to account for relative paths or typing out the absolute path to the CLI's directory every time, we will create a shorthand path alias. Open your .bashrc file (located in the Home directory) and add the following line at the bottom of the textfile:

    alias forum-cli='ts-node ~/Development/Solana/SDKs/DeEdIT_SDK/src/cli/forum-cli.ts'

accounting for the fact that your path to the forum-cli.ts file may be slightly different depending on where you put the cloned repository.

The remainder of this demonstration assumes a familiarity with Solana's CLI. You will need to create filesystem wallet keypairs and airdrop yourself some Solana to follow along with the demo.

## Configuration

In order to use the program we need to create some filesystem wallets and then configure the .ts files in ../src/cli/config_devnet/

To make filesystem wallets run the Solana CLI command:

    solana-keygen new --outfile ~/path-to-file/name-of-file.json
    
I've gone ahead and created 6 wallets and airdropped each of them about 5-10 Sol.

- /home/SolCharms/.config/solana/devnet-forum/forum_manager.json
- /home/SolCharms/.config/solana/devnet-forum/user_1.json
- ...
- ...
- ...
- /home/SolCharms/.config/solana/devnet-forum/user_5.json

There are 7 configuration files and we will edit them as needed throughout the demonstration. They are:

   - the network configuration
   - the forum configuration
   - the about me configuration
   - the bigNotes configuration
   - the question configuration
   - the answer configuration
   - the comment configuration
   
The choice for using configuration files was two-fold. For one, since there are multiple public keys / numerical values required for many of the commands, and users can have a multitude of accounts of each type, storage files would be necessary anyways. And secondly, entering multiple options in the process of a command would require a tedious copying/pasting process which configuration files ultimately forego. Nonetheless, the command line interface built here tries to be as flexible as possible, forcing you to use configuration files when it is absolutely in your best interest and otherwise giving you the flexibility to enter options manually.

The network configuration (../config_devnet/networkConfig-devnet.ts) is necessary right away. We will first set up the configuration from the perspective of someone who will initialize and manage a forum (later we will also do it from the perspective of other users). Two inputs are required:

    the clusterApiUrl
    the signerKeypair

Here's what mine looks like:

![Screenshot from 2023-03-13 21-31-11](https://user-images.githubusercontent.com/97003046/224869092-1d86e36f-8f70-4864-8437-141710e0e624.png)

## Initializing a Forum

The forum is where all the business takes place. It is an account that stores all the data needed protocol-wide. To initialize a forum account, one must decide on all the protocol fees and all the ways reputation can be earned. To configure a forum, we need to input all the required parameters into the config file (../config_devnet/forumConfig-devnet.ts). Here's mine:

![Screenshot from 2023-03-13 21-43-54](https://user-images.githubusercontent.com/97003046/224870596-d38aac72-eb85-43e8-a994-1cb2b8f77327.png)

Notice that all quantities of Sol are entered in terms of Lamports (the conversion is 1 Sol = 10^9 Lamports). This holds true for any SPL-Tokens as well. That is, as integer multiples of their respective smallest denomination and their conversion follows 10^n where n is the token's number of decimals.  

Once this file is configured, we will run the command 

    forum-cli init-forum

The output to the terminal, upon successful transaction, should appear as:

![Screenshot from 2023-03-13 21-53-41](https://user-images.githubusercontent.com/97003046/224871935-519e4e92-c59f-4f00-85ef-a04c47e3fe6f.png)

We can view all the forums associated to this manager's pubkey by running

    forum-cli fetch-all-forums

which produces an output as:

![Screenshot from 2023-03-13 21-59-22](https://user-images.githubusercontent.com/97003046/224872762-a02d50c7-4011-4726-bfb6-0ee7aaff8056.png)

where mine correctly states that there are 2 forum accounts (one from prior testing). We see all chosen fee and reputation parameters reflected in the account's data. 

Suppose however, that we wanted to change some of the parameters (say, answer repuatation to 25, comment reputation to 5 and forum big notes bounty minimum to 2.5 Sol). Updating the config file to reflect the changes

![Screenshot from 2023-03-13 22-14-24](https://user-images.githubusercontent.com/97003046/224875189-141fc4e8-199f-4b19-9815-f7fd97af489d.png)

and running the command (with the -f option necessary and being the forum pubkey)

    forum-cli update-forum-params -f 5CL3JJC156CrDGvQfWpCcmdW3v2HJQYs6bYe3FhzAJts

A successful transaction outputs

![Screenshot from 2023-03-13 22-18-35](https://user-images.githubusercontent.com/97003046/224875790-29c74012-5398-435c-bc6b-50f0f437d72f.png)

and running the command

    forum-cli fetch-forum-by-key -k 5CL3JJC156CrDGvQfWpCcmdW3v2HJQYs6bYe3FhzAJts

displays the changes reflected:

![Screenshot from 2023-03-13 22-20-25](https://user-images.githubusercontent.com/97003046/224876071-c4c82635-6705-41b3-9455-815ecc610d31.png)

## Creating a User Profile

To create a user profile, we will change the network config's signer keypair as follows:

![Screenshot from 2023-03-13 22-23-41](https://user-images.githubusercontent.com/97003046/224876580-f7ba3ffc-1d74-499d-857d-809f0bcc8765.png)

Running the command

    forum-cli create-profile -f 5CL3JJC156CrDGvQfWpCcmdW3v2HJQYs6bYe3FhzAJts

the output to the terminal should appear as something like 

![Screenshot from 2023-03-14 01-05-22](https://user-images.githubusercontent.com/97003046/224898780-4806119b-7a53-4ba7-b9bf-89f6ed5955f0.png)

We can fetch the user profile by running the command

    forum-cli fetch-profile-by-key -k FNdJSvCWraqKrELHFdvaHuQHqKNCYKLw1JbbKNdBDHPA

which displays the user profile state account to the terminal as something like

![Screenshot from 2023-03-14 01-06-52](https://user-images.githubusercontent.com/97003046/224899211-c7bc15b7-b421-4a5b-a3c7-488834b046ff.png)

Fetching the forum account, we see that there is now 1 forum profile account present:

![Screenshot from 2023-03-14 01-08-12](https://user-images.githubusercontent.com/97003046/224899679-0feb98df-65ae-4a17-9139-588255ed2703.png)

The next step after a user's profile has been created is to create an 'about me'. This first requires configuring the file (../config_devnet/aboutMeConfig-devnet.ts) to add the necessary about me text

![Screenshot from 2023-03-14 01-09-39](https://user-images.githubusercontent.com/97003046/224900169-90315480-421b-4d88-9926-b5fdf067200b.png)

and then by running the command

    forum-cli create-about-me

obtaining an output similar to

![Screenshot from 2023-03-14 01-10-32](https://user-images.githubusercontent.com/97003046/224900477-04ee15f7-5c8a-4721-bc29-caa97f2c6dee.png)

Fetching the user profile

![Screenshot from 2023-03-14 01-11-19](https://user-images.githubusercontent.com/97003046/224900698-9a291078-7a5b-4309-8003-57764aa7fada.png)

we now see that the user profile has an about me and has earned 100 reputation!

We can also view the about me state account by running the command

    forum-cli fetch-about-me-by-profile -p FNdJSvCWraqKrELHFdvaHuQHqKNCYKLw1JbbKNdBDHPA

which displays the following output to the terminal

![Screenshot from 2023-03-14 01-12-26](https://user-images.githubusercontent.com/97003046/224901086-cb85b6d0-98d8-4bc4-abde-cc98373d0838.png)

To edit the about me, change the content in the config file and execute

    forum-cli edit-about-me

A successful transaction outputs

![Screenshot from 2023-03-14 01-13-45](https://user-images.githubusercontent.com/97003046/224901506-bda215a6-55c4-4cce-a0c2-d2a31387ee4f.png)

and the about me account is updated to reflect the changes

![Screenshot from 2023-03-14 01-14-26](https://user-images.githubusercontent.com/97003046/224901690-c5b9235c-5ae9-4dfa-b795-2ad9f983069c.png)

I'll later create the remaining user profiles, as necessary.

## Asking a Question, Providing an Answer, or Leaving a Comment

To ask a question on the forum, we must first configure the question config file (../config_devnet/questionConfig-devnet.ts). I've gone ahead and grabbed a question off of solana stack exchange as an homage to the inspiriation for xAndria. Here's what the config looks like:

![Screenshot from 2023-03-14 01-16-55](https://user-images.githubusercontent.com/97003046/224902442-c94ff9b9-7d8a-44d0-a0b1-ac4b88f29706.png)

The front end app will have the ability to pick up newline characters, code block delimiters and even latex math equations. 

Running the command

    forum-cli ask-question

the output to the terminal upon a successful transaction is something of the form

![Screenshot from 2023-03-14 02-19-51](https://user-images.githubusercontent.com/97003046/224912966-a3acb145-ef00-4a60-be94-2bda3e510616.png)

We can fetch the question either by fetching all questions for a given user profile or by the question account's pubkey. Here, running

    forum-cli fetch-question-by-key -k 8SMeMaXARPZDJHyBtoPiZiGXW89c731UjKAgqyUdgiLi

the question state account displays to the terminal as

![Screenshot from 2023-03-14 02-20-53](https://user-images.githubusercontent.com/97003046/224913155-23d2fb0e-0e22-4a3c-9289-790a59dda7bb.png)

Fetching the forum account again, 

![Screenshot from 2023-03-14 01-19-48](https://user-images.githubusercontent.com/97003046/224903427-465ed16f-4027-4941-8458-3d65b0c0e200.png)

we see that there is now 1 question in the count.

We can then edit or add additional content to the question. Showing the addition of content, we first update the config file inputting the additional content to the 

    const additionalQuestionContent: string[]

Running the command 

    forum-cli add-to-question -q 8SMeMaXARPZDJHyBtoPiZiGXW89c731UjKAgqyUdgiLi

the output gives

![Screenshot from 2023-03-14 02-23-16](https://user-images.githubusercontent.com/97003046/224913577-27ba184f-9f6b-4a80-b29f-8e1a8e2dad1e.png)

and the updated question state account

![Screenshot from 2023-03-14 02-24-14](https://user-images.githubusercontent.com/97003046/224913751-e7061245-7568-46f6-bbd0-e4ce9a2b8c65.png)

reflects the additional desired content.

Now, another user may come along and take interest your question. Being also particularly interested in knowing the answer, the user may choose to supplement the question bounty to help drive up engagement. Running

    forum-cli supplement-question-bounty -q 8SMeMaXARPZDJHyBtoPiZiGXW89c731UjKAgqyUdgiLi -x 1000000000

The output to the terminal appears as

![Screenshot from 2023-03-14 02-27-21](https://user-images.githubusercontent.com/97003046/224914397-5789f4ba-1b98-4e92-95ec-ceca6fde912a.png)

and the question account's state

![Screenshot from 2023-03-14 02-28-26](https://user-images.githubusercontent.com/97003046/224914616-683bd71c-394b-4877-8e5c-df8975a32486.png)

reflects the supplemental bounty contribution. 

REMARK: An improtant comment to make in passing is that this bounty is held onchain in a PDA account and can only be released to the owner of the user profile who provided the 'accepted answer'.

Providing an answer or leaving a comment goes much the same way as asking a question does; by first updating the config file, either (../config_devnet/answerConfig-devnet.ts) or (../config_devnet/commentConfig-devnet.ts). Here is an example for an answer config file for a user intending to answer the question posted earlier:

![Screenshot from 2023-03-14 02-58-31](https://user-images.githubusercontent.com/97003046/224920446-9975ced4-3112-4104-846a-5ff4c31a5791.png)

Running

    forum-cli answer-question

we get an output for a successful transaction as

![Screenshot from 2023-03-14 03-00-00](https://user-images.githubusercontent.com/97003046/224920752-ea5ade26-218d-492c-b2c6-46465c6299c1.png)

and the answer state account can be fetched by running

    forum-cli fetch-answer-by-key -k 23vTfWpPgGzXrhCmHPDD8A7sBsDgNY9AD95p8H9W16zQ
    
which gives

![Screenshot from 2023-03-14 03-10-19](https://user-images.githubusercontent.com/97003046/224922941-fa2d37b5-9897-4960-bcad-18f5ec4a6f96.png)

I'll go ahead and post some comments and edits to the answer without going through all of the details, but to give you an idea of what a typical stack would look like, here is the following series of interactions following the posted question:

![Screenshot from 2023-03-14 07-12-31](https://user-images.githubusercontent.com/97003046/224983946-e361e1b0-0930-4c89-9e22-4d6fdb2d5ac9.png)

Obviously, a front-end application with nice graphical interfaces will present the relevent data to the user in a much more appealing way, but that's neither here nor there. To accept an answer, the poster of the question can run the command

    forum-cli accept-answer -q 8SMeMaXARPZDJHyBtoPiZiGXW89c731UjKAgqyUdgiLi -a 23vTfWpPgGzXrhCmHPDD8A7sBsDgNY9AD95p8H9W16zQ

and upon doing so we see that both the question and the accepted answer have been updated to reflect this fact

![Screenshot from 2023-03-14 18-22-14](https://user-images.githubusercontent.com/97003046/225155470-fc9c744d-6626-4040-ad0c-56bfdae57ac0.png)

The bounty is transferred to the account owner of the user profile which posted the accepted answer. Here is the transaction signature:

    txSig: 3Jk1yoSDXHWTvFQAnBQi4zWHQaBdYo4MN4A2Ue4at9FRQgaFbv97xZRYcWVtGR2bRtoBSdQbcBj7sgLGhuKsGZyd

Note the slight discrepancy for +◎2.49994432 rather than +◎2.5, which was due to a small bug which miscalculated the rent-exemption Lamports (as these are returned to the account owner of the user profile which posted the question.) This bug has now been fixed (by instead transfering the 2.5 first and returning the remaining Lamports while closing the PDA thereafter), although the tutorial is too far along to begin anew. 

## Interacting with The Library (creating BigNotes, soliciting BigNotes Contributions, etc..)

Coming Soon.











## Program Improvements / Debugging

1. Create an instruction that runs Delete User Profile and Delete About Me in one call (either onchain or in the CLI). Creating them separately was done to incentivize a user's first action on the protocol and to give the user a first taste at gaining some reputation. Deleting them does not have to be done subsequently, although the functionality to delete them separately is necessary (in the case that a user has no 'about me' for example). 

2. Implement a way to reclaim bounties from PDAs for questions that have been inactive for extremely long periods of time. This is not necessary right away and metrics will be put in place to monitor app engagement, thereby creating a statistically advantageous cut-off point.

3. Moderator privileges still need to be implemented. This includes giving moderators the ability to edit questions, answers, comments, and big notes pages. 


