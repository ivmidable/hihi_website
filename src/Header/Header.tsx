import React, { useState, useEffect } from 'react';
import './Header.css';
import Grid from '@material-ui/core/Grid';
import WalletButton from './WalletButton';
import HihiBalance from './HihiBalance'
import SolanaBalance from './SolanaBalance';

export default function Header(): React.ReactElement {
    return (
        <Grid
            container
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
        >
            <div className="hi">
                <div className="hi_l">ヒ</div>
                <div className="hi_r">ヒ</div>
            </div>
            <div>
                <div style={{ overflow: 'visible' }} className="row-center">
                    <HihiBalance />
                    <SolanaBalance />
                    <WalletButton />
                </div>
            </div>
        </Grid>
    )
}