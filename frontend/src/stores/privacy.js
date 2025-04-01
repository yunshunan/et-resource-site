import { defineStore } from 'pinia'
import { privacyService } from '@/services/privacy'

export const usePrivacyStore = defineStore('privacy', {
  state: () => ({
    consent: {
      privacyPolicyAccepted: false,
      privacyPolicyVersion: null,
      privacyPolicyAcceptedDate: null,
      analytics: false,
      errorTracking: false,
      performance: false,
      userBehavior: false,
      thirdParty: false,
      marketing: false
    },
    loading: false,
    error: null
  }),

  getters: {
    hasAcceptedPolicy: (state) => state.consent.privacyPolicyAccepted,
    hasAnalyticsConsent: (state) => state.consent.analytics,
    hasErrorTrackingConsent: (state) => state.consent.errorTracking,
    hasPerformanceConsent: (state) => state.consent.performance,
    hasUserBehaviorConsent: (state) => state.consent.userBehavior,
    hasThirdPartyConsent: (state) => state.consent.thirdParty,
    hasMarketingConsent: (state) => state.consent.marketing,
    
    privacySummary: (state) => ({
      dataCollection: {
        analytics: state.consent.analytics,
        errorTracking: state.consent.errorTracking,
        performance: state.consent.performance,
        userBehavior: state.consent.userBehavior
      },
      dataSharing: {
        thirdParty: state.consent.thirdParty,
        marketing: state.consent.marketing
      },
      policy: {
        accepted: state.consent.privacyPolicyAccepted,
        version: state.consent.privacyPolicyVersion,
        acceptedDate: state.consent.privacyPolicyAcceptedDate
      }
    })
  },

  actions: {
    async loadConsent() {
      this.loading = true
      try {
        const consent = privacyService.getUserConsent()
        this.consent = {
          ...this.consent,
          ...consent
        }
        this.error = null
      } catch (error) {
        this.error = '加载隐私设置失败'
        console.error('加载隐私设置失败:', error)
      } finally {
        this.loading = false
      }
    },

    async updateConsent(updates) {
      this.loading = true
      try {
        const newConsent = {
          ...this.consent,
          ...updates
        }
        
        if (privacyService.updateUserConsent(newConsent)) {
          this.consent = newConsent
          this.error = null
          return true
        } else {
          this.error = '更新隐私设置失败'
          return false
        }
      } catch (error) {
        this.error = '更新隐私设置失败'
        console.error('更新隐私设置失败:', error)
        return false
      } finally {
        this.loading = false
      }
    },

    async acceptAll() {
      const updates = {
        privacyPolicyAccepted: true,
        privacyPolicyVersion: '1.0',
        privacyPolicyAcceptedDate: new Date().toISOString(),
        analytics: true,
        errorTracking: true,
        performance: true,
        userBehavior: true,
        thirdParty: true,
        marketing: true
      }
      
      return await this.updateConsent(updates)
    },

    async resetConsent() {
      const updates = {
        privacyPolicyAccepted: false,
        privacyPolicyVersion: null,
        privacyPolicyAcceptedDate: null,
        analytics: false,
        errorTracking: false,
        performance: false,
        userBehavior: false,
        thirdParty: false,
        marketing: false
      }
      
      return await this.updateConsent(updates)
    },

    async exportUserData(userId) {
      try {
        return await privacyService.exportUserData(userId)
      } catch (error) {
        this.error = '导出用户数据失败'
        console.error('导出用户数据失败:', error)
        throw error
      }
    },

    async deleteUserData(userId) {
      try {
        return await privacyService.deleteUserData(userId)
      } catch (error) {
        this.error = '删除用户数据失败'
        console.error('删除用户数据失败:', error)
        throw error
      }
    }
  }
}) 