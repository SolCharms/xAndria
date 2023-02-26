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
          "name": "forumProfileFee",
          "type": "u64"
        },
        {
          "name": "forumQuestionFee",
          "type": "u64"
        },
        {
          "name": "forumQuestionBountyMinimum",
          "type": "u64"
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
          "name": "newForumProfileFee",
          "type": "u64"
        },
        {
          "name": "newForumQuestionFee",
          "type": "u64"
        },
        {
          "name": "newForumQuestionBountyMinimum",
          "type": "u64"
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
          "isMut": false,
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
          "name": "forumManager",
          "isMut": false,
          "isSigner": true
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
          "name": "bumpUserProfile",
          "type": "u8"
        },
        {
          "name": "bumpQuestion",
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
            "name": "forumProfileFee",
            "type": "u64"
          },
          {
            "name": "forumQuestionFee",
            "type": "u64"
          },
          {
            "name": "forumQuestionBountyMinimum",
            "type": "u64"
          },
          {
            "name": "forumProfileCount",
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
            "name": "nftPfpTokenMint",
            "type": "publicKey"
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
          "name": "forumProfileFee",
          "type": "u64"
        },
        {
          "name": "forumQuestionFee",
          "type": "u64"
        },
        {
          "name": "forumQuestionBountyMinimum",
          "type": "u64"
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
          "name": "newForumProfileFee",
          "type": "u64"
        },
        {
          "name": "newForumQuestionFee",
          "type": "u64"
        },
        {
          "name": "newForumQuestionBountyMinimum",
          "type": "u64"
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
          "isMut": false,
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
          "name": "forumManager",
          "isMut": false,
          "isSigner": true
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
          "name": "bumpUserProfile",
          "type": "u8"
        },
        {
          "name": "bumpQuestion",
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
            "name": "forumProfileFee",
            "type": "u64"
          },
          {
            "name": "forumQuestionFee",
            "type": "u64"
          },
          {
            "name": "forumQuestionBountyMinimum",
            "type": "u64"
          },
          {
            "name": "forumProfileCount",
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
            "name": "nftPfpTokenMint",
            "type": "publicKey"
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
