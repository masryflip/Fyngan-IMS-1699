export const setupWizard = {
  isFirstTimeSetup() {
    try {
      return !localStorage.getItem('fyngan_setup_completed');
    } catch (error) {
      console.error('Error checking setup status:', error);
      return true;
    }
  },

  completeSetup() {
    try {
      localStorage.setItem('fyngan_setup_completed', 'true');
      localStorage.setItem('fyngan_setup_date', new Date().toISOString());
    } catch (error) {
      console.error('Error completing setup:', error);
    }
  },

  getSetupProgress() {
    try {
      const progress = {
        companyInfo: !!localStorage.getItem('company_configured'),
        locations: !!localStorage.getItem('locations_configured'),
        team: !!localStorage.getItem('team_configured'),
        inventory: !!localStorage.getItem('inventory_configured')
      };

      const completed = Object.values(progress).filter(Boolean).length;
      const total = Object.keys(progress).length;

      return {
        ...progress,
        percentage: Math.round((completed / total) * 100),
        isComplete: completed === total
      };
    } catch (error) {
      console.error('Error getting setup progress:', error);
      return {
        companyInfo: false,
        locations: false,
        team: false,
        inventory: false,
        percentage: 0,
        isComplete: false
      };
    }
  },

  clearDemoData() {
    const confirmClear = window.confirm(
      'This will remove all demo data and start fresh. Are you sure?'
    );
    
    if (confirmClear) {
      try {
        localStorage.removeItem('multiLocationInventory');
        localStorage.removeItem('fyngan_setup_completed');
        localStorage.removeItem('company_configured');
        localStorage.removeItem('locations_configured');
        localStorage.removeItem('team_configured');
        localStorage.removeItem('inventory_configured');
        window.location.reload();
      } catch (error) {
        console.error('Error clearing demo data:', error);
      }
    }
  },

  exportConfig() {
    try {
      const config = {
        company: JSON.parse(localStorage.getItem('company_config') || '{}'),
        inventory: JSON.parse(localStorage.getItem('multiLocationInventory') || '{}'),
        setupDate: localStorage.getItem('fyngan_setup_date'),
        version: '1.0.0'
      };

      const blob = new Blob([JSON.stringify(config, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fyngan-config-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting config:', error);
    }
  }
};