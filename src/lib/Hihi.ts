import {
    Connection,
    PublicKey,
    Keypair,
    AccountInfo,
    TransactionInstruction,
    SystemProgram,
    Transaction,
    sendAndConfirmTransaction,
    SYSVAR_RENT_PUBKEY
} from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';

import { Uint64LE } from 'int64-buffer';

const TOKENS = 1;
const WORK = 32;
const MAGIC_LEN = 1;
const MAGIC = 23;
const WORK_BYTES = TOKENS + WORK + MAGIC_LEN + MAGIC;
const LB_BYTES = TOKENS + WORK + MAGIC_LEN + MAGIC;
const LB_COUNT_BYTES = 4;
const LB_PER_EPOCH_BYTES = 4;

const MAX_COUNT = 101;

const INITIALIZED_BYTES = 1;
const NONCE_BYTES = 1;
const SLOT_BYTES = 8;
const EPOCH_BYTES = 8;
const DIFFICULTY_BYTES = 1;
const LAMPORTS_BYTES = 8;
const PRICE_BYTES = 8;
const REMAIN_BYTES = 8;
const COUNT_BYTES = 4;
const COUNT_PER_WINDOW_BYTES = 4;
const CACHED_BYTES = 8;
const TOKEN_MINT_ID_BYTES = 32;
const TOKEN_DOUBLES_BYTES = 8;

const ADMIN_ONE_BYTES = 32;
const ADMIN_TWO_BYTES = 32;
const WITHDRAW_BYTES = 32;


const VEC_COUNT = 1;
const VEC_DATA_LENGTH = 4;
const VEC_DATA = WORK_BYTES * MAX_COUNT;
const HIHI_STATE_SPACE = INITIALIZED_BYTES + NONCE_BYTES + SLOT_BYTES + EPOCH_BYTES + DIFFICULTY_BYTES + LAMPORTS_BYTES + PRICE_BYTES + REMAIN_BYTES + COUNT_BYTES + COUNT_PER_WINDOW_BYTES + CACHED_BYTES + TOKEN_MINT_ID_BYTES + TOKEN_DOUBLES_BYTES + LB_COUNT_BYTES + LB_PER_EPOCH_BYTES + ADMIN_ONE_BYTES + ADMIN_TWO_BYTES + WITHDRAW_BYTES + LB_BYTES + VEC_COUNT + VEC_DATA_LENGTH + VEC_DATA;

export class Work {
    tokens: number;
    hash: string;
    magic: string;
    magic_len: number;
    hex: string;
    constructor() {
        this.tokens = 0;
        this.hash = "";
        this.magic = "";
        this.magic_len = 0;
        this.hex = "";
    }
}

export class hihiAccountData {
    initialized: number;
    nonce: number;
    authority_id: string;
    token_mint_id: string;
    token_doubles: string;
    slot: string;
    epoch: string;
    difficulty: string;
    lamps_locked: string;
    breach_price: string;
    breach_remain: string;
    breach_count: string;
    breach_count_this_window: string;
    work_cached: string;
    limit_breaks_this_epoch: string;
    admin_one_id: string;
    admin_two_id: string;
    withdraw_id: string;
    limit_count: string;
    limit_break: Work;
    work_count: string;
    work: Array<Work>;
    constructor() {
        this.initialized = 0;
        this.nonce = 0;
        this.authority_id = "";
        this.token_mint_id = "";
        this.token_doubles = "0";
        this.slot = "0";
        this.epoch = "0";
        this.difficulty = "0";
        this.lamps_locked = "0";
        this.breach_price = "0";
        this.breach_remain = "0";
        this.breach_count = "0";
        this.breach_count_this_window = "0";
        this.work_cached = "0";
        this.limit_breaks_this_epoch = "0";
        this.admin_one_id = "";
        this.admin_two_id = "";
        this.withdraw_id = "";
        this.limit_count = "0";
        this.limit_break = new Work();
        this.work_count = "0";
        this.work = [];
    }
}

export class Hihi {
    program_id: PublicKey;
    space: number;
    constructor(program_id: string) {
        this.program_id = new PublicKey(program_id);
        this.space = HIHI_STATE_SPACE;
    }

    async get_authority_id(instance_id: PublicKey, nonce: number) {

        const auth = await PublicKey.createProgramAddress(
            [instance_id.toBuffer(), writeUInt8(nonce)],
            this.program_id,
        );
        return auth
    }

