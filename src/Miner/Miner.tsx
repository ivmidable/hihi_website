import React, { useState, useEffect } from 'react';
import '../Header/Header.css';
import './Miner.css';
import '../App.css';
import WorkTable from './WorkTable';
import { Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import Switch from '@material-ui/core/Switch';
import { withStyles } from '@material-ui/core';
import Tooltip from '@material-ui/core/Tooltip';
import { hihiAccountData, Work } from '../lib/Hihi';
import { wrap } from 'comlink';

type MinerInfo = {
    worker: Worker;
    mine: any;
    getHashCount: any;
}

let mine_breach_work = false;
let mine_limit_break = false;

let current = new Work();
let threads = window.navigator.hardwareConcurrency;
let is_limit_break = false;
let miners: Array<MinerInfo> = new Array<MinerInfo>();

let start = new Date().getTime();
let hihi_data: hihiAccountData = new hihiAccountData();


function Hashrate(): React.ReactElement {
    const [rate, setRate] = useState(() => {
        return 0;
    });

    function set(rate: any) {
        setRate(rate.detail);
    }

    useEffect(() => {
        window.addEventListener("hashrate.set", set);
        return () => {
            window.removeEventListener("hashrate.set", set);
        }
    }, []);

    return (
        <div className="Widget">
            <div className="hashRate">{rate}</div>
            <div className="hashPerSecond">H/s</div>
        </div>
    )
}


//type = claim or limitbreak
function setupMiners(type: string) {
    console.log(type);
    killMiners();
    let randIndex = hihi_data.work.length * Math.random() | 0;
    for (let i = 0; i < threads; i++) {
        const miner = new Worker('./miner', { name: "RunMiner", type: 'module' });
        const { mine, getHashCount } = wrap<import('./miner').RunMiner>(miner);
        if (type === "claim") {
            if (hihi_data.work.length === 0) return;
            is_limit_break = false;
            current = hihi_data.work[randIndex];
            start = new Date().getTime();
            const hex = hihi_data.work[randIndex].hex;
            mine(hihi_data.work[randIndex].hash, hihi_data.work[randIndex].magic).then((result) => {
                let claim = Keypair.fromSecretKey(Buffer.from(result.claim, 'hex'));
                let pool = Keypair.fromSecretKey(Buffer.from(result.pool, 'hex'));
                const claim_event = new CustomEvent('wb.claim', { detail: { claim, pool, hex } });
                window.dispatchEvent(claim_event);
                killMiners();
                
                return;
            }).catch((error) => console.log(error));
        } else {
            is_limit_break = true;
            current = hihi_data.limit_break;
            start = new Date().getTime();
            mine(hihi_data.limit_break.hash, hihi_data.limit_break.magic).then((result) => {
                let claim = Keypair.fromSecretKey(Buffer.from(result.claim, 'hex'));
                let pool = Keypair.fromSecretKey(Buffer.from(result.pool, 'hex'));
                const claim_event = new CustomEvent('wb.limitbreak', { detail: { claim, pool } });
                window.dispatchEvent(claim_event);
                killMiners();
            }).catch((error) => console.log(error));
        }
        miners.push({ worker: miner, mine, getHashCount });
    }
}

function killMiners() {
    for (let i = 0; i < miners.length; i++) {
        miners[i].worker.terminate();
    }
    miners = [];
    const event = new CustomEvent('hashrate.set', { detail: 0 });
    window.dispatchEvent(event);
}

setTimeout(async function tick() {
    let data = window.localStorage.getItem("hihi_data") || null;
    if (data !== null) {
        hihi_data = JSON.parse(data) as hihiAccountData;
        const hihi_event = new CustomEvent('mn.set', { detail: hihi_data });
        window.dispatchEvent(hihi_event);
    }

    checkWork();
    let combined = 0;
    for (let i = 0; i < miners.length; i++) {
        try {
            combined += await awaitWithTimeout(300, miners[i].getHashCount());
        } catch (_) { }
    }
    let cur = new Date().getTime();
    let s = Math.ceil(combined / (cur - start) * 1000);
    const event = new CustomEvent('hashrate.set', { detail: s });
    window.dispatchEvent(event);
    setTimeout(tick, 5000);
}, 0);

function awaitWithTimeout(timeout, ...args) {
    function timeOut() {
        return new Promise((res, rej) => setTimeout(rej, timeout, new Error(`Timed out after ${timeout}ms`)));
    }
    return Promise.race([...args, timeOut()]);
}

function checkWork() {
    if (mine_limit_break === true && miners.length === 0) {
        setupMiners("limitbreak");
    }


    if (mine_breach_work === true && miners.length === 0) {
        setupMiners("claim");
    }

    if (
        mine_breach_work === true
        && miners.length > 0
        && mine_limit_break === true
        && is_limit_break === true
        && hihi_data.work.length > 0
    ) {
        setupMiners("claim");
    }

    if (mine_breach_work === true && is_limit_break === false && hihi_data.work.length > 0) {
        let found = false;
        for (let i = 0; i < hihi_data.work.length; i++) {
            //console.log(hihi_data.work[i].hash);
            //console.log(current.hash);
            if (hihi_data.work[i].hash === current.hash && hihi_data.work[i].magic === current.magic)
                found = true;
        }
        if (found === false) {
            setupMiners("claim");
        }
    }

}

const MinerSwitch = withStyles({
    switchBase: {
        color: '#3c5e8b',
        '&$checked': {
            color: '#fff089',
        },
        '&$checked + $track': {
            backgroundColor: '#253a5e',
        },
    },
    checked: {},
    track: {},
})(Switch);

export default function Miner(): React.ReactElement {
    const [data, setData] = useState<hihiAccountData>(() => {
        return new hihiAccountData();
    })
    async function handleMinerChange(event: any, checked: boolean) {
        if (checked === true) {
            mine_breach_work = true;
        } else {
            mine_breach_work = false;
            killMiners();
        }
    }

    async function handleLBChange(event: any, checked: boolean) {
        if (checked === true) {
            mine_limit_break = true;
        } else {
            mine_limit_break = false;
            killMiners();
        }
    }
    function set(event: any) {
        setData(event.detail);
        //console.log(data.limit_count);
    }

    useEffect(() => {
        window.addEventListener("mn.set", set);
        return () => {
            window.removeEventListener("mn.set", set);
        }
    }, [])

    return (
        <div className="Box">
            <div className="split">
                <div>
                    <div className="workLabel">
                        <div className="widgetHeader">
                            <div className="row-center">
                                <div>Mine Breach Work</div>
                                <MinerSwitch onChange={handleMinerChange} />
                            </div>
                        </div>
                        <div className="row-center">
                            <div className="row">
                                <div className="column">
                                    <div className="smallLabel">Doubles</div>
                                    <div className="largeLabel">{data.token_doubles}</div>
                                </div>
                                <div className="column">
                                    <div className="smallLabel">Cached</div>
                                    <div className="largeLabel">{data.work_cached}</div>
                                </div>
                            </div>

                            <div className="row">
                                <div className="column">
                                    <div className="smallLabel">Unmined</div>
                                    <div className="largeLabel">{data.work_count}</div>
                                </div>
                                <div className="column">
                                    <div className="smallLabel">Mined</div>
                                    <div className="largeLabel">{Number(data.breach_count) - Number(data.work_cached) - Number(data.work_count)}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <div className="workLabel">
                        <div className="widgetHeader">
                            <div className="row-center">
                                <div>Mine Limit Break</div>
                                <MinerSwitch onChange={handleLBChange} />
                            </div>
                        </div>
                        <div className="row">
                            <div className="row">
                                <div className="column">
                                    <div className="smallLabel">Total Mined</div>
                                    <div className="largeLabel">{data.limit_count}</div>
                                </div>
                                <div className="column">
                                    <div className="smallLabel">Mined This Epoch</div>
                                    <div className="largeLabel">{data.limit_breaks_this_epoch}</div>
                                </div>
                            </div>

                            <div className="row">
                                <div className="column">
                                    <div className="smallLabel">Epoch</div>
                                    <div className="largeLabel">{data.epoch}</div>
                                </div>
                                <div className="column">
                                    <div className="smallLabel">Locked</div>
                                    <div className="largeLabel">{(Number(data.lamps_locked) / LAMPORTS_PER_SOL).toFixed(3)} SOL</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="workLabel">
                <div className="widgetHeader hashRateLabel">Hashrate</div>
                <Hashrate />
            </div>
            <WorkTable data={data} />
        </div>
    )
}