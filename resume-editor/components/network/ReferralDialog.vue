<template>
  <el-dialog 
    v-model="visible" 
    title="发送内推请求" 
    width="560px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <template v-if="targetPerson">
      <div class="referral-dialog">
        <div class="target-person-info">
          <el-avatar :size="56">{{ (targetPerson.anonymous ? targetPerson.anonymousTitle : targetPerson.name).charAt(0) }}</el-avatar>
          <div class="person-info">
            <div class="person-name">
              {{ targetPerson.anonymous ? targetPerson.anonymousTitle : targetPerson.name }}
              <el-tag v-if="targetPerson.connectionDegree === 1" type="primary" size="small">1度人脉</el-tag>
              <el-tag v-else-if="targetPerson.connectionDegree === 2" type="success" size="small">2度人脉</el-tag>
              <el-tag v-else type="warning" size="small">3度人脉</el-tag>
            </div>
            <div class="person-company">{{ targetPerson.currentCompany }}</div>
            <div class="person-position">{{ targetPerson.currentPosition }}</div>
          </div>
        </div>

        <el-divider />

        <el-form :model="formData" label-width="100px" class="referral-form">
          <el-form-item label="目标公司" required>
            <el-select v-model="formData.targetCompany" placeholder="选择目标公司" style="width: 100%">
              <el-option 
                v-for="option in targetCompanyOptions" 
                :key="option.value" 
                :label="option.label" 
                :value="option.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="目标职位" required>
            <el-input v-model="formData.targetPosition" placeholder="请输入目标职位名称" />
          </el-form-item>

          <el-form-item label="简历版本">
            <el-select v-model="formData.resumeVersion" placeholder="选择简历版本" style="width: 100%">
              <el-option label="标准简历" value="标准简历" />
              <el-option label="技术岗简历" value="技术岗简历" />
              <el-option label="产品岗简历" value="产品岗简历" />
              <el-option label="精简版简历" value="精简版简历" />
            </el-select>
          </el-form-item>

          <el-form-item label="内推说明" required>
            <el-input
              v-model="formData.message"
              type="textarea"
              :rows="5"
              placeholder="请输入内推说明，包括您的优势、为什么适合这个岗位等..."
              maxlength="500"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="快捷模板">
            <div class="template-buttons">
              <el-button size="small" type="info" plain @click="applyTemplate('alumni')" v-if="targetPerson.connectionType === 'alumni'">
                校友模板
              </el-button>
              <el-button size="small" type="info" plain @click="applyTemplate('colleague')" v-if="targetPerson.connectionType === 'colleague'">
                同事模板
              </el-button>
              <el-button size="small" type="info" plain @click="applyTemplate('general')">
                通用模板
              </el-button>
            </div>
          </el-form-item>
        </el-form>

        <div class="preview-section">
          <h4>
            <el-icon><View /></el-icon> 消息预览
          </h4>
          <div class="message-preview">
            <p><strong>主题:</strong> 内推请求 - {{ formData.targetPosition }} 岗位</p>
            <p><strong>收件人:</strong> {{ targetPerson.anonymous ? targetPerson.anonymousTitle : targetPerson.name }}</p>
            <p><strong>附件:</strong> {{ formData.resumeVersion }}.pdf</p>
            <p class="message-body">{{ formData.message || '（请输入内推说明）' }}</p>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="sending" @click="handleSend">
        <el-icon><Promotion /></el-icon> 发送内推请求
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { View, Promotion } from '@element-plus/icons-vue'
import { targetCompanyOptions } from '@/data/networkData'
import type { Person } from '@/types/network'

const props = defineProps<{
  modelValue: boolean
  targetPerson: Person | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'sent', data: { 
    targetPersonId: string
    targetCompany: string
    targetPosition: string
    resumeVersion: string
    message: string
  }): void
}>()

const networkStore = useNetworkStore()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const sending = ref(false)

const formData = reactive({
  targetCompany: '',
  targetPosition: '',
  resumeVersion: '标准简历',
  message: ''
})

watch(() => props.targetPerson, (person) => {
  if (person) {
    formData.targetCompany = person.currentCompany
    formData.targetPosition = ''
    formData.message = ''
  }
})