    async parseAccountData(connection: Connection, account_id: PublicKey) {
        let pos = 0;
        //let obj = {};
        const acct: AccountInfo<Buffer> | null = await connection.getAccountInfo(account_id);
        const obj: hihiAccountData = new hihiAccountData();
        if (acct !== null) {
            const buf: Buffer = acct.data;
            obj.initialized = buf[pos];
            pos += INITIALIZED_BYTES;
            obj.nonce = buf[pos];
            obj.authority_id = (await this.get_authority_id(account_id, obj.nonce)).toBase58();
            pos += NONCE_BYTES;
            obj.slot = new Uint64LE(buf, pos).toString();
            pos += SLOT_BYTES;
            obj.epoch = new Uint64LE(buf, pos).toString();
            pos += EPOCH_BYTES;
            obj.difficulty = buf.readUInt8(pos).toString();
            pos += DIFFICULTY_BYTES;
            obj.lamps_locked = new Uint64LE(buf, pos).toString();
            pos += LAMPORTS_BYTES;
            obj.breach_price = new Uint64LE(buf, pos).toString();
            pos += PRICE_BYTES;
            obj.breach_remain = new Uint64LE(buf, pos).toString();
            pos += REMAIN_BYTES;
            obj.breach_count = buf.readInt32LE(pos).toString();
            pos += COUNT_BYTES;
            obj.breach_count_this_window = buf.readUInt32LE(pos).toString();
            pos += COUNT_PER_WINDOW_BYTES;
            obj.work_cached = new Uint64LE(buf, pos).toString();
            pos += CACHED_BYTES;
            const token_mint_id = new PublicKey(Buffer.from(buf.toString('hex', pos, pos + 32), 'hex'));
            obj.token_mint_id = token_mint_id.toBase58();
            pos += TOKEN_MINT_ID_BYTES;
            obj.token_doubles = new Uint64LE(buf, pos).toString();
            pos += TOKEN_DOUBLES_BYTES;
            obj.limit_count = buf.readUInt32LE(pos).toString();
            pos += LB_COUNT_BYTES;
            obj.limit_breaks_this_epoch = buf.readUInt32LE(pos).toString();
            pos += LB_PER_EPOCH_BYTES;
            let admin_one_id = new PublicKey(Buffer.from(buf.toString('hex', pos, pos + 32), 'hex'));
            obj.admin_one_id = admin_one_id.toBase58();
            pos += ADMIN_ONE_BYTES;
            let admin_two_id = new PublicKey(Buffer.from(buf.toString('hex', pos, pos + 32), 'hex'));
            obj.admin_two_id = admin_two_id.toBase58();
            pos += ADMIN_TWO_BYTES;
            let withdraw_id = new PublicKey(Buffer.from(buf.toString('hex', pos, pos + 32), 'hex'));
            obj.withdraw_id = withdraw_id.toBase58();
            pos += WITHDRAW_BYTES;
            const tokens = buf.readUInt8(pos);
            pos += TOKENS;
            const hash = buf.toString('hex', pos, pos + 32);
            pos += WORK;
            const magic_len = buf.readUInt8(pos);
            pos += MAGIC_LEN;
            const magic = buf.toString('hex', pos, pos + magic_len);
            pos += MAGIC;
            obj.limit_break = { tokens: tokens, hash: hash, magic: magic, magic_len: magic_len, hex: "" };
            obj.work_count = buf.readUInt8(pos).toString();
            pos += VEC_COUNT;
            pos += VEC_DATA_LENGTH;
            for (let i = 0; i < Number(obj.work_count); i++) {
                const hex = buf.toString('hex', pos, pos + WORK_BYTES);
                const tokens = buf.readUInt8(pos);
                pos += TOKENS;
                const hash = buf.toString('hex', pos, pos + 32);
                pos += WORK;
                const magic_len = buf.readUInt8(pos);
                pos += MAGIC_LEN;
                const magic = buf.toString('hex', pos, pos + magic_len);
                pos += MAGIC;
                obj.work.push({ tokens: tokens, hash: hash, magic: magic, magic_len: magic_len, hex: hex });
            }
        }

        return obj;
    }

