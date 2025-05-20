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
    for (let administrators_i = 0; administrators_i < administrators_setLength; administrators_i++) {
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
    const ballotContractZkwa_vecLength = _input.readI32();
    const ballotContractZkwa: Buffer = _input.readBytes(ballotContractZkwa_vecLength);
    const ballotContractAbi_vecLength = _input.readI32();
    const ballotContractAbi: Buffer = _input.readBytes(ballotContractAbi_vecLength);
    const ballots_setLength = _input.readI32();
    const ballots: BlockchainAddress[] = [];
    for (let ballots_i = 0; ballots_i < ballots_setLength; ballots_i++) {
      const ballots_elem: BlockchainAddress = _input.readAddress();
      ballots.push(ballots_elem);
    }
    const eventNonce: BN = _input.readU64();
    const ballotProcesses_mapLength = _input.readI32();
    const ballotProcesses: Map<string, BallotProcessState> = new Map();
    for (let ballotProcesses_i = 0; ballotProcesses_i < ballotProcesses_mapLength; ballotProcesses_i++) {
      const ballotProcesses_key: string = _input.readString();
      const ballotProcesses_value: BallotProcessState = this.deserializeBallotProcessState(_input);
      ballotProcesses.set(ballotProcesses_key, ballotProcesses_value);
    }
    const factoryAddress: BlockchainAddress = _input.readAddress();
    return { owner, administrators, members, name, description, profileImage, bannerImage, website, xAccount, discordServer, ballotContractZkwa, ballotContractAbi, ballots, eventNonce, ballotProcesses, factoryAddress };
  }
  public deserializeBallotProcessState(_input: AbiInput): BallotProcessState {
    const discriminant = _input.readU8();
    if (discriminant === 0) {
      return this.deserializeBallotProcessStateCreated(_input);
    } else if (discriminant === 1) {
      return this.deserializeBallotProcessStateDeployed(_input);
    } else if (discriminant === 2) {
      return this.deserializeBallotProcessStateActive(_input);
    } else if (discriminant === 3) {
      return this.deserializeBallotProcessStateTallying(_input);
    } else if (discriminant === 4) {
      return this.deserializeBallotProcessStateCompleted(_input);
    } else if (discriminant === 5) {
      return this.deserializeBallotProcessStateCancelled(_input);
    }
    throw new Error("Unknown discriminant: " + discriminant);
  }
  public deserializeBallotProcessStateCreated(_input: AbiInput): BallotProcessStateCreated {
    return { discriminant: BallotProcessStateD.Created,  };
  }
  public deserializeBallotProcessStateDeployed(_input: AbiInput): BallotProcessStateDeployed {
    return { discriminant: BallotProcessStateD.Deployed,  };
  }
  public deserializeBallotProcessStateActive(_input: AbiInput): BallotProcessStateActive {
    return { discriminant: BallotProcessStateD.Active,  };
  }
  public deserializeBallotProcessStateTallying(_input: AbiInput): BallotProcessStateTallying {
    return { discriminant: BallotProcessStateD.Tallying,  };
  }
  public deserializeBallotProcessStateCompleted(_input: AbiInput): BallotProcessStateCompleted {
    return { discriminant: BallotProcessStateD.Completed,  };
  }
  public deserializeBallotProcessStateCancelled(_input: AbiInput): BallotProcessStateCancelled {
    return { discriminant: BallotProcessStateD.Cancelled,  };
  }
  public deserializeBallotInit(_input: AbiInput): BallotInit {
    const options_vecLength = _input.readI32();
    const options: string[] = [];
    for (let options_i = 0; options_i < options_vecLength; options_i++) {
      const options_elem: string = _input.readString();
      options.push(options_elem);
    }
    const title: string = _input.readString();
    const description: string = _input.readString();
    const administrator: BlockchainAddress = _input.readAddress();
    const durationSeconds: BN = _input.readU64();
    return { options, title, description, administrator, durationSeconds };
  }
  public deserializeOrganizationEvent(_input: AbiInput): OrganizationEvent {
    const discriminant = _input.readU8();
    if (discriminant === 0) {
      return this.deserializeOrganizationEventBallotDeployed(_input);
    } else if (discriminant === 1) {
      return this.deserializeOrganizationEventMembersAdded(_input);
    } else if (discriminant === 2) {
      return this.deserializeOrganizationEventMembersRemoved(_input);
    } else if (discriminant === 3) {
      return this.deserializeOrganizationEventBallotDeployFailed(_input);
    }
    throw new Error("Unknown discriminant: " + discriminant);
  }
  public deserializeOrganizationEventBallotDeployed(_input: AbiInput): OrganizationEventBallotDeployed {
    const organization: BlockchainAddress = _input.readAddress();
    const ballot: BlockchainAddress = _input.readAddress();
    const title: string = _input.readString();
    const timestamp: BN = _input.readU64();
    const processId: string = _input.readString();
    return { discriminant: OrganizationEventD.BallotDeployed, organization, ballot, title, timestamp, processId };
  }
  public deserializeOrganizationEventMembersAdded(_input: AbiInput): OrganizationEventMembersAdded {
    const members_vecLength = _input.readI32();
    const members: BlockchainAddress[] = [];
    for (let members_i = 0; members_i < members_vecLength; members_i++) {
      const members_elem: BlockchainAddress = _input.readAddress();
      members.push(members_elem);
    }
    const organization: BlockchainAddress = _input.readAddress();
    const timestamp: BN = _input.readU64();
    const processId: string = _input.readString();
    const nonce: BN = _input.readU64();
    return { discriminant: OrganizationEventD.MembersAdded, members, organization, timestamp, processId, nonce };
  }
  public deserializeOrganizationEventMembersRemoved(_input: AbiInput): OrganizationEventMembersRemoved {
    const members_vecLength = _input.readI32();
    const members: BlockchainAddress[] = [];
    for (let members_i = 0; members_i < members_vecLength; members_i++) {
      const members_elem: BlockchainAddress = _input.readAddress();
      members.push(members_elem);
    }
    const organization: BlockchainAddress = _input.readAddress();
    const timestamp: BN = _input.readU64();
    const processId: string = _input.readString();
    const nonce: BN = _input.readU64();
    return { discriminant: OrganizationEventD.MembersRemoved, members, organization, timestamp, processId, nonce };
  }
  public deserializeOrganizationEventBallotDeployFailed(_input: AbiInput): OrganizationEventBallotDeployFailed {
    const organization: BlockchainAddress = _input.readAddress();
    const reason: string = _input.readString();
    const timestamp: BN = _input.readU64();
    const processId: string = _input.readString();
    return { discriminant: OrganizationEventD.BallotDeployFailed, organization, reason, timestamp, processId };
  }
  public async getState(): Promise<OrganizationState> {
    const bytes = await this._client?.getContractStateBinary(this._address!);
    if (bytes === undefined) {
      throw new Error("Unable to get state bytes");
    }
    const input = AbiByteInput.createLittleEndian(bytes);
    return this.deserializeOrganizationState(input);
  }

  public deserializeAddAdministratorAction(_input: AbiInput): AddAdministratorAction {
    const address: BlockchainAddress = _input.readAddress();
    return { discriminant: "add_administrator", address };
  }

  public deserializeRemoveAdministratorAction(_input: AbiInput): RemoveAdministratorAction {
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
    for (let addresses_i = 0; addresses_i < addresses_vecLength; addresses_i++) {
      const addresses_elem: BlockchainAddress = _input.readAddress();
      addresses.push(addresses_elem);
    }
    return { discriminant: "add_members", addresses };
  }

  public deserializeDeployBallotAction(_input: AbiInput): DeployBallotAction {
    const ballotInit: BallotInit = this.deserializeBallotInit(_input);
    return { discriminant: "deploy_ballot", ballotInit };
  }

  public deserializeUpdateMetadataAction(_input: AbiInput): UpdateMetadataAction {
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
    return { discriminant: "update_metadata", name, description, profileImage, bannerImage, website, xAccount, discordServer };
  }

  public deserializeHandleBallotDeployedEventAction(_input: AbiInput): HandleBallotDeployedEventAction {
    const event: OrganizationEvent = this.deserializeOrganizationEvent(_input);
    return { discriminant: "handle_ballot_deployed_event", event };
  }

  public deserializeDeployBallotCallbackCallback(_input: AbiInput): DeployBallotCallbackCallback {
    const ballotContractAddress: BlockchainAddress = _input.readAddress();
    const ballotTitle: string = _input.readString();
    const processId: string = _input.readString();
    return { discriminant: "deploy_ballot_callback", ballotContractAddress, ballotTitle, processId };
  }

  public deserializeInitializeInit(_input: AbiInput): InitializeInit {
    const name: string = _input.readString();
    const description: string = _input.readString();
    const profileImage: string = _input.readString();
    const bannerImage: string = _input.readString();
    const website: string = _input.readString();
    const xAccount: string = _input.readString();
    const discordServer: string = _input.readString();
    const administrator: BlockchainAddress = _input.readAddress();
    const ballotContractZkwa_vecLength = _input.readI32();
    const ballotContractZkwa: Buffer = _input.readBytes(ballotContractZkwa_vecLength);
    const ballotContractAbi_vecLength = _input.readI32();
    const ballotContractAbi: Buffer = _input.readBytes(ballotContractAbi_vecLength);
    const factoryAddress: BlockchainAddress = _input.readAddress();
    return { discriminant: "initialize", name, description, profileImage, bannerImage, website, xAccount, discordServer, administrator, ballotContractZkwa, ballotContractAbi, factoryAddress };
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
  ballotContractZkwa: Buffer;
  ballotContractAbi: Buffer;
  ballots: BlockchainAddress[];
  eventNonce: BN;
  ballotProcesses: Map<string, BallotProcessState>;
  factoryAddress: BlockchainAddress;
}

