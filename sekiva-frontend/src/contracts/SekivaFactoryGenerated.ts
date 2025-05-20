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
export class SekivaFactoryGenerated {
  private readonly _client: BlockchainStateClient | undefined;
  private readonly _address: BlockchainAddress | undefined;

  public constructor(
    client: BlockchainStateClient | undefined,
    address: BlockchainAddress | undefined
  ) {
    this._address = address;
    this._client = client;
  }
  public deserializeSekivaFactoryState(_input: AbiInput): SekivaFactoryState {
    const admin: BlockchainAddress = _input.readAddress();
    const organizations_setLength = _input.readI32();
    const organizations: BlockchainAddress[] = [];
    for (
      let organizations_i = 0;
      organizations_i < organizations_setLength;
      organizations_i++
    ) {
      const organizations_elem: BlockchainAddress = _input.readAddress();
      organizations.push(organizations_elem);
    }
    const ballots_setLength = _input.readI32();
    const ballots: BlockchainAddress[] = [];
    for (let ballots_i = 0; ballots_i < ballots_setLength; ballots_i++) {
      const ballots_elem: BlockchainAddress = _input.readAddress();
      ballots.push(ballots_elem);
    }
    const userOrgMemberships_mapLength = _input.readI32();
    const userOrgMemberships: Map<BlockchainAddress, BlockchainAddress[]> =
      new Map();
    for (
      let userOrgMemberships_i = 0;
      userOrgMemberships_i < userOrgMemberships_mapLength;
      userOrgMemberships_i++
    ) {
      const userOrgMemberships_key: BlockchainAddress = _input.readAddress();
      const userOrgMemberships_value_setLength = _input.readI32();
      const userOrgMemberships_value: BlockchainAddress[] = [];
      for (
        let userOrgMemberships_value_i = 0;
        userOrgMemberships_value_i < userOrgMemberships_value_setLength;
        userOrgMemberships_value_i++
      ) {
        const userOrgMemberships_value_elem: BlockchainAddress =
          _input.readAddress();
        userOrgMemberships_value.push(userOrgMemberships_value_elem);
      }
      userOrgMemberships.set(userOrgMemberships_key, userOrgMemberships_value);
    }
    const ballotContractZkwa_vecLength = _input.readI32();
    const ballotContractZkwa: Buffer = _input.readBytes(
      ballotContractZkwa_vecLength
    );
    const ballotContractAbi_vecLength = _input.readI32();
    const ballotContractAbi: Buffer = _input.readBytes(
      ballotContractAbi_vecLength
    );
    const organizationContractWasm_vecLength = _input.readI32();
    const organizationContractWasm: Buffer = _input.readBytes(
      organizationContractWasm_vecLength
    );
    const organizationContractAbi_vecLength = _input.readI32();
    const organizationContractAbi: Buffer = _input.readBytes(
      organizationContractAbi_vecLength
    );
    const eventNonce: BN = _input.readU64();
    const organizationProcesses_mapLength = _input.readI32();
    const organizationProcesses: Map<string, OrganizationProcessState> =
      new Map();
    for (
      let organizationProcesses_i = 0;
      organizationProcesses_i < organizationProcesses_mapLength;
      organizationProcesses_i++
    ) {
      const organizationProcesses_key: string = _input.readString();
      const organizationProcesses_value: OrganizationProcessState =
        this.deserializeOrganizationProcessState(_input);
      organizationProcesses.set(
        organizationProcesses_key,
        organizationProcesses_value
      );
    }
    return {
      admin,
      organizations,
      ballots,
      userOrgMemberships,
      ballotContractZkwa,
      ballotContractAbi,
      organizationContractWasm,
      organizationContractAbi,
      eventNonce,
      organizationProcesses,
    };
  }
  public deserializeOrganizationProcessState(
    _input: AbiInput
  ): OrganizationProcessState {
    const discriminant = _input.readU8();
    if (discriminant === 0) {
      return this.deserializeOrganizationProcessStateCreated(_input);
    } else if (discriminant === 1) {
      return this.deserializeOrganizationProcessStateDeployed(_input);
    } else if (discriminant === 2) {
      return this.deserializeOrganizationProcessStateActive(_input);
    } else if (discriminant === 3) {
      return this.deserializeOrganizationProcessStateDeleted(_input);
    }
    throw new Error("Unknown discriminant: " + discriminant);
  }
  public deserializeOrganizationProcessStateCreated(
    _input: AbiInput
  ): OrganizationProcessStateCreated {
    return { discriminant: OrganizationProcessStateD.Created };
  }
  public deserializeOrganizationProcessStateDeployed(
    _input: AbiInput
  ): OrganizationProcessStateDeployed {
    return { discriminant: OrganizationProcessStateD.Deployed };
  }
  public deserializeOrganizationProcessStateActive(
    _input: AbiInput
  ): OrganizationProcessStateActive {
    return { discriminant: OrganizationProcessStateD.Active };
  }
  public deserializeOrganizationProcessStateDeleted(
    _input: AbiInput
  ): OrganizationProcessStateDeleted {
    return { discriminant: OrganizationProcessStateD.Deleted };
  }
  public deserializeOrganizationInit(_input: AbiInput): OrganizationInit {
    const name: string = _input.readString();
    const description: string = _input.readString();
    const profileImage: string = _input.readString();
    const bannerImage: string = _input.readString();
    const xUrl: string = _input.readString();
    const discordUrl: string = _input.readString();
    const websiteUrl: string = _input.readString();
    const administrator: BlockchainAddress = _input.readAddress();
    return {
      name,
      description,
      profileImage,
      bannerImage,
      xUrl,
      discordUrl,
      websiteUrl,
      administrator,
    };
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
    } else if (discriminant === 4) {
      return this.deserializeOrganizationEventOrganizationDeployed(_input);
    }
    throw new Error("Unknown discriminant: " + discriminant);
  }
  public deserializeOrganizationEventBallotDeployed(
    _input: AbiInput
  ): OrganizationEventBallotDeployed {
    const organization: BlockchainAddress = _input.readAddress();
    const ballot: BlockchainAddress = _input.readAddress();
    const title: string = _input.readString();
    const timestamp: BN = _input.readU64();
    const processId: string = _input.readString();
    return {
      discriminant: OrganizationEventD.BallotDeployed,
      organization,
      ballot,
      title,
      timestamp,
      processId,
    };
  }
  public deserializeOrganizationEventMembersAdded(
    _input: AbiInput
  ): OrganizationEventMembersAdded {
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
    return {
      discriminant: OrganizationEventD.MembersAdded,
      members,
      organization,
      timestamp,
      processId,
      nonce,
    };
  }
  public deserializeOrganizationEventMembersRemoved(
    _input: AbiInput
  ): OrganizationEventMembersRemoved {
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
    return {
      discriminant: OrganizationEventD.MembersRemoved,
      members,
      organization,
      timestamp,
      processId,
      nonce,
    };
  }
  public deserializeOrganizationEventBallotDeployFailed(
    _input: AbiInput
  ): OrganizationEventBallotDeployFailed {
    const organization: BlockchainAddress = _input.readAddress();
    const reason: string = _input.readString();
    const timestamp: BN = _input.readU64();
    const processId: string = _input.readString();
    return {
      discriminant: OrganizationEventD.BallotDeployFailed,
      organization,
      reason,
      timestamp,
      processId,
    };
  }
  public deserializeOrganizationEventOrganizationDeployed(
    _input: AbiInput
  ): OrganizationEventOrganizationDeployed {
    const factory: BlockchainAddress = _input.readAddress();
    const organization: BlockchainAddress = _input.readAddress();
    const timestamp: BN = _input.readU64();
    const processId: string = _input.readString();
    return {
      discriminant: OrganizationEventD.OrganizationDeployed,
      factory,
      organization,
      timestamp,
      processId,
    };
  }
  public async getState(): Promise<SekivaFactoryState> {
    const bytes = await this._client?.getContractStateBinary(this._address!);
    if (bytes === undefined) {
      throw new Error("Unable to get state bytes");
    }
    const input = AbiByteInput.createLittleEndian(bytes);
    return this.deserializeSekivaFactoryState(input);
  }

  public deserializeDeployOrganizationAction(
    _input: AbiInput
  ): DeployOrganizationAction {
    const orgInit: OrganizationInit = this.deserializeOrganizationInit(_input);
    return { discriminant: "deploy_organization", orgInit };
  }

  public deserializeHandleOrganizationEventAction(
    _input: AbiInput
  ): HandleOrganizationEventAction {
    const event: OrganizationEvent = this.deserializeOrganizationEvent(_input);
    return { discriminant: "handle_organization_event", event };
  }

  public deserializeHandleOrganizationDeployedEventAction(
    _input: AbiInput
  ): HandleOrganizationDeployedEventAction {
    const event: OrganizationEvent = this.deserializeOrganizationEvent(_input);
    return { discriminant: "handle_organization_deployed_event", event };
  }

  public deserializeDeployOrganizationCallbackCallback(
    _input: AbiInput
  ): DeployOrganizationCallbackCallback {
    const orgContractAddress: BlockchainAddress = _input.readAddress();
    const processId: string = _input.readString();
    return {
      discriminant: "deploy_organization_callback",
      orgContractAddress,
      processId,
    };
  }

  public deserializeInitializeInit(_input: AbiInput): InitializeInit {
    const ballotContractZkwa_vecLength = _input.readI32();
    const ballotContractZkwa: Buffer = _input.readBytes(
      ballotContractZkwa_vecLength
    );
    const ballotContractAbi_vecLength = _input.readI32();
    const ballotContractAbi: Buffer = _input.readBytes(
      ballotContractAbi_vecLength
    );
    const organizationContractWasm_vecLength = _input.readI32();
    const organizationContractWasm: Buffer = _input.readBytes(
      organizationContractWasm_vecLength
    );
    const organizationContractAbi_vecLength = _input.readI32();
    const organizationContractAbi: Buffer = _input.readBytes(
      organizationContractAbi_vecLength
    );
    return {
      discriminant: "initialize",
      ballotContractZkwa,
      ballotContractAbi,
      organizationContractWasm,
      organizationContractAbi,
    };
  }
}
export interface SekivaFactoryState {
  admin: BlockchainAddress;
  organizations: BlockchainAddress[];
  ballots: BlockchainAddress[];
  userOrgMemberships: Map<BlockchainAddress, BlockchainAddress[]>;
  ballotContractZkwa: Buffer;
  ballotContractAbi: Buffer;
  organizationContractWasm: Buffer;
  organizationContractAbi: Buffer;
  eventNonce: BN;
  organizationProcesses: Map<string, OrganizationProcessState>;
}

