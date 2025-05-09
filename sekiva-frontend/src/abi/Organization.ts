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
export class Organization {
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
    return new Organization(client, address).deserializeOrganizationState(
      input
    );
  } else {
    const input = AbiByteInput.createLittleEndian(state.bytes);
    return new Organization(
      state.client,
      state.address
    ).deserializeOrganizationState(input);
  }
}
