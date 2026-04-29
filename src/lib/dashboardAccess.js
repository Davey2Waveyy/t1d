export function getIntegrationAccess({ user, isGuest }) {
  const canUseProtectedFeatures = Boolean(user) && !isGuest;

  return {
    canUseProtectedFeatures,
    showLockedPreview: !canUseProtectedFeatures,
  };
}
