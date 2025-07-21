'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Chip,
  Alert,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';

interface Account {
  id: string;
  email: string;
  created_at: string;
}

export default function AccountsSection() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchAccounts();
    }
  }, [user]);

  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/accounts');
      if (response.ok) {
        const data = await response.json();
        setAccounts(data);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectGmail = () => {
    window.location.href = '/api/auth/google';
  };

  const handleDisconnectAccount = async (email: string) => {
    try {
      const response = await fetch('/api/accounts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setAccounts(accounts.filter(acc => acc.email !== email));
      }
    } catch (error) {
      console.error('Error disconnecting account:', error);
    }
  };

  return (
    <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <EmailIcon sx={{ mr: 1, color: '#1976d2' }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Connected Gmail Accounts
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            size="small"
            onClick={handleConnectGmail}
            sx={{ 
              borderColor: '#1976d2',
              color: '#1976d2',
              '&:hover': {
                bgcolor: 'rgba(25, 118, 210, 0.04)',
                borderColor: '#1976d2',
              }
            }}
          >
            Add Account
          </Button>
        </Box>

        {loading ? (
          <Typography variant="body2" color="text.secondary">
            Loading accounts...
          </Typography>
        ) : accounts.length === 0 ? (
          <Alert severity="info" sx={{ borderRadius: 1 }}>
            No Gmail accounts connected. Click "Add Account" to get started.
          </Alert>
        ) : (
          <List sx={{ py: 0 }}>
            {accounts.map((account, index) => (
              <ListItem
                key={account.id}
                sx={{
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  mb: 1,
                  '&:last-child': { mb: 0 },
                  '&:hover': {
                    bgcolor: 'rgba(25, 118, 210, 0.04)',
                  },
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1">
                        {account.email}
                      </Typography>
                      {index === 0 && (
                        <Chip
                          label="Primary"
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  }
                  secondary={`Connected on ${new Date(account.created_at).toLocaleDateString()}`}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => handleDisconnectAccount(account.email)}
                    disabled={index === 0} // Prevent disconnecting primary account
                    sx={{
                      color: index === 0 ? 'text.disabled' : 'error.main',
                      '&:hover': {
                        bgcolor: index === 0 ? 'transparent' : 'rgba(211, 47, 47, 0.04)',
                      },
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
}