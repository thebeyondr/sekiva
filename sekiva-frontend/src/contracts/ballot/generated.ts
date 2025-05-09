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

type Option<K> = K | undefined;
export class generated {
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
    const voters_setLength = _input.readI32();
    const voters: BlockchainAddress[] = [];
    for (let voters_i = 0; voters_i < voters_setLength; voters_i++) {
      const voters_elem: BlockchainAddress = _input.readAddress();
      voters.push(voters_elem);
    }
    let tally: Option<Tally> = undefined;
    const tally_isSome = _input.readBoolean();
    if (tally_isSome) {
      const tally_option: Tally = this.deserializeTally(_input);
      tally = tally_option;
    }
    return {
      organization,
      administrator,
      title,
      description,
      options,
      startTime,
      endTime,
      status,
      voters,
      tally,
    };
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
    return { discriminant: BallotStatusD.Created };
  }
  public deserializeBallotStatusActive(_input: AbiInput): BallotStatusActive {
    return { discriminant: BallotStatusD.Active };
  }
  public deserializeBallotStatusTallying(
    _input: AbiInput
  ): BallotStatusTallying {
    return { discriminant: BallotStatusD.Tallying };
  }
  public deserializeBallotStatusCompleted(
    _input: AbiInput
  ): BallotStatusCompleted {
    return { discriminant: BallotStatusD.Completed };
  }
  public deserializeBallotStatusCancelled(
    _input: AbiInput
  ): BallotStatusCancelled {
    return { discriminant: BallotStatusD.Cancelled };
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
  public async getState(): Promise<BallotState> {
    const bytes = await this._client?.getContractStateBinary(this._address!);
    if (bytes === undefined) {
      throw new Error("Unable to get state bytes");
    }
    const input = AbiByteInput.createLittleEndian(bytes);
    return this.deserializeBallotState(input);
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
  voters: BlockchainAddress[];
  tally: Option<Tally>;
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

export interface BallotStatusCreated {
  discriminant: BallotStatusD.Created;
}

export interface BallotStatusActive {
  discriminant: BallotStatusD.Active;
}

export interface BallotStatusTallying {
  discriminant: BallotStatusD.Tallying;
}

export interface BallotStatusCompleted {
  discriminant: BallotStatusD.Completed;
}

export interface BallotStatusCancelled {
  discriminant: BallotStatusD.Cancelled;
}

export interface Tally {
  option0: number;
  option1: number;
  option2: number;
  option3: number;
  option4: number;
  total: number;
}

export function initialize(
  options: string[],
  title: string,
  description: string,
  organization: BlockchainAddress
): Buffer {
  return AbiByteOutput.serializeBigEndian((_out) => {
    _out.writeBytes(Buffer.from("ffffffff0f", "hex"));
    _out.writeI32(options.length);
    for (const options_vec of options) {
      _out.writeString(options_vec);
    }
    _out.writeString(title);
    _out.writeString(description);
    _out.writeAddress(organization);
  });
}

export function computeTally(): Buffer {
  return AbiByteOutput.serializeBigEndian((_out) => {
    _out.writeU8(0x09);
    _out.writeBytes(Buffer.from("01", "hex"));
  });
}

export function setVoteActive(): Buffer {
  return AbiByteOutput.serializeBigEndian((_out) => {
    _out.writeU8(0x09);
    _out.writeBytes(Buffer.from("48", "hex"));
  });
}

export function castVote(): SecretInputBuilder<number> {
  const _publicRpc: Buffer = AbiByteOutput.serializeBigEndian((_out) => {
    _out.writeBytes(Buffer.from("40", "hex"));
  });
  const _secretInput = (secret_input_lambda: number): CompactBitArray =>
    AbiBitOutput.serialize((_out) => {
      _out.writeI8(secret_input_lambda);
    });
  return new SecretInputBuilder<>(_publicRpc, _secretInput);
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
    return new generated(client, address).deserializeBallotState(input);
  } else {
    const input = AbiByteInput.createLittleEndian(state.bytes);
    return new generated(state.client, state.address).deserializeBallotState(
      input
    );
  }
}
