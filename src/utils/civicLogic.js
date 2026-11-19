export const ISSUE_TYPE_META = {
  Pothole: {
    label: 'Pothole',
    shortLabel: 'Pothole',
    colorHex: '#D97706',
    markerBg: '#FEF3C7',
  },
  BrokenStreetlight: {
    label: 'Broken Streetlight',
    shortLabel: 'Streetlight',
    colorHex: '#4F46E5',
    markerBg: '#E0E7FF',
  },
  IllegalDumping: {
    label: 'Illegal Dumping',
    shortLabel: 'Dumping',
    colorHex: '#9A3412',
    markerBg: '#FFEDD5',
  },
  WaterLeak: {
    label: 'Water Leak / Drain',
    shortLabel: 'Water Leak',
    colorHex: '#0284C7',
    markerBg: '#E0F2FE',
  },
  DamagedSidewalk: {
    label: 'Damaged Sidewalk',
    shortLabel: 'Sidewalk',
    colorHex: '#0D9488',
    markerBg: '#CCFBF1',
  },
  TrafficSignal: {
    label: 'Traffic Signal',
    shortLabel: 'Signal',
    colorHex: '#DC2626',
    markerBg: '#FEE2E2',
  },
};

export const ISSUE_STATUS_META = {
  Submitted: {
    label: 'Submitted',
    textClass: 'text-civic-text-secondary',
    darkTextClass: '',
  },
  UnderReview: {
    label: 'Under Review',
    textClass: 'text-amber-700',
    darkTextClass: 'dark:text-amber-400',
  },
  InProgress: {
    label: 'In Progress',
    textClass: 'text-blue-700',
    darkTextClass: 'dark:text-blue-400',
  },
  Resolved: {
    label: 'Resolved',
    textClass: 'text-emerald-700',
    darkTextClass: 'dark:text-emerald-400',
  },
  Rejected: {
    label: 'Rejected',
    textClass: 'text-rose-700',
    darkTextClass: 'dark:text-rose-400',
  },
};

export const ISSUE_TYPES = Object.keys(ISSUE_TYPE_META);
export const ISSUE_STATUSES = Object.keys(ISSUE_STATUS_META);

export const VIEW_ROUTES = {
  login: '/login',
  register: '/register',
  map: '/map',
  reports: '/reports',
  profile: '/profile',
  official: '/official',
  admin: '/admin',
};

export function getHomeViewForRole(role) {
  switch (role) {
    case 'Citizen':
      return 'map';
    case 'Official':
      return 'official';
    case 'Admin':
      return 'admin';
    default:
      return 'login';
  }
}

export function getPathForView(view) {
  return VIEW_ROUTES[view] || '/login';
}

export function getHomePathForRole(role) {
  return getPathForView(getHomeViewForRole(role));
}

export function getViewFromPath(pathname) {
  const normalized = (pathname || '/').replace(/\/+$/, '') || '/';
  const entry = Object.entries(VIEW_ROUTES).find(([, route]) => route === normalized);
  return entry ? entry[0] : null;
}

export function canAccessView(role, view) {
  if (!role) {
    return view === 'login' || view === 'register';
  }

  if (role === 'Citizen') {
    return view === 'map' || view === 'reports' || view === 'profile';
  }

  if (role === 'Official') {
    return view === 'official' || view === 'profile';
  }

  if (role === 'Admin') {
    return view === 'admin' || view === 'profile';
  }

  return false;
}

export function nextCarouselIndex(current, total) {
  if (total <= 1) return 0;
  return (current + 1) % total;
}

export function prevCarouselIndex(current, total) {
  if (total <= 1) return 0;
  return (current - 1 + total) % total;
}

export function resolveSwipeDirection(startX, endX, thresholdPx = 36) {
  const delta = endX - startX;
  if (Math.abs(delta) < thresholdPx) return 'none';
  return delta < 0 ? 'next' : 'prev';
}

export function filterIssues(issues, filters = {}) {
  const { issueType = 'All', status = 'All', searchQuery = '' } = filters;
  const q = searchQuery.trim().toLowerCase();

  return issues.filter((issue) => {
    if (issueType !== 'All' && issue.issueType !== issueType) {
      return false;
    }
    if (status !== 'All' && issue.status !== status) {
      return false;
    }
    if (!q) return true;

    return (
      issue.title.toLowerCase().includes(q) ||
      issue.description.toLowerCase().includes(q) ||
      issue.address.toLowerCase().includes(q) ||
      issue.referenceCode.toLowerCase().includes(q) ||
      ISSUE_TYPE_META[issue.issueType].label.toLowerCase().includes(q)
    );
  });
}

export function validateIssueSubmission(input) {
  if (!input.issueType) {
    return 'Please select an issue type.';
  }
  if (input.latitude === null || input.longitude === null) {
    return 'Please drop a pin on the map to set the issue location.';
  }
  if (
    input.latitude < -90 ||
    input.latitude > 90 ||
    input.longitude < -180 ||
    input.longitude > 180
  ) {
    return 'Map coordinates are out of valid bounds.';
  }
  if (input.title.trim().length < 4) {
    return 'Please enter a short summary title (at least 4 characters).';
  }
  if (input.description.trim().length < 10) {
    return 'Please provide a clear description (at least 10 characters).';
  }
  if (input.imageCount > 6) {
    return 'You can attach up to 6 images per issue report.';
  }
  return null;
}

export function validateProfileUpdate(input) {
  if (input.fullName.trim().length < 2) {
    return 'Full name must be at least 2 characters.';
  }
  if (input.phoneNumber.trim().length > 32) {
    return 'Phone number is too long.';
  }
  return null;
}

export function formatCoordinates(lat, lng) {
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

export function formatDateShort(isoDate) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function formatDateTimeReadable(isoDate) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

export function getReportProgressStage(status) {
  switch (status) {
    case 'Submitted':
      return { step: 1, isRejected: false };
    case 'UnderReview':
    case 'InProgress':
      return { step: 2, isRejected: false };
    case 'Resolved':
      return { step: 3, isRejected: false };
    case 'Rejected':
      return { step: 2, isRejected: true };
    default:
      return { step: 1, isRejected: false };
  }
}
