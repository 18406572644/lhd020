<template>
  <div class="resume-preview-wrapper">
    <div class="preview-header no-print">
      <h2 class="preview-title">简历预览</h2>
      <div class="preview-actions">
        <el-radio-group v-model="zoomLevel" size="small">
          <el-radio-button :label="0.75">75%</el-radio-button>
          <el-radio-button :label="1">100%</el-radio-button>
          <el-radio-button :label="1.25">125%</el-radio-button>
          <el-radio-button :label="1.5">150%</el-radio-button>
        </el-radio-group>
      </div>
    </div>
    
    <div class="preview-container">
      <div 
        class="resume-preview-content"
        :class="[`template-${resumeStore.resumeData?.template || 'modern'}`, `layout-${currentTemplate?.layout || 'double'}`]"
        :style="previewStyle"
        ref="previewRef"
      >
        <template v-if="resumeStore.resumeData">
          <!-- 基本信息头部 -->
          <header class="resume-header">
            <div class="header-content">
              <div class="avatar-section" v-if="resumeStore.resumeData.basicInfo.avatar">
                <el-avatar :size="80" :src="resumeStore.resumeData.basicInfo.avatar" class="avatar" />
              </div>
              <div class="info-section">
                <h1 class="name">{{ resumeStore.resumeData.basicInfo.name }}</h1>
                <div class="job-title">{{ resumeStore.resumeData.basicInfo.jobTitle }}</div>
                <div class="contact-info">
                  <span v-if="resumeStore.resumeData.basicInfo.phone" class="contact-item">
                    <el-icon><Phone /></el-icon>
                    {{ resumeStore.resumeData.basicInfo.phone }}
                  </span>
                  <span v-if="resumeStore.resumeData.basicInfo.email" class="contact-item">
                    <el-icon><Message /></el-icon>
                    {{ resumeStore.resumeData.basicInfo.email }}
                  </span>
                  <span v-if="resumeStore.resumeData.basicInfo.location" class="contact-item">
                    <el-icon><Location /></el-icon>
                    {{ resumeStore.resumeData.basicInfo.location }}
                  </span>
                  <span v-if="resumeStore.resumeData.basicInfo.website" class="contact-item">
                    <el-icon><Link /></el-icon>
                    {{ resumeStore.resumeData.basicInfo.website }}
                  </span>
                </div>
              </div>
            </div>
            <div class="summary" v-if="resumeStore.resumeData.basicInfo.summary">
              {{ resumeStore.resumeData.basicInfo.summary }}
            </div>
          </header>
          
          <!-- 内容区域 -->
          <div class="resume-body">
            <div class="main-content">
              <template v-for="module in visibleMainModules" :key="module.id">
                <!-- 工作经历 -->
                <section v-if="module.type === 'work' && resumeStore.resumeData!.workExperience.length > 0" class="resume-section">
                  <h2 class="section-title">{{ module.title }}</h2>
                  <div class="work-list">
                    <div v-for="work in resumeStore.resumeData!.workExperience" :key="work.id" class="work-item">
                      <div class="item-header">
                        <div class="item-title">
                          <span class="company">{{ work.company }}</span>
                          <span class="position">{{ work.position }}</span>
                        </div>
                        <div class="item-date">
                          {{ work.startDate }} - {{ work.current ? '至今' : work.endDate }}
                        </div>
                      </div>
                      <p class="description" v-if="work.description">{{ work.description }}</p>
                      <ul class="highlights" v-if="work.highlights?.length">
                        <li v-for="(highlight, i) in work.highlights" :key="i">{{ highlight }}</li>
                      </ul>
                    </div>
                  </div>
                </section>
                
                <!-- 项目经历 -->
                <section v-if="module.type === 'project' && resumeStore.resumeData!.projects.length > 0" class="resume-section">
                  <h2 class="section-title">{{ module.title }}</h2>
                  <div class="project-list">
                    <div v-for="project in resumeStore.resumeData!.projects" :key="project.id" class="project-item">
                      <div class="item-header">
                        <div class="item-title">
                          <span class="name">{{ project.name }}</span>
                          <span class="role">{{ project.role }}</span>
                        </div>
                        <div class="item-date">
                          {{ project.startDate }} - {{ project.endDate }}
                        </div>
                      </div>
                      <p class="description" v-if="project.description">{{ project.description }}</p>
                      <div class="technologies" v-if="project.technologies?.length">
                        <span v-for="(tech, i) in project.technologies" :key="i" class="tech-tag">{{ tech }}</span>
                      </div>
                      <ul class="highlights" v-if="project.highlights?.length">
                        <li v-for="(highlight, i) in project.highlights" :key="i">{{ highlight }}</li>
                      </ul>
                    </div>
                  </div>
                </section>
                
                <!-- 教育经历 -->
                <section v-if="module.type === 'education' && resumeStore.resumeData!.education.length > 0" class="resume-section">
                  <h2 class="section-title">{{ module.title }}</h2>
                  <div class="education-list">
                    <div v-for="edu in resumeStore.resumeData!.education" :key="edu.id" class="education-item">
                      <div class="item-header">
                        <div class="item-title">
                          <span class="school">{{ edu.school }}</span>
                          <span class="degree">{{ edu.degree }} · {{ edu.major }}</span>
                        </div>
                        <div class="item-date">
                          {{ edu.startDate }} - {{ edu.endDate }}
                        </div>
                      </div>
                      <p class="description" v-if="edu.description">{{ edu.description }}</p>
                    </div>
                  </div>
                </section>
              </template>
            </div>
            
            <div class="side-content" v-if="currentTemplate?.layout === 'double'">
              <template v-for="module in visibleSideModules" :key="module.id">
                <!-- 技能 -->
                <section v-if="module.type === 'skill' && resumeStore.resumeData!.skills.length > 0" class="resume-section">
                  <h2 class="section-title">{{ module.title }}</h2>
                  <div class="skill-list">
                    <div v-for="skill in resumeStore.resumeData!.skills" :key="skill.id" class="skill-item">
                      <div class="skill-header">
                        <span class="skill-name">{{ skill.name }}</span>
                        <span class="skill-level">{{ skill.level }}%</span>
                      </div>
                      <div class="skill-bar">
                        <div class="skill-progress" :style="{ width: skill.level + '%' }"></div>
                      </div>
                    </div>
                  </div>
                </section>
                
                <!-- 证书 -->
                <section v-if="module.type === 'certificate' && resumeStore.resumeData!.certificates.length > 0" class="resume-section">
                  <h2 class="section-title">{{ module.title }}</h2>
                  <div class="certificate-list">
                    <div v-for="cert in resumeStore.resumeData!.certificates" :key="cert.id" class="certificate-item">
                      <div class="cert-name">{{ cert.name }}</div>
                      <div class="cert-issuer">{{ cert.issuer }} · {{ cert.date }}</div>
                      <p class="description" v-if="cert.description">{{ cert.description }}</p>
                    </div>
                  </div>
                </section>
              </template>
            </div>
            
            <!-- 单列布局时侧边内容放在后面 -->
            <div v-if="currentTemplate?.layout === 'single'" class="full-width">
              <template v-for="module in visibleSideModules" :key="module.id">
                <!-- 技能 -->
                <section v-if="module.type === 'skill' && resumeStore.resumeData!.skills.length > 0" class="resume-section">
                  <h2 class="section-title">{{ module.title }}</h2>
                  <div class="skill-grid">
                    <div v-for="skill in resumeStore.resumeData!.skills" :key="skill.id" class="skill-item-inline">
                      <span class="skill-name">{{ skill.name }}</span>
                      <div class="skill-bar-inline">
                        <div class="skill-progress" :style="{ width: skill.level + '%' }"></div>
                      </div>
                    </div>
                  </div>
                </section>
                
                <!-- 证书 -->
                <section v-if="module.type === 'certificate' && resumeStore.resumeData!.certificates.length > 0" class="resume-section">
                  <h2 class="section-title">{{ module.title }}</h2>
                  <div class="certificate-grid">
                    <div v-for="cert in resumeStore.resumeData!.certificates" :key="cert.id" class="certificate-item-inline">
                      <div class="cert-name">{{ cert.name }}</div>
                      <div class="cert-issuer">{{ cert.issuer }} · {{ cert.date }}</div>
                    </div>
                  </div>
                </section>
              </template>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { templateConfigs } from '@/data/mockData'
