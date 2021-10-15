import crypto from 'crypto';

class Ops {
    static sha256(data) {
        return crypto.createHash('sha256').update(data).digest();
    }

    static sha256d(data) {
        let pre_hash = crypto.createHash('sha256').update(data).digest();
        return crypto.createHash('sha256').update(pre_hash).digest();
    }

    static createNonce() {
        return this.sha256(crypto.randomBytes(32));
    }
}


export default Ops;