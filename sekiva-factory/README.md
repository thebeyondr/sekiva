# Sekiva Factory

A factory smart contract for deploying and managing organizations and their ballots on Partisia Blockchain.

## Features

### Organization Management

- Deploy new organization contracts
- Track organization memberships
- Manage organization administrators
- Query organization details

### Ballot Management

- Deploy ballot contracts within organizations
- Track ballot statuses and participation
- Manage voter eligibility
- Query ballot results

### User Tracking

- Track user participation in organizations
- Track user voting history

## Contract Structure

The factory maintains registries for:

- Organizations
- Ballots
- User participation
- Contract deployments

## Usage

### Creating an Organization

```rust
// Deploy a new organization
factory.deploy_organization(
    name,
    description,
    profile_image,
    banner_image
);
```

### Creating a Ballot

```rust
// Deploy a new ballot within an organization
factory.deploy_ballot(
    organization_address,
    title,
    description,
    options
);
```

### Querying

- Get user's organizations
- Get organization's ballots
- Get ballot information
- Get deployment history
