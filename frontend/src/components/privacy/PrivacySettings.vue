<template>
  <div class="privacy-settings">
    <div class="privacy-settings__header">
      <h2 class="privacy-settings__title">隐私设置</h2>
      <p class="privacy-settings__description">
        管理您的隐私偏好设置，控制我们如何收集和使用您的信息。
      </p>
    </div>

    <div class="privacy-settings__content">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        class="privacy-settings__form"
      >
        <!-- 数据分析设置 -->
        <div class="privacy-settings__section">
          <h3 class="privacy-settings__section-title">数据分析</h3>
          <p class="privacy-settings__section-description">
            帮助我们改进服务，提供更好的用户体验。
          </p>
          
          <el-form-item label="使用数据分析" prop="analytics">
            <el-switch
              v-model="form.analytics"
              active-text="开启"
              inactive-text="关闭"
            />
          </el-form-item>
          
          <el-form-item label="收集性能数据" prop="performance">
            <el-switch
              v-model="form.performance"
              active-text="开启"
              inactive-text="关闭"
            />
          </el-form-item>
        </div>

        <!-- 营销设置 -->
        <div class="privacy-settings__section">
          <h3 class="privacy-settings__section-title">营销偏好</h3>
          <p class="privacy-settings__section-description">
            控制您是否接收营销相关的通信。
          </p>
          
          <el-form-item label="接收营销邮件" prop="marketing">
            <el-switch
              v-model="form.marketing"
              active-text="开启"
              inactive-text="关闭"
            />
          </el-form-item>
          
          <el-form-item label="个性化推荐" prop="personalization">
            <el-switch
              v-model="form.personalization"
              active-text="开启"
              inactive-text="关闭"
            />
          </el-form-item>
        </div>

        <!-- 数据共享设置 -->
        <div class="privacy-settings__section">
          <h3 class="privacy-settings__section-title">数据共享</h3>
          <p class="privacy-settings__section-description">
            控制您的数据如何与第三方共享。
          </p>
          
          <el-form-item label="与合作伙伴共享数据" prop="thirdParty">
            <el-switch
              v-model="form.thirdParty"
              active-text="开启"
              inactive-text="关闭"
            />
          </el-form-item>
          
          <el-form-item label="匿名化数据共享" prop="anonymous">
            <el-switch
              v-model="form.anonymous"
              active-text="开启"
              inactive-text="关闭"
            />
          </el-form-item>
        </div>

        <!-- 数据管理 -->
        <div class="privacy-settings__section">
          <h3 class="privacy-settings__section-title">数据管理</h3>
          <p class="privacy-settings__section-description">
            管理您的个人数据。
          </p>
          
          <div class="privacy-settings__actions">
            <el-button
              type="primary"
              @click="exportData"
              :loading="exporting"
            >
              导出数据
            </el-button>
            
            <el-button
              type="danger"
              @click="deleteData"
              :loading="deleting"
            >
              删除数据
            </el-button>
          </div>
        </div>
      </el-form>
    </div>

    <div class="privacy-settings__footer">
      <el-button @click="resetSettings">重置设置</el-button>
      <el-button type="primary" @click="saveSettings" :loading="saving">
        保存设置
      </el-button>
    </div>

    <!-- 导出数据对话框 -->
    <el-dialog
      v-model="exportDialogVisible"
      title="导出数据"
      width="400px"
    >
      <el-form :model="exportForm" :rules="exportRules" ref="exportFormRef">
        <el-form-item label="导出密钥" prop="exportKey">
          <el-input
            v-model="exportForm.exportKey"
            type="password"
            placeholder="请输入导出密钥"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="exportDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmExport" :loading="exporting">
          确认导出
        </el-button>
      </template>
    </el-dialog>

    <!-- 删除数据确认对话框 -->
    <el-dialog
      v-model="deleteDialogVisible"
      title="删除数据"
      width="400px"
    >
      <p>此操作将永久删除您的所有个人数据，且无法恢复。是否继续？</p>
      <el-form :model="deleteForm" :rules="deleteRules" ref="deleteFormRef">
        <el-form-item label="确认文本" prop="confirmation">
          <el-input
            v-model="deleteForm.confirmation"
            placeholder="请输入 DELETE 以确认"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="deleteDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmDelete" :loading="deleting">
          确认删除
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { usePrivacyStore } from '@/stores/privacy'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'PrivacySettings',
  
  setup() {
    const privacyStore = usePrivacyStore()
    const formRef = ref(null)
    const exportFormRef = ref(null)
    const deleteFormRef = ref(null)
    
    const form = reactive({
      analytics: true,
      performance: true,
      marketing: false,
      personalization: true,
      thirdParty: false,
      anonymous: true
    })
    
    const rules = {
      analytics: [
        { required: true, message: '请选择是否启用数据分析', trigger: 'change' }
      ],
      performance: [
        { required: true, message: '请选择是否收集性能数据', trigger: 'change' }
      ],
      marketing: [
        { required: true, message: '请选择是否接收营销邮件', trigger: 'change' }
      ],
      personalization: [
        { required: true, message: '请选择是否启用个性化推荐', trigger: 'change' }
      ],
      thirdParty: [
        { required: true, message: '请选择是否与第三方共享数据', trigger: 'change' }
      ],
      anonymous: [
        { required: true, message: '请选择是否匿名化共享数据', trigger: 'change' }
      ]
    }
    
    const exportDialogVisible = ref(false)
    const deleteDialogVisible = ref(false)
    const exporting = ref(false)
    const deleting = ref(false)
    const saving = ref(false)
    
    const exportForm = reactive({
      exportKey: ''
    })
    
    const deleteForm = reactive({
      confirmation: ''
    })
    
    const exportRules = {
      exportKey: [
        { required: true, message: '请输入导出密钥', trigger: 'blur' },
        { min: 8, message: '密钥长度不能小于8位', trigger: 'blur' }
      ]
    }
    
    const deleteRules = {
      confirmation: [
        { required: true, message: '请输入确认文本', trigger: 'blur' },
        { 
          validator: (rule, value, callback) => {
            if (value !== 'DELETE') {
              callback(new Error('请输入正确的确认文本'))
            } else {
              callback()
            }
          },
          trigger: 'blur'
        }
      ]
    }
    
    onMounted(async () => {
      try {
        const settings = await privacyStore.getPrivacySettings()
        Object.assign(form, settings)
      } catch (error) {
        ElMessage.error('加载设置失败')
      }
    })
    
    const saveSettings = async () => {
      if (!formRef.value) return
      
      try {
        await formRef.value.validate()
        saving.value = true
        
        await privacyStore.updatePrivacySettings(form)
        ElMessage.success('设置已保存')
      } catch (error) {
        ElMessage.error('保存设置失败')
      } finally {
        saving.value = false
      }
    }
    
    const resetSettings = async () => {
      try {
        await ElMessageBox.confirm(
          '确定要重置所有设置吗？',
          '重置设置',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        
        const defaultSettings = await privacyStore.getDefaultSettings()
        Object.assign(form, defaultSettings)
        await saveSettings()
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('重置设置失败')
        }
      }
    }
    
    const exportData = () => {
      exportDialogVisible.value = true
    }
    
    const confirmExport = async () => {
      if (!exportFormRef.value) return
      
      try {
        await exportFormRef.value.validate()
        exporting.value = true
        
        await privacyStore.exportUserData(exportForm.exportKey)
        ElMessage.success('数据导出成功')
        exportDialogVisible.value = false
      } catch (error) {
        ElMessage.error('数据导出失败')
      } finally {
        exporting.value = false
      }
    }
    
    const deleteData = () => {
      deleteDialogVisible.value = true
    }
    
    const confirmDelete = async () => {
      if (!deleteFormRef.value) return
      
      try {
        await deleteFormRef.value.validate()
        deleting.value = true
        
        await privacyStore.deleteUserData()
        ElMessage.success('数据删除成功')
        deleteDialogVisible.value = false
      } catch (error) {
        ElMessage.error('数据删除失败')
      } finally {
        deleting.value = false
      }
    }
    
    return {
      formRef,
      exportFormRef,
      deleteFormRef,
      form,
      rules,
      exportDialogVisible,
      deleteDialogVisible,
      exportForm,
      deleteForm,
      exportRules,
      deleteRules,
      exporting,
      deleting,
      saving,
      saveSettings,
      resetSettings,
      exportData,
      confirmExport,
      deleteData,
      confirmDelete
    }
  }
}
</script>

<style lang="scss" scoped>
.privacy-settings {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  
  &__header {
    margin-bottom: 30px;
  }
  
  &__title {
    margin: 0 0 10px;
    font-size: 24px;
    color: #303133;
  }
  
  &__description {
    margin: 0;
    color: #606266;
    line-height: 1.5;
  }
  
  &__content {
    background: #fff;
    border-radius: 8px;
    padding: 30px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  }
  
  &__section {
    margin-bottom: 40px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  &__section-title {
    margin: 0 0 10px;
    font-size: 18px;
    color: #303133;
  }
  
  &__section-description {
    margin: 0 0 20px;
    color: #909399;
    font-size: 14px;
  }
  
  &__actions {
    display: flex;
    gap: 12px;
  }
  
  &__footer {
    margin-top: 30px;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
  
  :deep(.el-form-item__label) {
    font-weight: 500;
  }
  
  :deep(.el-switch) {
    margin-right: 8px;
  }
}
</style> 