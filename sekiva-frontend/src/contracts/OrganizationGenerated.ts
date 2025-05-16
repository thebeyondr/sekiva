// This file is auto-generated from an abi-file using AbiCodegen.
/* eslint-disable */
// @ts-nocheck
// noinspection ES6UnusedImports
import {
  AbiBitInput,
  AbiBitOutput,
  AbiByteInput,
  AbiByteOutput,
  AbiInput,
  AbiOutput,
  AvlTreeMap,
  BlockchainAddress,
  BlockchainPublicKey,
  BlockchainStateClient,
  BlsPublicKey,
  BlsSignature,
  BN,
  Hash,
  Signature,
  StateWithClient,
  SecretInputBuilder,
} from "@partisiablockchain/abi-client";
import { CompactBitArray } from "@secata-public/bitmanipulation-ts";

type Option<K> = K | undefined;
export class OrganizationGenerated {
  private readonly _client: BlockchainStateClient | undefined;
  private readonly _address: BlockchainAddress | undefined;

  public constructor(
    client: BlockchainStateClient | undefined,
    address: BlockchainAddress | undefined
  ) {
    this._address = address;
    this._client = client;
  }
  public deserializeOrganizationState(_input: AbiInput): OrganizationState {
    const owner: BlockchainAddress = _input.readAddress();
    const administrators_setLength = _input.readI32();
    const administrators: BlockchainAddress[] = [];
    for (
      let administrators_i = 0;
      administrators_i < administrators_setLength;
      administrators_i++
    ) {
      const administrators_elem: BlockchainAddress = _input.readAddress();
      administrators.push(administrators_elem);
    }
    const members_setLength = _input.readI32();
    const members: BlockchainAddress[] = [];
    for (let members_i = 0; members_i < members_setLength; members_i++) {
      const members_elem: BlockchainAddress = _input.readAddress();
      members.push(members_elem);
    }
    const name: string = _input.readString();
    const description: string = _input.readString();
    const profileImage: string = _input.readString();
    const bannerImage: string = _input.readString();
    const website: string = _input.readString();
    const xAccount: string = _input.readString();
    const discordServer: string = _input.readString();
    const ballots_setLength = _input.readI32();
    const ballots: BlockchainAddress[] = [];
    for (let ballots_i = 0; ballots_i < ballots_setLength; ballots_i++) {
      const ballots_elem: BlockchainAddress = _input.readAddress();
      ballots.push(ballots_elem);
    }
    return {
      owner,
      administrators,
      members,
      name,
      description,
      profileImage,
      bannerImage,
      website,
      xAccount,
      discordServer,
      ballots,
    };
  }
  public async getState(): Promise<OrganizationState> {
    const bytes = await this._client?.getContractStateBinary(this._address!);
    if (bytes === undefined) {
      throw new Error("Unable to get state bytes");
    }
    const input = AbiByteInput.createLittleEndian(bytes);
    return this.deserializeOrganizationState(input);
  }

  public deserializeAddAdministratorAction(
    _input: AbiInput
  ): AddAdministratorAction {
    const address: BlockchainAddress = _input.readAddress();
    return { discriminant: "add_administrator", address };
  }

  public deserializeRemoveAdministratorAction(
    _input: AbiInput
  ): RemoveAdministratorAction {
    const address: BlockchainAddress = _input.readAddress();
    return { discriminant: "remove_administrator", address };
  }

  public deserializeAddMemberAction(_input: AbiInput): AddMemberAction {
    const address: BlockchainAddress = _input.readAddress();
    return { discriminant: "add_member", address };
  }

  public deserializeRemoveMemberAction(_input: AbiInput): RemoveMemberAction {
    const address: BlockchainAddress = _input.readAddress();
    return { discriminant: "remove_member", address };
  }

  public deserializeAddBallotAction(_input: AbiInput): AddBallotAction {
    const address: BlockchainAddress = _input.readAddress();
    return { discriminant: "add_ballot", address };
  }

  public deserializeAddMembersAction(_input: AbiInput): AddMembersAction {
    const addresses_vecLength = _input.readI32();
    const addresses: BlockchainAddress[] = [];
    for (
      let addresses_i = 0;
      addresses_i < addresses_vecLength;
      addresses_i++
    ) {
      const addresses_elem: BlockchainAddress = _input.readAddress();
      addresses.push(addresses_elem);
    }
    return { discriminant: "add_members", addresses };
  }

  public deserializeRemoveMembersAction(_input: AbiInput): RemoveMembersAction {
    const addresses_vecLength = _input.readI32();
    const addresses: BlockchainAddress[] = [];
    for (
      let addresses_i = 0;
      addresses_i < addresses_vecLength;
      addresses_i++
    ) {
      const addresses_elem: BlockchainAddress = _input.readAddress();
      addresses.push(addresses_elem);
    }
    return { discriminant: "remove_members", addresses };
  }

