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
export class BallotGenerated {
  private readonly _client: BlockchainStateClient | undefined;
  private readonly _address: BlockchainAddress | undefined;
  
  public constructor(
    client: BlockchainStateClient | undefined,
    address: BlockchainAddress | undefined
  ) {
    this._address = address;
    this._client = client;
  }
  public deserializeBallotState(_input: AbiInput): BallotState {
    const organization: BlockchainAddress = _input.readAddress();
    const administrator: BlockchainAddress = _input.readAddress();
    const title: string = _input.readString();
    const description: string = _input.readString();
    const options_vecLength = _input.readI32();
    const options: string[] = [];
    for (let options_i = 0; options_i < options_vecLength; options_i++) {
      const options_elem: string = _input.readString();
      options.push(options_elem);
    }
    const startTime: BN = _input.readU64();
    const endTime: BN = _input.readU64();
    let status: Option<BallotStatus> = undefined;
    const status_isSome = _input.readBoolean();
    if (status_isSome) {
      const status_option: BallotStatus = this.deserializeBallotStatus(_input);
      status = status_option;
    }
    let tally: Option<Tally> = undefined;
    const tally_isSome = _input.readBoolean();
    if (tally_isSome) {
      const tally_option: Tally = this.deserializeTally(_input);
      tally = tally_option;
    }
    const eligibleVoters_vecLength = _input.readI32();
    const eligibleVoters: BlockchainAddress[] = [];
    for (let eligibleVoters_i = 0; eligibleVoters_i < eligibleVoters_vecLength; eligibleVoters_i++) {
      const eligibleVoters_elem: BlockchainAddress = _input.readAddress();
      eligibleVoters.push(eligibleVoters_elem);
    }
    const alreadyVoted_vecLength = _input.readI32();
    const alreadyVoted: BlockchainAddress[] = [];
    for (let alreadyVoted_i = 0; alreadyVoted_i < alreadyVoted_vecLength; alreadyVoted_i++) {
      const alreadyVoted_elem: BlockchainAddress = _input.readAddress();
      alreadyVoted.push(alreadyVoted_elem);
    }
    const processState: BallotProcessState = this.deserializeBallotProcessState(_input);
    const processId: string = _input.readString();
    const eventProcesses_mapLength = _input.readI32();
    const eventProcesses: Map<string, ProcessState> = new Map();
    for (let eventProcesses_i = 0; eventProcesses_i < eventProcesses_mapLength; eventProcesses_i++) {
      const eventProcesses_key: string = _input.readString();
      const eventProcesses_value: ProcessState = this.deserializeProcessState(_input);
      eventProcesses.set(eventProcesses_key, eventProcesses_value);
    }
    return { organization, administrator, title, description, options, startTime, endTime, status, tally, eligibleVoters, alreadyVoted, processState, processId, eventProcesses };
  }
  public deserializeBallotStatus(_input: AbiInput): BallotStatus {
    const discriminant = _input.readU8();
    if (discriminant === 0) {
      return this.deserializeBallotStatusCreated(_input);
    } else if (discriminant === 1) {
      return this.deserializeBallotStatusActive(_input);
    } else if (discriminant === 2) {
      return this.deserializeBallotStatusTallying(_input);
    } else if (discriminant === 3) {
      return this.deserializeBallotStatusCompleted(_input);
    } else if (discriminant === 4) {
      return this.deserializeBallotStatusCancelled(_input);
    }
    throw new Error("Unknown discriminant: " + discriminant);
  }
  public deserializeBallotStatusCreated(_input: AbiInput): BallotStatusCreated {
    return { discriminant: BallotStatusD.Created,  };
  }
  public deserializeBallotStatusActive(_input: AbiInput): BallotStatusActive {
    return { discriminant: BallotStatusD.Active,  };
  }
  public deserializeBallotStatusTallying(_input: AbiInput): BallotStatusTallying {
    return { discriminant: BallotStatusD.Tallying,  };
  }
  public deserializeBallotStatusCompleted(_input: AbiInput): BallotStatusCompleted {
    return { discriminant: BallotStatusD.Completed,  };
  }
  public deserializeBallotStatusCancelled(_input: AbiInput): BallotStatusCancelled {
    return { discriminant: BallotStatusD.Cancelled,  };
  }
  public deserializeTally(_input: AbiInput): Tally {
    const option0: number = _input.readU32();
    const option1: number = _input.readU32();
    const option2: number = _input.readU32();
    const option3: number = _input.readU32();
    const option4: number = _input.readU32();
    const total: number = _input.readU32();
    return { option0, option1, option2, option3, option4, total };
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
  public deserializeProcessState(_input: AbiInput): ProcessState {
    const discriminant = _input.readU8();
    if (discriminant === 0) {
      return this.deserializeProcessStateReceived(_input);
    } else if (discriminant === 1) {
      return this.deserializeProcessStateComplete(_input);
    } else if (discriminant === 2) {
      return this.deserializeProcessStateIgnored(_input);
    }
    throw new Error("Unknown discriminant: " + discriminant);
  }
  public deserializeProcessStateReceived(_input: AbiInput): ProcessStateReceived {
    return { discriminant: ProcessStateD.Received,  };
  }
  public deserializeProcessStateComplete(_input: AbiInput): ProcessStateComplete {
    return { discriminant: ProcessStateD.Complete,  };
  }
  public deserializeProcessStateIgnored(_input: AbiInput): ProcessStateIgnored {
    return { discriminant: ProcessStateD.Ignored,  };
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
  public deserializeBallotEvent(_input: AbiInput): BallotEvent {
    const discriminant = _input.readU8();
    if (discriminant === 0) {
      return this.deserializeBallotEventMembersUpdated(_input);
    } else if (discriminant === 1) {
      return this.deserializeBallotEventVoteCast(_input);
    } else if (discriminant === 2) {
      return this.deserializeBallotEventTallyStarted(_input);
    } else if (discriminant === 3) {
      return this.deserializeBallotEventTallyCompleted(_input);
    } else if (discriminant === 4) {
      return this.deserializeBallotEventStatusChanged(_input);
    }
    throw new Error("Unknown discriminant: " + discriminant);
  }
  public deserializeBallotEventMembersUpdated(_input: AbiInput): BallotEventMembersUpdated {
    const added_vecLength = _input.readI32();
    const added: BlockchainAddress[] = [];
    for (let added_i = 0; added_i < added_vecLength; added_i++) {
      const added_elem: BlockchainAddress = _input.readAddress();
      added.push(added_elem);
    }
    const removed_vecLength = _input.readI32();
    const removed: BlockchainAddress[] = [];
    for (let removed_i = 0; removed_i < removed_vecLength; removed_i++) {
      const removed_elem: BlockchainAddress = _input.readAddress();
      removed.push(removed_elem);
    }
    const timestamp: BN = _input.readU64();
    const processId: string = _input.readString();
    return { discriminant: BallotEventD.MembersUpdated, added, removed, timestamp, processId };
  }
  public deserializeBallotEventVoteCast(_input: AbiInput): BallotEventVoteCast {
    const voter: BlockchainAddress = _input.readAddress();
    const timestamp: BN = _input.readU64();
    const processId: string = _input.readString();
    return { discriminant: BallotEventD.VoteCast, voter, timestamp, processId };
  }
  public deserializeBallotEventTallyStarted(_input: AbiInput): BallotEventTallyStarted {
    const timestamp: BN = _input.readU64();
    const processId: string = _input.readString();
    return { discriminant: BallotEventD.TallyStarted, timestamp, processId };
  }
  public deserializeBallotEventTallyCompleted(_input: AbiInput): BallotEventTallyCompleted {
    const timestamp: BN = _input.readU64();
    const processId: string = _input.readString();
    return { discriminant: BallotEventD.TallyCompleted, timestamp, processId };
  }
  public deserializeBallotEventStatusChanged(_input: AbiInput): BallotEventStatusChanged {
    const status: BallotStatus = this.deserializeBallotStatus(_input);
    const timestamp: BN = _input.readU64();
    const processId: string = _input.readString();
    return { discriminant: BallotEventD.StatusChanged, status, timestamp, processId };
  }
  public async getState(): Promise<BallotState> {
    const bytes = await this._client?.getContractStateBinary(this._address!);
    if (bytes === undefined) {
      throw new Error("Unable to get state bytes");
    }
    const input = AbiByteInput.createLittleEndian(bytes);
    return this.deserializeBallotState(input);
  }

  public deserializeComputeTallyAction(_input: AbiInput): ComputeTallyAction {
    return { discriminant: "compute_tally",  };
  }

  public deserializeSyncVotersAction(_input: AbiInput): SyncVotersAction {
    const newEligibleVoters_vecLength = _input.readI32();
    const newEligibleVoters: BlockchainAddress[] = [];
    for (let newEligibleVoters_i = 0; newEligibleVoters_i < newEligibleVoters_vecLength; newEligibleVoters_i++) {
      const newEligibleVoters_elem: BlockchainAddress = _input.readAddress();
      newEligibleVoters.push(newEligibleVoters_elem);
    }
    return { discriminant: "sync_voters", newEligibleVoters };
  }

  public deserializeSetVoteActiveAction(_input: AbiInput): SetVoteActiveAction {
    return { discriminant: "set_vote_active",  };
  }

  public deserializeCancelBallotAction(_input: AbiInput): CancelBallotAction {
    return { discriminant: "cancel_ballot",  };
  }

  public deserializeHandleOrgEventAction(_input: AbiInput): HandleOrgEventAction {
    const event: OrganizationEvent = this.deserializeOrganizationEvent(_input);
    return { discriminant: "handle_org_event", event };
  }

  public deserializeStatusChangedAction(_input: AbiInput): StatusChangedAction {
    const event: BallotEvent = this.deserializeBallotEvent(_input);
    return { discriminant: "status_changed", event };
  }

  public deserializeInitializeInit(_input: AbiInput): InitializeInit {
    const options_vecLength = _input.readI32();
    const options: string[] = [];
    for (let options_i = 0; options_i < options_vecLength; options_i++) {
      const options_elem: string = _input.readString();
      options.push(options_elem);
    }
    const title: string = _input.readString();
    const description: string = _input.readString();
    const organization: BlockchainAddress = _input.readAddress();
    const administrator: BlockchainAddress = _input.readAddress();
    const eligibleVoters_vecLength = _input.readI32();
    const eligibleVoters: BlockchainAddress[] = [];
    for (let eligibleVoters_i = 0; eligibleVoters_i < eligibleVoters_vecLength; eligibleVoters_i++) {
      const eligibleVoters_elem: BlockchainAddress = _input.readAddress();
      eligibleVoters.push(eligibleVoters_elem);
    }
    return { discriminant: "initialize", options, title, description, organization, administrator, eligibleVoters };
  }

}
export interface BallotState {
  organization: BlockchainAddress;
  administrator: BlockchainAddress;
  title: string;
  description: string;
  options: string[];
  startTime: BN;
  endTime: BN;
  status: Option<BallotStatus>;
  tally: Option<Tally>;
  eligibleVoters: BlockchainAddress[];
  alreadyVoted: BlockchainAddress[];
  processState: BallotProcessState;
  processId: string;
  eventProcesses: Map<string, ProcessState>;
}

export enum BallotStatusD {
  Created = 0,
  Active = 1,
  Tallying = 2,
  Completed = 3,
  Cancelled = 4,
}
export type BallotStatus =
  | BallotStatusCreated
  | BallotStatusActive
  | BallotStatusTallying
  | BallotStatusCompleted
  | BallotStatusCancelled;
function serializeBallotStatus(out: AbiOutput, value: BallotStatus): void {
  if (value.discriminant === BallotStatusD.Created) {
    return serializeBallotStatusCreated(out, value);
  } else if (value.discriminant === BallotStatusD.Active) {
    return serializeBallotStatusActive(out, value);
  } else if (value.discriminant === BallotStatusD.Tallying) {
    return serializeBallotStatusTallying(out, value);
  } else if (value.discriminant === BallotStatusD.Completed) {
    return serializeBallotStatusCompleted(out, value);
  } else if (value.discriminant === BallotStatusD.Cancelled) {
    return serializeBallotStatusCancelled(out, value);
  }
}

export interface BallotStatusCreated {
  discriminant: BallotStatusD.Created;
}
function serializeBallotStatusCreated(_out: AbiOutput, _value: BallotStatusCreated): void {
  const {} = _value;
  _out.writeU8(_value.discriminant);
}

export interface BallotStatusActive {
  discriminant: BallotStatusD.Active;
}
function serializeBallotStatusActive(_out: AbiOutput, _value: BallotStatusActive): void {
  const {} = _value;
  _out.writeU8(_value.discriminant);
}

export interface BallotStatusTallying {
  discriminant: BallotStatusD.Tallying;
}
function serializeBallotStatusTallying(_out: AbiOutput, _value: BallotStatusTallying): void {
  const {} = _value;
  _out.writeU8(_value.discriminant);
}

export interface BallotStatusCompleted {
  discriminant: BallotStatusD.Completed;
}
function serializeBallotStatusCompleted(_out: AbiOutput, _value: BallotStatusCompleted): void {
  const {} = _value;
  _out.writeU8(_value.discriminant);
}

export interface BallotStatusCancelled {
  discriminant: BallotStatusD.Cancelled;
}
function serializeBallotStatusCancelled(_out: AbiOutput, _value: BallotStatusCancelled): void {
  const {} = _value;
  _out.writeU8(_value.discriminant);
}

export interface Tally {
  option0: number;
  option1: number;
  option2: number;
  option3: number;
  option4: number;
  total: number;
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

export enum ProcessStateD {
  Received = 0,
  Complete = 1,
  Ignored = 2,
}
export type ProcessState =
  | ProcessStateReceived
  | ProcessStateComplete
  | ProcessStateIgnored;

export interface ProcessStateReceived {
  discriminant: ProcessStateD.Received;
}

export interface ProcessStateComplete {
  discriminant: ProcessStateD.Complete;
}

export interface ProcessStateIgnored {
  discriminant: ProcessStateD.Ignored;
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

export enum BallotEventD {
  MembersUpdated = 0,
  VoteCast = 1,
  TallyStarted = 2,
  TallyCompleted = 3,
  StatusChanged = 4,
}
export type BallotEvent =
  | BallotEventMembersUpdated
  | BallotEventVoteCast
  | BallotEventTallyStarted
  | BallotEventTallyCompleted
  | BallotEventStatusChanged;
function serializeBallotEvent(out: AbiOutput, value: BallotEvent): void {
  if (value.discriminant === BallotEventD.MembersUpdated) {
    return serializeBallotEventMembersUpdated(out, value);
  } else if (value.discriminant === BallotEventD.VoteCast) {
    return serializeBallotEventVoteCast(out, value);
  } else if (value.discriminant === BallotEventD.TallyStarted) {
    return serializeBallotEventTallyStarted(out, value);
  } else if (value.discriminant === BallotEventD.TallyCompleted) {
    return serializeBallotEventTallyCompleted(out, value);
  } else if (value.discriminant === BallotEventD.StatusChanged) {
    return serializeBallotEventStatusChanged(out, value);
  }
}

export interface BallotEventMembersUpdated {
  discriminant: BallotEventD.MembersUpdated;
  added: BlockchainAddress[];
  removed: BlockchainAddress[];
  timestamp: BN;
  processId: string;
}
function serializeBallotEventMembersUpdated(_out: AbiOutput, _value: BallotEventMembersUpdated): void {
  const {added, removed, timestamp, processId} = _value;
  _out.writeU8(_value.discriminant);
  _out.writeI32(added.length);
  for (const added_vec of added) {
    _out.writeAddress(added_vec);
  }
  _out.writeI32(removed.length);
  for (const removed_vec of removed) {
    _out.writeAddress(removed_vec);
  }
  _out.writeU64(timestamp);
  _out.writeString(processId);
}

export interface BallotEventVoteCast {
  discriminant: BallotEventD.VoteCast;
  voter: BlockchainAddress;
  timestamp: BN;
  processId: string;
}
function serializeBallotEventVoteCast(_out: AbiOutput, _value: BallotEventVoteCast): void {
  const {voter, timestamp, processId} = _value;
  _out.writeU8(_value.discriminant);
  _out.writeAddress(voter);
  _out.writeU64(timestamp);
  _out.writeString(processId);
}

export interface BallotEventTallyStarted {
  discriminant: BallotEventD.TallyStarted;
  timestamp: BN;
  processId: string;
}
function serializeBallotEventTallyStarted(_out: AbiOutput, _value: BallotEventTallyStarted): void {
  const {timestamp, processId} = _value;
  _out.writeU8(_value.discriminant);
  _out.writeU64(timestamp);
  _out.writeString(processId);
}

export interface BallotEventTallyCompleted {
  discriminant: BallotEventD.TallyCompleted;
  timestamp: BN;
  processId: string;
}
function serializeBallotEventTallyCompleted(_out: AbiOutput, _value: BallotEventTallyCompleted): void {
  const {timestamp, processId} = _value;
  _out.writeU8(_value.discriminant);
  _out.writeU64(timestamp);
  _out.writeString(processId);
}

export interface BallotEventStatusChanged {
  discriminant: BallotEventD.StatusChanged;
  status: BallotStatus;
  timestamp: BN;
  processId: string;
}
function serializeBallotEventStatusChanged(_out: AbiOutput, _value: BallotEventStatusChanged): void {
  const {status, timestamp, processId} = _value;
  _out.writeU8(_value.discriminant);
  serializeBallotStatus(_out, status);
  _out.writeU64(timestamp);
  _out.writeString(processId);
}

export function initialize(options: string[], title: string, description: string, organization: BlockchainAddress, administrator: BlockchainAddress, eligibleVoters: BlockchainAddress[]): Buffer {
  return AbiByteOutput.serializeBigEndian((_out) => {
    _out.writeBytes(Buffer.from("ffffffff0f", "hex"));
    _out.writeI32(options.length);
    for (const options_vec of options) {
      _out.writeString(options_vec);
    }
    _out.writeString(title);
    _out.writeString(description);
    _out.writeAddress(organization);
    _out.writeAddress(administrator);
    _out.writeI32(eligibleVoters.length);
    for (const eligibleVoters_vec of eligibleVoters) {
      _out.writeAddress(eligibleVoters_vec);
    }
  });
}

export function computeTally(): Buffer {
  return AbiByteOutput.serializeBigEndian((_out) => {
    _out.writeU8(0x09);
    _out.writeBytes(Buffer.from("01", "hex"));
  });
}

export function syncVoters(newEligibleVoters: BlockchainAddress[]): Buffer {
  return AbiByteOutput.serializeBigEndian((_out) => {
    _out.writeU8(0x09);
    _out.writeBytes(Buffer.from("05", "hex"));
    _out.writeI32(newEligibleVoters.length);
    for (const newEligibleVoters_vec of newEligibleVoters) {
      _out.writeAddress(newEligibleVoters_vec);
    }
  });
}

export function setVoteActive(): Buffer {
  return AbiByteOutput.serializeBigEndian((_out) => {
    _out.writeU8(0x09);
    _out.writeBytes(Buffer.from("09", "hex"));
  });
}

export function cancelBallot(): Buffer {
  return AbiByteOutput.serializeBigEndian((_out) => {
    _out.writeU8(0x09);
    _out.writeBytes(Buffer.from("11", "hex"));
  });
}

export function handleOrgEvent(event: OrganizationEvent): Buffer {
  return AbiByteOutput.serializeBigEndian((_out) => {
    _out.writeU8(0x09);
    _out.writeBytes(Buffer.from("30", "hex"));
    serializeOrganizationEvent(_out, event);
  });
}

export function statusChanged(event: BallotEvent): Buffer {
  return AbiByteOutput.serializeBigEndian((_out) => {
    _out.writeU8(0x09);
    _out.writeBytes(Buffer.from("50", "hex"));
    serializeBallotEvent(_out, event);
  });
}

export function castVote(): SecretInputBuilder<number> {
  const _publicRpc: Buffer = AbiByteOutput.serializeBigEndian((_out) => {
    _out.writeBytes(Buffer.from("60", "hex"));
  });
  const _secretInput = (secret_input_lambda: number): CompactBitArray => AbiBitOutput.serialize((_out) => {
    _out.writeI8(secret_input_lambda);
  });
  return new SecretInputBuilder(_publicRpc, _secretInput);
}

export function deserializeState(state: StateWithClient): BallotState;
export function deserializeState(bytes: Buffer): BallotState;
export function deserializeState(
  bytes: Buffer,
  client: BlockchainStateClient,
  address: BlockchainAddress
): BallotState;
export function deserializeState(
  state: Buffer | StateWithClient,
  client?: BlockchainStateClient,
  address?: BlockchainAddress
): BallotState {
  if (Buffer.isBuffer(state)) {
    const input = AbiByteInput.createLittleEndian(state);
    return new BallotGenerated(client, address).deserializeBallotState(input);
  } else {
    const input = AbiByteInput.createLittleEndian(state.bytes);
    return new BallotGenerated(
      state.client,
      state.address
    ).deserializeBallotState(input);
  }
}

export type Action =
  | ComputeTallyAction
  | SyncVotersAction
  | SetVoteActiveAction
  | CancelBallotAction
  | HandleOrgEventAction
  | StatusChangedAction;

export interface ComputeTallyAction {
  discriminant: "compute_tally";
}
export interface SyncVotersAction {
  discriminant: "sync_voters";
  newEligibleVoters: BlockchainAddress[];
}
export interface SetVoteActiveAction {
  discriminant: "set_vote_active";
}
export interface CancelBallotAction {
  discriminant: "cancel_ballot";
}
export interface HandleOrgEventAction {
  discriminant: "handle_org_event";
  event: OrganizationEvent;
}
export interface StatusChangedAction {
  discriminant: "status_changed";
  event: BallotEvent;
}
export function deserializeAction(bytes: Buffer): Action {
  const input = AbiByteInput.createBigEndian(bytes);
  input.readU8();
  const shortname = input.readShortnameString();
  const contract = new BallotGenerated(undefined, undefined);
  if (shortname === "01") {
    return contract.deserializeComputeTallyAction(input);
  } else if (shortname === "05") {
    return contract.deserializeSyncVotersAction(input);
  } else if (shortname === "09") {
    return contract.deserializeSetVoteActiveAction(input);
  } else if (shortname === "11") {
    return contract.deserializeCancelBallotAction(input);
  } else if (shortname === "30") {
    return contract.deserializeHandleOrgEventAction(input);
  } else if (shortname === "50") {
    return contract.deserializeStatusChangedAction(input);
  }
  throw new Error("Illegal shortname: " + shortname);
}

export type Init =
  | InitializeInit;

export interface InitializeInit {
  discriminant: "initialize";
  options: string[];
  title: string;
  description: string;
  organization: BlockchainAddress;
  administrator: BlockchainAddress;
  eligibleVoters: BlockchainAddress[];
}
export function deserializeInit(bytes: Buffer): Init {
  const input = AbiByteInput.createBigEndian(bytes);
  const shortname = input.readShortnameString();
  const contract = new BallotGenerated(undefined, undefined);
  if (shortname === "ffffffff0f") {
    return contract.deserializeInitializeInit(input);
  }
  throw new Error("Illegal shortname: " + shortname);
}

