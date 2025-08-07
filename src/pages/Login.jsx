import axios from 'axios';
import { useEffect, useState } from 'react';
import { Container, Form, Button, Card } from 'react-bootstrap';
import { Link,replace,useNavigate } from 'react-router-dom';

function Login() {
    const navigate=useNavigate();
    const [isCorrect,setIsCorrect]=useState(false)
    const [err,setErr]=useState(false)
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // TODO: Implement login logic here
        try{

        
        let loginData=await axios.post("http://localhost:5005/auth/login",formData);
       
        if(loginData.data.success===true){
            //alert("login success!")
            setIsCorrect(true)
            navigate("/home")
            localStorage.setItem("userData",JSON.stringify(loginData.data.user))
        }
        else{
             setIsCorrect(true)
            //alert("login failed username and password is incorrect")
        }
    }catch(error){
        setErr(true);
    }
    };
   
    return (
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
            <Card style={{ width: '400px' }} className="p-4 shadow">
                <Card.Title className="text-center mb-4">Login</Card.Title>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Email address</Form.Label>
                        <Form.Control
                            type="email"
                            placeholder="Enter email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-4">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>

                    <Button variant="primary" type="submit" className="w-100">
                        Login
                    </Button>
                  
                  {isCorrect && <p className="text-danger">Invalid credentials</p>}
                  {err && <p className='text-danger'>Failed to connect to server</p>}
                </Form>
                 <Link to="/signup" className='text-center'>Signup!</Link>
            </Card>
           
        </Container>
    );
}

export default Login;