  public deserializeUpdateMetadataAction(
    _input: AbiInput
  ): UpdateMetadataAction {
    let name: Option<string> = undefined;
    const name_isSome = _input.readBoolean();
    if (name_isSome) {
      const name_option: string = _input.readString();
      name = name_option;
    }
    let description: Option<string> = undefined;
    const description_isSome = _input.readBoolean();
    if (description_isSome) {
      const description_option: string = _input.readString();
      description = description_option;
    }
    let profileImage: Option<string> = undefined;
    const profileImage_isSome = _input.readBoolean();
    if (profileImage_isSome) {
      const profileImage_option: string = _input.readString();
      profileImage = profileImage_option;
    }
    let bannerImage: Option<string> = undefined;
    const bannerImage_isSome = _input.readBoolean();
    if (bannerImage_isSome) {
      const bannerImage_option: string = _input.readString();
      bannerImage = bannerImage_option;
    }
    let website: Option<string> = undefined;
    const website_isSome = _input.readBoolean();
    if (website_isSome) {
      const website_option: string = _input.readString();
      website = website_option;
    }
    let xAccount: Option<string> = undefined;
    const xAccount_isSome = _input.readBoolean();
    if (xAccount_isSome) {
      const xAccount_option: string = _input.readString();
      xAccount = xAccount_option;
    }
    let discordServer: Option<string> = undefined;
    const discordServer_isSome = _input.readBoolean();
    if (discordServer_isSome) {
      const discordServer_option: string = _input.readString();
      discordServer = discordServer_option;
    }
    return {
      discriminant: "update_metadata",
      name,
      description,
      profileImage,
      bannerImage,
      website,
      xAccount,
      discordServer,
    };
  }

  public deserializeInitializeInit(_input: AbiInput): InitializeInit {
    const name: string = _input.readString();
    const description: string = _input.readString();
    const profileImage: string = _input.readString();
    const bannerImage: string = _input.readString();
    const website: string = _input.readString();
    const xAccount: string = _input.readString();
    const discordServer: string = _input.readString();
    return {
      discriminant: "initialize",
      name,
      description,
      profileImage,
      bannerImage,
      website,
      xAccount,
      discordServer,
    };
  }
}
export interface OrganizationState {
  owner: BlockchainAddress;
  administrators: BlockchainAddress[];
  members: BlockchainAddress[];
  name: string;
  description: string;
  profileImage: string;
  bannerImage: string;
  website: string;
  xAccount: string;
  discordServer: string;
  ballots: BlockchainAddress[];
}

export function initialize(
  name: string,
  description: string,
  profileImage: string,
  bannerImage: string,
  website: string,
  xAccount: string,
  discordServer: string
): Buffer {
  return AbiByteOutput.serializeBigEndian((_out) => {
    _out.writeBytes(Buffer.from("ffffffff0f", "hex"));
    _out.writeString(name);
    _out.writeString(description);
    _out.writeString(profileImage);
    _out.writeString(bannerImage);
    _out.writeString(website);
    _out.writeString(xAccount);
    _out.writeString(discordServer);
  });
}

export function addAdministrator(address: BlockchainAddress): Buffer {
  return AbiByteOutput.serializeBigEndian((_out) => {
    _out.writeBytes(Buffer.from("00", "hex"));
    _out.writeAddress(address);
  });
}

export function removeAdministrator(address: BlockchainAddress): Buffer {
  return AbiByteOutput.serializeBigEndian((_out) => {
    _out.writeBytes(Buffer.from("01", "hex"));
    _out.writeAddress(address);
  });
}

export function addMember(address: BlockchainAddress): Buffer {
  return AbiByteOutput.serializeBigEndian((_out) => {
    _out.writeBytes(Buffer.from("02", "hex"));
    _out.writeAddress(address);
  });
}

export function removeMember(address: BlockchainAddress): Buffer {
  return AbiByteOutput.serializeBigEndian((_out) => {
    _out.writeBytes(Buffer.from("03", "hex"));
    _out.writeAddress(address);
  });
}

export function addBallot(address: BlockchainAddress): Buffer {
  return AbiByteOutput.serializeBigEndian((_out) => {
    _out.writeBytes(Buffer.from("04", "hex"));
    _out.writeAddress(address);
  });
}

export function addMembers(addresses: BlockchainAddress[]): Buffer {
  return AbiByteOutput.serializeBigEndian((_out) => {
    _out.writeBytes(Buffer.from("05", "hex"));
    _out.writeI32(addresses.length);
    for (const addresses_vec of addresses) {
      _out.writeAddress(addresses_vec);
    }
  });
}

export function removeMembers(addresses: BlockchainAddress[]): Buffer {
  return AbiByteOutput.serializeBigEndian((_out) => {
    _out.writeBytes(Buffer.from("06", "hex"));
    _out.writeI32(addresses.length);
    for (const addresses_vec of addresses) {
      _out.writeAddress(addresses_vec);
    }
  });
}

