use anchor_lang::prelude::*;

#[derive(Debug, Copy, Clone, AnchorSerialize, AnchorDeserialize)]
pub enum Tags {
    DAOsAndGovernance,
    DataAndAnalytics,
    DeFi,
    Development,
    Gaming,
    Mobile,
    NFTs,
    Payments,
    ToolsAndInfrastructure,
    Trading,
}
