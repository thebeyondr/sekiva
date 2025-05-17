# The DApp Playground for Partisia Blockchain

This a development environment for the Partisia Blockchain, made for creating applications and smart
contracts utilizing the Zk Rust and public blockchain.

Read the documentation to better understand
[the fundamentals of the Partisia Blockchain](https://partisiablockchain.gitlab.io/documentation/pbc-fundamentals/introduction-to-the-fundamentals.html)

The repo contains two simple smart contracts with simple front-ends:
The [petition contract](https://gitlab.com/partisiablockchain/language/example-contracts/-/tree/main/petition?ref_type=heads)
and
the [average salary contract](https://gitlab.com/partisiablockchain/language/example-contracts/-/tree/main/zk-average-salary?ref_type=heads)
This is provided in a codespace, where all the tooling needed for developing smart contracts and
front-ends is installed.

To develop in your browser create a codespace for a repository,
select the `main` branch. You can read
more [here](https://docs.github.com/en/codespaces/developing-in-a-codespace/creating-a-codespace-for-a-repository#creating-a-codespace-for-a-repository)

Inside the codespace you can run predefined tasks by pressing `Ctrl+Shift+B`.

## It is an Automated setup

To interact with the Partisia Blockchain you need an account with gas.
The codespace automatically provides you with three new accounts,
`Account-A.pk`, `Account-B.pk` and `Account-C.pk`.

The created accounts have test_coins pre-minted which gives you 100.000.000 gas on the Testnet to
interact, deploy and
play around with as part of the codespace. You can continue using these outside of the codespace,
just remember the private keys, because they are not saved when you delete the codespace.

Read how addresses works
for [accounts and smart contracts](https://partisiablockchain.gitlab.io/documentation/pbc-fundamentals/dictionary.html#address).

## It is your own online personalized DApp playground

To use the codespace to develop your own DApps, fork the repository.
On the fork you can modify the contract- and client code, to make your own DApp.
To save your changes, use git to commit those changes to your forked repository.

Read about using codespaces in a forked
repository [here](https://www.freecodecamp.org/news/how-to-make-your-first-open-source-contribution/).

When forking the repository you can drastically decrease boot up time for new dev containers
by [configuring prebuilds](https://docs.github.com/en/codespaces/prebuilding-your-codespaces/configuring-prebuilds).

If you want to do local development read
the [dev container documentation](https://docs.github.com/en/codespaces/developing-in-a-codespace/using-github-codespaces-in-visual-studio-code).

## Try, Learn and Interact with Partisia Blockchain

We have included 2 challenge-based tutorials as part of your codespace, to help you learn and
experiment.

The first one explores the [Petition example application](tutorial/petition-example-application.md),
showing how to collect signatures for showing interests in making specific changes in the world. The
application consists of a smart contract written in Rust and a web frontend written in TypeScript.

The second one explores
the [Average Salary example application](tutorial/average-salary-example-application.md), showing
how
to compute the average salary of a group, without revealing the salary of any individual. This
example
uses the superpower of Partisia
Blockchain,
[Zk contracts](https://partisiablockchain.gitlab.io/documentation/smart-contracts/zk-smart-contracts/zk-smart-contracts.html).
The
application consists of a smart contract written in Rust
and [Zk Rust](https://partisiablockchain.gitlab.io/documentation/smart-contracts/zk-smart-contracts/zk-rust-language-zkrust.html)
and a web frontend written in TypeScript.

If you want to know more about the blockchain, ZK Rust or just contracts in general,
we urge you to visit our [documentation](https://partisiablockchain.gitlab.io/documentation/) and
participate
in [our active community on Discord](https://partisiablockchain.gitlab.io/documentation/get-support-from-pbc-community.html).

## Contract Shortname Scheme

The contracts use a systematic shortname numbering scheme to organize different types of operations:

```
0x00-0x1F: Actions (Regular contract actions)
- 0x00: add_administrator
- 0x01: remove_administrator, compute_tally
- 0x02: add_member
- 0x03: remove_member
- 0x04: add_ballot
- 0x05: add_members
- 0x06: remove_members
- 0x07: deploy_ballot
- 0x08: update_metadata
- 0x09: set_vote_active (ZK action)
- 0x11: handle_organization_event

0x20-0x3F: Callbacks (Contract callbacks)
- 0x10: deploy_organization_callback
- 0x20: deploy_ballot_callback

0x40-0x5F: Events (Contract events)
- 0x40: BallotDeployed event
- 0x41: MembersAdded event
- 0x42: MembersRemoved event

0x60-0x7F: ZK Operations (Zero-knowledge computations)
- 0x60: zk_on_secret_input
- 0x61: zk_on_variable_inputted
- 0x62: zk_on_compute_complete
- 0x72: zk_compute (ballot tally)
```

This scheme helps maintain consistency across contracts and makes it easier to:
1. Identify operation types
2. Avoid shortname conflicts
3. Plan for future additions
4. Document contract interfaces

When adding new operations:
- Regular actions should use 0x00-0x1F
- Callbacks should use 0x20-0x3F
- Events should use 0x40-0x5F
- ZK operations should use 0x60-0x7F

Note: This scheme was updated to ensure consistent ranges for each operation type. Previous versions had some operations in incorrect ranges.
