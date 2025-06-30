export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function validatePassword(password) {
  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }

  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }

  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }

  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number';
  }

  return null;
}

export function validateProfileName(name) {
  if (!name.trim()) {
    return 'Profile name is required';
  }

  if (name.length < 2) {
    return 'Profile name must be at least 2 characters';
  }

  if (name.length > 20) {
    return 'Profile name must be 20 characters or less';
  }

  if (!/^[a-zA-Z0-9\s]+$/.test(name)) {
    return 'Profile name can only contain letters, numbers, and spaces';
  }

  return null;
}

export function validateRating(rating) {
  if (rating < 1 || rating > 5) {
    return 'Rating must be between 1 and 5';
  }

  return null;
}

export function validateYear(year) {
  const currentYear = new Date().getFullYear();
  const yearNum = parseInt(year);

  if (isNaN(yearNum)) {
    return 'Invalid year';
  }

  if (yearNum < 1900 || yearNum > currentYear + 1) {
    return `Year must be between 1900 and ${currentYear + 1}`;
  }

  return null;
}