export enum OrganizationProcessStateD {
  Created = 0,
  Deployed = 1,
  Active = 2,
  Deleted = 3,
}
export type OrganizationProcessState =
  | OrganizationProcessStateCreated
  | OrganizationProcessStateDeployed
  | OrganizationProcessStateActive
  | OrganizationProcessStateDeleted;

export interface OrganizationProcessStateCreated {
  discriminant: OrganizationProcessStateD.Created;
}

export interface OrganizationProcessStateDeployed {
  discriminant: OrganizationProcessStateD.Deployed;
}

export interface OrganizationProcessStateActive {
  discriminant: OrganizationProcessStateD.Active;
}

export interface OrganizationProcessStateDeleted {
  discriminant: OrganizationProcessStateD.Deleted;
}

export interface OrganizationInit {
  name: string;
  description: string;
  profileImage: string;
  bannerImage: string;
  xUrl: string;
  discordUrl: string;
  websiteUrl: string;
  administrator: BlockchainAddress;
}
function serializeOrganizationInit(
  _out: AbiOutput,
  _value: OrganizationInit
): void {
  const {
    name,
    description,
    profileImage,
    bannerImage,
    xUrl,
    discordUrl,
    websiteUrl,
    administrator,
  } = _value;
  _out.writeString(name);
  _out.writeString(description);
  _out.writeString(profileImage);
  _out.writeString(bannerImage);
  _out.writeString(xUrl);
  _out.writeString(discordUrl);
  _out.writeString(websiteUrl);
  _out.writeAddress(administrator);
}