export enum BallotProcessStateD {
  Created = 0,
  Deployed = 1,
  Active = 2,
  Tallying = 3,
  Completed = 4,
  Cancelled = 5,
}
export type BallotProcessState =
  | BallotProcessStateCreated
  | BallotProcessStateDeployed
  | BallotProcessStateActive
  | BallotProcessStateTallying
  | BallotProcessStateCompleted
  | BallotProcessStateCancelled;

export interface BallotProcessStateCreated {
  discriminant: BallotProcessStateD.Created;
}

export interface BallotProcessStateDeployed {
  discriminant: BallotProcessStateD.Deployed;
}

export interface BallotProcessStateActive {
  discriminant: BallotProcessStateD.Active;
}

export interface BallotProcessStateTallying {
  discriminant: BallotProcessStateD.Tallying;
}

export interface BallotProcessStateCompleted {
  discriminant: BallotProcessStateD.Completed;
}

export interface BallotProcessStateCancelled {
  discriminant: BallotProcessStateD.Cancelled;
}

export interface BallotInit {
  options: string[];
  title: string;
  description: string;
  administrator: BlockchainAddress;
  durationSeconds: BN;
}
function serializeBallotInit(_out: AbiOutput, _value: BallotInit): void {
  const { options, title, description, administrator, durationSeconds } = _value;
  _out.writeI32(options.length);
  for (const options_vec of options) {
    _out.writeString(options_vec);
  }
  _out.writeString(title);
  _out.writeString(description);
  _out.writeAddress(administrator);
  _out.writeU64(durationSeconds);
}

