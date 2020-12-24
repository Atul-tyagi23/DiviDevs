import './App.css';
import React, {Fragment} from 'react';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom'
import Navbar from './components/layout/Navbar';
import Landing from './components/layout/Landing';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Alert from './components/layout/Alert';
import Dashboard from './components/dashboard/Dashboard'
//Redux
import { Provider} from 'react-redux';
import Store from './store'


const App = () => (
  <Provider store={Store}>
    <Router>
    <div className="App">
      <Fragment>
      <Navbar />
      <Route exact path='/' component={Landing} /> 
      <section className='container' >
        <Alert/>
        <Switch>
          <Route exact path='/register' component={Register} />
          <Route exact path='/login' component={Login} />
          <Route exact path='/dashboard' component={Dashboard} />
        </Switch>
      </section>

      </Fragment>
    </div>
    </Router>
  </Provider>
);
 
export default App;