export function updateMetadata(
  name: Option<string>,
  description: Option<string>,
  profileImage: Option<string>,
  bannerImage: Option<string>,
  website: Option<string>,
  xAccount: Option<string>,
  discordServer: Option<string>
): Buffer {
  return AbiByteOutput.serializeBigEndian((_out) => {
    _out.writeBytes(Buffer.from("08", "hex"));
    _out.writeBoolean(name !== undefined);
    if (name !== undefined) {
      _out.writeString(name);
    }
    _out.writeBoolean(description !== undefined);
    if (description !== undefined) {
      _out.writeString(description);
    }
    _out.writeBoolean(profileImage !== undefined);
    if (profileImage !== undefined) {
      _out.writeString(profileImage);
    }
    _out.writeBoolean(bannerImage !== undefined);
    if (bannerImage !== undefined) {
      _out.writeString(bannerImage);
    }
    _out.writeBoolean(website !== undefined);
    if (website !== undefined) {
      _out.writeString(website);
    }
    _out.writeBoolean(xAccount !== undefined);
    if (xAccount !== undefined) {
      _out.writeString(xAccount);
    }
    _out.writeBoolean(discordServer !== undefined);
    if (discordServer !== undefined) {
      _out.writeString(discordServer);
    }
  });
}

export function deserializeState(state: StateWithClient): OrganizationState;
export function deserializeState(bytes: Buffer): OrganizationState;
export function deserializeState(
  bytes: Buffer,
  client: BlockchainStateClient,
  address: BlockchainAddress
): OrganizationState;
export function deserializeState(
  state: Buffer | StateWithClient,
  client?: BlockchainStateClient,
  address?: BlockchainAddress
): OrganizationState {
  if (Buffer.isBuffer(state)) {
    const input = AbiByteInput.createLittleEndian(state);
    return new OrganizationGenerated(
      client,
      address
    ).deserializeOrganizationState(input);
  } else {
    const input = AbiByteInput.createLittleEndian(state.bytes);
    return new OrganizationGenerated(
      state.client,
      state.address
    ).deserializeOrganizationState(input);
  }
}

export type Action =
  | AddAdministratorAction
  | RemoveAdministratorAction
  | AddMemberAction
  | RemoveMemberAction
  | AddBallotAction
  | AddMembersAction
  | RemoveMembersAction
  | UpdateMetadataAction;

export interface AddAdministratorAction {
  discriminant: "add_administrator";
  address: BlockchainAddress;
}
export interface RemoveAdministratorAction {
  discriminant: "remove_administrator";
  address: BlockchainAddress;
}
export interface AddMemberAction {
  discriminant: "add_member";
  address: BlockchainAddress;
}
export interface RemoveMemberAction {
  discriminant: "remove_member";
  address: BlockchainAddress;
}
export interface AddBallotAction {
  discriminant: "add_ballot";
  address: BlockchainAddress;
}
export interface AddMembersAction {
  discriminant: "add_members";
  addresses: BlockchainAddress[];
}
export interface RemoveMembersAction {
  discriminant: "remove_members";
  addresses: BlockchainAddress[];
}
export interface UpdateMetadataAction {
  discriminant: "update_metadata";
  name: Option<string>;
  description: Option<string>;
  profileImage: Option<string>;
  bannerImage: Option<string>;
  website: Option<string>;
  xAccount: Option<string>;
  discordServer: Option<string>;
}
export function deserializeAction(bytes: Buffer): Action {
  const input = AbiByteInput.createBigEndian(bytes);
  const shortname = input.readShortnameString();
  const contract = new OrganizationGenerated(undefined, undefined);
  if (shortname === "00") {
    return contract.deserializeAddAdministratorAction(input);
  } else if (shortname === "01") {
    return contract.deserializeRemoveAdministratorAction(input);
  } else if (shortname === "02") {
    return contract.deserializeAddMemberAction(input);
  } else if (shortname === "03") {
    return contract.deserializeRemoveMemberAction(input);
  } else if (shortname === "04") {
    return contract.deserializeAddBallotAction(input);
  } else if (shortname === "05") {
    return contract.deserializeAddMembersAction(input);
  } else if (shortname === "06") {
    return contract.deserializeRemoveMembersAction(input);
  } else if (shortname === "08") {
    return contract.deserializeUpdateMetadataAction(input);
  }
  throw new Error("Illegal shortname: " + shortname);
}

export type Init = InitializeInit;

export interface InitializeInit {
  discriminant: "initialize";
  name: string;
  description: string;
  profileImage: string;
  bannerImage: string;
  website: string;
  xAccount: string;
  discordServer: string;
}
export function deserializeInit(bytes: Buffer): Init {
  const input = AbiByteInput.createBigEndian(bytes);
  const shortname = input.readShortnameString();
  const contract = new OrganizationGenerated(undefined, undefined);
  if (shortname === "ffffffff0f") {
    return contract.deserializeInitializeInit(input);
  }
  throw new Error("Illegal shortname: " + shortname);
}
