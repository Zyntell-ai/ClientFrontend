// Run: npm test  (Node's built-in test runner — no extra dependencies)
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  OTHER_CATEGORY_ID, CUSTOM_CATEGORY_MAX_LENGTH, withOtherCategory, isOtherCategory, selectCategory,
  validateCustomCategory, buildRegisterPayload, categoryDisplayLabel,
} from './customCategory.js'

const CATS = ['healthcare', 'realestate', 'restaurant', 'salon', 'coaching', 'insurance', 'auto', 'homeservice']
  .map(id => ({ id, label: id, subCategories: [{ id: 'general', label: 'General' }] }))

test('"Other" appears in the category options, after all existing categories', () => {
  const list = withOtherCategory(CATS)
  assert.deepEqual(list.slice(0, CATS.length), CATS)
  assert.equal(list.length, CATS.length + 1)
  assert.equal(list.at(-1).id, OTHER_CATEGORY_ID)
  assert.equal(list.at(-1).label, 'Other')
})

test('"Other" is added only once and the input list is not mutated', () => {
  const list = withOtherCategory(withOtherCategory(CATS))
  assert.equal(list.filter(c => c.id === OTHER_CATEGORY_ID).length, 1)
  assert.equal(CATS.length, 8)
})

test('custom input is shown only when "Other" is selected, and cleared when switching away', () => {
  let form = { category: '', subCategory: '', customCategory: '', name: 'Paws' }
  form = selectCategory(form, OTHER_CATEGORY_ID)
  assert.equal(isOtherCategory(form.category), true)
  form = { ...form, customCategory: 'Veterinary Clinic' }

  form = selectCategory(form, 'salon')
  assert.equal(isOtherCategory(form.category), false)
  assert.equal(form.customCategory, '')
  assert.equal(form.subCategory, '')
  assert.equal(form.name, 'Paws')
})

test('empty and whitespace-only custom categories are rejected', () => {
  for (const v of ['', '   ', '\t \n', undefined, null]) assert.notEqual(validateCustomCategory(v), '')
})

test('custom category length limit is enforced after trimming', () => {
  assert.equal(validateCustomCategory('a'.repeat(CUSTOM_CATEGORY_MAX_LENGTH)), '')
  assert.equal(validateCustomCategory(`  ${'a'.repeat(CUSTOM_CATEGORY_MAX_LENGTH)}  `), '')
  assert.match(validateCustomCategory('a'.repeat(CUSTOM_CATEGORY_MAX_LENGTH + 1)), /at most 100/)
})

test('HTML/script and multi-line values are rejected; normal names are accepted', () => {
  assert.notEqual(validateCustomCategory('<script>alert(1)</script>'), '')
  assert.notEqual(validateCustomCategory('Vet\nClinic'), '')
  assert.notEqual(validateCustomCategory('...'), '')
  assert.equal(validateCustomCategory('Veterinary Clinic'), '')
  assert.equal(validateCustomCategory('Pet/Vet Care (24x7)'), '')
})

test('submit payload for "Other" sends the trimmed custom value as the category', () => {
  const payload = buildRegisterPayload({
    category: OTHER_CATEGORY_ID, subCategory: '', customCategory: '  Veterinary Clinic  ',
    name: 'Paws', city: 'Hyderabad', email: 'a@b.co', password: 'password123',
  })
  assert.equal(payload.category, 'Veterinary Clinic')
  assert.equal(payload.categoryType, 'custom')
  assert.ok(!('subCategory' in payload))
  assert.ok(!('customCategory' in payload))
  assert.equal(payload.name, 'Paws')
})

test('submit payload for a predefined category is unchanged', () => {
  const form = { category: 'salon', subCategory: 'unisex', customCategory: '', name: 'Glam', city: 'Pune' }
  const payload = buildRegisterPayload(form)
  assert.deepEqual(payload, { category: 'salon', subCategory: 'unisex', name: 'Glam', city: 'Pune' })
})

test('category label shows predefined labels and custom names as typed', () => {
  const labels = { healthcare: 'Healthcare' }
  assert.equal(categoryDisplayLabel('healthcare', labels), 'Healthcare')
  assert.equal(categoryDisplayLabel('Veterinary Clinic', labels), 'Veterinary Clinic')
  assert.equal(categoryDisplayLabel('', labels), 'Business')
})