function applyTemplate(type: 'alumni' | 'colleague' | 'general') {
  const personName = props.targetPerson?.anonymous 
    ? props.targetPerson.anonymousTitle 
    : props.targetPerson?.name || '您好'
  
  const myName = '张三'
  const targetPosition = formData.targetPosition || '目标'
  
  const templates: Record<string, string> = {
    alumni: `${personName}学长/学姐您好，\n\n我是${myName}，和您同校毕业。目前我希望能申请${formData.targetCompany}的${targetPosition}岗位，了解到您在公司任职，想冒昧地请您帮忙内推。\n\n我有5年前端开发经验，精通Vue、React等框架，曾在字节跳动和阿里巴巴工作，主导过多个大型项目。附上我的简历，希望能得到您的帮助。\n\n非常感谢！\n\n${myName}`,
    
    colleague: `${personName}您好，\n\n我是${myName}，之前和您在${props.targetPerson?.workHistory.find(w => w.company)?.company || '同一家公司'}共事过。听闻您现在在${formData.targetCompany}发展得很好，想请您帮忙内推${targetPosition}岗位。\n\n我在前端领域有丰富的经验，擅长大型项目架构设计和团队管理，相信能为团队带来价值。附上我的简历供您参考。\n\n期待您的回复！\n\n${myName}`,
    
    general: `${personName}您好，\n\n我是${myName}，通过人脉网络了解到您在${formData.targetCompany}任职${props.targetPerson?.currentPosition || ''}。我目前正在寻找${targetPosition}的机会，希望能请您帮忙内推。\n\n我有5年互联网行业经验，具备扎实的技术能力和项目管理经验，相信能够胜任该岗位。附上我的简历，希望能得到您的帮助。\n\n感谢您抽出宝贵时间阅读！\n\n${myName}`
  }
  
  formData.message = templates[type]
}

async function handleSend() {
  if (!formData.targetCompany || !formData.targetPosition || !formData.message) {
    ElMessage.warning('请填写完整信息')
    return
  }
  
  if (!props.targetPerson) return
  
  sending.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    networkStore.sendReferralRequest(
      props.targetPerson.id,
      formData.targetCompany,
      formData.targetPosition,
      formData.resumeVersion,
      formData.message
    )
    
    ElMessage.success('内推请求已发送！')
    emit('sent', {
      targetPersonId: props.targetPerson.id,
      targetCompany: formData.targetCompany,
      targetPosition: formData.targetPosition,
      resumeVersion: formData.resumeVersion,
      message: formData.message
    })
    handleClose()
  } finally {
    sending.value = false
  }
}

function handleClose() {
  visible.value = false
  formData.message = ''
  formData.targetPosition = ''
}
</script>

<style lang="scss" scoped>
.referral-dialog {
  .target-person-info {
    display: flex;
    gap: $spacing-lg;
    align-items: center;

    .person-info {
      flex: 1;

      .person-name {
        display: flex;
        align-items: center;
        gap: $spacing-xs;
        font-size: $font-size-lg;
        font-weight: 600;
        color: $color-gray-800;
      }

      .person-company {
        color: $primary-color;
        font-size: $font-size-base;
        margin: $spacing-xs 0;
      }

      .person-position {
        color: $color-gray-600;
        font-size: $font-size-sm;
      }
    }
  }

  .referral-form {
    .template-buttons {
      display: flex;
      gap: $spacing-xs;
    }
  }

  .preview-section {
    margin-top: $spacing-lg;

    h4 {
      display: flex;
      align-items: center;
      gap: $spacing-xs;
      margin: 0 0 $spacing-sm 0;
      font-size: $font-size-base;
      font-weight: 600;
      color: $color-gray-800;

      .el-icon {
        color: $primary-color;
      }
    }

    .message-preview {
      background: $color-gray-50;
      border: 1px dashed $color-gray-300;
      border-radius: $spacing-xs;
      padding: $spacing-base;
      font-size: $font-size-sm;
      color: $color-gray-700;

      p {
        margin: 0 0 $spacing-sm 0;

        &:last-child {
          margin-bottom: 0;
        }
      }

      .message-body {
        white-space: pre-wrap;
        color: $color-gray-600;
        font-style: italic;
      }
    }
  }
}
</style>
