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
    for (let organizations_i = 0; organizations_i < organizations_setLength; organizations_i++) {
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
    const userOrgMemberships: Map<BlockchainAddress, BlockchainAddress[]> = new Map();
    for (let userOrgMemberships_i = 0; userOrgMemberships_i < userOrgMemberships_mapLength; userOrgMemberships_i++) {
      const userOrgMemberships_key: BlockchainAddress = _input.readAddress();
      const userOrgMemberships_value_setLength = _input.readI32();
      const userOrgMemberships_value: BlockchainAddress[] = [];
      for (let userOrgMemberships_value_i = 0; userOrgMemberships_value_i < userOrgMemberships_value_setLength; userOrgMemberships_value_i++) {
        const userOrgMemberships_value_elem: BlockchainAddress = _input.readAddress();
        userOrgMemberships_value.push(userOrgMemberships_value_elem);
      }
      userOrgMemberships.set(userOrgMemberships_key, userOrgMemberships_value);
    }
    const organizationBallots_mapLength = _input.readI32();
    const organizationBallots: Map<BlockchainAddress, BlockchainAddress[]> = new Map();
    for (let organizationBallots_i = 0; organizationBallots_i < organizationBallots_mapLength; organizationBallots_i++) {
      const organizationBallots_key: BlockchainAddress = _input.readAddress();
      const organizationBallots_value_setLength = _input.readI32();
      const organizationBallots_value: BlockchainAddress[] = [];
      for (let organizationBallots_value_i = 0; organizationBallots_value_i < organizationBallots_value_setLength; organizationBallots_value_i++) {
        const organizationBallots_value_elem: BlockchainAddress = _input.readAddress();
        organizationBallots_value.push(organizationBallots_value_elem);
      }
      organizationBallots.set(organizationBallots_key, organizationBallots_value);
    }
    const ballotContractZkwa_vecLength = _input.readI32();
    const ballotContractZkwa: Buffer = _input.readBytes(ballotContractZkwa_vecLength);
    const ballotContractAbi_vecLength = _input.readI32();
    const ballotContractAbi: Buffer = _input.readBytes(ballotContractAbi_vecLength);
    const organizationContractWasm_vecLength = _input.readI32();
    const organizationContractWasm: Buffer = _input.readBytes(organizationContractWasm_vecLength);
    const organizationContractAbi_vecLength = _input.readI32();
    const organizationContractAbi: Buffer = _input.readBytes(organizationContractAbi_vecLength);
    return { admin, organizations, ballots, userOrgMemberships, organizationBallots, ballotContractZkwa, ballotContractAbi, organizationContractWasm, organizationContractAbi };
  }
  public async getState(): Promise<SekivaFactoryState> {
    const bytes = await this._client?.getContractStateBinary(this._address!);
    if (bytes === undefined) {
      throw new Error("Unable to get state bytes");
    }
    const input = AbiByteInput.createLittleEndian(bytes);
    return this.deserializeSekivaFactoryState(input);
  }

}
export interface SekivaFactoryState {
  admin: BlockchainAddress;
  organizations: BlockchainAddress[];
  ballots: BlockchainAddress[];
  userOrgMemberships: Map<BlockchainAddress, BlockchainAddress[]>;
  organizationBallots: Map<BlockchainAddress, BlockchainAddress[]>;
  ballotContractZkwa: Buffer;
  ballotContractAbi: Buffer;
  organizationContractWasm: Buffer;
  organizationContractAbi: Buffer;
}

export interface OrganizationInfo {
  name: string;
  description: string;
  profileImage: string;
  bannerImage: string;
  xUrl: string;
  discordUrl: string;
  websiteUrl: string;
}
function serializeOrganizationInfo(_out: AbiOutput, _value: OrganizationInfo): void {
  const { name, description, profileImage, bannerImage, xUrl, discordUrl, websiteUrl } = _value;
  _out.writeString(name);
  _out.writeString(description);
  _out.writeString(profileImage);
  _out.writeString(bannerImage);
  _out.writeString(xUrl);
  _out.writeString(discordUrl);
  _out.writeString(websiteUrl);
}

export function initialize(ballotContractZkwa: Buffer, ballotContractAbi: Buffer, organizationContractWasm: Buffer, organizationContractAbi: Buffer): Buffer {
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

export function deployOrganization(orgInfo: OrganizationInfo): Buffer {
  return AbiByteOutput.serializeBigEndian((_out) => {
    _out.writeBytes(Buffer.from("01", "hex"));
    serializeOrganizationInfo(_out, orgInfo);
  });
}

export function deployBallot(options: string[], title: string, description: string, organization: BlockchainAddress): Buffer {
  return AbiByteOutput.serializeBigEndian((_out) => {
    _out.writeBytes(Buffer.from("02", "hex"));
    _out.writeI32(options.length);
    for (const options_vec of options) {
      _out.writeString(options_vec);
    }
    _out.writeString(title);
    _out.writeString(description);
    _out.writeAddress(organization);
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
    return new SekivaFactoryGenerated(client, address).deserializeSekivaFactoryState(input);
  } else {
    const input = AbiByteInput.createLittleEndian(state.bytes);
    return new SekivaFactoryGenerated(
      state.client,
      state.address
    ).deserializeSekivaFactoryState(input);
  }
}

