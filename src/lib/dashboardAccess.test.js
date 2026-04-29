import test from 'node:test';
import assert from 'node:assert/strict';

import { getIntegrationAccess } from './dashboardAccess.js';

test('signed-in users can use protected integrations', () => {
  assert.deepEqual(
    getIntegrationAccess({ user: { id: 'user-123' }, isGuest: false }),
    {
      canUseProtectedFeatures: true,
      showLockedPreview: false,
    }
  );
});

test('guest users get locked previews for protected integrations', () => {
  assert.deepEqual(
    getIntegrationAccess({ user: { id: 'guest-uid' }, isGuest: true }),
    {
      canUseProtectedFeatures: false,
      showLockedPreview: true,
    }
  );
});
