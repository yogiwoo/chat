import axios from 'axios';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDataContext } from '../../reactProvider';
const userData=localStorage.getItem('userData')
const userUid=JSON.parse(userData)?.id
function Header() {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const {setSessionId} = useDataContext();
    const x = (id) => {
       setSessionId(id)
    }
    const navigate=useNavigate();
    // Function to fetch data from API
    const fetchSearchResults = async (query) => {
        if (!query) {
            setSearchResults([]);
            return;
        }

        try {
            setLoading(true);
            const apiurl=`http://localhost:5005/auth/users?name=${query}`
            const response = await fetch(apiurl);
            const data = await response.json();
            setSearchResults(data);
        } catch (error) {
            console.error('Error fetching search results:', error);
            setSearchResults([]);
        } finally {
            setLoading(false);
        }
    };

    // Function to create chat session
    const createChatSession = async (userId) => {
        const object={
            members:[
                userUid,
                userId
            ]
        }
        const userData = localStorage.getItem('userData');
        const token = userData ? JSON.parse(userData).token : null;

        const data = await axios.post(
            'http://localhost:8080/chat/startNewChat',
            object,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            }
        );
        console.log("=========================================>",data);
       if(data){
        alert("Chat created")
       }
       else{
        alert("error while chat is being created")
       }
    };

    // Debounce search to avoid too many API calls
    const handleLogout=()=>{
        localStorage.removeItem("userData")
        navigate("/login")
    }
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchSearchResults(searchTerm);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    return (
        <div className="row">
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav">
                        <li className="nav-item active">
                            <a className="nav-link" href="#">Home</a>
                        </li>
                    </ul>
                    <div className="form-inline my-2 my-lg-0 mx-auto w-50 position-relative">
                        <input 
                            className="form-control mr-sm-2" 
                            type="search" 
                            placeholder="Search" 
                            aria-label="Search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {/* Search Results Dropdown */}
                        {searchTerm && (
                            <div className="position-absolute w-100 mt-1 bg-white rounded shadow-sm" style={{ zIndex: 1000 }}>
                                {loading ? (
                                    <div className="p-3 text-center text-muted">
                                        Loading...
                                    </div>
                                ) : searchResults.length > 0 ? (
                                    <ul className="list-unstyled mb-0">
                                        {searchResults.map((item) => (
                                            <li 
                                                key={item._id} 
                                                className="p-2 hover-bg-light border-bottom cursor-pointer" 
                                                onClick={() => {x(item._id);createChatSession(item._id);}}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <div className="d-flex align-items-center">
                                                    {item.profilePic && (
                                                        <img 
                                                            src={item.profilePic} 
                                                            alt={item.name} 
                                                            className="rounded-circle me-2"
                                                            style={{ width: '30px', height: '30px', objectFit: 'cover' }}
                                                        />
                                                    )}
                                                    <div>
                                                        <div className="fw-bold">{item.name}</div>
                                                        {item.email && (
                                                            <div className="small text-muted">{item.email}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="p-3 text-center text-muted">
                                        No results found
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="ms-auto">
                        <button type="button" className="btn btn-primary" onClick={handleLogout}>Logout</button>
                    </div>
                </div>
            </nav>
        </div>
    );
}

export default Header;