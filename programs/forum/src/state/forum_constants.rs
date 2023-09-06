use anchor_lang::prelude::*;

#[proc_macros::assert_size(32)] // divisible by 8
#[repr(C)]
#[derive(Debug, Copy, Clone, AnchorSerialize, AnchorDeserialize)]
pub struct ForumConstants {

    // maximum number of allowed tags in tag vectors
    pub max_tags_length: u64,

    // maximum number of allowed characters in titles
    pub max_title_length: u64,

    // maximum number of allowed characters in urls
    pub max_url_length: u64,

    // minimum amount of inactivity time in seconds before possible refund request
    pub min_inactivity_period: u64,

}
