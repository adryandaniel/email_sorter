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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Chip,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Category as CategoryIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';

interface Category {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

interface CategoriesSectionProps {
  onCategorySelect: (category: Category) => void;
  selectedCategoryId?: string;
}

export default function CategoriesSection({ onCategorySelect, selectedCategoryId }: CategoriesSectionProps) {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.id) {
      fetchCategories();
    }
  }, [user]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!formData.name || !formData.description) {
      setError('Both name and description are required');
      return;
    }

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newCategory = await response.json();
        setCategories([...categories, newCategory]);
        setDialogOpen(false);
        setFormData({ name: '', description: '' });
        setError('');
      } else {
        setError('Failed to create category');
      }
    } catch (error) {
      setError('Failed to create category');
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const response = await fetch(`/api/categories?id=${categoryId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCategories(categories.filter(cat => cat.id !== categoryId));
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  return (
    <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <CategoryIcon sx={{ mr: 1, color: '#00acc1' }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Email Categories
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            size="small"
            onClick={() => setDialogOpen(true)}
            sx={{ 
              borderColor: '#00acc1',
              color: '#00acc1',
              '&:hover': {
                bgcolor: 'rgba(0, 172, 193, 0.04)',
                borderColor: '#00acc1',
              }
            }}
          >
            Add Category
          </Button>
        </Box>

        {loading ? (
          <Typography variant="body2" color="text.secondary">
            Loading categories...
          </Typography>
        ) : categories.length === 0 ? (
          <Alert severity="info" sx={{ borderRadius: 1 }}>
            No categories yet. Create your first category to start organizing emails.
          </Alert>
        ) : (
          <List sx={{ py: 0 }}>
            {categories.map((category) => (
              <ListItem
                key={category.id}
                sx={{
                  border: selectedCategoryId === category.id ? '2px solid #00acc1' : '1px solid #e0e0e0',
                  borderRadius: 1,
                  mb: 1,
                  cursor: 'pointer',
                  '&:last-child': { mb: 0 },
                  '&:hover': {
                    bgcolor: 'rgba(0, 172, 193, 0.04)',
                  },
                  bgcolor: selectedCategoryId === category.id ? 'rgba(0, 172, 193, 0.08)' : 'transparent',
                }}
                onClick={() => onCategorySelect(category)}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1" fontWeight="medium">
                        {category.name}
                      </Typography>
                      {selectedCategoryId === category.id && (
                        <Chip
                          label="Active"
                          size="small"
                          color="info"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  }
                  secondary={category.description}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCategory(category.id);
                    }}
                    sx={{
                      color: 'error.main',
                      '&:hover': {
                        bgcolor: 'rgba(211, 47, 47, 0.04)',
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

      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle>Create New Category</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 1 }}>
              {error}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            label="Category Name"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe what types of emails belong in this category..."
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setDialogOpen(false)}
            sx={{ color: 'text.secondary' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreateCategory}
            variant="contained"
            sx={{ 
              bgcolor: '#00acc1',
              '&:hover': { bgcolor: '#0097a7' }
            }}
          >
            Create Category
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}