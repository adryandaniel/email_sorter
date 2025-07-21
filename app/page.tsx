'use client';

import { useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import {
  Email as EmailIcon,
  Google as GoogleIcon,
  AutoAwesome as AutoAwesomeIcon,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';

export default function Home() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user) {
      window.location.href = '/dashboard';
    }
  }, [user]);

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (user) {
    return null; // Will redirect to dashboard
  }

  const handleSignIn = () => {
    window.location.href = '/api/auth/google';
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 50%, #00acc1 100%)',
      display: 'flex',
      alignItems: 'center',
    }}>
      <Container maxWidth="md">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <EmailIcon sx={{ fontSize: 80, color: 'white', mb: 2 }} />
          <Typography 
            variant="h2" 
            component="h1" 
            sx={{ 
              color: 'white', 
              fontWeight: 'bold',
              mb: 2,
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            }}
          >
            Email Sorter
          </Typography>
          <Typography 
            variant="h5" 
            sx={{ 
              color: 'rgba(255,255,255,0.9)', 
              mb: 4,
              fontWeight: 300,
            }}
          >
            AI-Powered Email Organization for Multiple Gmail Accounts
          </Typography>
        </Box>

        <Card sx={{ 
          borderRadius: 3, 
          boxShadow: '0 16px 32px rgba(0,0,0,0.2)',
          backdrop: 'blur(10px)',
        }}>
          <CardContent sx={{ p: 6 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                Welcome to Email Sorter
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
                Automatically categorize and manage your emails with AI
              </Typography>
            </Box>

            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
              gap: 3,
              mb: 4,
            }}>
              <Box sx={{ textAlign: 'center' }}>
                <AutoAwesomeIcon sx={{ fontSize: 48, color: '#1976d2', mb: 1 }} />
                <Typography variant="h6" gutterBottom>
                  AI-Powered Sorting
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Automatically categorize emails using advanced AI technology
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <EmailIcon sx={{ fontSize: 48, color: '#00acc1', mb: 1 }} />
                <Typography variant="h6" gutterBottom>
                  Multi-Account Support
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Connect and manage multiple Gmail accounts in one place
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <GoogleIcon sx={{ fontSize: 48, color: '#f57c00', mb: 1 }} />
                <Typography variant="h6" gutterBottom>
                  Smart Unsubscribe
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Automatically detect and process unsubscribe requests
                </Typography>
              </Box>
            </Box>

            <Box sx={{ textAlign: 'center' }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<GoogleIcon />}
                onClick={handleSignIn}
                sx={{
                  bgcolor: '#4285f4',
                  color: 'white',
                  py: 2,
                  px: 4,
                  fontSize: '1.1rem',
                  borderRadius: 2,
                  textTransform: 'none',
                  '&:hover': {
                    bgcolor: '#3367d6',
                    transform: 'translateY(-2px)',
                    transition: 'all 0.2s ease',
                  },
                }}
              >
                Sign in with Google
              </Button>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Secure authentication with Gmail API access
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}