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
  Checkbox,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Inbox as InboxIcon,
  Delete as DeleteIcon,
  Unsubscribe as UnsubscribeIcon,
  Refresh as RefreshIcon,
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';

interface Email {
  id: string;
  subject: string;
  sender: string;
  snippet: string;
  summary: string;
  unsubscribe_url: string | null;
  full_content: string;
  created_at: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
}

interface EmailsSectionProps {
  selectedCategory: Category | null;
}

export default function EmailsSection({ selectedCategory }: EmailsSectionProps) {
  const { user } = useAuth();
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [fetchingEmails, setFetchingEmails] = useState(false);
  const [autoFetch, setAutoFetch] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [unsubscribing, setUnsubscribing] = useState(false);

  const [message, setMessage] = useState('');

  useEffect(() => {
    if (selectedCategory) {
      fetchEmails();
    }
  }, [selectedCategory]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoFetch) {
      interval = setInterval(() => {
        handleFetchEmails();
      }, 30000); // 30 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoFetch]);

  const fetchEmails = async () => {
    if (!selectedCategory) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/emails/${selectedCategory.id}`);
      if (response.ok) {
        const data = await response.json();
        setEmails(data);
      }
    } catch (error) {
      console.error('Error fetching emails:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchEmails = async () => {
    setFetchingEmails(true);
    setMessage('');
    try {
      const response = await fetch('/api/emails/fetch', {
        method: 'POST',
      });

      if (response.ok) {
        const result = await response.json();
        setMessage(result.message);
        // Refresh emails after fetching
        if (selectedCategory) {
          fetchEmails();
        }
      } else {
        setMessage('Failed to fetch emails');
      }
    } catch (error) {
      setMessage('Error fetching emails');
    } finally {
      setFetchingEmails(false);
    }
  };

  const handleSelectEmail = (emailId: string) => {
    setSelectedEmails(prev =>
      prev.includes(emailId)
        ? prev.filter(id => id !== emailId)
        : [...prev, emailId]
    );
  };

  const handleSelectAll = () => {
    if (selectedEmails.length === emails.length) {
      setSelectedEmails([]);
    } else {
      setSelectedEmails(emails.map(email => email.id));
    }
  };

  const handleViewEmail = (email: Email) => {
    setSelectedEmail(email);
    setDialogOpen(true);
  };

  const handleBulkUnsubscribe = async () => {
    setUnsubscribing(true);
    setMessage('');

    try {
      const unsubscribeList = emails
        .filter(item => selectedEmails.includes(item.id) && item.unsubscribe_url)
        .map(item => ({
          id: item.id,
          unsubscribe_url: item.unsubscribe_url!
        }));

      if (unsubscribeList.length === 0) {
        setMessage('No unsubscribe links found in selected emails.');
        return;
      }

      const response = await fetch('/api/emails/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unsubscribeList }),
      });

      if (response.ok) {
        const result = await response.json();
        setMessage(`Unsubscribed from ${result.successCount} emails.`);
      } else {
        setMessage('Failed to unsubscribe from some emails.');
      }
    } catch (error) {
      console.error('Error unsubscribing:', error);
      setMessage('Error during unsubscribe process.');
    } finally {
      setUnsubscribing(false);
      setSelectedEmails([]);
    }
  };


  const handleBulkDelete = async () => {
    setDeleting(true);
    setMessage('');
    try {
      const response = await fetch('/api/emails/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailIds: selectedEmails }),
      });

      if (response.ok) {
        const result = await response.json();
        setMessage(result.message);
        fetchEmails();
      } else {
        setMessage('Failed to delete emails');
      }
    } catch (error) {
      console.error('Error deleting emails:', error);
      setMessage('Error deleting emails');
    } finally {
      setDeleting(false);
      setSelectedEmails([]);
    }
  };

  const toggleAutoFetch = () => {
    setAutoFetch(!autoFetch);
    setMessage(autoFetch ? 'Auto-fetch stopped' : 'Auto-fetch started (30s interval)');
  };

  return (
    <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', gap: 1, marginBottom: 2 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={fetchingEmails ? <CircularProgress size={16} /> : <RefreshIcon />}
            onClick={handleFetchEmails}
            disabled={fetchingEmails}
            sx={{
              borderColor: '#f57c00',
              color: '#f57c00',
              '&:hover': {
                bgcolor: 'rgba(245, 124, 0, 0.04)',
                borderColor: '#f57c00',
              }
            }}
          >
            {fetchingEmails ? 'Fetching...' : 'Fetch New'}
          </Button>
          <Button
            variant={autoFetch ? 'contained' : 'outlined'}
            size="small"
            startIcon={autoFetch ? <StopIcon /> : <PlayArrowIcon />}
            onClick={toggleAutoFetch}
            sx={{
              ...(autoFetch ? {
                bgcolor: '#4caf50',
                '&:hover': { bgcolor: '#45a049' }
              } : {
                borderColor: '#4caf50',
                color: '#4caf50',
                '&:hover': {
                  bgcolor: 'rgba(76, 175, 80, 0.04)',
                  borderColor: '#4caf50',
                }
              })
            }}
          >
            {autoFetch ? 'Stop Auto' : 'Auto Fetch'}
          </Button>
        </Box>
        {
          !selectedCategory ?
            <Box sx={{ borderRadius: 2 }}>
              <CardContent sx={{ textAlign: 'center', py: 6 }}>
                <InboxIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  Select a category to view emails
                </Typography>
              </CardContent>
            </Box>
            :
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <InboxIcon sx={{ mr: 1, color: '#f57c00' }} />
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                  {selectedCategory.name} ({emails.length} emails)
                </Typography>
              </Box>

              {message && (
                <Alert
                  severity="info"
                  sx={{ mb: 2, borderRadius: 1 }}
                  onClose={() => setMessage('')}
                >
                  {message}
                </Alert>
              )}

              {selectedEmails.length > 0 && (
                <Box sx={{ mb: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    {selectedEmails.length} selected
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<UnsubscribeIcon />}
                    onClick={handleBulkUnsubscribe}
                    sx={{ color: '#ff9800' }}
                  >
                    Unsubscribe
                  </Button>
                  <Button
                    size="small"
                    startIcon={<DeleteIcon />}
                    onClick={handleBulkDelete}
                    sx={{ color: 'error.main' }}
                  >
                    Delete
                  </Button>
                </Box>
              )}

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : emails.length === 0 ? (
                <Alert severity="info" sx={{ borderRadius: 1 }}>
                  No emails in this category yet. Use "Fetch New" to import emails from your Gmail accounts.
                </Alert>
              ) : (
                <>
                  <Box sx={{ mb: 2 }}>
                    <Button
                      size="small"
                      onClick={handleSelectAll}
                      sx={{ color: 'text.secondary' }}
                    >
                      {selectedEmails.length === emails.length ? 'Deselect All' : 'Select All'}
                    </Button>
                  </Box>
                  <List sx={{ py: 0 }}>
                    {emails.map((email, index) => (
                      <ListItem
                        key={email.id}
                        sx={{
                          border: '1px solid #e0e0e0',
                          borderRadius: 1,
                          mb: 1,
                          cursor: 'pointer',
                          '&:last-child': { mb: 0 },
                          '&:hover': {
                            bgcolor: 'rgba(245, 124, 0, 0.04)',
                          },
                        }}
                      >
                        <Checkbox
                          checked={selectedEmails.includes(email.id)}
                          onChange={() => handleSelectEmail(email.id)}
                          sx={{ mr: 1 }}
                        />
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                              <Typography component="span" variant="body1" fontWeight="medium">
                                {email.subject || '(No Subject)'}
                              </Typography>
                              {email.unsubscribe_url && (
                                <Chip
                                  label="Unsubscribe Available"
                                  size="small"
                                  color="warning"
                                  variant="outlined"
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <Box component="span" sx={{ display: 'block' }}>
                              <Typography component="span" variant="body2" color="text.secondary" display="block">
                                From: {email.sender}
                              </Typography>
                              <Typography component="span" variant="body2" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                                {email.summary}
                              </Typography>
                              <Typography component="span" variant="caption" color="text.secondary" display="block">
                                {new Date(email.created_at).toLocaleString()}
                              </Typography>
                            </Box>
                          }
                          onClick={() => handleViewEmail(email)}
                        />

                      </ListItem>
                    ))}
                  </List>
                </>
              )}
            </>
        }
      </CardContent>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        {selectedEmail && (
          <>
            <DialogTitle>
              <Typography variant="h6">{selectedEmail.subject}</Typography>
              <Typography variant="body2" color="text.secondary">
                From: {selectedEmail.sender}
              </Typography>
            </DialogTitle>
            <Divider />
            <DialogContent>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  AI Summary:
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {selectedEmail.summary}
                </Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" gutterBottom>
                Original Content:
              </Typography>
              <Box
                sx={{
                  maxHeight: 400,
                  overflow: 'auto',
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  p: 2,
                  bgcolor: '#f9f9f9',
                }}
              >
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {selectedEmail.full_content}
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              {selectedEmail.unsubscribe_url && (
                <Button
                  startIcon={<UnsubscribeIcon />}
                  sx={{ color: '#ff9800' }}
                  onClick={() => window.open(selectedEmail.unsubscribe_url!, '_blank')}
                >
                  Unsubscribe
                </Button>
              )}
              <Button onClick={() => setDialogOpen(false)}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Card>
  );
}