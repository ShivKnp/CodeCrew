import React from 'react';
import './App.css';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import Editor from './Containers/Editor';
import Home from './Containers/Home';
import Lobby from './Components/Lobby/Lobby'; // <-- IMPORT LOBBY

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Switch>
          <Route path='/' exact component={Home} />
          {/* NEW LOBBY ROUTE */}
          <Route path='/lobby/:id' exact component={Lobby} />
          <Route path='/:id' exact component={Editor} />
          {/* Optional: Redirect if someone lands on a bad URL */}
          <Redirect to="/" />
        </Switch>
      </div>
    </BrowserRouter>
  );
}

export default App;