export enum OrganizationEventD {
  BallotDeployed = 0,
  MembersAdded = 1,
  MembersRemoved = 2,
  BallotDeployFailed = 3,
}
export type OrganizationEvent =
  | OrganizationEventBallotDeployed
  | OrganizationEventMembersAdded
  | OrganizationEventMembersRemoved
  | OrganizationEventBallotDeployFailed;
function serializeOrganizationEvent(out: AbiOutput, value: OrganizationEvent): void {
  if (value.discriminant === OrganizationEventD.BallotDeployed) {
    return serializeOrganizationEventBallotDeployed(out, value);
  } else if (value.discriminant === OrganizationEventD.MembersAdded) {
    return serializeOrganizationEventMembersAdded(out, value);
  } else if (value.discriminant === OrganizationEventD.MembersRemoved) {
    return serializeOrganizationEventMembersRemoved(out, value);
  } else if (value.discriminant === OrganizationEventD.BallotDeployFailed) {
    return serializeOrganizationEventBallotDeployFailed(out, value);
  }
}

export interface OrganizationEventBallotDeployed {
  discriminant: OrganizationEventD.BallotDeployed;
  organization: BlockchainAddress;
  ballot: BlockchainAddress;
  title: string;
  timestamp: BN;
  processId: string;
}
function serializeOrganizationEventBallotDeployed(_out: AbiOutput, _value: OrganizationEventBallotDeployed): void {
  const {organization, ballot, title, timestamp, processId} = _value;
  _out.writeU8(_value.discriminant);
  _out.writeAddress(organization);
  _out.writeAddress(ballot);
  _out.writeString(title);
  _out.writeU64(timestamp);
  _out.writeString(processId);
}

export interface OrganizationEventMembersAdded {
  discriminant: OrganizationEventD.MembersAdded;
  members: BlockchainAddress[];
  organization: BlockchainAddress;
  timestamp: BN;
  processId: string;
  nonce: BN;
}
function serializeOrganizationEventMembersAdded(_out: AbiOutput, _value: OrganizationEventMembersAdded): void {
  const {members, organization, timestamp, processId, nonce} = _value;
  _out.writeU8(_value.discriminant);
  _out.writeI32(members.length);
  for (const members_vec of members) {
    _out.writeAddress(members_vec);
  }
  _out.writeAddress(organization);
  _out.writeU64(timestamp);
  _out.writeString(processId);
  _out.writeU64(nonce);
}

