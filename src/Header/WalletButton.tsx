import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Avatar from '@material-ui/core/Avatar';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import Snackbar from "@material-ui/core/Snackbar";
import Alert from '@material-ui/lab/Alert';
import Link from "@material-ui/core/Link";
import { withStyles } from '@material-ui/core/styles';
import './WalletButton.css';
import Hihi from '../lib/Hihi';
import { Uint64LE } from 'int64-buffer';
import Wallet from '../../../';
import {
    Connection,
    Transaction,
    clusterApiUrl,
    LAMPORTS_PER_SOL,
    PublicKey
} from '@solana/web3.js';
import { Token, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import {
    WalletAdapter,
    LedgerWalletAdapter,
    PhantomWalletAdapter,
    SolletExtensionAdapter,
    MathWalletAdapter,
    SolflareExtensionWalletAdapter,
} from '../wallet-adapters';

const network = clusterApiUrl('mainnet-beta');

const connection = new Connection(
    network,
    'confirmed',
);


const hihi = new Hihi("AbRELevcgegtTppb9LYWw66Gxy5ES6HyT9MCqzQFFHGK");
const hihi_instance = new PublicKey("3iaVX4uTLDXRDPrmqPWebwz4YKYKt1gcdVDiqco22okX");
let hihi_data: any = undefined;

let hihi_receiver_id: any = undefined;
let explorerLink: string = "https://explorer.solana.com/tx/";

window.localStorage.setItem("hihi_instance", hihi_instance.toBase58());

const providers = ['Sollet.io', 'Phantom', 'Solflare', 'Ledger'];
let wallet: any = undefined;

const ASSET_URL =
    'https://cdn.jsdelivr.net/gh/solana-labs/oyster@main/assets/wallets';

export const WALLET_PROVIDERS = new Map();

WALLET_PROVIDERS.set("Sollet.io", { url: 'https://www.sollet.io', icon: `${ASSET_URL}/sollet.svg` });
WALLET_PROVIDERS.set("Solflare", {
    url: 'https://solflare.com/access-wallet',
    icon: `${ASSET_URL}/solflare.svg`,
});
WALLET_PROVIDERS.set("Ledger", {
    url: 'https://www.ledger.com',
    icon: `${ASSET_URL}/ledger.svg`,
    adapter: LedgerWalletAdapter,
});
WALLET_PROVIDERS.set("Phantom", {
    url: 'https://www.phantom.app',
    icon: `https://www.phantom.app/img/logo.png`,
    adapter: PhantomWalletAdapter,
});
WALLET_PROVIDERS.set("Math", {
    url: 'https://www.mathwallet.org',
    icon: `${ASSET_URL}/mathwallet.svg`,
    adapter: MathWalletAdapter,
});

/*function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}*/

setTimeout(function tick() {
    hihi.parseAccountData(connection, hihi_instance).then(data => {
        hihi_data = data;
        window.localStorage.setItem("hihi_data", JSON.stringify(data));
        const b_update = new CustomEvent('breach.update');
        window.dispatchEvent(b_update);
    }).catch(err => console.log(err));
    connection.getEpochInfo().then(data => {
        window.localStorage.setItem("epoch_data", JSON.stringify(data));
    }).catch(err => console.log(err));
    connection.getSlot().then(data => {
        window.localStorage.setItem("slot_data", JSON.stringify(data));
    }).catch(err => console.log(err));
    if (wallet !== undefined) {
        connection.getBalance(wallet.publicKey).then((balance) => {
            const sol_balance = new CustomEvent('sol.balance', { detail: balance });
            window.dispatchEvent(sol_balance);
            //console.log(balance / LAMPORTS_PER_SOL);
        }).catch(err => console.log(err));

        if (hihi_receiver_id !== undefined && hihi_data !== undefined) {
            let token_mint_id = new PublicKey(hihi_data.token_mint_id);
            getTokenBalance(token_mint_id, hihi_receiver_id).then((balance) => {
                const hihi_balance = new CustomEvent('hihi.balance', { detail: balance });
                window.dispatchEvent(hihi_balance);
            }).catch(err => console.log(err))
        }
    }
    setTimeout(tick, 1500);
}, 0);

function signAndSend(event: any) {
    if (wallet === undefined) return;
    wallet.signTransaction(event.detail).then((signed) => {
        connection.sendRawTransaction(signed.serialize()).then((signature) => {
            const success = new CustomEvent('wb.success', { detail: signature });
            window.dispatchEvent(success);
            const b_update = new CustomEvent('breach.update');
            window.dispatchEvent(b_update);
            //console.log("TXN-SIGNATURE >> ", signature);
        }).catch(err => {
            const error = new CustomEvent('wb.error', { detail: "Invalid Transaction, Check funds." });
            window.dispatchEvent(error);
            return;
        });
    }).catch(err => {
        console.log(err);
    });

}

function sendBreach(event: any) {
    if (wallet === undefined) return;
    const token_mint_id = new PublicKey(hihi_data.token_mint_id);
    const authority_id = new PublicKey(hihi_data.authority_id);
    //console.log(Math.ceil(event.detail*LAMPORTS_PER_SOL));
    console.log(event.detail);
    hihi.BreachTransaction(connection, hihi_instance, token_mint_id, authority_id, hihi_receiver_id, wallet.publicKey, new Uint64LE(Math.floor(event.detail * LAMPORTS_PER_SOL)))
        .catch(err => {
            console.log(err);
            //const error = new CustomEvent('wb.error', { detail: "Failed to send Breach." });
            //window.dispatchEvent(error);
            return;
        });
}

function sendClaim(event: any) {
    if (wallet === undefined) return;
    const token_mint_id = new PublicKey(hihi_data.token_mint_id);
    const authority_id = new PublicKey(hihi_data.authority_id);
    hihi.ClaimTransaction(connection, hihi_instance, TOKEN_PROGRAM_ID, token_mint_id, authority_id, event.detail.claim, event.detail.pool, hihi_receiver_id, event.detail.hex, wallet.publicKey)
        .catch(err => {
            console.log(err);
            //const error = new CustomEvent('wb.error', { detail: "Failed to send Claim." });
            //window.dispatchEvent(error);
            return;
        });
}

function sendLimitBreak(event: any) {
    if (wallet === undefined) return;
    const token_mint_id = new PublicKey(hihi_data.token_mint_id);
    const authority_id = new PublicKey(hihi_data.authority_id);
    hihi.LimitBreakTransaction(connection, hihi_instance, TOKEN_PROGRAM_ID, token_mint_id, authority_id, event.detail.claim, event.detail.pool, hihi_receiver_id, wallet.publicKey, wallet.publicKey)
        .catch(err => {
            console.log(err);
            //const error = new CustomEvent('wb.error', { detail: "Failed to send Limit Break." });
            //window.dispatchEvent(error);
            return;
        });
}

function createTokenAccount(token_mint_id: PublicKey) {
    Token.getAssociatedTokenAddress(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, token_mint_id, wallet.publicKey).then(associatedAddress => {
        console.log(associatedAddress.toBase58());
        let ix = Token.createAssociatedTokenAccountInstruction(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, token_mint_id, associatedAddress, wallet.publicKey, wallet.publicKey);
        const txn = new Transaction().add(ix);
        connection.getRecentBlockhash().then(blockhash => {
            txn.recentBlockhash = blockhash.blockhash;
            txn.feePayer = wallet.publicKey;
            signAndSend({ detail: txn })
        }).catch(err => {
            const error = new CustomEvent('wb.error', { detail: "Failed to get recent blockhash." });
            window.dispatchEvent(error);
            return;
        });
    }).catch(err => {
        const error = new CustomEvent('wb.error', { detail: "Failed to get associated token account." });
        window.dispatchEvent(error);
        return;
    });
}

//USDT mint id: Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB
async function getTokenBalance(token_mint_id: PublicKey, token_account_id: PublicKey) {
    let info = await connection.getAccountInfo(token_account_id)
    if (info === null) {
        return 0;
    }

    if (!info.owner.equals(TOKEN_PROGRAM_ID)) {
        return 0;
    }

    let data = Buffer.from(info.data);
    let pos = 0;
    let mint_id = new PublicKey("Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB");
    pos += 32 + 32;
    if (mint_id.toBase58() !== token_mint_id.toBase58()) {
        return 0;
    }
    let balance = new Uint64LE(data, pos);
    return Number(balance.toString());
}

CreateTokenAccountDialog.propTypes = {
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
};

function CreateTokenAccountDialog(props: any) {
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
        let token_mint_id = new PublicKey(hihi_data.token_mint_id);
        createTokenAccount(token_mint_id);
        onClose();
    }
    const CustomDialog = withStyles({
        paper: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            maxWidth: '25em',
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
            <CustomDialogTitle>Create ヒヒ Account</CustomDialogTitle>
            <div>Your wallet does not have a ヒヒ account.</div>
            <div>In order to receive ヒヒ you must create an account.</div>
            <div>If you choose not to create an account then all ヒヒ</div> 
            <div>breached will be added to work.</div>
            <CreateAccountButton variant="contained" onClick={handleButtonClick}>Create ヒヒ Account</CreateAccountButton>
        </CustomDialog>
    );
}

WalletDialog.propTypes = {
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    selectedValue: PropTypes.string.isRequired,
};


function WalletDialog(props: any) {
    const { onClose, selectedValue, open } = props;

    function disconnectWallet() {
        if(wallet !== undefined) {
            wallet.disconnect();
            wallet = undefined;
        }
        const event = new CustomEvent('wb.connected', { detail: false });
        window.dispatchEvent(event);
        const hihi_balance = new CustomEvent('hihi.balance', { detail: 0 });
        window.dispatchEvent(hihi_balance);
        const sol_balance = new CustomEvent('sol.balance', { detail: 0 });
        window.dispatchEvent(sol_balance);
    }

    function connectWallet() {
        if (wallet !== undefined) {
            wallet.on('connect', () => {
                console.log('connected');
                const event = new CustomEvent('wb.connected', { detail: true });
                window.dispatchEvent(event);
                window.localStorage.setItem("wallet_id", wallet.publicKey?.toBase58() ?? "");
                connection.getBalance(wallet.publicKey).then((balance) => {
                    console.log(balance / LAMPORTS_PER_SOL);
                })

                let token_account = window.localStorage.getItem("hihi_receiver_id");

                if (token_account !== null && hihi_data !== undefined) {
                    let token_account_id = new PublicKey(token_account);
                    let token_mint_id = new PublicKey(hihi_data.token_mint_id);
                    getTokenBalance(token_mint_id, token_account_id);
                }

            });
            wallet.on('disconnect', () => {
                const event = new CustomEvent('wb.connected', { detail: false });
                window.dispatchEvent(event);
                console.log('Disconnected');
            });

            wallet.connect().then(() => {

            }).catch((err) => {
                const error = new CustomEvent('wb.error', { detail: "Failed to connect wallet." });
                window.dispatchEvent(error);
            });
        }
    }

    useEffect(() => {
        window.addEventListener("wb.signsend", signAndSend);
        window.addEventListener("wb.breach", sendBreach);
        window.addEventListener("wb.claim", sendClaim);
        window.addEventListener("wb.limitbreak", sendLimitBreak);
        window.addEventListener("wb.disconnect", disconnectWallet);
        return () => {
            window.removeEventListener("wb.signsend", signAndSend);
            window.removeEventListener("wb.breach", sendBreach);
            window.removeEventListener("wb.claim", sendClaim);
            window.removeEventListener("wb.limitbreak", sendLimitBreak);
            window.removeEventListener("wb.disconnect", disconnectWallet);
        }
    }, [])

    const handleClose = () => {
        onClose(selectedValue);
    };

    const handleListItemClick = (value: any) => {
        if (WALLET_PROVIDERS.has(value) === true) {
            wallet = new (WALLET_PROVIDERS.get(value).adapter || Wallet)(
                WALLET_PROVIDERS.get(value).url,
                network,
            ) as WalletAdapter;
        }
        connectWallet();
        onClose(value);
    };

    const CustomDialog = withStyles({
        paper: {
            backgroundColor: '#a4dddb',
            color: '#253a5e'
        }
    })(Dialog);

    const CustomDialogTitle = withStyles({
        root: {
            backgroundColor: '#253a5e',
            color: '#fff089'
        }
    })(DialogTitle);

    const CustomListItem = withStyles({
        root: {
            '&:hover': {
                backgroundColor: '#fff089',
            }
        }
    })(ListItem);

    return (
        <CustomDialog onClose={handleClose} aria-labelledby="wallet-dialog" open={open}>
            <CustomDialogTitle>Choose Wallet Provider</CustomDialogTitle>
            <List>
                {providers.map((provider) => (
                    <CustomListItem className="listItem" button onClick={() => handleListItemClick(provider)} key={provider}>
                        <div className="listItemInternal">
                            <ListItemAvatar>
                                <Avatar className="avatarImage" src={WALLET_PROVIDERS.get(provider).icon} />
                            </ListItemAvatar>
                            <ListItemText primary={provider} />
                        </div>
                    </CustomListItem>
                ))}
            </List>
        </CustomDialog>
    );
}

WalletDialog.propTypes = {
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    selectedValue: PropTypes.string.isRequired,
};

export default function WalletButton() {
    const [providerOpen, setProviderOpen] = useState(false);
    const [accountOpen, setAccountOpen] = useState(false);
    const [errorOpen, setErrorOpen] = useState(() => {
        return false;
    });
    const [successOpen, setSuccessOpen] = useState(() => {
        return false
    });
    const [errorText, setErrorText] = useState(() => {
        return "";
    });
    const [successText, setSuccessText] = useState(() => {
        return ""
    });
    const [selectedValue, setSelectedValue] = useState(providers[0]);
    const [connected, setConnected] = useState(() => {
        return false;
    });
    const [text, setText] = useState(() => {
        return "Connect Wallet";
    })

    function handleAccountOpen() {
        setAccountOpen(true);
    }

    const handleAccountClose = () => {
        setAccountOpen(false);
    };

    const handleProviderClickOpen = () => {
        if (connected === false) {
            setProviderOpen(true);
        } else {
            const event = new CustomEvent('wb.disconnect');
            window.dispatchEvent(event);
        }
    };

    const handleProviderClose = (value: any) => {
        setProviderOpen(false);
        setSelectedValue(value);
    };

    function handleError(event: any) {
        setErrorText("Transaction Failed.");
        setErrorOpen(true);
    }

    function handleSuccess(event: any) {
        setSuccessText(event.detail);
        setSuccessOpen(true);
    }

    function handleErrorClose() {
        setErrorOpen(false);
    }

    function handleSuccessClose() {
        setSuccessOpen(false);
    }

    function handleConnected(value: any) {
        setConnected(value.detail);
        if (value.detail === true) {
            setText("Disconnect");
            const token_mint_id = new PublicKey(hihi_data.token_mint_id);
            //get token address, if no token address found prompt to create one.
            let token_mint = new Token(connection, token_mint_id, TOKEN_PROGRAM_ID, wallet.publicKey);
            Token.getAssociatedTokenAddress(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, token_mint_id, wallet.publicKey).then(associatedAddress => {
                hihi_receiver_id = associatedAddress;
                window.localStorage.setItem("hihi_receiver_id", associatedAddress.toBase58());
                token_mint.getAccountInfo(associatedAddress).then(info => {
                    //console.log(info.amount.toString());
                    //if (token_mint_id.toBase58() !== info.mint.toBase58()) return;

                }).catch(err => {
                    if (String(err) === "Error: Failed to find account") {
                        handleAccountOpen();
                    } else {
                        const error = new CustomEvent('wb.error', { detail: "Failed to get account info." });
                        window.dispatchEvent(error);
                    }
                });
            }).catch(err => {
                const error = new CustomEvent('wb.error', { detail: "Failed to get associated token address" });
                window.dispatchEvent(error);
            });

        } else {
            setText("Connect Wallet");
        }

    }

    useEffect(() => {
        window.addEventListener("wb.connected", handleConnected);
        window.addEventListener("wb.error", handleError);
        window.addEventListener("wb.success", handleSuccess);
        return () => {
            window.removeEventListener("wb.connected", handleConnected);
            window.removeEventListener("wb.error", handleError);
            window.removeEventListener("wb.success", handleSuccess);
        }
    }, []);

    const action = (
        <Link target="_blank" href={explorerLink + successText}>
            View
        </Link>
        /*<Button color="secondary" size="small">
          lorem ipsum dolorem
        </Button>*/
    );


    const ConnectWalletButton = withStyles({
        root: {
            backgroundColor: '#fff089',
            border: 0,
            borderRadius: '3em',
            fontSize: '0.7em',
            color: '#4f8fba',
            height: '3em',
            padding: '0 1em',
            marginRight: '1em',
            '&:hover': {
                backgroundColor: '#fcf7be',
            },
        }
    })(Button);

    const SuccessAlert = withStyles({
        root: {
            backgroundColor: '#c4f129',
            fontSize: '0.7em',
            borderRadius: '1em',
            color: '#253a5e',
        }
    })(Alert);

    const ErrorAlert = withStyles({
        root: {
            backgroundColor: '#fdc9c9',
            borderRadius: '1em',
            fontSize: '0.7em',
            color: '#253a5e',
        }
    })(Alert);

    return (
        <div className="walletButton">
            <ConnectWalletButton variant="contained" onClick={handleProviderClickOpen}>
                {text}
            </ConnectWalletButton>
            <WalletDialog selectedValue={selectedValue} open={providerOpen} onClose={handleProviderClose} />
            <CreateTokenAccountDialog open={accountOpen} onClose={handleAccountClose} />
            <Snackbar anchorOrigin={{ vertical: 'top', horizontal: 'center' }} open={errorOpen} autoHideDuration={3000} onClose={handleErrorClose}>
                <ErrorAlert elevation={6} onClose={handleErrorClose} severity="error">
                    {errorText}
                </ErrorAlert>
            </Snackbar>
            <Snackbar anchorOrigin={{ vertical: 'top', horizontal: 'center' }} open={successOpen} autoHideDuration={3000} onClose={handleSuccessClose}>
                <SuccessAlert elevation={6} onClose={handleSuccessClose} severity="success" action={action}>
                    Transaction Sent.
                </SuccessAlert>
            </Snackbar>
        </div>
    );
}

