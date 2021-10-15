import React from 'react';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import './App.css';

const useStyles = makeStyles((theme) => ({
    appBar: {
        position: 'relative',
    },
    title: {
        marginLeft: theme.spacing(2),
        flex: 1,
    },
}));

export default function EnterDialog() {
    let agreed: any = window.localStorage.getItem("agreed_to_terms");
    if (agreed === "true")
        agreed = true;
    else
        agreed = false;
    const [open, setOpen] = React.useState(!agreed);

    function handleAgree() {
        window.localStorage.setItem("agreed_to_terms", "true");
        setOpen(false);
    }

    const handleClose = () => {
        setOpen(false);
    };

    const CustomDialog = withStyles({
        paper: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#a4dddb',
            color: '#253a5e'
        }
    })(Dialog);

    const CustomButton = withStyles({
        root: {
            backgroundColor: '#fff089',
            border: 0,
            borderRadius: '0.5em',
            fontSize: '0.9em',
            color: '#4f8fba',
            height: '2.7em',
            padding: '0 1em',
            marginRight: '1em',
            '&:hover': {
                backgroundColor: '#fcf7be',
            },
        }
    })(Button);


    return (
        <CustomDialog fullScreen open={open} onClose={handleClose}>
            <div>For now this website updates once every ~2 seconds.</div>
            <br />
            <div>The state displayed by the website will not match the state on-chain during times of high usage.</div>
            <br />
            <div>The slider is kinda janky. Jiggle it and it should respond.</div>
            <br />
            <div>Treat all numbers you see on this website as estimates.</div>
            <br />
            <div className="largeRed">This is beta software, you use it at your own risk.</div>
            <div>
                <br />
                <CustomButton variant="contained" onClick={handleAgree}>
                    I Agree
                </CustomButton>
            </div>
        </CustomDialog>
    );
}