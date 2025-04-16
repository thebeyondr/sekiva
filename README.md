# Partisia Blockchain Build Program

Welcome to the official repository for the Partisia Blockchain Build Program! Our mission is to drive innovation on the Partisia Blockchain by incentivizing developers to build privacy-preserving, MPC-powered applications.

> **Note:** To claim a project, please open a GitHub Issue with the project number and title. This helps us track who's working on what and prevents duplicate efforts. We'll mark the project as "In Progress" once approved.

---

## Table of Contents

1. [Program Overview](#1-program-overview)
2. [Build Tiers & Leaderboard](#2-build-tiers--leaderboard)
3. [Evaluation Rubric](#3-evaluation-rubric)
4. [Project Descriptions](#4-privacy-preserving-application-projects-dapps)
5. [Submission Guidelines & Template](#5-submission-guidelines--template)
6. [Community Voting Process](#6-community-voting-process)
7. [Additional Resources](#7-additional-resources)

## 1. Program Overview

The Partisia Blockchain Build Program incentivizes developers to create cutting-edge dApps and tools that leverage our advanced MPC technology to maintain privacy while performing complex computations. All submissions must be open source (licensed under MIT, Apache 2.0, etc.) and published on GitHub.

## 2. Build Tiers & Leaderboard

### Build Tiers

Our build projects are divided into three tiers—Beginner (Easy), Intermediate, and Advanced—based on complexity, required skills, and innovation. Here's what each means:

- **Beginner Bounties (Easy):**
  Perfect for developers new to Partisia or blockchain development. These projects involve:
  - Using existing example contracts or templates.
  - Simple integrations with minimal custom logic.
  - Basic front-end development.
  - **Reward:** Up to $2,000
- **Intermediate Bounties (Medium):**
  These require a moderate grasp of Partisia's MPC features and include:
  - Custom logic for privacy-preserving computations.
  - More complex smart contract development.
  - A user-friendly front-end with clear instructions.
  - **Reward:** $2,000–$4,000
- **Advanced Bounties (Hard):**
  High-impact projects for experienced developers with deep technical expertise. Expect:
  - Complex MPC integrations or novel use cases.
  - Infrastructure tools benefiting the ecosystem.
  - Extensive testing and documentation.
  - **Reward:** $4,000+

### Leaderboard & Discord Roles

Each build awards points based on tier:

- **Easy:** 0 - 10 points
- **Medium:** 11 - 30 points
- **Hard:** 31 - 60 points

**Discord Roles:**

- **Novice:** 0 – 10 points
- **Apprentice:** 11 – 20 points
- **Adept:** 21 – 40 points
- **Expert:** 41 – 70 points
- **Master:** 100+ points

_Perks include role color changes, official GitHub recognition, eligibility for larger grants, NFT badges, monthly shoutouts, exclusive invites, merchandise, and private beta access._

## 3. Evaluation Rubric

Submissions are evaluated as follows:

| **Criteria**                                | **Description**                                                              | **Weight** |
| ------------------------------------------- | ---------------------------------------------------------------------------- | ---------- |
| **Technical Correctness & MPC Integration** | Correct implementation of MPC, robust functionality, and edge-case handling. | 35%        |
| **Innovation & Creativity**                 | Novel approach and creative use of privacy-preserving techniques.            | 20%        |
| **Code Quality & Documentation**            | Clean code, adherence to best practices, and comprehensive documentation.    | 15%        |
| **User Experience & Presentation**          | Quality and usability of the interface and overall design.                   | 10%        |
| **Compliance & Community Engagement**       | Following guidelines and active participation in community discussions.      | 10%        |
| **Community Voting**                        | Aggregated community feedback influencing the final score.                   | 10%        |

_Note: Final scores are determined by our review panel with community voting contributing 10% to the overall evaluation._

## 4. Privacy-Preserving Application Projects (dApps)

_These projects focus on building dApps that highlight Partisia's MPC-powered privacy features. They are generally **beginner-friendly** to **intermediate** in difficulty, aimed at showcasing what's possible on Partisia through practical, user-facing applications._ Each project should include a simple user interface (web or mobile) and smart contract/MPC integration on Partisia. Emphasis is on creativity, functionality, and how well the solution preserves privacy.

### 1. Privacy-Preserving Voting DApp – _Secure Anonymous Polling_ (Reward: **$3,000**, Est. Timeline: 4 weeks) 🔄

**Status:** In Progress

**Brief:** Build a decentralized voting application where votes are cast and tallied on Partisia Blockchain with full privacy. The goal is to ensure voters can verify that their vote was counted correctly without revealing who they voted for. For example, a community could vote on a proposal or election with the guarantee that individual choices remain secret, yet the final tally is correct. The application should allow an organizer to create a poll/election, voters to securely submit their votes (perhaps via an **MPC** smart contract), and then compute the result using Partisia's MPC so that only the aggregated outcome is public. This showcases Partisia's ability to provide verifiable results with hidden inputs (solving the privacy issues of traditional blockchain voting.

**difficulty: Intermediate - 25 points**

**Marking Criteria:**

- **Correctness & Privacy:** Votes must be recorded and tallied accurately using MPC, with no individual vote data exposed on-chain. The solution should demonstrate that even the vote organizer cannot learn how each person voted.
- **Use of Partisia MPC:** Effective use of Partisia's unified public/private smart contract capabilities to keep votes secret while computing the outcome. For instance, use secret sharing or a similar MPC technique for vote aggregation (citing how Partisia uses Shamir's secret sharing in their voting example is a plus).
- **Transparency & Verifiability:** Provide a way for users to verify the integrity of the vote (e.g., each vote has a receipt or proof) without compromising privacy. The community should trust the result due to the tamper-proof and MPC-based design.
- **User Experience:** Easy-to-use interface for both vote creators and voters. Even non-technical users should be able to cast a vote and understand that their choice is private. Clear instructions and feedback (e.g., confirmation of vote recorded) are expected.
- **Code Quality & Documentation:** Clean and well-documented code, with an explanation of how MPC is implemented. Include a README explaining how to deploy and run the voting dApp on Partisia, and any test results demonstrating privacy (such as showing only aggregated results visible).

### 2. Mystery "Blind Box" NFT Drop – _Fair Randomized NFT Distribution_ (Reward: **$2,000**, Est. Timeline: 2 weeks)

**Brief:** Develop a dApp that allows creators to conduct a "blind box" NFT drop on Partisia. Users purchase or mint NFTs from a collection without knowing which specific item they will get until after the reveal. The fairness and randomness of the assignment should be guaranteed through MPC – for example, using Partisia's random beacon or multi-party computation to generate random traits or select which NFT each buyer receives. This project highlights how Partisia can enable provably fair and private randomness (the assignment is hidden until reveal, preventing anyone from cheating or predicting outcomes). The deliverable is a simple NFT launch platform where a user can initialize an NFT collection with hidden attributes, and buyers can mint NFTs that reveal their attributes only once a fair random process (secured by MPC) has assigned them.

**Difficulty: Easy - 10 points**

**Marking Criteria:**

- **Fair Randomness Implementation:** The core random assignment of NFT attributes or editions must be done in a verifiably fair way (e.g., no one can predict or influence the outcome). Using Partisia's MPC nodes to jointly generate a random seed or outcome is ideal. Document how the randomness is derived and why it's secure.
- **MPC / Privacy Usage:** Until the reveal, the NFT metadata or assignment should remain secret. Leverage Partisia's capability to compute outcomes (e.g., which NFT goes to which user) without pre-revealing that information. This prevents any party from knowing the distribution before it's finalized.
- **Functionality:** Users should be able to participate in the drop easily (e.g., click "mint" or "buy" and get a random NFT). The system should handle multiple users and NFTs, and then correctly reveal the NFT properties (or which item they got) after mint. Ensure that each NFT is unique and accounted for exactly once.
- **User Interface & Experience:** Provide a basic front-end showing the blind mint process. Even if simplistic, it should inform the user that they will get a random NFT and allow them to trigger the reveal. After reveal, the user should see what NFT they obtained (image or description).
- **Verification & Transparency:** Even though the process is random, users and observers should be confident it's fair. Consider providing a proof or record of the random draw (for example, a hash of the secret seed before reveal and then unveiling the seed later for verification). Clear instructions on how others could verify the fairness (e.g., check that the revealed seed produces the outcome recorded on-chain) will earn extra credit.

### 3. Privacy-Protected Lottery Game – _MPC-Based Lucky Draw_ (Reward: **$3,000**, Est. Timeline: 3 weeks) 🔄

**Status:** In Progress

**Brief:** Create a simple lottery or lucky draw dApp in which participants can buy entries and a winner is chosen at random using Partisia's MPC capabilities. The twist is that all tickets and the drawing process are privacy-protected until the drawing concludes. This prevents issues like front-running or someone manipulating the draw, as the winning number is determined through a secure multi-party computation only when the lottery ends. The contract can collect entry fees (in MPC tokens or another asset) and at a preset time (or once a certain number of tickets are sold) perform an MPC computation to pick a winner. Only the winner's identifier is revealed (or the prize automatically sent), without revealing any unnecessary data about other participants. This project demonstrates fair random selection and the power of MPC to run lotteries or raffles that are transparent in outcome but private in process.

**Difficulty: Intermediate - 25 points**

**Marking Criteria:**

- **Secure Random Draw:** The method of selecting the winner must be unpredictable and resistant to manipulation. Use MPC to generate a random winner only at draw time (e.g., combine secret shares or inputs from multiple nodes to form a random number). Show that no one (not even a node operator) could know or influence the result beforehand.
- **Privacy of Participants:** Ensure that participation entries (e.g., who bought tickets or how many) are not exposed in a way that compromises fairness. For example, if anonymity is a feature, the identity of participants can be hidden or pseudonymous. At minimum, nothing should leak that could allow someone to target or change odds mid-lottery.
- **Lottery Functionality:** The contract and app should correctly accept entries (and funds), enforce any rules (like one entry per account if desired, or multiple entries, etc.), and then determine the winner and award the prize. All state transitions (selling tickets -> picking winner -> distributing prize) should be handled smoothly on Partisia.
- **Transparency of Outcome:** After the lottery, the outcome (winning ticket or address) should be publicly verifiable. The process should produce a record (like a transaction or event on-chain) that confirms who the winner is and perhaps a proof of fairness (similar to the NFT drop criteria: e.g., reveal the random seed or provide a cryptographic proof that the selection was random and fair).
- **User Experience & Clarity:** From a user perspective, it should be clear how to enter the lottery and what the terms are (cost, when it draws, how winners are picked). The UI should show the countdown or conditions for the draw and eventually display the winner. Even a simple web page or dashboard is fine if it communicates these points.

### 4. Decentralized Trivia Game – _Private Answers with Public Leaderboard_ (Reward: **$3,000**, Est. Timeline: 3–4 weeks) 🔄

**Status:** In Progress

**Brief:** Develop a multiplayer trivia or quiz game where players submit answers to questions, and scores are computed without revealing each player's answers until the game is over. The idea is to prevent copying or cheating off other players' responses by keeping answers secret using MPC, and then revealing correct answers and computing scores. For example, imagine a trivia dApp where a question is posted on-chain, players have a limited time to submit their answers (privately, via an MPC contract). Once time is up, the contract (with MPC) evaluates which answers are correct for each player and updates their score. Only aggregated scores or winner information is published, while individual answer submissions remain private. This showcases how even simple games can benefit from Partisia's privacy — creating a fair gameplay environment.

**difficulty: Intermediate - 25 points**

**Marking Criteria:**

- **Privacy of Answers:** Players' answers should not be visible on-chain until the reveal phase (if ever). Use MPC to compare answers to the correct answer without directly exposing the players' submissions to everyone. For instance, the contract could secret-share the correct answer and each player's answer, then MPC determines if they match for scoring.
- **Game Logic & Fairness:** Implement the game rounds such that all players are treated fairly. Ensure that the correct answer is either committed ahead of time (to avoid changing it) or otherwise guaranteed. No player should be able to see another's answer before submitting their own. The scoring mechanism must be accurate and only count truly correct answers.
- **Use of Partisia's Features:** Leverage Partisia Blockchain's capability for combined public/private smart contracts. For example, the question and maybe a hash of the correct answer could be public, but the check of each answer is done in the private MPC part. Show that the multi-party computation occurs as intended (e.g., multiple nodes jointly evaluating answers).
- **User Interface and Experience:** Provide a simple interface for the game (it can be command-line or web). It should allow an organizer to input questions and correct answers (or load a set), and allow players to join and submit answers. Show the results after each question or at the end: e.g., display the leaderboard of scores without exposing what each answer was (aside from indicating right or wrong).
- **Expandability & Creativity:** Extra credit for making the game easily extensible or more engaging. For example, support multiple questions (a quiz series), multiple players, or even a smart contract that can handle many different trivia games (rooms) in parallel. This is not a strict requirement, but good design and creativity here will be noted in the evaluation.

### 5. **MPC-Enabled Crowdfunding Platform – Private Funding with Threshold Reveal** (Reward: **$4,000**, Est. Timeline: 4 weeks)

**Brief:** a crowdfunding platform where contributions are submitted privately. The total funds raised are revealed only if a predefined funding threshold is met. This model allows backers to support projects without exposing individual contribution details, leveraging MPC to secure and aggregate the data.

**difficulty: Advanced - 40 points**

**Key Marking Criteria:**

- **Confidential Contributions:** Each contribution remains private until the overall goal is reached.
- **Threshold Mechanism:** Use MPC to reveal total funds only when a certain threshold is met, ensuring no partial disclosure that could affect contributor behavior.
- **Robust Contract Logic:** The smart contract should handle fund collection, threshold checking, and secure final disclosure.
- **User Interface & Documentation:** Clear instructions for both contributors and project owners, with a straightforward mechanism to verify that the funding total is accurate and computed fairly.

### 6. MPC-Enabled Multi-Sig Wallet – _Threshold Signature for Asset Security_ (Reward: **$5,000**, Est. Timeline: 5–6 weeks) 🔄

**Status:** In Progress

**Brief:** Develop a multi-signature wallet or custody application that uses Partisia's MPC to split a private key among multiple parties (or nodes) so no single entity ever has the full key. The idea is to showcase an **MPC-based custody solution** on Partisia, where, for example, a transaction requires approval by a threshold of participants but the signing operation is done via MPC. This could be implemented as a smart contract that coordinates an MPC key generation and signing process. A simple use-case: a **threshold wallet** for a DAO treasury, where 3 of 5 members must approve a transfer. Instead of each holding a private key shard manually, the Partisia network's MPC can hold shares and perform the signature when authorized by the group. This project aligns with Partisia's focus on advanced security for digital assets (similar to [MOCCA](https://gitlab.com/partisiablockchain/language/contracts/defi/-/tree/main/rust/mocca) custody solution, but at a basic level for this build). Deliverables could include a demo where multiple users jointly control a wallet and must approve a transaction, which then gets signed by the MPC nodes and broadcast to the blockchain.

**difficulty: Advanced - 50 points**

**Marking Criteria:**

- **Correctness of MPC Multi-Sig:** Demonstrate that a private key (for Partisia or even another blockchain's asset if using interoperability) is never reconstructed in one place. Instead, show that the signing occurs through cooperation of multiple parties or nodes. The implementation can use an existing threshold signature scheme (TSS) library if applicable, but it should be integrated with Partisia's framework. The process for adding/removing signers or changing the threshold (if supported) should be clearly documented.
- **Security & Privacy:** The design should ensure that compromising one share or one participant does not expose the full key. We will evaluate the cryptographic soundness of the approach (e.g., using at least a standard threshold scheme). Also, ensure that the transaction details can be kept confidential among signers until execution if needed (for example, the transaction could be formed in MPC too, not revealing details until it's signed).
- **Use of Partisia Ecosystem:** The project should leverage Partisia's capabilities such as its **smart contract for coordination** or using the Partisia nodes as signers. If relevant, use Partisia's bridging or interoperability features to show the wallet controlling assets on another chain (not required but could be impressive). At minimum, explain how Partisia's MPC nodes or smart contracts are utilized to manage the key shares or signature process.
- **Functionality & Ease of Use:** Provide a mechanism for multiple users to initiate and approve a transaction. For instance, a simple web dashboard or command-line script where N users provide their approval, and once the threshold is reached, the transaction is signed and executed. The workflow should be logical and not overly cumbersome for users (who should just approve or reject requests).
- **Documentation & Testing:** Because this project is more complex, good documentation is crucial. Describe the threshold cryptography approach used and any assumptions. Provide tests – for example, show that if not enough parties approve, no signature is produced, but once the threshold is met, the transaction succeeds. If possible, include a security analysis or reference to known MPC wallet practices to bolster confidence in your solution.

## 5. Developer Tools and Infrastructure Projects

_These projects aim to strengthen the Partisia developer ecosystem. They are typically **intermediate to advanced** in difficulty. By building these tools, participants directly contribute to the growth and usability of Partisia Blockchain, making it easier for all developers to create and deploy MPC-powered applications._ Each project in this category has a relatively higher reward to reflect their impact and the effort required. Clear documentation and alignment with Partisia's existing systems are important marking aspects.

### 7. Local Partisia Testnet & Developer Environment (Reward: **$6,000**, Est. Timeline: 5–6 weeks)

**Brief:** Set up a **local testnet** or sandbox environment for Partisia Blockchain development. Currently, developers may rely on public testnets, but a local environment would significantly speed up development and testing. This project involves creating a packaged solution (for example, using Docker containers or scripts) that runs a small Partisia network on a developer's machine, including MPC nodes, so that smart contracts (both public and MPC components) can be deployed and tested instantly without external dependencies. The deliverable might be a one-click installer or a set of detailed instructions and config files to launch a local multi-node Partisia network. Additional tooling like a local block explorer or debugging utilities for MPC computations would be a big plus. This project aligns with making Partisia more accessible – similar to how Ethereum has Ganache or Hardhat networks for local use, Partisia developers would greatly benefit from a local blockchain instance to iterate quickly.

**difficulty: Advanced - 60 points**

**Marking Criteria:**

- **Completeness of Environment:** The local testnet should mirror the functionality of Partisia's actual testnet as closely as possible. This means running multiple nodes (including MPC nodes) to allow private computations. We will check that smart contracts (including MPC smart contracts) can be deployed and executed in this environment and that the privacy features function (e.g., the MPC part of a contract actually engages multiple nodes locally).
- **Ease of Setup and Use:** The solution should be straightforward to use for other developers. If using Docker, a single `docker-compose up` or similar command should launch everything. If not, then provide scripts or a clear step-by-step guide. Minimal manual configuration should be needed from the user's side. Basically, a junior developer should be able to follow your instructions and get a local Partisia blockchain running within minutes.
- **Documentation:** Provide clear documentation, including prerequisites, setup steps, and examples. Document how to deploy a sample public+MPC contract on the local net, how to check logs or outcomes, and how to reset the network if needed. Troubleshooting tips are also valuable (e.g., if a node doesn't start, what to do).
- **Stability and Performance:** The local network doesn't need to be highly performant, but it should be stable enough to handle basic testing of transactions and contracts without crashing. It should also not consume excessive resources; try to optimize it to run on a typical developer laptop. We will test by running a few example contracts. The environment should maintain consensus and MPC computations correctly across restarts or at least be easily restartable.
- **Compatibility & Extendability:** Ensure the local testnet is up-to-date with the current Partisia protocol version and can be updated as Partisia evolves. If possible, implement configuration options (like number of nodes, enabling debug modes, etc.). Extra credit for including a simple block explorer UI or exposing JSON-RPC endpoints so that standard blockchain dev tools can connect to the local net. Overall, this tool will be judged heavily on how much it accelerates and simplifies the developer workflow on Partisia.

### 8. Partisia SDK or Scaffold CLI – _Developer Productivity Tool_ (Reward: **$4,000**, Est. Timeline: 4–6 weeks) 🔄

**Brief:** Create a software development kit (SDK) or a CLI "scaffolding" tool to streamline building on Partisia Blockchain. This could be delivered in one of two forms (or a combination): (a) an **SDK in a popular language** (for example, a Python SDK, or improving the existing TypeScript SDK) that provides easy functions to interact with Partisia nodes, deploy contracts, manage keys, etc.; or (b) a **CLI tool** (similar to Truffle/Hardhat for Ethereum or Substrate's SRTool) that can initialize a Partisia dApp project, compile contracts, and deploy them. The goal is to reduce the friction for developers starting on Partisia. For instance, a Python SDK could allow writing scripts to handle Partisia MPC contracts or integrate Partisia with existing Python applications. A scaffold CLI could generate boilerplate code for a new Partisia project and manage contract deployment with one command. This project supports ecosystem growth by lowering the entry barrier for new developers.

**difficulty: Advanced - 40 points**

**Marking Criteria:**

- **Functionality & Feature Set:** The SDK/CLI should cover common developer needs. For an SDK, that means functions or modules for key management, connecting to a node or API, deploying smart contracts (including handling MPC aspects), and reading contract states/events. For a CLI, that means commands to create a project, compile smart contracts (if a special compiler or configuration is needed for MPC contracts), and deploy to a specified network (local, testnet, or mainnet). We will evaluate how many useful features are included out-of-the-box.
- **Developer Experience:** The tool should be easy and intuitive to use. If it's an SDK, the APIs should be well-designed (following conventions of that language, with clear docs). If it's a CLI, commands should be clearly named and the output should guide the developer (for example, after deployment, print the contract address or any MPC parameters). Packaging (e.g., a pip/npm package for SDK, or an installable binary for CLI) will be considered – the easier it is to install and start, the better.
- **Documentation & Examples:** High-quality documentation is essential. Provide a guide on how to use the SDK or CLI, and at least one example/tutorial using it (for instance, a simple "Hello World" contract deployment using your tool). If SDK, include docstrings and a reference manual of the functions. If CLI, include a help command and maybe a sample project repository template. We will check that following the docs leads to a successful outcome on a Partisia network.
- **Integration with Partisia Tech:** Ensure the tool works with the current Partisia chain specifications. For example, if Partisia uses a specific contract language or compilation process, your tool should wrap around that. If Partisia already has some libraries, integrate rather than reinvent if possible (acknowledge existing official tools and extend them). The best submissions will likely build on Partisia's documentation to cover gaps that developers currently face.
- **Maintainability & Extensibility:** The architecture of your SDK/CLI will be evaluated for how easy it is to maintain or extend. For instance, if Partisia upgrades their protocol, can your tool be updated without a complete rewrite? Use clean code structure and possibly design the tool in modules so future contributors (or Partisia's team) can build on it. Consider open-sourcing it in a public repo for community contributions. Bonus points if your tool is already packaged and ready for others to use immediately.

## 5. Submission Guidelines & Template

All submissions must follow our [SUBMISSION_TEMPLATE.md](./SUBMISSION_TEMPLATE.md) file. Key requirements:

- Open-source code in a public GitHub repository.
- Comprehensive documentation including a README.
- Clear deployment and testing instructions.
- Submission before the stated deadline.
- Provide contact details for follow-up.
- **Weekly progress updates** through GitHub Issues in this repository (required for all projects)
- Use [Discord Developer Chat](https://discord.com/channels/819902335567265792/935292989868228638) for questions and technical discussions
- Link to your project's GitHub repository in the submission.

> **Note:** The submission template can be found in the root of this repository. Please make a copy of it and fill it out for your project submission.

### Progress Update Requirements

Each week, project teams must create a new GitHub Issue in their project repository with the following format:

```markdown
# Weekly Progress Update - [Project Name] - Week [X]

## What was accomplished this week

- Completed features
- Technical challenges overcome
- Code commits and PRs
- Documentation updates

## Next week's goals

- Planned features
- Technical challenges to address
- Milestones to reach

## Blockers or questions

- Any issues preventing progress
- Questions for the community or mentors
- Areas where help is needed

## Screenshots or demos (when applicable)

- UI/UX progress
- Working features
- Test results
```

> **Note:**
>
> - Missing two consecutive weekly updates may result in the project being marked as available for other developers to claim.
> - For questions and discussions, please use the [Discord Developer Chat](https://discord.com/channels/819902335567265792/935292989868228638)

### Project Status Indicators

- 🔄 In Progress
- ✅ Completed
- ⏳ Available
- 🚧 Under Review

## 6. Community Voting Process

- **Voting Platform:**
  Once your submission is accepted, it will be shared on:
  - Our [CrowdSnap Voting Platform](https://www.crowdsnap.ai/) for community voting
  - GitHub Discussions and Discord channels for feedback
- **How to Vote:**
  Community members can vote on CrowdSnap using their platform's voting mechanism. These votes are aggregated to contribute 10% to your overall score.
- **Feedback:**
  Community comments and suggestions will be made publicly available (anonymized if necessary) through GitHub Discussions and Discord.

## 7. Additional Resources

- **GitHub Organization:**
  Check our updates at [github.com/partisiablockchain](https://github.com/partisiablockchain).
- **Discord Community:**
  Join our [Discord Server](https://discord.gg/M3ECRTzG) for real-time discussions and Q&A.
  - [Developer Chat Channel](https://discord.com/channels/819902335567265792/935292989868228638) for technical questions and discussions
- **Notion Page:**
  Visit our Notion workspace for high-level overviews, project briefs, roadmap updates, and detailed guides.
- **Contact:**
  Reach out via GitHub Issues or Discord for any questions.

## Acknowledgment

By submitting a project, you confirm that:

- The work is original or properly credited.
- You agree to release your code under an approved open-source license.
- You accept the evaluation rubric and community voting process.

We look forward to your innovative solutions and thank you for contributing to the Partisia Blockchain ecosystem!
