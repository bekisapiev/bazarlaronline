/**
 * Referral utilities for handling referral codes and cookies
 */

/**
 * Set referral code in cookies for 10 days
 */
export const setReferralCodeCookie = (refCode: string): void => {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 10); // 10 days
  document.cookie = `ref_code=${refCode}; expires=${expiryDate.toUTCString()}; path=/`;
};

/**
 * Get referral code from cookies
 */
export const getReferralCodeCookie = (): string | null => {
  const name = 'ref_code=';
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookies = decodedCookie.split(';');

  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i].trim();
    if (cookie.indexOf(name) === 0) {
      return cookie.substring(name.length, cookie.length);
    }
  }
  return null;
};

/**
 * Clear referral code cookie
 */
export const clearReferralCodeCookie = (): void => {
  document.cookie = 'ref_code=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
};

/**
 * Get ref code from URL query params
 */
export const getRefCodeFromUrl = (): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('ref');
};

/**
 * Handle referral code on page load
 * - If ref param in URL, save to cookie
 * - Return ref code from cookie if exists
 */
export const handleReferralCode = (): string | null => {
  // Check URL for ref param
  const refFromUrl = getRefCodeFromUrl();
  if (refFromUrl) {
    setReferralCodeCookie(refFromUrl);
    return refFromUrl;
  }

  // Return from cookie if exists
  return getReferralCodeCookie();
};
