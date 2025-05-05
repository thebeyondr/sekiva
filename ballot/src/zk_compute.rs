use create_type_spec_derive::CreateTypeSpec;
use pbc_zk::*;

#[allow(unused)]
const VOTE_VARIABLE_KIND: u8 = 0u8;

#[derive(CreateTypeSpec, SecretBinary)]
pub struct TallyOutput {
    option_0: Sbi32,
    option_1: Sbi32,
    option_2: Sbi32,
    option_3: Sbi32,
    option_4: Sbi32,
}

#[zk_compute(shortname = 0x72)]
pub fn tally_votes() -> TallyOutput {
    // Initialize counters for each option
    let mut tally = TallyOutput {
        option_0: Sbi32::from(0),
        option_1: Sbi32::from(0),
        option_2: Sbi32::from(0),
        option_3: Sbi32::from(0),
        option_4: Sbi32::from(0),
    };

    // Count votes for each option
    for variable_id in secret_variable_ids() {
        if load_metadata::<u8>(variable_id) == VOTE_VARIABLE_KIND {
            let vote_option = load_sbi::<Sbi8>(variable_id);

            // Increment the appropriate counter
            if vote_option == Sbi8::from(0) {
                tally.option_0 = tally.option_0 + Sbi32::from(1);
            } else if vote_option == Sbi8::from(1) {
                tally.option_1 = tally.option_1 + Sbi32::from(1);
            } else if vote_option == Sbi8::from(2) {
                tally.option_2 = tally.option_2 + Sbi32::from(1);
            } else if vote_option == Sbi8::from(3) {
                tally.option_3 = tally.option_3 + Sbi32::from(1);
            } else if vote_option == Sbi8::from(4) {
                tally.option_4 = tally.option_4 + Sbi32::from(1);
            }
        }
    }

    tally
}
