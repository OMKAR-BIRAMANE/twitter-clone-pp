import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { login, reset } from '../redux/features/authSlice';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Paper, 
  Container,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert
} from '@mui/material';
import { Visibility, VisibilityOff, Twitter as TwitterIcon } from '@mui/icons-material';

const Login = () => {
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  
  const { usernameOrEmail, password } = formData;
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { user, isLoading, isError, isSuccess, message, isAuthenticated } = useSelector(
    (state) => state.auth
  );
  
  useEffect(() => {
    if (isError) {
      console.error('Login error:', message);
      // Display error message to user
    }
    
    // Redirect when logged in
    if (isSuccess || user) {
      console.log('Login successful, redirecting to home');
      navigate('/');
    }
    
    // Check if already authenticated
    if (isAuthenticated) {
      console.log('User is already authenticated, redirecting to home');
      navigate('/');
    }
    
    return () => {
      dispatch(reset());
    };
  }, [user, isError, isSuccess, message, navigate, dispatch, isAuthenticated]);
  
  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value
    }));
    
    // Clear error when user types
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!usernameOrEmail.trim()) {
      newErrors.usernameOrEmail = 'Username or email is required';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const onSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const userData = {
        usernameOrEmail,
        password
      };
      
      console.log('Submitting login data:', { usernameOrEmail });
      dispatch(login(userData));
    }
  };
  
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  
  return (
    <Container component="main" maxWidth="xs">
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          mt: 8
        }}
      >
        <TwitterIcon color="primary" sx={{ fontSize: 40, mb: 2 }} />
        <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
          Log in to Twitter
        </Typography>
        
        {isError && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {message}
          </Alert>
        )}
        
        <Box component="form" onSubmit={onSubmit} sx={{ width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="usernameOrEmail"
            label="Username or Email"
            name="usernameOrEmail"
            autoComplete="username"
            autoFocus
            value={usernameOrEmail}
            onChange={onChange}
            error={!!errors.usernameOrEmail}
            helperText={errors.usernameOrEmail}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={onChange}
            error={!!errors.password}
            helperText={errors.password}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={toggleShowPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, py: 1.5, borderRadius: '30px' }}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Log In'}
          </Button>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Typography variant="body2">
              Don't have an account?{' '}
              <Link to="/signup" style={{ textDecoration: 'none', color: 'primary.main' }}>
                Sign up
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;