import type { ResumeModule } from '@/types/resume'

const resumeStore = useResumeStore()
const zoomLevel = ref(0.75)
const previewRef = ref<HTMLElement | null>(null)

const currentTemplate = computed(() => {
  if (!resumeStore.resumeData) return null
  return templateConfigs.find(t => t.id === resumeStore.resumeData!.template)
})

const previewStyle = computed(() => {
  const template = currentTemplate.value
  if (!template) return {}
  return {
    '--primary-color': template.primaryColor,
    '--secondary-color': template.secondaryColor,
    transform: `scale(${zoomLevel.value})`,
    transformOrigin: 'top center'
  }
})

const visibleModules = computed(() => {
  if (!resumeStore.resumeData) return []
  return [...resumeStore.resumeData.modules]
    .filter(m => m.visible)
    .sort((a, b) => a.order - b.order)
})

const mainModuleTypes = ['work', 'project', 'education']
const sideModuleTypes = ['skill', 'certificate']

const visibleMainModules = computed(() => {
  return visibleModules.value.filter(m => mainModuleTypes.includes(m.type))
})

const visibleSideModules = computed(() => {
  return visibleModules.value.filter(m => sideModuleTypes.includes(m.type))
})
</script>

<style lang="scss" scoped>
.resume-preview-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: $color-gray-200;
  
  .preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: $spacing-base $spacing-xl;
    background-color: $color-white;
    border-bottom: 1px solid $color-gray-200;
    
    .preview-title {
      font-size: $font-size-lg;
      font-weight: 600;
      color: $color-gray-800;
    }
  }
  
  .preview-container {
    flex: 1;
    overflow: auto;
    padding: $spacing-2xl;
    display: flex;
    justify-content: center;
  }
  
  .resume-preview-content {
    width: $a4-width;
    min-height: $a4-height;
    background-color: $color-white;
    box-shadow: $shadow-xl;
    padding: 15mm 12mm;
    font-size: 12px;
    line-height: 1.6;
    color: $color-gray-800;
    
    &.template-classic {
      font-family: $font-family-serif;
      
      .resume-header {
        background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
        color: $color-white;
        margin: -15mm -12mm 8mm;
        padding: 10mm 12mm;
        
        .contact-item {
          color: rgba(255, 255, 255, 0.9);
        }
        
        .section-title {
          border-bottom: 2px solid var(--primary-color);
          color: var(--primary-color);
        }
      }
      
      .section-title {
        border-bottom: 2px solid var(--primary-color);
        color: var(--primary-color);
        font-family: $font-family-serif;
      }
    }
    
    &.template-modern {
      .resume-header {
        border-bottom: 3px solid var(--primary-color);
        padding-bottom: 6mm;
        margin-bottom: 6mm;
        
        .name {
          color: var(--primary-color);
        }
      }
      
      .section-title {
        position: relative;
        padding-left: 4mm;
        
        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 70%;
          background-color: var(--secondary-color);
          border-radius: 2px;
        }
      }
      
      .skill-progress {
        background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
      }
    }
    
    &.template-minimal {
      .resume-header {
        text-align: center;
        border-bottom: 1px solid $color-gray-300;
        padding-bottom: 6mm;
        margin-bottom: 6mm;
      }
      
      .section-title {
        text-transform: uppercase;
        letter-spacing: 2px;
        font-size: 11px;
        color: $color-gray-500;
        font-weight: 500;
      }
      
      .contact-info {
        justify-content: center;
      }
    }
    
    &.template-creative {
      .resume-header {
        background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
        color: $color-white;
        margin: -15mm -12mm 8mm;
        padding: 10mm 12mm;
        border-radius: 0 0 8mm 8mm;
        
        .contact-item {
          background-color: rgba(255, 255, 255, 0.2);
          padding: 2mm 4mm;
          border-radius: 4mm;
        }
      }
      
      .section-title {
        display: inline-block;
        background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
        color: $color-white;
        padding: 2mm 6mm;
        border-radius: 4mm;
        margin-bottom: 4mm;
      }
      
      .skill-progress {
        background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
        border-radius: 3px;
      }
      
      .tech-tag {
        background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
        color: $color-white;
      }
    }
    
    &.layout-double {
      .resume-body {
        display: grid;
        grid-template-columns: 1fr 55mm;
        gap: 8mm;
      }
    }
    
    &.layout-single {
      .resume-body {
        display: flex;
        flex-direction: column;
        gap: 6mm;
      }
      
      .full-width {
        display: flex;
        flex-direction: column;
        gap: 6mm;
      }
    }
  }
  
  .resume-header {
    .header-content {
      display: flex;
      gap: 5mm;
      align-items: center;
      margin-bottom: 4mm;
    }
    
    .avatar {
      border: 2px solid rgba(255, 255, 255, 0.3);
    }
    
    .info-section {
      flex: 1;
    }
    
    .name {
      font-size: 26px;
      font-weight: 700;
      margin-bottom: 2mm;
      line-height: 1.2;
    }
    
    .job-title {
      font-size: 14px;
      margin-bottom: 3mm;
      opacity: 0.9;
    }
    
    .contact-info {
      display: flex;
      flex-wrap: wrap;
      gap: 3mm 5mm;
      
      .contact-item {
        display: flex;
        align-items: center;
        gap: 1.5mm;
        font-size: 11px;
        
        .el-icon {
          font-size: 12px;
        }
      }
    }
    
    .summary {
      font-size: 12px;
      line-height: 1.8;
      opacity: 0.95;
    }
  }
  
  .resume-section {
    margin-bottom: 6mm;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .section-title {
      font-size: 13px;
      font-weight: 700;
      margin-bottom: 4mm;
      padding-bottom: 2mm;
      color: var(--primary-color);
    }
  }
  
  .work-list,
  .project-list,
  .education-list {
    display: flex;
    flex-direction: column;
    gap: 5mm;
  }
  
  .work-item,
  .project-item,
  .education-item {
    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2mm;
      
      .item-title {
        .company,
        .name,
        .school {
          font-weight: 600;
          font-size: 13px;
          margin-right: 2mm;
        }
        
        .position,
        .role,
        .degree {
          font-size: 12px;
          color: $color-gray-600;
        }
      }
      
      .item-date {
        font-size: 11px;
        color: $color-gray-500;
        white-space: nowrap;
      }
    }
    
    .description {
      font-size: 11.5px;
      color: $color-gray-700;
      line-height: 1.7;
      margin-bottom: 2mm;
    }
    
    .highlights {
      list-style: disc;
      padding-left: 4mm;
      
      li {
        font-size: 11.5px;
        color: $color-gray-700;
        line-height: 1.7;
        margin-bottom: 1mm;
      }
    }
    
    .technologies {
      display: flex;
      flex-wrap: wrap;
      gap: 1.5mm;
      margin-bottom: 2mm;
      
      .tech-tag {
        font-size: 10px;
        padding: 1mm 2.5mm;
        background-color: $color-gray-100;
        color: $color-gray-600;
        border-radius: 3px;
      }
    }
  }
  
  .skill-list {
    display: flex;
    flex-direction: column;
    gap: 3mm;
    
    .skill-item {
      .skill-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5mm;
        
        .skill-name {
          font-size: 11.5px;
          font-weight: 500;
        }
        
        .skill-level {
          font-size: 10.5px;
          color: $color-gray-500;
        }
      }
      
      .skill-bar {
        height: 4px;
        background-color: $color-gray-200;
        border-radius: 2px;
        overflow: hidden;
        
        .skill-progress {
          height: 100%;
          background-color: var(--primary-color);
          border-radius: 2px;
          transition: width 0.3s ease;
        }
      }
    }
  }
  
  .skill-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 3mm 5mm;
    
    .skill-item-inline {
      display: flex;
      flex-direction: column;
      gap: 1.5mm;
      
      .skill-name {
        font-size: 11.5px;
        font-weight: 500;
      }
      
      .skill-bar-inline {
        height: 4px;
        background-color: $color-gray-200;
        border-radius: 2px;
        overflow: hidden;
        
        .skill-progress {
          height: 100%;
          background-color: var(--primary-color);
          border-radius: 2px;
        }
      }
    }
  }
  
  .certificate-list {
    display: flex;
    flex-direction: column;
    gap: 3mm;
    
    .certificate-item {
      .cert-name {
        font-size: 11.5px;
        font-weight: 600;
        margin-bottom: 0.5mm;
      }
      
      .cert-issuer {
        font-size: 10.5px;
        color: $color-gray-500;
        margin-bottom: 1mm;
      }
      
      .description {
        font-size: 10.5px;
        color: $color-gray-600;
        line-height: 1.6;
      }
    }
  }
  
  .certificate-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 3mm 5mm;
    
    .certificate-item-inline {
      .cert-name {
        font-size: 11.5px;
        font-weight: 600;
        margin-bottom: 0.5mm;
      }
      
      .cert-issuer {
        font-size: 10.5px;
        color: $color-gray-500;
      }
    }
  }
}

@media print {
  .resume-preview-wrapper {
    .preview-header {
      display: none;
    }
    
    .preview-container {
      padding: 0;
      overflow: visible;
    }
    
    .resume-preview-content {
      box-shadow: none;
      transform: none !important;
      margin: 0 auto;
    }
  }
}
</style>