export enum OrganizationEventD {
  BallotDeployed = 0,
  MembersAdded = 1,
  MembersRemoved = 2,
  BallotDeployFailed = 3,
  OrganizationDeployed = 4,
}
export type OrganizationEvent =
  | OrganizationEventBallotDeployed
  | OrganizationEventMembersAdded
  | OrganizationEventMembersRemoved
  | OrganizationEventBallotDeployFailed
  | OrganizationEventOrganizationDeployed;
function serializeOrganizationEvent(
  out: AbiOutput,
  value: OrganizationEvent
): void {
  if (value.discriminant === OrganizationEventD.BallotDeployed) {
    return serializeOrganizationEventBallotDeployed(out, value);
  } else if (value.discriminant === OrganizationEventD.MembersAdded) {
    return serializeOrganizationEventMembersAdded(out, value);
  } else if (value.discriminant === OrganizationEventD.MembersRemoved) {
    return serializeOrganizationEventMembersRemoved(out, value);
  } else if (value.discriminant === OrganizationEventD.BallotDeployFailed) {
    return serializeOrganizationEventBallotDeployFailed(out, value);
  } else if (value.discriminant === OrganizationEventD.OrganizationDeployed) {
    return serializeOrganizationEventOrganizationDeployed(out, value);
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
function serializeOrganizationEventBallotDeployed(
  _out: AbiOutput,
  _value: OrganizationEventBallotDeployed
): void {
  const { organization, ballot, title, timestamp, processId } = _value;
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
function serializeOrganizationEventMembersAdded(
  _out: AbiOutput,
  _value: OrganizationEventMembersAdded
): void {
  const { members, organization, timestamp, processId, nonce } = _value;
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
function serializeOrganizationEventMembersRemoved(
  _out: AbiOutput,
  _value: OrganizationEventMembersRemoved
): void {
  const { members, organization, timestamp, processId, nonce } = _value;
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
function serializeOrganizationEventBallotDeployFailed(
  _out: AbiOutput,
  _value: OrganizationEventBallotDeployFailed
): void {
  const { organization, reason, timestamp, processId } = _value;
  _out.writeU8(_value.discriminant);
  _out.writeAddress(organization);
  _out.writeString(reason);
  _out.writeU64(timestamp);
  _out.writeString(processId);
}

export interface OrganizationEventOrganizationDeployed {
  discriminant: OrganizationEventD.OrganizationDeployed;
  factory: BlockchainAddress;
  organization: BlockchainAddress;
  timestamp: BN;
  processId: string;
}
function serializeOrganizationEventOrganizationDeployed(
  _out: AbiOutput,
  _value: OrganizationEventOrganizationDeployed
): void {
  const { factory, organization, timestamp, processId } = _value;
  _out.writeU8(_value.discriminant);
  _out.writeAddress(factory);
  _out.writeAddress(organization);
  _out.writeU64(timestamp);
  _out.writeString(processId);
}

export function initialize(
  ballotContractZkwa: Buffer,
  ballotContractAbi: Buffer,
  organizationContractWasm: Buffer,
  organizationContractAbi: Buffer
): Buffer {
  return AbiByteOutput.serializeBigEndian((_out) => {
    _out.writeBytes(Buffer.from("ffffffff0f", "hex"));
    _out.writeI32(ballotContractZkwa.length);
    _out.writeBytes(ballotContractZkwa);
    _out.writeI32(ballotContractAbi.length);
    _out.writeBytes(ballotContractAbi);
    _out.writeI32(organizationContractWasm.length);
    _out.writeBytes(organizationContractWasm);
    _out.writeI32(organizationContractAbi.length);
    _out.writeBytes(organizationContractAbi);
  });
}

export function deployOrganization(orgInit: OrganizationInit): Buffer {
  return AbiByteOutput.serializeBigEndian((_out) => {
    _out.writeBytes(Buffer.from("01", "hex"));
    serializeOrganizationInit(_out, orgInit);
  });
}

export function handleOrganizationEvent(event: OrganizationEvent): Buffer {
  return AbiByteOutput.serializeBigEndian((_out) => {
    _out.writeBytes(Buffer.from("11", "hex"));
    serializeOrganizationEvent(_out, event);
  });
}

export function handleOrganizationDeployedEvent(
  event: OrganizationEvent
): Buffer {
  return AbiByteOutput.serializeBigEndian((_out) => {
    _out.writeBytes(Buffer.from("45", "hex"));
    serializeOrganizationEvent(_out, event);
  });
}

export function deserializeState(state: StateWithClient): SekivaFactoryState;
export function deserializeState(bytes: Buffer): SekivaFactoryState;
export function deserializeState(
  bytes: Buffer,
  client: BlockchainStateClient,
  address: BlockchainAddress
): SekivaFactoryState;
export function deserializeState(
  state: Buffer | StateWithClient,
  client?: BlockchainStateClient,
  address?: BlockchainAddress
): SekivaFactoryState {
  if (Buffer.isBuffer(state)) {
    const input = AbiByteInput.createLittleEndian(state);
    return new SekivaFactoryGenerated(
      client,
      address
    ).deserializeSekivaFactoryState(input);
  } else {
    const input = AbiByteInput.createLittleEndian(state.bytes);
    return new SekivaFactoryGenerated(
      state.client,
      state.address
    ).deserializeSekivaFactoryState(input);
  }
}

export type Action =
  | DeployOrganizationAction
  | HandleOrganizationEventAction
  | HandleOrganizationDeployedEventAction;

export interface DeployOrganizationAction {
  discriminant: "deploy_organization";
  orgInit: OrganizationInit;
}
export interface HandleOrganizationEventAction {
  discriminant: "handle_organization_event";
  event: OrganizationEvent;
}
export interface HandleOrganizationDeployedEventAction {
  discriminant: "handle_organization_deployed_event";
  event: OrganizationEvent;
}
export function deserializeAction(bytes: Buffer): Action {
  const input = AbiByteInput.createBigEndian(bytes);
  const shortname = input.readShortnameString();
  const contract = new SekivaFactoryGenerated(undefined, undefined);
  if (shortname === "01") {
    return contract.deserializeDeployOrganizationAction(input);
  } else if (shortname === "11") {
    return contract.deserializeHandleOrganizationEventAction(input);
  } else if (shortname === "45") {
    return contract.deserializeHandleOrganizationDeployedEventAction(input);
  }
  throw new Error("Illegal shortname: " + shortname);
}

export type Callback = DeployOrganizationCallbackCallback;

export interface DeployOrganizationCallbackCallback {
  discriminant: "deploy_organization_callback";
  orgContractAddress: BlockchainAddress;
  processId: string;
}
export function deserializeCallback(bytes: Buffer): Callback {
  const input = AbiByteInput.createBigEndian(bytes);
  const shortname = input.readShortnameString();
  const contract = new SekivaFactoryGenerated(undefined, undefined);
  if (shortname === "10") {
    return contract.deserializeDeployOrganizationCallbackCallback(input);
  }
  throw new Error("Illegal shortname: " + shortname);
}

export type Init = InitializeInit;

export interface InitializeInit {
  discriminant: "initialize";
  ballotContractZkwa: Buffer;
  ballotContractAbi: Buffer;
  organizationContractWasm: Buffer;
  organizationContractAbi: Buffer;
}
export function deserializeInit(bytes: Buffer): Init {
  const input = AbiByteInput.createBigEndian(bytes);
  const shortname = input.readShortnameString();
  const contract = new SekivaFactoryGenerated(undefined, undefined);
  if (shortname === "ffffffff0f") {
    return contract.deserializeInitializeInit(input);
  }
  throw new Error("Illegal shortname: " + shortname);
}
