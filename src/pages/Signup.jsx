import { useState } from 'react';
import { Container, Form, Button, Card } from 'react-bootstrap';
import axios from "axios"
import { Link } from 'react-router-dom';
function Signup() {
    const [formData, setFormData] = useState({
        name: "",
        mobile: "",
        email: "",
        password: ""
    })
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }
    const handleSubmit = async (e) => {
        console.log("this one")
        const postData = await axios.post("http://localhost:5005/auth/signup", formData)
        console.log("===========================>", postData)
        if (postData) {
            alert("Signup successful")
        }
        e.preventDefault();
    }
    return (
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
            <Card style={{ width: '400px' }} className="p-4 shadow">
                <Card.Title className="text-center mb-4">Login</Card.Title>
                <input type='text'
                    placeholder="Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange} />

                <input type='text'
                    placeholder="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange} />

                <input type='text'
                    placeholder="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange} />

                <input type='text'
                    placeholder="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange} />

                <button onClick={handleSubmit}>Signup</button>

                <Link to="/login" className='text-center'>Already have an account?</Link>


            </Card>
        </Container>
    )
}

export default Signup;