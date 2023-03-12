export type Forum = {
  "version": "0.1.0",
  "name": "forum",
  "instructions": [
    {
      "name": "initForum",
      "accounts": [
        {
          "name": "forum",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "forumManager",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "forumAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "forumTreasury",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpForumAuth",
          "type": "u8"
        },
        {
          "name": "forumFees",
          "type": {
            "defined": "ForumFees"
          }
        },
        {
          "name": "reputationMatrix",
          "type": {
            "defined": "ReputationMatrix"
          }
        }
      ]
    },
    {
      "name": "updateForumParams",
      "accounts": [
        {
          "name": "forum",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "forumManager",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "newForumFees",
          "type": {
            "defined": "ForumFees"
          }
        },
        {
          "name": "newReputationMatrix",
          "type": {
            "defined": "ReputationMatrix"
          }
        }
      ]
    },
    {
      "name": "payoutFromTreasury",
      "accounts": [
        {
          "name": "forum",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "forumManager",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "forumTreasury",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "receiver",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpForumTreasury",
          "type": "u8"
        },
        {
          "name": "minimumBalanceForRentExemption",
          "type": "u64"
        }
      ]
    },
    {
      "name": "closeForum",
      "accounts": [
        {
          "name": "forum",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "forumManager",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "forumTreasury",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "receiver",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpForumTreasury",
          "type": "u8"
        }
      ]
    },
    {
      "name": "createUserProfile",
      "accounts": [
        {
          "name": "forum",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "forumAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "forumTreasury",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "profileOwner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpForumAuth",
          "type": "u8"
        },
        {
          "name": "bumpTreasury",
          "type": "u8"
        }
      ]
    },
    {
      "name": "editUserProfile",
      "accounts": [
        {
          "name": "profileOwner",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "userProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftPfpTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpUserProfile",
          "type": "u8"
        }
      ]
    },
    {
      "name": "deleteUserProfile",
      "accounts": [
        {
          "name": "forum",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "profileOwner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "receiver",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpUserProfile",
          "type": "u8"
        }
      ]
    },
    {
      "name": "createAboutMe",
      "accounts": [
        {
          "name": "forum",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "profileOwner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "aboutMe",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpUserProfile",
          "type": "u8"
        },
        {
          "name": "content",
          "type": "string"
        }
      ]
    },
    {
      "name": "editAboutMe",
      "accounts": [
        {
          "name": "profileOwner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "aboutMe",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpUserProfile",
          "type": "u8"
        },
        {
          "name": "bumpAboutMe",
          "type": "u8"
        },
        {
          "name": "newContent",
          "type": "string"
        }
      ]
    },
    {
      "name": "deleteAboutMe",
      "accounts": [
        {
          "name": "profileOwner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "aboutMe",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "receiver",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpUserProfile",
          "type": "u8"
        },
        {
          "name": "bumpAboutMe",
          "type": "u8"
        }
      ]
    },
    {
      "name": "addModerator",
      "accounts": [
        {
          "name": "forum",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "forumManager",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "profileOwner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "userProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpUserProfile",
          "type": "u8"
        }
      ]
    },
    {
      "name": "removeModerator",
      "accounts": [
        {
          "name": "forum",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "forumManager",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "profileOwner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "userProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpUserProfile",
          "type": "u8"
        }
      ]
    },
    {
      "name": "askQuestion",
      "accounts": [
        {
          "name": "forum",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "forumTreasury",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "profileOwner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "question",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "questionSeed",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "bountyPda",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpTreasury",
          "type": "u8"
        },
        {
          "name": "bumpUserProfile",
          "type": "u8"
        },
        {
          "name": "title",
          "type": "string"
        },
        {
          "name": "content",
          "type": "string"
        },
        {
          "name": "tags",
          "type": {
            "defined": "Tags"
          }
        },
        {
          "name": "bountyAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "addContentToQuestion",
      "accounts": [
        {
          "name": "forum",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "profileOwner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userProfile",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "question",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "questionSeed",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpUserProfile",
          "type": "u8"
        },
        {
          "name": "bumpQuestion",
          "type": "u8"
        },
        {
          "name": "newContent",
          "type": "string"
        }
      ]
    },
    {
      "name": "editQuestion",
      "accounts": [
        {
          "name": "forum",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "profileOwner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userProfile",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "question",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "questionSeed",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpUserProfile",
          "type": "u8"
        },
        {
          "name": "bumpQuestion",
          "type": "u8"
        },
        {
          "name": "newTitle",
          "type": "string"
        },
        {
          "name": "newContent",
          "type": "string"
        },
        {
          "name": "newTags",
          "type": {
            "defined": "Tags"
          }
        }
      ]
    },
    {
      "name": "deleteQuestion",
      "accounts": [
        {
          "name": "forum",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "moderator",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "moderatorProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "profileOwner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "question",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "questionSeed",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "receiver",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpModeratorProfile",
          "type": "u8"
        },
        {
          "name": "bumpUserProfile",
          "type": "u8"
        },
        {
          "name": "bumpQuestion",
          "type": "u8"
        }
      ]
    },
    {
      "name": "supplementQuestionBounty",
      "accounts": [
        {
          "name": "forum",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "supplementor",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "supplementorProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "profileOwner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "userProfile",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "question",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "questionSeed",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "bountyPda",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpSupplementorProfile",
          "type": "u8"
        },
        {
          "name": "bumpUserProfile",
          "type": "u8"
        },
        {
          "name": "bumpQuestion",
          "type": "u8"
        },
        {
          "name": "bumpBountyPda",
          "type": "u8"
        },
        {
          "name": "supplementalBountyAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "acceptAnswer",
      "accounts": [
        {
          "name": "forum",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "profileOwner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "question",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "questionSeed",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "bountyPda",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "answerProfileOwner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "answerUserProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "answer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "answerSeed",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "receiver",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpUserProfile",
          "type": "u8"
        },
        {
          "name": "bumpQuestion",
          "type": "u8"
        },
        {
          "name": "bumpBountyPda",
          "type": "u8"
        },
        {
          "name": "bumpAnswerUserProfile",
          "type": "u8"
        },
        {
          "name": "bumpAnswer",
          "type": "u8"
        }
      ]
    },
    {
      "name": "answerQuestion",
      "accounts": [
        {
          "name": "forum",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "profileOwner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "question",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "answer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "answerSeed",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpUserProfile",
          "type": "u8"
        },
        {
          "name": "content",
          "type": "string"
        }
      ]
    },
    {
      "name": "addContentToAnswer",
      "accounts": [
        {
          "name": "forum",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "profileOwner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userProfile",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "answer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "answerSeed",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpUserProfile",
          "type": "u8"
        },
        {
          "name": "bumpAnswer",
          "type": "u8"
        },
        {
          "name": "newContent",
          "type": "string"
        }
      ]
    },
    {
      "name": "editAnswer",
      "accounts": [
        {
          "name": "forum",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "profileOwner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userProfile",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "answer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "answerSeed",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpUserProfile",
          "type": "u8"
        },
        {
          "name": "bumpQuestion",
          "type": "u8"
        },
        {
          "name": "newContent",
          "type": "string"
        }
      ]
    },
    {
      "name": "deleteAnswer",
      "accounts": [
        {
          "name": "forum",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "moderator",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "moderatorProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "profileOwner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "answer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "answerSeed",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "receiver",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpModeratorProfile",
          "type": "u8"
        },
        {
          "name": "bumpUserProfile",
          "type": "u8"
        },
        {
          "name": "bumpAnswer",
          "type": "u8"
        }
      ]
    },
    {
      "name": "leaveComment",
      "accounts": [
        {
          "name": "forum",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "profileOwner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "commentedOn",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "comment",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "commentSeed",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpUserProfile",
          "type": "u8"
        },
        {
          "name": "content",
          "type": "string"
        }
      ]
    },
    {
      "name": "editComment",
      "accounts": [
        {
          "name": "forum",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "profileOwner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userProfile",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "comment",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "commentSeed",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpUserProfile",
          "type": "u8"
        },
        {
          "name": "bumpComment",
          "type": "u8"
        },
        {
          "name": "content",
          "type": "string"
        }
      ]
    },
    {
      "name": "deleteComment",
      "accounts": [
        {
          "name": "forum",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "moderator",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "moderatorProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "profileOwner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "comment",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "commentSeed",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "receiver",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpModeratorProfile",
          "type": "u8"
        },
        {
          "name": "bumpUserProfile",
          "type": "u8"
        },
        {
          "name": "bumpComment",
          "type": "u8"
        }
      ]
    },
    {
      "name": "createBigNote",
      "accounts": [
        {
          "name": "forum",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "forumTreasury",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "profileOwner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bigNote",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bigNoteSeed",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpTreasury",
          "type": "u8"
        },
        {
          "name": "bumpUserProfile",
          "type": "u8"
        },
        {
          "name": "title",
          "type": "string"
        },
        {
          "name": "content",
          "type": "string"
        },
        {
          "name": "tags",
          "type": {
            "defined": "Tags"
          }
        }
      ]
    },
    {
      "name": "addContentToBigNote",
      "accounts": [
        {
          "name": "forum",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "profileOwner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userProfile",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "bigNote",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bigNoteSeed",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpUserProfile",
          "type": "u8"
        },
        {
          "name": "bumpBigNote",
          "type": "u8"
        },
        {
          "name": "newContent",
          "type": "string"
        }
      ]
    },
    {
      "name": "editBigNote",
      "accounts": [
        {
          "name": "forum",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "profileOwner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userProfile",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "bigNote",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bigNoteSeed",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpUserProfile",
          "type": "u8"
        },
        {
          "name": "bumpBigNote",
          "type": "u8"
        },
        {
          "name": "newTitle",
          "type": "string"
        },
        {
          "name": "newContent",
          "type": "string"
        },
        {
          "name": "newTags",
          "type": {
            "defined": "Tags"
          }
        }
      ]
    },
    {
      "name": "deleteBigNote",
      "accounts": [
        {
          "name": "forum",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "moderator",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "moderatorProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "profileOwner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bigNote",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bigNoteSeed",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "receiver",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpModeratorProfile",
          "type": "u8"
        },
        {
          "name": "bumpUserProfile",
          "type": "u8"
        },
        {
          "name": "bumpBigNote",
          "type": "u8"
        }
      ]
    },
    {
      "name": "verifyBigNote",
      "accounts": [
        {
          "name": "forum",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "moderator",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "moderatorProfile",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "profileOwner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userProfile",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "bigNote",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bigNoteSeed",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpModeratorProfile",
          "type": "u8"
        },
        {
          "name": "bumpUserProfile",
          "type": "u8"
        },
        {
          "name": "bumpBigNote",
          "type": "u8"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "aboutMe",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "userProfile",
            "type": "publicKey"
          },
          {
            "name": "aboutMeCreatedTs",
            "type": "u64"
          },
          {
            "name": "mostRecentUpdateTs",
            "type": "u64"
          },
          {
            "name": "content",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "answer",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "question",
            "type": "publicKey"
          },
          {
            "name": "userProfile",
            "type": "publicKey"
          },
          {
            "name": "answerSeed",
            "type": "publicKey"
          },
          {
            "name": "answerPostedTs",
            "type": "u64"
          },
          {
            "name": "mostRecentEngagementTs",
            "type": "u64"
          },
          {
            "name": "content",
            "type": "string"
          },
          {
            "name": "acceptedAnswer",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "bigNote",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "forum",
            "type": "publicKey"
          },
          {
            "name": "userProfile",
            "type": "publicKey"
          },
          {
            "name": "bigNoteSeed",
            "type": "publicKey"
          },
          {
            "name": "bigNoteCreatedTs",
            "type": "u64"
          },
          {
            "name": "mostRecentUpdateTs",
            "type": "u64"
          },
          {
            "name": "bountyAmount",
            "type": "u64"
          },
          {
            "name": "solicitingContibutors",
            "type": "bool"
          },
          {
            "name": "bountyAwarded",
            "type": "bool"
          },
          {
            "name": "isVerified",
            "type": "bool"
          },
          {
            "name": "tag",
            "type": {
              "defined": "Tags"
            }
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "content",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "comment",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "commentedOn",
            "type": "publicKey"
          },
          {
            "name": "userProfile",
            "type": "publicKey"
          },
          {
            "name": "commentSeed",
            "type": "publicKey"
          },
          {
            "name": "commentPostedTs",
            "type": "u64"
          },
          {
            "name": "mostRecentEngagementTs",
            "type": "u64"
          },
          {
            "name": "content",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "forum",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "version",
            "type": "u16"
          },
          {
            "name": "forumManager",
            "type": "publicKey"
          },
          {
            "name": "forumAuthority",
            "type": "publicKey"
          },
          {
            "name": "forumAuthoritySeed",
            "type": "publicKey"
          },
          {
            "name": "forumAuthorityBumpSeed",
            "type": {
              "array": [
                "u8",
                1
              ]
            }
          },
          {
            "name": "forumTreasury",
            "type": "publicKey"
          },
          {
            "name": "forumFees",
            "type": {
              "defined": "ForumFees"
            }
          },
          {
            "name": "forumCounts",
            "type": {
              "defined": "ForumCounts"
            }
          },
          {
            "name": "reputationMatrix",
            "type": {
              "defined": "ReputationMatrix"
            }
          }
        ]
      }
    },
    {
      "name": "question",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "forum",
            "type": "publicKey"
          },
          {
            "name": "userProfile",
            "type": "publicKey"
          },
          {
            "name": "questionSeed",
            "type": "publicKey"
          },
          {
            "name": "questionPostedTs",
            "type": "u64"
          },
          {
            "name": "mostRecentEngagementTs",
            "type": "u64"
          },
          {
            "name": "bountyAmount",
            "type": "u64"
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "content",
            "type": "string"
          },
          {
            "name": "tag",
            "type": {
              "defined": "Tags"
            }
          },
          {
            "name": "bountyAwarded",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "userProfile",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "profileOwner",
            "type": "publicKey"
          },
          {
            "name": "profileCreatedTs",
            "type": "u64"
          },
          {
            "name": "mostRecentEngagementTs",
            "type": "u64"
          },
          {
            "name": "bigNotesPosted",
            "type": "u64"
          },
          {
            "name": "bigNotesContributions",
            "type": "u64"
          },
          {
            "name": "questionsAsked",
            "type": "u64"
          },
          {
            "name": "questionsAnswered",
            "type": "u64"
          },
          {
            "name": "commentsAdded",
            "type": "u64"
          },
          {
            "name": "answersAccepted",
            "type": "u64"
          },
          {
            "name": "totalBountyReceived",
            "type": "u64"
          },
          {
            "name": "reputationScore",
            "type": "u64"
          },
          {
            "name": "extraReputationSpace",
            "type": {
              "array": [
                "u8",
                64
              ]
            }
          },
          {
            "name": "nftPfpTokenMint",
            "type": "publicKey"
          },
          {
            "name": "hasAboutMe",
            "type": "bool"
          },
          {
            "name": "hasHadAboutMe",
            "type": "bool"
          },
          {
            "name": "isModerator",
            "type": "bool"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "ForumCounts",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "forumProfileCount",
            "type": "u64"
          },
          {
            "name": "forumBigNotesCount",
            "type": "u64"
          },
          {
            "name": "forumQuestionCount",
            "type": "u64"
          },
          {
            "name": "forumAnswerCount",
            "type": "u64"
          },
          {
            "name": "forumCommentCount",
            "type": "u64"
          },
          {
            "name": "extraSpace",
            "type": {
              "array": [
                "u8",
                64
              ]
            }
          }
        ]
      }
    },
    {
      "name": "ForumFees",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "forumProfileFee",
            "type": "u64"
          },
          {
            "name": "forumQuestionFee",
            "type": "u64"
          },
          {
            "name": "forumBigNotesFee",
            "type": "u64"
          },
          {
            "name": "forumQuestionBountyMinimum",
            "type": "u64"
          },
          {
            "name": "forumBigNotesBountyMinimum",
            "type": "u64"
          },
          {
            "name": "extraSpace",
            "type": {
              "array": [
                "u8",
                64
              ]
            }
          }
        ]
      }
    },
    {
      "name": "ReputationMatrix",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "aboutMeRep",
            "type": "u64"
          },
          {
            "name": "postBigNotesRep",
            "type": "u64"
          },
          {
            "name": "contributeBigNotesRep",
            "type": "u64"
          },
          {
            "name": "questionRep",
            "type": "u64"
          },
          {
            "name": "answerRep",
            "type": "u64"
          },
          {
            "name": "commentRep",
            "type": "u64"
          },
          {
            "name": "acceptedAnswerRep",
            "type": "u64"
          },
          {
            "name": "extraSpace",
            "type": {
              "array": [
                "u8",
                64
              ]
            }
          }
        ]
      }
    },
    {
      "name": "Tags",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "DAOsAndGovernance"
          },
          {
            "name": "DataAndAnalytics"
          },
          {
            "name": "DeFi"
          },
          {
            "name": "Development"
          },
          {
            "name": "Gaming"
          },
          {
            "name": "Mobile"
          },
          {
            "name": "NFTs"
          },
          {
            "name": "Payments"
          },
          {
            "name": "ToolsAndInfrastructure"
          },
          {
            "name": "Trading"
          }
        ]
      }
    }
  ]
};

