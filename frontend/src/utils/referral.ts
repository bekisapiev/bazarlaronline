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

/**
 * Product referral cookie structure
 */
export interface ProductReferralCookie {
  productId: string;
  referrerId: string;
}

/**
 * Set product referral cookie (expires in 10 days)
 */
export const setProductReferralCookie = (productId: string, referrerId: string): void => {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 10); // 10 days
  const value = JSON.stringify({ productId, referrerId });
  document.cookie = `product_ref=${encodeURIComponent(value)}; expires=${expiryDate.toUTCString()}; path=/`;
};

/**
 * Get product referral cookie
 */
export const getProductReferralCookie = (productId: string): ProductReferralCookie | null => {
  const name = 'product_ref=';
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookies = decodedCookie.split(';');

  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i].trim();
    if (cookie.indexOf(name) === 0) {
      try {
        const value = cookie.substring(name.length, cookie.length);
        const data: ProductReferralCookie = JSON.parse(decodeURIComponent(value));
        if (data.productId === productId) {
          return data;
        }
      } catch (e) {
        console.error('Error parsing product referral cookie:', e);
      }
    }
  }
  return null;
};

/**
 * Clear product referral cookie
 */
export const clearProductReferralCookie = (): void => {
  document.cookie = 'product_ref=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
};

/**
 * Handle product referral code from URL
 * Expected URL format: /products/{id}?ref={userId}
 */
export const handleProductReferralCode = (productId: string): ProductReferralCookie | null => {
  const refFromUrl = getRefCodeFromUrl();
  if (refFromUrl && productId) {
    setProductReferralCookie(productId, refFromUrl);
    return { productId, referrerId: refFromUrl };
  }

  return getProductReferralCookie(productId);
};
