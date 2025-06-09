import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { register, reset } from '../redux/features/authSlice';
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
  Alert,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { Visibility, VisibilityOff, Twitter as TwitterIcon } from '@mui/icons-material';

const Signup = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  
  const { name, username, email, password, confirmPassword } = formData;
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );
  
  useEffect(() => {
    if (isError) {
      // Handle error
    }
    
    // Redirect when registered
    if (isSuccess || user) {
      navigate('/');
    }
    
    dispatch(reset());
  }, [user, isError, isSuccess, message, navigate, dispatch]);
  
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
  
  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 0) {
      if (!name.trim()) {
        newErrors.name = 'Name is required';
      }
      
      if (!email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(email)) {
        newErrors.email = 'Email is invalid';
      }
    } else if (step === 1) {
      if (!username.trim()) {
        newErrors.username = 'Username is required';
      } else if (username.length < 3) {
        newErrors.username = 'Username must be at least 3 characters';
      }
      
      if (!password) {
        newErrors.password = 'Password is required';
      } else if (password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
      
      if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleNext = (e) => {
    e.preventDefault(); // Prevent form submission
    if (validateStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };
  
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };
  
  const onSubmit = (e) => {
    e.preventDefault();
    
    if (validateStep(activeStep)) {
      const userData = {
        name,
        username,
        email,
        password
      };
      
      dispatch(register(userData));
    }
  };
  
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  
  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  
  const steps = ['Basic Information', 'Account Details'];
  
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
          Create your account
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ width: '100%', mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {isError && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {message}
          </Alert>
        )}
        
        <Box component="form" noValidate onSubmit={activeStep === steps.length - 1 ? onSubmit : handleNext} sx={{ width: '100%' }}>
          {activeStep === 0 ? (
            <>
              <TextField
                margin="normal"
                required
                fullWidth
                id="name"
                label="Name"
                name="name"
                autoComplete="name"
                autoFocus
                value={name}
                onChange={onChange}
                error={!!errors.name}
                helperText={errors.name}
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                value={email}
                onChange={onChange}
                error={!!errors.email}
                helperText={errors.email}
              />
            </>
          ) : (
            <>
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                value={username}
                onChange={onChange}
                error={!!errors.username}
                helperText={errors.username}
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="new-password"
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
              
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={onChange}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={toggleShowConfirmPassword}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              onClick={handleBack}
              sx={{ borderRadius: '30px' }}
              disabled={activeStep === 0}
            >
              Back
            </Button>
            
            <Button
              type="submit"
              variant="contained"
              sx={{ py: 1.5, px: 4, borderRadius: '30px' }}
              disabled={isLoading}
            >
              {isLoading ? (
                <CircularProgress size={24} />
              ) : activeStep === steps.length - 1 ? (
                'Sign Up'
              ) : (
                'Next'
              )}
            </Button>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Typography variant="body2">
              Already have an account?{' '}
              <Link to="/login" style={{ textDecoration: 'none', color: 'primary.main' }}>
                Log in
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Signup;