export interface OrganizationEventMembersRemoved {
  discriminant: OrganizationEventD.MembersRemoved;
  members: BlockchainAddress[];
  organization: BlockchainAddress;
  timestamp: BN;
  processId: string;
  nonce: BN;
}
function serializeOrganizationEventMembersRemoved(_out: AbiOutput, _value: OrganizationEventMembersRemoved): void {
  const {members, organization, timestamp, processId, nonce} = _value;
  _out.writeU8(_value.discriminant);
  _out.writeI32(members.length);
  for (const members_vec of members) {
    _out.writeAddress(members_vec);
  }
  _out.writeAddress(organization);
  _out.writeU64(timestamp);
  _out.writeString(processId);
  _out.writeU64(nonce);
}

export interface OrganizationEventBallotDeployFailed {
  discriminant: OrganizationEventD.BallotDeployFailed;
  organization: BlockchainAddress;
  reason: string;
  timestamp: BN;
  processId: string;
}
function serializeOrganizationEventBallotDeployFailed(_out: AbiOutput, _value: OrganizationEventBallotDeployFailed): void {
  const {organization, reason, timestamp, processId} = _value;
  _out.writeU8(_value.discriminant);
  _out.writeAddress(organization);
  _out.writeString(reason);
  _out.writeU64(timestamp);
  _out.writeString(processId);
}

export function initialize(name: string, description: string, profileImage: string, bannerImage: string, website: string, xAccount: string, discordServer: string, administrator: BlockchainAddress, ballotContractZkwa: Buffer, ballotContractAbi: Buffer, factoryAddress: BlockchainAddress): Buffer {
  return AbiByteOutput.serializeBigEndian((_out) => {
    _out.writeBytes(Buffer.from("ffffffff0f", "hex"));
    _out.writeString(name);
    _out.writeString(description);
    _out.writeString(profileImage);
    _out.writeString(bannerImage);
    _out.writeString(website);
    _out.writeString(xAccount);
    _out.writeString(discordServer);
    _out.writeAddress(administrator);
    _out.writeI32(ballotContractZkwa.length);
    _out.writeBytes(ballotContractZkwa);
    _out.writeI32(ballotContractAbi.length);
    _out.writeBytes(ballotContractAbi);
    _out.writeAddress(factoryAddress);
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

export function deployBallot(ballotInit: BallotInit): Buffer {
  return AbiByteOutput.serializeBigEndian((_out) => {
    _out.writeBytes(Buffer.from("07", "hex"));
    serializeBallotInit(_out, ballotInit);
  });
}

export function updateMetadata(name: Option<string>, description: Option<string>, profileImage: Option<string>, bannerImage: Option<string>, website: Option<string>, xAccount: Option<string>, discordServer: Option<string>): Buffer {
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

export function handleBallotDeployedEvent(event: OrganizationEvent): Buffer {
  return AbiByteOutput.serializeBigEndian((_out) => {
    _out.writeBytes(Buffer.from("40", "hex"));
    serializeOrganizationEvent(_out, event);
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
    return new OrganizationGenerated(client, address).deserializeOrganizationState(input);
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
  | DeployBallotAction
  | UpdateMetadataAction
  | HandleBallotDeployedEventAction;

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
export interface DeployBallotAction {
  discriminant: "deploy_ballot";
  ballotInit: BallotInit;
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
export interface HandleBallotDeployedEventAction {
  discriminant: "handle_ballot_deployed_event";
  event: OrganizationEvent;
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
  } else if (shortname === "07") {
    return contract.deserializeDeployBallotAction(input);
  } else if (shortname === "08") {
    return contract.deserializeUpdateMetadataAction(input);
  } else if (shortname === "40") {
    return contract.deserializeHandleBallotDeployedEventAction(input);
  }
  throw new Error("Illegal shortname: " + shortname);
}

export type Callback =
  | DeployBallotCallbackCallback;

export interface DeployBallotCallbackCallback {
  discriminant: "deploy_ballot_callback";
  ballotContractAddress: BlockchainAddress;
  ballotTitle: string;
  processId: string;
}
export function deserializeCallback(bytes: Buffer): Callback {
  const input = AbiByteInput.createBigEndian(bytes);
  const shortname = input.readShortnameString();
  const contract = new OrganizationGenerated(undefined, undefined);
  if (shortname === "20") {
    return contract.deserializeDeployBallotCallbackCallback(input);
  }
  throw new Error("Illegal shortname: " + shortname);
}

export type Init =
  | InitializeInit;

export interface InitializeInit {
  discriminant: "initialize";
  name: string;
  description: string;
  profileImage: string;
  bannerImage: string;
  website: string;
  xAccount: string;
  discordServer: string;
  administrator: BlockchainAddress;
  ballotContractZkwa: Buffer;
  ballotContractAbi: Buffer;
  factoryAddress: BlockchainAddress;
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