    async parseAccountDataNoWork(connection: Connection, account_id: PublicKey) {
        let pos = 0;
        //let obj = {};
        const acct: AccountInfo<Buffer> | null = await connection.getAccountInfo(account_id);
        const obj: hihiAccountData = new hihiAccountData();
        if (acct !== null) {
            const buf: Buffer = acct.data;
            obj.initialized = buf[pos];
            pos += INITIALIZED_BYTES;
            obj.nonce = buf[pos];
            obj.authority_id = (await this.get_authority_id(account_id, obj.nonce)).toBase58();
            pos += NONCE_BYTES;
            obj.slot = new Uint64LE(buf, pos).toString();
            pos += SLOT_BYTES;
            obj.epoch = new Uint64LE(buf, pos).toString();
            pos += EPOCH_BYTES;
            obj.difficulty = buf.readUInt8(pos).toString();
            pos += DIFFICULTY_BYTES;
            obj.lamps_locked = new Uint64LE(buf, pos).toString();
            pos += LAMPORTS_BYTES;
            obj.breach_price = new Uint64LE(buf, pos).toString();
            pos += PRICE_BYTES;
            obj.breach_remain = new Uint64LE(buf, pos).toString();
            pos += REMAIN_BYTES;
            obj.breach_count = buf.readInt32LE(pos).toString();
            pos += COUNT_BYTES;
            obj.breach_count_this_window = buf.readUInt32LE(pos).toString();
            pos += COUNT_PER_WINDOW_BYTES;
            obj.work_cached = new Uint64LE(buf, pos).toString();
            pos += CACHED_BYTES;
            const token_mint_id = new PublicKey(Buffer.from(buf.toString('hex', pos, pos + 32), 'hex'));
            obj.token_mint_id = token_mint_id.toBase58();
            pos += TOKEN_MINT_ID_BYTES;
            obj.token_doubles = new Uint64LE(buf, pos).toString();
            pos += TOKEN_DOUBLES_BYTES;
            obj.limit_count = buf.readUInt32LE(pos).toString();
            pos += LB_COUNT_BYTES;
            obj.limit_breaks_this_epoch = buf.readUInt32LE(pos).toString();
            pos += LB_PER_EPOCH_BYTES;
            let admin_one_id = new PublicKey(Buffer.from(acct.data.toString('hex', pos[0], pos[0] + 32), 'hex'));
            obj.admin_one_id = admin_one_id.toBase58();
            pos += ADMIN_ONE_BYTES;
            let admin_two_id = new PublicKey(Buffer.from(acct.data.toString('hex', pos[0], pos[0] + 32), 'hex'));
            obj.admin_two_id = admin_two_id.toBase58();
            pos += ADMIN_TWO_BYTES;
            let withdraw_id = new PublicKey(Buffer.from(acct.data.toString('hex', pos[0], pos[0] + 32), 'hex'));
            obj.withdraw_id = withdraw_id.toBase58();
            pos += WITHDRAW_BYTES + TOKENS + WORK + MAGIC_LEN + MAGIC;
            obj.work_count = buf.readUInt8(pos).toString();
        }
        return obj;
    }

