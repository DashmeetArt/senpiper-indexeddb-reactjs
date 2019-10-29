import React, { useState, useEffect, useRef } from 'react';
import TextField from '@material-ui/core/TextField';
// import throttle from 'lodash.throttle';
import debounce from 'lodash.debounce';

import './App.css';
import Restaurants from './Components/Restaurants';

function eliminate(string) {
    const reg = new RegExp("[^a-zA-Z0-9,\\s+]", "gi");
    return string.replace(reg, "");
}

// Main App
function App() {
    const [searchTerm, setSearchTerm] = useState("");
    const [pseudo, setPseudo] = useState("");

    const debounced = useRef(debounce((value) => {
        setPseudo(eliminate(value))
    }, 200));

    useEffect(() => {
        debounced.current(searchTerm)
    }, [searchTerm])
    
    function handleChange(event) {
        setSearchTerm(event.target.value);
    }
    return (
        <div className="App">
            <div className="Search">
                <TextField
                    autoFocus
                    fullWidth
                    label="Search Restaurants"
                    placeholder=""
                    value={searchTerm}
                    onChange={handleChange}
                    variant="outlined"
                    InputLabelProps={{
                        shrink: true
                    }}
                />
            </div>
            <Restaurants search={pseudo} />
        </div>
    );
}

export default App;
