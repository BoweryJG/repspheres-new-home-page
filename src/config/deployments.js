// Deployment URLs for all RepSpheres modules
export const DEPLOYMENT_URLS = {
  marketInsights: {
    url: 'https://repspheres-test.netlify.app', // Your current market data deployment
    alternateUrl: null,
    isActive: true
  },
  marketPulse: {
    url: 'https://repspheres-test.netlify.app/pulse', // Market Pulse Engine route
    alternateUrl: null,
    isActive: true
  },
  aiWorkspace: {
    url: 'https://your-workspace-deployment.netlify.app', // Update with your workspace URL
    alternateUrl: null,
    isActive: false // Set to true when deployed
  },
  linguistics: {
    url: 'https://your-linguistics-deployment.netlify.app', // Update with your linguistics URL
    alternateUrl: null,
    isActive: false // Set to true when deployed
  },
  crm: {
    url: 'https://your-crm-deployment.netlify.app', // Update with your CRM URL
    alternateUrl: null,
    isActive: false // Set to true when deployed
  }
};

// Helper function to get deployment URL
export const getDeploymentUrl = (moduleId) => {
  const deployment = DEPLOYMENT_URLS[moduleId];
  if (!deployment) return null;
  
  // Return the URL if active, otherwise return null
  return deployment.isActive ? deployment.url : null;
};