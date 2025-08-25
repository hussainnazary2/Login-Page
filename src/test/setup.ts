import { vi, beforeEach } from 'vitest'
import '@testing-library/jest-dom'

// Mock localStorage for testing with actual storage behavior
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock
})

// Mock fetch for API tests
global.fetch = vi.fn()

beforeEach(() => {
  // Clear the storage but keep the mock functions
  localStorageMock.clear()
  localStorageMock.getItem.mockClear()
  localStorageMock.setItem.mockClear()
  localStorageMock.removeItem.mockClear()
  vi.mocked(fetch).mockClear()
})