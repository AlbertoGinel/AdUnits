import { defineStore } from 'pinia'
import type { AppState, StageDimensions, ViewMode } from '../../types/mainTypes'

export const useAppStore = defineStore('app', {
  // State
  state: (): AppState => ({
    stage: { width: 0, height: 0 },
    currentView: 'bulkMode',
    currentAdUnitId: null,
    creativeId: null,
    isInitialized: false,
  }),

  // Getters
  getters: {
    getStage: (state) => (): StageDimensions => {
      return { ...state.stage }
    },

    getCurrentView: (state) => (): ViewMode => {
      return state.currentView
    },

    getCurrentAdUnitId: (state) => (): string | null => {
      return state.currentAdUnitId
    },

    getCreativeId: (state) => (): string | null => {
      return state.creativeId
    },

    getIsInitialized: (state) => (): boolean => {
      return state.isInitialized
    },

    hasCurrentAdUnit: (state) => (): boolean => {
      return state.currentAdUnitId !== null
    },

    hasCreativeId: (state) => (): boolean => {
      return state.creativeId !== null
    },

    isBulkMode: (state) => (): boolean => {
      return state.currentView === 'bulkMode'
    },

    isFocusMode: (state) => (): boolean => {
      return state.currentView === 'focusMode'
    },

    isReady: (state) => (): boolean => {
      return state.isInitialized && state.creativeId !== null
    },
  },

  // Actions
  actions: {
    // Setters - completely replace state
    setAppState(newState: AppState) {
      this.stage = { ...newState.stage }
      this.currentView = newState.currentView
      this.currentAdUnitId = newState.currentAdUnitId
      this.creativeId = newState.creativeId
      this.isInitialized = newState.isInitialized
    },

    setStage(stage: StageDimensions) {
      this.stage = { ...stage }
    },

    setCurrentView(view: ViewMode) {
      this.currentView = view
    },

    setCurrentAdUnitId(id: string | null) {
      this.currentAdUnitId = id
    },

    setCreativeId(id: string | null) {
      this.creativeId = id
    },

    setIsInitialized(initialized: boolean) {
      this.isInitialized = initialized
    },

    // App-specific operations
    updateStageDimensions(width: number, height: number) {
      this.stage.width = width
      this.stage.height = height
    },

    switchToBulkMode() {
      this.currentView = 'bulkMode'
      this.currentAdUnitId = null
    },

    switchToFocusMode(adUnitID: string) {
      this.currentView = 'focusMode'
      this.currentAdUnitId = adUnitID
    },

    clearCurrentAdUnit() {
      this.currentAdUnitId = null
    },

    initializeApp(creativeId: string, stage?: StageDimensions) {
      this.creativeId = creativeId
      if (stage) {
        this.stage = { ...stage }
      }
      this.isInitialized = true
    },

    resetApp() {
      this.stage = { width: 0, height: 0 }
      this.currentView = 'bulkMode'
      this.currentAdUnitId = null
      this.creativeId = null
      this.isInitialized = false
    },
  },
})