export const IDL: Forum = {
  "version": "0.1.0",
  "name": "forum",
  "instructions": [
    {
      "name": "initForum",
      "accounts": [
        {
          "name": "forum",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "forumManager",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "forumAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "forumTreasury",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpForumAuth",
          "type": "u8"
        },
        {
          "name": "forumFees",
          "type": {
            "defined": "ForumFees"
          }
        },
        {
          "name": "reputationMatrix",
          "type": {
            "defined": "ReputationMatrix"
          }
        }
      ]
    },
    {
      "name": "updateForumParams",
      "accounts": [
        {
          "name": "forum",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "forumManager",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "newForumFees",
          "type": {
            "defined": "ForumFees"
          }
        },
        {
          "name": "newReputationMatrix",
          "type": {
            "defined": "ReputationMatrix"
          }
        }
      ]
    },
    {
      "name": "payoutFromTreasury",
      "accounts": [
        {
          "name": "forum",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "forumManager",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "forumTreasury",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "receiver",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpForumTreasury",
          "type": "u8"
        },
        {
          "name": "minimumBalanceForRentExemption",
          "type": "u64"
        }
      ]
    },
    {
      "name": "closeForum",
      "accounts": [
        {
          "name": "forum",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "forumManager",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "forumTreasury",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "receiver",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpForumTreasury",
          "type": "u8"
        }
      ]
    },
    {
      "name": "createUserProfile",
      "accounts": [
        {
          "name": "forum",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "forumAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "forumTreasury",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "profileOwner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpForumAuth",
          "type": "u8"
        },
        {
          "name": "bumpTreasury",
          "type": "u8"
        }
      ]
    },
    {
      "name": "editUserProfile",
      "accounts": [
        {
          "name": "profileOwner",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "userProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftPfpTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpUserProfile",
          "type": "u8"
        }
      ]
    },
    {
      "name": "deleteUserProfile",
      "accounts": [
        {
          "name": "forum",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "profileOwner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "receiver",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpUserProfile",
          "type": "u8"
        }
      ]
    },
    {
      "name": "createAboutMe",
      "accounts": [
        {
          "name": "forum",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "profileOwner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "aboutMe",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpUserProfile",
          "type": "u8"
        },
        {
          "name": "content",
          "type": "string"
        }
      ]
    },
    {
      "name": "editAboutMe",
      "accounts": [
        {
          "name": "profileOwner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "aboutMe",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpUserProfile",
          "type": "u8"
        },
        {
          "name": "bumpAboutMe",
          "type": "u8"
        },
        {
          "name": "newContent",
          "type": "string"
        }
      ]
    },
    {
      "name": "deleteAboutMe",
      "accounts": [
        {
          "name": "profileOwner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "aboutMe",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "receiver",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpUserProfile",
          "type": "u8"
        },
        {
          "name": "bumpAboutMe",
          "type": "u8"
        }
      ]
    },
    {
      "name": "addModerator",
      "accounts": [
        {
          "name": "forum",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "forumManager",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "profileOwner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "userProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpUserProfile",
          "type": "u8"
        }
      ]
    },
    {
      "name": "removeModerator",
      "accounts": [
        {
          "name": "forum",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "forumManager",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "profileOwner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "userProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpUserProfile",
          "type": "u8"
        }
      ]
    },
    {
      "name": "askQuestion",
      "accounts": [
        {
          "name": "forum",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "forumTreasury",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "profileOwner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "question",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "questionSeed",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "bountyPda",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpTreasury",
          "type": "u8"
        },
        {
          "name": "bumpUserProfile",
          "type": "u8"
        },
        {
          "name": "title",
          "type": "string"
        },
        {
          "name": "content",
          "type": "string"
        },
        {
          "name": "tags",
          "type": {
            "defined": "Tags"
          }
        },
        {
          "name": "bountyAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "addContentToQuestion",
      "accounts": [
        {
          "name": "forum",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "profileOwner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userProfile",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "question",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "questionSeed",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpUserProfile",
          "type": "u8"
        },
        {
          "name": "bumpQuestion",
          "type": "u8"
        },
        {
          "name": "newContent",
          "type": "string"
        }
      ]
    },
    {
      "name": "editQuestion",
      "accounts": [
        {
          "name": "forum",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "profileOwner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userProfile",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "question",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "questionSeed",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpUserProfile",
          "type": "u8"
        },
        {
          "name": "bumpQuestion",
          "type": "u8"
        },
        {
          "name": "newTitle",
          "type": "string"
        },
        {
          "name": "newContent",
          "type": "string"
        },
        {
          "name": "newTags",
          "type": {
            "defined": "Tags"
          }
        }
      ]
    },
    {
      "name": "deleteQuestion",
      "accounts": [
        {
          "name": "forum",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "moderator",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "moderatorProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "profileOwner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "question",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "questionSeed",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "receiver",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpModeratorProfile",
          "type": "u8"
        },
        {
          "name": "bumpUserProfile",
          "type": "u8"
        },
        {
          "name": "bumpQuestion",
          "type": "u8"
        }
      ]
    },
    {
      "name": "supplementQuestionBounty",
      "accounts": [
        {
          "name": "forum",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "supplementor",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "supplementorProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "profileOwner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "userProfile",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "question",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "questionSeed",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "bountyPda",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpSupplementorProfile",
          "type": "u8"
        },
        {
          "name": "bumpUserProfile",
          "type": "u8"
        },
        {
          "name": "bumpQuestion",
          "type": "u8"
        },
        {
          "name": "bumpBountyPda",
          "type": "u8"
        },
        {
          "name": "supplementalBountyAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "acceptAnswer",
      "accounts": [
        {
          "name": "forum",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "profileOwner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "question",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "questionSeed",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "bountyPda",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "answerProfileOwner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "answerUserProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "answer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "answerSeed",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "receiver",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpUserProfile",
          "type": "u8"
        },
        {
          "name": "bumpQuestion",
          "type": "u8"
        },
        {
          "name": "bumpBountyPda",
          "type": "u8"
        },
        {
          "name": "bumpAnswerUserProfile",
          "type": "u8"
        },
        {
          "name": "bumpAnswer",
          "type": "u8"
        }
      ]
    },
    {
      "name": "answerQuestion",
      "accounts": [
        {
          "name": "forum",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "profileOwner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "question",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "answer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "answerSeed",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpUserProfile",
          "type": "u8"
        },
        {
          "name": "content",
          "type": "string"
        }
      ]
    },
    {
      "name": "addContentToAnswer",
      "accounts": [
        {
          "name": "forum",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "profileOwner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userProfile",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "answer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "answerSeed",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpUserProfile",
          "type": "u8"
        },
        {
          "name": "bumpAnswer",
          "type": "u8"
        },
        {
          "name": "newContent",
          "type": "string"
        }
      ]
    },
    {
      "name": "editAnswer",
      "accounts": [
        {
          "name": "forum",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "profileOwner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userProfile",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "answer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "answerSeed",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpUserProfile",
          "type": "u8"
        },
        {
          "name": "bumpQuestion",
          "type": "u8"
        },
        {
          "name": "newContent",
          "type": "string"
        }
      ]
    },
    {
      "name": "deleteAnswer",
      "accounts": [
        {
          "name": "forum",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "moderator",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "moderatorProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "profileOwner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "answer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "answerSeed",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "receiver",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpModeratorProfile",
          "type": "u8"
        },
        {
          "name": "bumpUserProfile",
          "type": "u8"
        },
        {
          "name": "bumpAnswer",
          "type": "u8"
        }
      ]
    },
    {
      "name": "leaveComment",
      "accounts": [
        {
          "name": "forum",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "profileOwner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "commentedOn",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "comment",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "commentSeed",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpUserProfile",
          "type": "u8"
        },
        {
          "name": "content",
          "type": "string"
        }
      ]
    },
    {
      "name": "editComment",
      "accounts": [
        {
          "name": "forum",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "profileOwner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userProfile",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "comment",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "commentSeed",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpUserProfile",
          "type": "u8"
        },
        {
          "name": "bumpComment",
          "type": "u8"
        },
        {
          "name": "content",
          "type": "string"
        }
      ]
    },
    {
      "name": "deleteComment",
      "accounts": [
        {
          "name": "forum",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "moderator",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "moderatorProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "profileOwner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "comment",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "commentSeed",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "receiver",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpModeratorProfile",
          "type": "u8"
        },
        {
          "name": "bumpUserProfile",
          "type": "u8"
        },
        {
          "name": "bumpComment",
          "type": "u8"
        }
      ]
    },
    {
      "name": "createBigNote",
      "accounts": [
        {
          "name": "forum",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "forumTreasury",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "profileOwner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bigNote",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bigNoteSeed",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpTreasury",
          "type": "u8"
        },
        {
          "name": "bumpUserProfile",
          "type": "u8"
        },
        {
          "name": "title",
          "type": "string"
        },
        {
          "name": "content",
          "type": "string"
        },
        {
          "name": "tags",
          "type": {
            "defined": "Tags"
          }
        }
      ]
    },
    {
      "name": "addContentToBigNote",
      "accounts": [
        {
          "name": "forum",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "profileOwner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userProfile",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "bigNote",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bigNoteSeed",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpUserProfile",
          "type": "u8"
        },
        {
          "name": "bumpBigNote",
          "type": "u8"
        },
        {
          "name": "newContent",
          "type": "string"
        }
      ]
    },
    {
      "name": "editBigNote",
      "accounts": [
        {
          "name": "forum",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "profileOwner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userProfile",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "bigNote",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bigNoteSeed",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpUserProfile",
          "type": "u8"
        },
        {
          "name": "bumpBigNote",
          "type": "u8"
        },
        {
          "name": "newTitle",
          "type": "string"
        },
        {
          "name": "newContent",
          "type": "string"
        },
        {
          "name": "newTags",
          "type": {
            "defined": "Tags"
          }
        }
      ]
    },
    {
      "name": "deleteBigNote",
      "accounts": [
        {
          "name": "forum",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "moderator",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "moderatorProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "profileOwner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bigNote",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bigNoteSeed",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "receiver",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpModeratorProfile",
          "type": "u8"
        },
        {
          "name": "bumpUserProfile",
          "type": "u8"
        },
        {
          "name": "bumpBigNote",
          "type": "u8"
        }
      ]
    },
    {
      "name": "verifyBigNote",
      "accounts": [
        {
          "name": "forum",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "moderator",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "moderatorProfile",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "profileOwner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userProfile",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "bigNote",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bigNoteSeed",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpModeratorProfile",
          "type": "u8"
        },
        {
          "name": "bumpUserProfile",
          "type": "u8"
        },
        {
          "name": "bumpBigNote",
          "type": "u8"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "aboutMe",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "userProfile",
            "type": "publicKey"
          },
          {
            "name": "aboutMeCreatedTs",
            "type": "u64"
          },
          {
            "name": "mostRecentUpdateTs",
            "type": "u64"
          },
          {
            "name": "content",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "answer",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "question",
            "type": "publicKey"
          },
          {
            "name": "userProfile",
            "type": "publicKey"
          },
          {
            "name": "answerSeed",
            "type": "publicKey"
          },
          {
            "name": "answerPostedTs",
            "type": "u64"
          },
          {
            "name": "mostRecentEngagementTs",
            "type": "u64"
          },
          {
            "name": "content",
            "type": "string"
          },
          {
            "name": "acceptedAnswer",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "bigNote",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "forum",
            "type": "publicKey"
          },
          {
            "name": "userProfile",
            "type": "publicKey"
          },
          {
            "name": "bigNoteSeed",
            "type": "publicKey"
          },
          {
            "name": "bigNoteCreatedTs",
            "type": "u64"
          },
          {
            "name": "mostRecentUpdateTs",
            "type": "u64"
          },
          {
            "name": "bountyAmount",
            "type": "u64"
          },
          {
            "name": "solicitingContibutors",
            "type": "bool"
          },
          {
            "name": "bountyAwarded",
            "type": "bool"
          },
          {
            "name": "isVerified",
            "type": "bool"
          },
          {
            "name": "tag",
            "type": {
              "defined": "Tags"
            }
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "content",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "comment",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "commentedOn",
            "type": "publicKey"
          },
          {
            "name": "userProfile",
            "type": "publicKey"
          },
          {
            "name": "commentSeed",
            "type": "publicKey"
          },
          {
            "name": "commentPostedTs",
            "type": "u64"
          },
          {
            "name": "mostRecentEngagementTs",
            "type": "u64"
          },
          {
            "name": "content",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "forum",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "version",
            "type": "u16"
          },
          {
            "name": "forumManager",
            "type": "publicKey"
          },
          {
            "name": "forumAuthority",
            "type": "publicKey"
          },
          {
            "name": "forumAuthoritySeed",
            "type": "publicKey"
          },
          {
            "name": "forumAuthorityBumpSeed",
            "type": {
              "array": [
                "u8",
                1
              ]
            }
          },
          {
            "name": "forumTreasury",
            "type": "publicKey"
          },
          {
            "name": "forumFees",
            "type": {
              "defined": "ForumFees"
            }
          },
          {
            "name": "forumCounts",
            "type": {
              "defined": "ForumCounts"
            }
          },
          {
            "name": "reputationMatrix",
            "type": {
              "defined": "ReputationMatrix"
            }
          }
        ]
      }
    },
    {
      "name": "question",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "forum",
            "type": "publicKey"
          },
          {
            "name": "userProfile",
            "type": "publicKey"
          },
          {
            "name": "questionSeed",
            "type": "publicKey"
          },
          {
            "name": "questionPostedTs",
            "type": "u64"
          },
          {
            "name": "mostRecentEngagementTs",
            "type": "u64"
          },
          {
            "name": "bountyAmount",
            "type": "u64"
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "content",
            "type": "string"
          },
          {
            "name": "tag",
            "type": {
              "defined": "Tags"
            }
          },
          {
            "name": "bountyAwarded",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "userProfile",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "profileOwner",
            "type": "publicKey"
          },
          {
            "name": "profileCreatedTs",
            "type": "u64"
          },
          {
            "name": "mostRecentEngagementTs",
            "type": "u64"
          },
          {
            "name": "bigNotesPosted",
            "type": "u64"
          },
          {
            "name": "bigNotesContributions",
            "type": "u64"
          },
          {
            "name": "questionsAsked",
            "type": "u64"
          },
          {
            "name": "questionsAnswered",
            "type": "u64"
          },
          {
            "name": "commentsAdded",
            "type": "u64"
          },
          {
            "name": "answersAccepted",
            "type": "u64"
          },
          {
            "name": "totalBountyReceived",
            "type": "u64"
          },
          {
            "name": "reputationScore",
            "type": "u64"
          },
          {
            "name": "extraReputationSpace",
            "type": {
              "array": [
                "u8",
                64
              ]
            }
          },
          {
            "name": "nftPfpTokenMint",
            "type": "publicKey"
          },
          {
            "name": "hasAboutMe",
            "type": "bool"
          },
          {
            "name": "hasHadAboutMe",
            "type": "bool"
          },
          {
            "name": "isModerator",
            "type": "bool"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "ForumCounts",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "forumProfileCount",
            "type": "u64"
          },
          {
            "name": "forumBigNotesCount",
            "type": "u64"
          },
          {
            "name": "forumQuestionCount",
            "type": "u64"
          },
          {
            "name": "forumAnswerCount",
            "type": "u64"
          },
          {
            "name": "forumCommentCount",
            "type": "u64"
          },
          {
            "name": "extraSpace",
            "type": {
              "array": [
                "u8",
                64
              ]
            }
          }
        ]
      }
    },
    {
      "name": "ForumFees",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "forumProfileFee",
            "type": "u64"
          },
          {
            "name": "forumQuestionFee",
            "type": "u64"
          },
          {
            "name": "forumBigNotesFee",
            "type": "u64"
          },
          {
            "name": "forumQuestionBountyMinimum",
            "type": "u64"
          },
          {
            "name": "forumBigNotesBountyMinimum",
            "type": "u64"
          },
          {
            "name": "extraSpace",
            "type": {
              "array": [
                "u8",
                64
              ]
            }
          }
        ]
      }
    },
    {
      "name": "ReputationMatrix",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "aboutMeRep",
            "type": "u64"
          },
          {
            "name": "postBigNotesRep",
            "type": "u64"
          },
          {
            "name": "contributeBigNotesRep",
            "type": "u64"
          },
          {
            "name": "questionRep",
            "type": "u64"
          },
          {
            "name": "answerRep",
            "type": "u64"
          },
          {
            "name": "commentRep",
            "type": "u64"
          },
          {
            "name": "acceptedAnswerRep",
            "type": "u64"
          },
          {
            "name": "extraSpace",
            "type": {
              "array": [
                "u8",
                64
              ]
            }
          }
        ]
      }
    },
    {
      "name": "Tags",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "DAOsAndGovernance"
          },
          {
            "name": "DataAndAnalytics"
          },
          {
            "name": "DeFi"
          },
          {
            "name": "Development"
          },
          {
            "name": "Gaming"
          },
          {
            "name": "Mobile"
          },
          {
            "name": "NFTs"
          },
          {
            "name": "Payments"
          },
          {
            "name": "ToolsAndInfrastructure"
          },
          {
            "name": "Trading"
          }
        ]
      }
    }
  ]
};
