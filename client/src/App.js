// import logo from './logo.svg';
import './App.css';
import {BrowserRouter as Router ,Route,Routes} from 'react-router-dom';
import Login from './pages/Login/login'
import Recon from './pages/recon/recon';
// import Sample from './pages/sample/sample';
import Users from './pages/Users/users';
import Master from './pages/master/master';
import Minion from './pages/Minions/minions';
import Mapping from './pages/Mapping/mapping';
import Transactions from './pages/Transactions/transactions';
function App() {
  return (
    <div>
    <Router>
      <Routes >
        <Route path="/" element={<Login />} />
        <Route path="/users" element={<Users/>}/>
        <Route path="/masters" element={<Master/>}/>
        <Route path="/minions" element={<Minion/>}/>
        <Route path="/mappings" element={<Mapping/>}/>
        <Route path="/transactions" element={<Transactions/>}/>
        <Route path="/recon" element={<Recon/>}/>
        <Route path="*" element={<Login/>}/>
        {/* <Route path="/sample" element={<Sample/>}/> */}
      </Routes>
    </Router>
    </div>
  );
}

export default App;
