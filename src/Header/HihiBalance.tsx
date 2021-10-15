import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import { withStyles } from '@material-ui/core/styles';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';

HihiBalanceDialog.propTypes = {
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
};

function HihiBalanceDialog(props: any) {
    const { onClose, open } = props;

    const CreateAccountButton = withStyles({
        root: {
            backgroundColor: '#fff089',
            border: 0,
            borderRadius: '0.5em',
            fontSize: '0.9em',
            color: '#4f8fba',
            height: '3em',
            padding: '0 1em',
            marginTop: '1em',
            marginRight: '1em',
            marginBottom: '1em',
            '&:hover': {
                backgroundColor: '#fcf7be',
            },
        }
    })(Button);

    const handleClose = () => {
        onClose();
    };

    function handleButtonClick() {
        //let token_mint_id = new PublicKey(hihi_data.token_mint_id);
        //createTokenAccount(token_mint_id);
        onClose();
    }
    const CustomDialog = withStyles({
        paper: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            maxWidth: '20em',
            width: '100%',
            backgroundColor: '#a4dddb',
            color: '#253a5e'
        }
    })(Dialog);

    const CustomDialogTitle = withStyles({
        root: {
            textAlign: 'center',
            width: "100%",
            backgroundColor: '#253a5e',
            color: '#fff089'
        }
    })(DialogTitle);

    return (
        <CustomDialog onClose={handleClose} aria-labelledby="Create Account" open={open}>
            <CustomDialogTitle>Send ヒヒ</CustomDialogTitle>
            
            <CreateAccountButton variant="contained" onClick={handleButtonClick}>Create ヒヒ Account</CreateAccountButton>
        </CustomDialog>
    );
}


export default function HihiBalance() {
    const [balance, setBalance] = useState(() => {
        return 0
    })

    function set(event:any) {
        setBalance(event.detail);
    }


    function handleBalanceOpen() {

    }

    const HihiBalanceButton = withStyles({
        root: {
            border:'1px solid #fff089',
            textShadow: '0.04em 0.04em 0.2em #253a5e',
            boxShadow: '0em 0em 0.2em #253a5e',
            borderRadius: '3em',
            fontSize: '0.7em',
            fontWeight: 'bold',
            color: '#fff089',
            height: '2em',
            padding: '0 1em',
            marginRight: '1em',
            '&:hover': {
                backgroundColor: '#73bed3',
            },
        }
    })(Button);

    useEffect(() => {
        window.addEventListener("hihi.balance", set);
        return () => {
            window.removeEventListener("hihi.balance", set);
        }
    }, [])

    return (
        <div>
            <HihiBalanceButton onClick={handleBalanceOpen}>
                <div className="row-center">
                    {(balance/LAMPORTS_PER_SOL)}
                    <div>ヒ</div>
                    <div className="hi_r">ヒ</div>
                </div>

            </HihiBalanceButton>
        </div>
    )
}