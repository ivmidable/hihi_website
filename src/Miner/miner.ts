import { expose } from 'comlink';
import { Keypair } from '@solana/web3.js';
import Ops from '../lib/cryptoOperations';

const obj = {
    mine, getHashCount
}

let hash_count = 0;
let time_count = 0;

async function mine(hash: string, magic: string) {
    let claim = new Keypair();
    let pool = new Keypair();
    let hash_buf = Buffer.from(hash, 'hex');

    while (true) {
        if (time_count > 25) {
            await sleep(0);
            time_count = 0;
        }
        time_count++;
        hash_count++;
        claim = new Keypair();
        let check = Ops.sha256(Buffer.concat([hash_buf, claim.publicKey.toBuffer(), pool.publicKey.toBuffer()])).toString('hex');
        if (check.startsWith(magic) === true) {
            break;
        }
    }
    
    let claim_str = Buffer.from(claim.secretKey).toString('hex');
    let pool_str = Buffer.from(pool.secretKey).toString('hex');
    hash_count = 0;
    return { claim: claim_str, pool: pool_str };
}

function getHashCount(): number {
    return hash_count;
}

function sleep(ms:any) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export type RunMiner = typeof obj;

expose(obj);