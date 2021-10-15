import React, { useState, useEffect } from 'react';
import './Breach.css';
import '../App.css';
import Slider from '@material-ui/core/Slider';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';
import { Hihi, hihiAccountData } from '../lib/Hihi';
import { LAMPORTS_PER_SOL, EpochInfo } from '@solana/web3.js';

class BreachWindow {
    breaches: number;
    price: string;
    tokens: number;

    constructor() {
        this.breaches = 0;
        this.price = "0.0000100";
        this.tokens = 0;
    }
}

function BreachText(): React.ReactElement {
    const [hihi_data, setHihiData] = useState(() => {
        return new hihiAccountData();
    })

    const [slot_data, setSlotData] = useState(() => {
        return 0;
    })

    const [sliderValue, setSliderValue] = useState(() => {
        return 0;
    })

    const [sliderSol, setSliderSol] = useState(() => {
        return 0.0000100;
    })

    const [sliderBreaches, setSliderBreaches] = useState(() => {
        return 0;
    })

    const [slotsRemaining, setSlotsRemaining] = useState(() => {
        return 0;
    })

    const [breachWindow, setBreachWindow] = useState<BreachWindow>(() => {
        return new BreachWindow();
    })

    const [nextBreachWindow, setNextBreachWindow] = useState<BreachWindow>(() => {
        return new BreachWindow();
    })

    function updateText() {
        setHihiData(JSON.parse(window.localStorage.getItem("hihi_data") || "{ }"));

        let slot = window.localStorage.getItem("slot_data");
        if (slot !== null) {
            setSlotData(Number(slot));
            if (Number(slot) !== 0 && Number(hihi_data.slot) !== 0) {
                let remaining = 100 - (Number(slot) - Number(hihi_data.slot));
                if (remaining < 0) remaining = 0;
                if (slotsRemaining !== remaining) {
                    setSlotsRemaining(remaining);
                }
            } else {
                setSlotsRemaining(0);
            }
        }
        //updateBreachSliderText();
    }

    function updateBreachSliderText() {
        let bw = new BreachWindow();
        bw.breaches = sliderBreaches;
        if (slotsRemaining === 0) {
            let new_price = Hihi.calculateNewPrice(Number(hihi_data.breach_count), 150000000);
            let sl_data = calculateSliderData(new_price, 9, sliderValue);
            setSliderSol(sl_data.sol);
            setSliderBreaches(Math.trunc((sl_data.sol + sl_data.br_sol) / sl_data.bp_sol));
            bw.price = sliderSol.toFixed(7);
            bw.tokens = Hihi.calculateTokens(Number(hihi_data.breach_count)) * sliderBreaches;
        } else {
            let sl_data = calculateSliderData(Number(hihi_data.breach_price), 10, sliderValue);
            let breaches = Math.trunc((sl_data.sol + sl_data.br_sol) / sl_data.bp_sol);
            bw.price = sl_data.sol.toFixed(7);
            bw.tokens = (Hihi.calculateTokens(Number(hihi_data.breach_count) - Number(hihi_data.breach_count_this_window)) * breaches);
            setSliderSol(sl_data.sol);
            setSliderBreaches(Math.trunc((sl_data.sol + sl_data.br_sol) / sl_data.bp_sol));
            let n_bw = new BreachWindow();
            let new_price = Hihi.calculateNewPrice(Number(hihi_data.breach_count), 150000000);
            let n_sl_data = calculateSliderData(new_price, 10, sliderValue);
            let n_breaches = Math.trunc((n_sl_data.sol + n_sl_data.br_sol) / n_sl_data.bp_sol);
            n_bw.price = n_sl_data.sol.toFixed(7);
            n_bw.tokens = Hihi.calculateTokens(Number(hihi_data.breach_count)) * n_breaches;
            setNextBreachWindow(n_bw);
        }
        setBreachWindow(bw);
    }

    function updateBreachSliderValue(event: any) {
        setSliderValue(event.detail.value);
        updateBreachSliderText();
    }

    function calculateSliderData(price: number, scaler: number, sliderValue: number) {
        let lamps = lerp(10000, price * scaler, sliderValue * 0.01);
        let sol = lamps / LAMPORTS_PER_SOL;
        let br_sol = Number(hihi_data.breach_remain) / LAMPORTS_PER_SOL;
        let bp_sol = price / LAMPORTS_PER_SOL;
        return { sol, br_sol, bp_sol };
    }

    function sendBreach() {
        const breach_b = new CustomEvent('wb.breach', { detail: sliderSol });
        window.dispatchEvent(breach_b);
    }

    useEffect(() => {
        window.addEventListener("breach.update", updateText);
        window.addEventListener("breach.button", sendBreach);
        window.addEventListener("breach.slider", updateBreachSliderValue);
        return () => {
            window.removeEventListener("breach.update", updateText);
            window.removeEventListener("breach.button", sendBreach);
            window.removeEventListener("breach.slider", updateBreachSliderValue);
        }
    }, [hihi_data, sliderSol, slotsRemaining, sliderValue]);

    return (
        <div className="Box">
            <div className="breachWidget">
                <div className="widgetHeader">Breach</div>
                <div>
                    <div className="row">
                        <div className="column">
                            <div className="smallLabel">Total</div>
                            <div className="largeLabel">{hihi_data.breach_count}</div>
                        </div>
                        <div className="column">
                            <div className="smallLabel">Price</div>
                            <div className="largeLabel">{Number(hihi_data.breach_price) / LAMPORTS_PER_SOL} SOL</div>
                        </div>
                        <div className="column">
                            <div className="smallLabel">Leftovers</div>
                            <div className="largeLabel">{Number(hihi_data.breach_remain) / LAMPORTS_PER_SOL} SOL</div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="column">
                            <div className="smallLabel">Open Slot</div>
                            <div className="largeLabel">{hihi_data.slot}</div>
                        </div>
                        <div className="column">
                            <div className="smallLabel">Close Slot</div>
                            <div className="largeLabel">{Number(hihi_data.slot) + 100}</div>
                        </div>

                    </div>
                    <div className="row">
                        <div className="column">
                            <div className="smallLabel">Slots Remaining</div>
                            <div className="largeLabel">{slotsRemaining}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="split">
                <div>
                    <div className="widgetHeader">Current Breach Window</div>
                    <div className="row">
                        <div className="column">
                            <div className="smallLabel">Breaches</div>
                            <div className="largeLabel">{breachWindow.breaches}</div>
                        </div>
                        <div className="column">
                            <div className="smallLabel">Price</div>
                            <div className="largeLabel">{breachWindow.price} SOL</div>
                        </div>
                        <div className="row">
                            <div className="column">
                                <div className="smallLabel">You</div>
                                <div className="row-center">
                                    <div className="largeLabel">{breachWindow.tokens}</div>
                                    <div>ヒ</div>
                                    <div className="hi_r">ヒ</div>
                                </div>
                            </div>
                            <div className="column">
                                <div className="smallLabel">Work</div>
                                <div className="row-center">
                                    <div className="largeLabel">{breachWindow.tokens}</div>
                                    <div>ヒ</div>
                                    <div className="hi_r">ヒ</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div style={{ display: slotsRemaining > 0 ? 'block' : 'none' }}>
                    <div className="widgetHeader">Next Breach Window</div>
                    <div className="row">
                        <div className="column">
                            <div className="smallLabel">Price</div>
                            <div className="largeLabel">{nextBreachWindow.price} SOL</div>
                        </div>
                        <div className="row">
                            <div className="column">
                                <div className="smallLabel">You</div>
                                <div className="row">
                                    <div className="largeLabel">{nextBreachWindow.tokens}</div>
                                    <div>ヒ</div>
                                    <div className="hi_r">ヒ</div>
                                </div>
                            </div>
                            <div className="column">
                                <div className="smallLabel">Work</div>
                                <div className="row">
                                    <div className="largeLabel">{nextBreachWindow.tokens}</div>
                                    <div>ヒ</div>
                                    <div className="hi_r">ヒ</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}

function lerp(v0, v1, t) {
    return v0 * (1 - t) + v1 * t
}

function sliderChange(event: any, value: any) {
    const breach_s = new CustomEvent('breach.slider', { detail: { value: value } });
    window.dispatchEvent(breach_s);
}

function breachButtonClick() {
    const breach_b = new CustomEvent('breach.button');
    window.dispatchEvent(breach_b);
}

export default function Breach(): React.ReactElement {
    const iOSBoxShadow =
        '0 3px 1px rgba(0,0,0,0.1),0 4px 8px rgba(0,0,0,0.13),0 0 0 1px rgba(0,0,0,0.02)';

    const marks = [
        {
            value: 0,
        },
        {
            value: 20,
        },
        {
            value: 37,
        },
        {
            value: 100,
        },
    ];

    const IOSSlider = withStyles({
        root: {
            color: '#253a5e',
            height: 2,
            padding: '15px 0',
        },
        thumb: {
            height: 28,
            width: 28,
            backgroundColor: '#fff089',
            boxShadow: iOSBoxShadow,
            marginTop: -14,
            marginLeft: -14,
            '&:focus, &:hover, &$active': {
                backgroundColor: '#fcf7be',
                boxShadow: '0 3px 1px rgba(0,0,0,0.1),0 4px 8px rgba(0,0,0,0.3),0 0 0 1px rgba(0,0,0,0.02)',
                // Reset on touch devices, it doesn't add specificity
                '@media (hover: none)': {
                    boxShadow: iOSBoxShadow,
                },
            },
        },
        active: {},
        valueLabel: {
            left: 'calc(-50% + 12px)',
            top: -22,
            '& *': {
                background: 'transparent',
                color: '#000',
            },
        },
        track: {
            height: 5,
        },
        rail: {
            height: 5,
            opacity: 0.5,
            backgroundColor: '#3c5e8b',
        },
        mark: {
            backgroundColor: '#bfbfbf',
            height: 12,
            width: 3,
            marginTop: -3,
        },
        markActive: {
            opacity: 1,
            backgroundColor: 'currentColor',
        },
    })(Slider);

    const BreachButton = withStyles({
        root: {
            backgroundColor: '#fff089',
            border: 0,
            borderRadius: '0.5em',
            fontSize: '0.9em',
            color: '#4f8fba',
            height: '3em',
            padding: '0 1em',
            marginRight: '1em',
            '&:hover': {
                backgroundColor: '#fcf7be',
            },
        }
    })(Button);

    return (
        <div className="Box">
            <BreachText />
            <div className="slidecontainer">
                <IOSSlider defaultValue={0} onChange={sliderChange} />
            </div>
            <BreachButton style={{ fontSize: '0.9em' }} variant="contained" onClick={breachButtonClick}>Breach</BreachButton>
        </div>
    )
}