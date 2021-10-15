import React from 'react';
import './App.css';
import Header from './Header/Header';
import Breach from './Breach/Breach';
import Miner from './Miner/Miner';


function App(): React.ReactElement {

    return (
        <div className="AppBox">
            <Header />
            <div className="AppInside">
                <Breach />
                <Miner />
            </div>
        </div>
    );
}

export default App;
