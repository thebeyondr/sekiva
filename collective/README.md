# Organization

This contract handles the creation and management of an organization.

## Overview

The organization contract allows creating and managing decentralized organizations with members, administrators and proposals.

## Key Features

- Organizations have an owner, administrators, members and proposals
- Organizations have a name, description, profile image and banner image
- Only administrators can add/remove members and add proposals
- Only the owner can add/remove administrators
- Members must be added before they can become administrators

## Functions

### initialize

Creates a new organization with the given name, description and images. The creator becomes the owner, first administrator and member.

### add_administrator

Allows the owner to add a new administrator from existing members.

### remove_administrator  

Allows the owner to remove an administrator.

### add_member

Allows administrators to add new members to the organization.

### remove_member

Allows administrators to remove existing members.

### add_proposal

Allows administrators to add new proposals to the organization.

## Example Usage

Proposals can be accessed via:
<https://prpstr.xyz/{org_address}/p/{proposal_address}>
