import React, { useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

export default function SolanaBalance() {
    const [balance, setBalance] = useState(() => {
        return 0
    })

    function set(event:any) {
        setBalance(event.detail);
    }

    function handleBalanceOpen() {
        
    }

    const SolanaBalanceButton = withStyles({
        root: {
            border:'1px solid #fff089',
            textShadow: '0.04em 0.04em 0.2em #253a5e',
            boxShadow: '0em 0em 0.2em #253a5e',
            borderRadius: '3em',
            fontSize: '0.7em',
            fontWeight: 'bold',
            color: '#fff089',
            height: '2em',
            paddingLeft: '1em',
            paddingRight:'1em',
            marginRight: '5em',
            '&:hover': {
                backgroundColor: '#73bed3',
            },
        }
    })(Button);

    useEffect(() => {
        window.addEventListener("sol.balance", set);
        return () => {
            window.removeEventListener("sol.balance", set);
        }
    }, [])

    return (
        <div>
            <SolanaBalanceButton onClick={handleBalanceOpen}>
                {(balance/LAMPORTS_PER_SOL)} SOL
            </SolanaBalanceButton>
        </div>
    )
}