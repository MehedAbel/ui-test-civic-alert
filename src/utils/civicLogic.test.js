import test from 'node:test';
import assert from 'node:assert/strict';
import {
  canAccessView,
  filterIssues,
  formatCoordinates,
  getHomePathForRole,
  getHomeViewForRole,
  getPathForView,
  getReportProgressStage,
  getViewFromPath,
  nextCarouselIndex,
  prevCarouselIndex,
  resolveSwipeDirection,
  validateIssueSubmission,
  validateProfileUpdate,
} from './civicLogic.js';

const SAMPLE_ISSUES = [
  {
    id: '1',
    referenceCode: 'CA-2026-1041',
    title: 'Deep pothole on Elm St',
    description: 'Large crater near curb collecting rainwater.',
    issueType: 'Pothole',
    status: 'InProgress',
    latitude: 51.509865,
    longitude: -0.118092,
    address: '412 Elm Street',
    reporterId: 'u1',
    reporterName: 'Elena Vance',
    createdAtUtc: '2026-11-14T10:00:00Z',
    updatedAtUtc: '2026-11-16T10:00:00Z',
    images: [],
    statusHistory: [],
  },
  {
    id: '2',
    referenceCode: 'CA-2026-1042',
    title: 'Unlit streetlight on Market Terrace',
    description: 'Lamp dark all night.',
    issueType: 'BrokenStreetlight',
    status: 'Submitted',
    latitude: 51.5125,
    longitude: -0.1252,
    address: '88 Market Terrace',
    reporterId: 'u2',
    reporterName: 'Other Citizen',
    createdAtUtc: '2026-11-16T10:00:00Z',
    updatedAtUtc: '2026-11-16T10:00:00Z',
    images: [],
    statusHistory: [],
  },
];

test('role home routing separates Citizen, Official, and Admin interfaces', () => {
  assert.equal(getHomeViewForRole('Citizen'), 'map');
  assert.equal(getHomeViewForRole('Official'), 'official');
  assert.equal(getHomeViewForRole('Admin'), 'admin');
  assert.equal(getHomePathForRole(null), '/login');
  assert.equal(getHomePathForRole('Citizen'), '/map');
  assert.equal(getHomePathForRole('Official'), '/official');
  assert.equal(getHomePathForRole('Admin'), '/admin');
  assert.equal(getPathForView('reports'), '/reports');
  assert.equal(getPathForView('profile'), '/profile');
  assert.equal(getViewFromPath('/reports/'), 'reports');
  assert.equal(getViewFromPath('/unknown'), null);
});

test('role access control isolates Citizen, Official, and Admin views', () => {
  assert.equal(canAccessView(null, 'login'), true);
  assert.equal(canAccessView(null, 'register'), true);
  assert.equal(canAccessView(null, 'map'), false);

  assert.equal(canAccessView('Citizen', 'map'), true);
  assert.equal(canAccessView('Citizen', 'reports'), true);
  assert.equal(canAccessView('Citizen', 'profile'), true);
  assert.equal(canAccessView('Citizen', 'official'), false);
  assert.equal(canAccessView('Citizen', 'admin'), false);

  assert.equal(canAccessView('Official', 'official'), true);
  assert.equal(canAccessView('Official', 'map'), false);
  assert.equal(canAccessView('Admin', 'admin'), true);
  assert.equal(canAccessView('Admin', 'map'), false);
});

test('image carousel index wraps cleanly in both directions', () => {
  assert.equal(nextCarouselIndex(0, 3), 1);
  assert.equal(nextCarouselIndex(2, 3), 0);
  assert.equal(prevCarouselIndex(0, 3), 2);
  assert.equal(prevCarouselIndex(2, 3), 1);
  assert.equal(nextCarouselIndex(0, 1), 0);
  assert.equal(prevCarouselIndex(0, 1), 0);
});

test('touch swipe resolves left/right gestures beyond threshold', () => {
  assert.equal(resolveSwipeDirection(200, 120), 'next');
  assert.equal(resolveSwipeDirection(120, 200), 'prev');
  assert.equal(resolveSwipeDirection(120, 130), 'none');
});

test('issue filtering narrows by type, status, and search text', () => {
  assert.equal(
    filterIssues(SAMPLE_ISSUES, { issueType: 'All', status: 'All', searchQuery: '' }).length,
    2
  );
  assert.equal(
    filterIssues(SAMPLE_ISSUES, { issueType: 'Pothole', status: 'All', searchQuery: '' }).length,
    1
  );
  assert.equal(
    filterIssues(SAMPLE_ISSUES, { issueType: 'All', status: 'Submitted', searchQuery: 'market' }).length,
    1
  );
  assert.equal(
    filterIssues(SAMPLE_ISSUES, { issueType: 'All', status: 'Resolved', searchQuery: '' }).length,
    0
  );
});

test('issue submission validation rejects missing pin or short descriptions', () => {
  assert.match(
    validateIssueSubmission({
      title: 'Broken curb',
      description: 'Valid long description here.',
      issueType: 'Pothole',
      latitude: null,
      longitude: null,
      imageCount: 1,
    }) ?? '',
    /drop a pin/i
  );

  assert.match(
    validateIssueSubmission({
      title: 'Bad',
      description: 'Too short',
      issueType: 'Pothole',
      latitude: 51.5,
      longitude: -0.12,
      imageCount: 1,
    }) ?? '',
    /short summary title/i
  );

  assert.equal(
    validateIssueSubmission({
      title: 'Cracked pavement',
      description: 'Large vertical trip hazard near crosswalk.',
      issueType: 'DamagedSidewalk',
      latitude: 51.509,
      longitude: -0.118,
      imageCount: 2,
    }),
    null
  );
});

test('profile validation & coordinate formatting work reliably', () => {
  assert.match(validateProfileUpdate({ fullName: 'A', phoneNumber: '' }) ?? '', /at least 2/);
  assert.equal(validateProfileUpdate({ fullName: 'Elena Vance', phoneNumber: '555-1234' }), null);
  assert.equal(formatCoordinates(51.509865, -0.118092), '51.50986, -0.11809');
});

test('report progress stage maps issue statuses to 3-step stepper', () => {
  assert.deepEqual(getReportProgressStage('Submitted'), { step: 1, isRejected: false });
  assert.deepEqual(getReportProgressStage('UnderReview'), { step: 2, isRejected: false });
  assert.deepEqual(getReportProgressStage('InProgress'), { step: 2, isRejected: false });
  assert.deepEqual(getReportProgressStage('Resolved'), { step: 3, isRejected: false });
  assert.deepEqual(getReportProgressStage('Rejected'), { step: 2, isRejected: true });
});
