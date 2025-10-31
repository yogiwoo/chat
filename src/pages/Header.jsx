import axios from 'axios';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDataContext } from '../../reactProvider';
import pp from "./../../public/profile.png";
const userData = localStorage.getItem('userData')
const userUid = JSON.parse(userData)?.id
const prefix = "http://localhost:3001";
const prefix2 = "http://localhost:3002";

function Header() {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const { setSessionId } = useDataContext();
    const x = (id) => {
        setSessionId(id)
    }
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);  // Add state for dropdown
    
    const handleLogout = () => {
        localStorage.removeItem("userData");
        navigate("/login");
    };

    const toggleDropdown = () => {
        setShowDropdown(prev => !prev);  // Toggle dropdown
    };

    // Handle clicking outside to close dropdown imporatant  - >CHATGPT CODE ADDED
    useEffect(() => {
        function handleClickOutside(event) {
            // If click is outside the dropdown container, close it
            const dropdownContainer = document.querySelector('.profile-dropdown-container');
            if (dropdownContainer && !dropdownContainer.contains(event.target)) {
                setShowDropdown(false);
            }
        }

        // Add the event listener
        document.addEventListener('click', handleClickOutside);
        
        // Clean up the event listener when component unmounts
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []); // Empty dependency array means this runs once on mount

    // Function to fetch data from API
    const fetchSearchResults = async (query) => {
        if (!query) {
            setSearchResults([]);
            return;
        }

        try {
            setLoading(true);
            const apiurl = `${prefix}/users?name=${query}`
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
        console.log("user id===================>", userId, userUid);
        const object = {
            members: [
                userUid,
                userId
            ]
        }
        const userData = localStorage.getItem('userData');
        const token = userData ? JSON.parse(userData).token : null;

        const data = await axios.post(
            `${prefix2}/startNewChat`,
            object,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            }
        );
        console.log("=========================================>", data);
        if (data) {
            alert("Chat created")
        }
        else {
            alert("error while chat is being created")
        }
    };

    // Debounce search to avoid too many API calls
    // const handleLogout=()=>{
    //     localStorage.removeItem("userData")
    //     navigate("/login")
    // }
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
                                                onClick={() => { x(item._id); createChatSession(item._id); }}
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
                    <div className="ms-auto position-relative profile-dropdown-container">
                        <img
                            src={pp}
                            alt="Profile"
                            className="profilepic rounded-circle border"
                            style={{ width: '40px', height: '40px', objectFit: 'cover', cursor: 'pointer' }}
                            onClick={toggleDropdown}
                        />
                        {showDropdown && (
                            <div 
                                className="position-absolute end-0 mt-2 py-2 bg-white rounded shadow-lg" 
                                style={{ 
                                    minWidth: '160px', 
                                    zIndex: 1000,
                                    border: '1px solid rgba(0,0,0,0.1)'
                                }}
                            >
                                <div 
                                    className="px-3 py-2 hover-bg-light"
                                    onClick={() => { navigate('/profile'); setShowDropdown(false); }}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <i className="bi bi-person me-2"></i>
                                    Profile
                                </div>
                                <hr className="my-1" />
                                <div 
                                    className="px-3 py-2 text-danger hover-bg-light"
                                    onClick={() => { handleLogout(); setShowDropdown(false); }}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <i className="bi bi-box-arrow-right me-2"></i>
                                    Logout
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </nav>
        </div>
    );
}

export default Header;