    //Instructions
    BreachInstruction(
        instance_id: PublicKey,
        token_mint_id: PublicKey,
        authority_id: PublicKey,
        to_token_id: PublicKey,
        from_id: PublicKey,
        lamports: Uint64LE
    ) {
        const buf: Array<Buffer> = [];
        buf.push(writeUInt8(1));
        buf.push(lamports.toBuffer());
        const data = Buffer.concat(buf);

        return new TransactionInstruction({
            keys: [
                { pubkey: instance_id, isSigner: false, isWritable: true },
                { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
                { pubkey: token_mint_id, isSigner: false, isWritable: true },
                { pubkey: authority_id, isSigner: false, isWritable: true },
                { pubkey: from_id, isSigner: true, isWritable: true },
                { pubkey: to_token_id, isSigner: false, isWritable: true },
                { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
            ],
            programId: this.program_id,
            data,
        });
    }

    LimitBreakInstruction(
        instance_id: PublicKey,
        token_program_id: PublicKey,
        token_mint_id: PublicKey,
        authority_id: PublicKey,
        claim_id: PublicKey,
        pool_id: PublicKey,
        to_tokens_id: PublicKey,
        to_lamports_id: PublicKey
    ) {
        const buf: Array<Buffer> = [];
        buf.push(writeUInt8(2));
        const data = Buffer.concat(buf);

        return new TransactionInstruction({
            keys: [
                { pubkey: instance_id, isSigner: false, isWritable: true },
                { pubkey: token_program_id, isSigner: false, isWritable: false },
                { pubkey: token_mint_id, isSigner: false, isWritable: true },
                { pubkey: authority_id, isSigner: false, isWritable: true },
                { pubkey: claim_id, isSigner: true, isWritable: false },
                { pubkey: pool_id, isSigner: true, isWritable: false },
                { pubkey: to_tokens_id, isSigner: false, isWritable: true },
                { pubkey: to_lamports_id, isSigner: false, isWritable: true },
                { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
            ],
            programId: this.program_id,
            data,
        });
    }

    ClaimInstruction(
        instance_id: PublicKey,
        token_program_id: PublicKey,
        token_mint_id: PublicKey,
        authority_id: PublicKey,
        claim_id: PublicKey,
        pool_id: PublicKey,
        to_id: PublicKey,
        work_hex: string
    ) {
        const buf: Array<Buffer> = [];
        buf.push(writeUInt8(3));
        buf.push(Buffer.from(work_hex, 'hex'));
        const data = Buffer.concat(buf);
        //console.log(new Uint8Array(data));
        return new TransactionInstruction({
            keys: [
                { pubkey: instance_id, isSigner: false, isWritable: true },
                { pubkey: token_program_id, isSigner: false, isWritable: false },
                { pubkey: token_mint_id, isSigner: false, isWritable: true },
                { pubkey: authority_id, isSigner: false, isWritable: false },
                { pubkey: claim_id, isSigner: true, isWritable: false },
                { pubkey: pool_id, isSigner: true, isWritable: false },
                { pubkey: to_id, isSigner: false, isWritable: true },
            ],
            programId: this.program_id,
            data,
        });
    }

    async BreachTransaction(
        connection: Connection,
        instance_id: PublicKey,
        token_mint_id: PublicKey,
        authority_id: PublicKey,
        to_token_id: PublicKey,
        from_keypair_id: PublicKey,
        lamports: Uint64LE
    ) {
        const txn = new Transaction().add(
            this.BreachInstruction(instance_id, token_mint_id, authority_id, to_token_id, from_keypair_id, lamports)
        );

        const { blockhash } = await connection.getRecentBlockhash();
        txn.recentBlockhash = blockhash;
        txn.feePayer = from_keypair_id;

        console.log(instance_id.toBase58());
        console.log(token_mint_id.toBase58());
        console.log(authority_id.toBase58());
        console.log(to_token_id.toBase58());
        console.log(from_keypair_id.toBase58());
        console.log(lamports);

        console.log(txn);

        const event = new CustomEvent('wb.signsend', { detail: txn });
        window.dispatchEvent(event);
    }

    async LimitBreakTransaction
        (
            connection: Connection,
            instance_id: PublicKey,
            token_program_id: PublicKey,
            token_mint_id: PublicKey,
            authority_id: PublicKey,
            claim_keypair: Keypair,
            pool_keypair: Keypair,
            to_token_id: PublicKey,
            to_lamports_id: PublicKey,
            fee_payer:PublicKey
        ) {
        const txn = new Transaction().add(
            this.LimitBreakInstruction(
                instance_id,
                token_program_id,
                token_mint_id,
                authority_id,
                claim_keypair.publicKey,
                pool_keypair.publicKey,
                to_token_id,
                to_lamports_id
            )
        );

        const { blockhash } = await connection.getRecentBlockhash();
        txn.recentBlockhash = blockhash;
        txn.feePayer = fee_payer;

        txn.partialSign(claim_keypair, pool_keypair);

        const event = new CustomEvent('wb.signsend', { detail: txn });
        window.dispatchEvent(event);
    }

    async ClaimTransaction
        (
            connection: Connection,
            instance_id: PublicKey,
            token_program_id: PublicKey,
            token_mint_id: PublicKey,
            authority_id: PublicKey,
            claim_keypair: Keypair,
            pool_keypair: Keypair,
            to_id: PublicKey,
            work_hex: string,
            fee_payer:PublicKey,
    ) {
        const txn = new Transaction().add(
            this.ClaimInstruction(
                instance_id,
                token_program_id,
                token_mint_id,
                authority_id,
                claim_keypair.publicKey,
                pool_keypair.publicKey,
                to_id,
                work_hex
            )
        );

        const { blockhash } = await connection.getRecentBlockhash();
        txn.recentBlockhash = blockhash;
        txn.feePayer = fee_payer;

        txn.partialSign(claim_keypair, pool_keypair);

        const event = new CustomEvent('wb.signsend', { detail: txn });
        window.dispatchEvent(event);
    }

    static calculateNewPrice(count: number, starting_price: number) {
        let price: number = 0;
        if (count < 1000) {
            price = priceGrower(count, starting_price, 0.00218);
        } else if (count >= 1000 && count < 10000) {
            price = 1323796464; //precompute.
            price = priceGrower(count - 1000, price, 0.000218);
        } else if (count >= 10000 && count < 100000) {
            price = 9416424207; //precompute.
            price = priceGrower(count - 10000, price, 0.0000218);
        } else {
            price = 67051171537; //precompute.
            price = priceGrower(count - 100000, price, 0.00000218);
        }
        return price;
    }

    static calculateTokens(count: number) {
        if (count < 1000) {
            return 100;
        } else if (count >= 1000 && count < 10000) {
            return 50;
        } else if (count >= 10000 && count < 100000) {
            return 25;
        } else {
            return 10;
        }
    }

}

function priceGrower(count, price, rate) {
    return price * (Math.pow(1 + rate / 1, count));
}

function writeUInt8(number: number) {
    const buf = Buffer.alloc(1);
    buf.writeUInt8(number);
    return buf;
}

async function findAssociatedTokenAddressAndBump(walletAddress: PublicKey, tokenMintAddress: PublicKey) {
    return (await PublicKey.findProgramAddress(
        [
            walletAddress.toBuffer(),
            TOKEN_PROGRAM_ID.toBuffer(),
            tokenMintAddress.toBuffer(),
        ],
        ASSOCIATED_TOKEN_PROGRAM_ID
    ));
}

export default Hihi;