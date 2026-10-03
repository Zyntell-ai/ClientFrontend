/**
 * @file        customCategory.js
 * @module      Utils / Custom Category
 * @description "Other" business category for signup — the business types its own category name, which is sent
 *              as the business `category` (with categoryType 'custom'). Mirrors the backend registerSchema rules.
 */

// [UI]: Selector id for the "Other" option — never sent to the backend as the category itself
export const OTHER_CATEGORY_ID = 'other'
export const CUSTOM_CATEGORY_MAX_LENGTH = 100

export const OTHER_CATEGORY_OPTION = { id: OTHER_CATEGORY_ID, label: 'Other', icon: '🏢', subCategories: [] }

/** Appends the "Other" option to the category list (once), keeping every existing category unchanged */
export function withOtherCategory(categories = []) {
  return categories.some(c => c.id === OTHER_CATEGORY_ID) ? categories : [...categories, OTHER_CATEGORY_OPTION]
}

export function isOtherCategory(categoryId) {
  return categoryId === OTHER_CATEGORY_ID
}

/**
 * @function    selectCategory
 * @purpose     New form state after picking a category — clears the sub-category and any custom category text
 */
export function selectCategory(form, categoryId) {
  return { ...form, category: categoryId, subCategory: '', customCategory: '' }
}

/**
 * @function    validateCustomCategory
 * @returns {string} Error message, or '' when valid
 */
export function validateCustomCategory(value) {
  const v = typeof value === 'string' ? value.trim() : ''
  if (!v) return 'Please enter your business category'
  if (v.length > CUSTOM_CATEGORY_MAX_LENGTH) return `Business category must be at most ${CUSTOM_CATEGORY_MAX_LENGTH} characters`
  if (/[<>]/.test(v)) return 'Business category must be plain text (no HTML)'
  if (/[\u0000-\u001F\u007F]/.test(v)) return 'Business category must be a single line of text'
  if (!/[\p{L}\p{N}]/u.test(v)) return 'Business category must contain letters or numbers'
  return ''
}

/**
 * @function    buildRegisterPayload
 * @purpose     Registration body — for "Other", the trimmed custom name becomes the category and no sub-category is sent
 */
export function buildRegisterPayload(form) {
  const { customCategory, ...rest } = form
  if (!isOtherCategory(form.category)) return rest
  const { subCategory, ...withoutSub } = rest
  return { ...withoutSub, category: (customCategory || '').trim(), categoryType: 'custom' }
}

/** Human-readable label for a business category — custom categories are shown as typed */
export function categoryDisplayLabel(category, labels = {}) {
  return labels[category] || category || 'Business'
}
