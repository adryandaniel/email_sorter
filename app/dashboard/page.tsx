'use client';

import { useState } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import Layout from '../../components/Layout';
import AccountsSection from '../../components/AccountsSection';
import CategoriesSection from '../../components/CategoriesSection';
import EmailsSection from '../../components/EmailsSection';
import { useAuth } from '../../hooks/useAuth';

interface Category {
  id: string;
  name: string;
  description: string;
}

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  if (loading) {
    return (
      <Layout>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <Typography>Loading...</Typography>
        </Box>
      </Layout>
    );
  }

  if (!user) {
    window.location.href = '/';
    return null;
  }

  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Email Management Dashboard
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Welcome back, {user.name}! Manage your emails with AI-powered organization.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <AccountsSection />
          <CategoriesSection 
            onCategorySelect={setSelectedCategory}
            selectedCategoryId={selectedCategory?.id}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <EmailsSection selectedCategory={selectedCategory} />
        </Grid>
      </Grid>
    </Layout>
  );
}