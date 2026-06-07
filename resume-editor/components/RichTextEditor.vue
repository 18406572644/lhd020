<template>
  <div class="rich-text-editor">
    <div class="editor-toolbar">
      <div class="toolbar-group">
        <button
          class="toolbar-btn toolbar-btn-text"
          :class="{ 'is-active': editor?.isActive('bold') }"
          @click="editor?.chain().focus().toggleBold().run()"
          title="加粗 (Ctrl+B)"
        >
          <strong>B</strong>
        </button>
        <button
          class="toolbar-btn toolbar-btn-text"
          :class="{ 'is-active': editor?.isActive('italic') }"
          @click="editor?.chain().focus().toggleItalic().run()"
          title="斜体 (Ctrl+I)"
        >
          <em>I</em>
        </button>
        <button
          class="toolbar-btn toolbar-btn-text"
          :class="{ 'is-active': editor?.isActive('underline') }"
          @click="editor?.chain().focus().toggleUnderline().run()"
          title="下划线 (Ctrl+U)"
        >
          <span style="text-decoration: underline;">U</span>
        </button>
      </div>
      
      <div class="toolbar-divider"></div>
      
      <div class="toolbar-group">
        <button
          class="toolbar-btn"
          :class="{ 'is-active': editor?.isActive('bulletList') }"
          @click="editor?.chain().focus().toggleBulletList().run()"
          title="无序列表"
        >
          <el-icon><List /></el-icon>
        </button>
        <button
          class="toolbar-btn toolbar-btn-text"
          :class="{ 'is-active': editor?.isActive('orderedList') }"
          @click="editor?.chain().focus().toggleOrderedList().run()"
          title="有序列表"
        >
          <span>1.</span>
        </button>
      </div>
      
      <div class="toolbar-divider"></div>
      
      <div class="toolbar-group">
        <button
          class="toolbar-btn"
          :class="{ 'is-active': editor?.isActive('link') }"
          @click="showLinkDialog"
          title="插入链接"
        >
          <el-icon><Link /></el-icon>
        </button>
        <button
          class="toolbar-btn"
          @click="showTableDialog"
          title="插入表格"
        >
          <el-icon><Grid /></el-icon>
        </button>
      </div>
    </div>
    
    <editor-content :editor="editor" class="editor-content" />
    
    <el-dialog
      v-model="linkDialogVisible"
      title="插入链接"
      width="400px"
      :close-on-click-modal="false"
    >
      <el-form :model="linkForm" label-width="80px">
        <el-form-item label="链接文本">
          <el-input v-model="linkForm.text" placeholder="请输入链接显示文本" />
        </el-form-item>
        <el-form-item label="链接地址">
          <el-input v-model="linkForm.href" placeholder="https://" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="linkDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="insertLink">确定</el-button>
      </template>
    </el-dialog>
    
    <el-dialog
      v-model="tableDialogVisible"
      title="插入表格"
      width="400px"
      :close-on-click-modal="false"
    >
      <el-form :model="tableForm" label-width="80px">
        <el-form-item label="行数">
          <el-input-number v-model="tableForm.rows" :min="1" :max="20" />
        </el-form-item>
        <el-form-item label="列数">
          <el-input-number v-model="tableForm.cols" :min="1" :max="10" />
        </el-form-item>
        <el-form-item label="表头">
          <el-switch v-model="tableForm.withHeader" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="tableDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="insertTable">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onBeforeUnmount, reactive } from 'vue'
import { useEditor, EditorContent, type Editor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import Placeholder from '@tiptap/extension-placeholder'
import { List, Link as LinkIcon, Grid } from '@element-plus/icons-vue'

const props = defineProps<{
  modelValue: string
  placeholder?: string
  rows?: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    Underline,
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        target: '_blank',
        rel: 'noopener noreferrer'
      }
    }),
    Table.configure({
      resizable: true
    }),
    TableRow,
    TableCell,
    TableHeader,
    Placeholder.configure({
      placeholder: props.placeholder || '请输入内容...'
    })
  ],
  editorProps: {
    attributes: {
      class: 'tiptap-editor'
    },
    handleDOMEvents: {
      focus: (view, event) => {
        view.dom.classList.add('is-focused')
        return false
      },
      blur: (view, event) => {
        view.dom.classList.remove('is-focused')
        return false
      }
    }
  },
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  }
})

watch(() => props.modelValue, (newValue) => {
  const ed = editor.value as Editor | undefined
  if (ed && ed.getHTML() !== newValue) {
    ed.commands.setContent(newValue, { emitUpdate: false })
  }
})

const linkDialogVisible = ref(false)
const linkForm = reactive({
  text: '',
  href: ''
})

const tableDialogVisible = ref(false)
const tableForm = reactive({
  rows: 3,
  cols: 3,
  withHeader: true
})

function showLinkDialog() {
  const ed = editor.value as Editor | undefined
  if (!ed) return
  
  const selection = ed.state.selection
  const selectedText = ed.state.doc.textBetween(selection.from, selection.to)
  linkForm.text = selectedText || ''
  linkForm.href = ''
  linkDialogVisible.value = true
}

function insertLink() {
  const ed = editor.value as Editor | undefined
  if (!ed) return
  
  if (linkForm.href) {
    if (linkForm.text) {
      ed.chain().focus().extendMarkRange('link', { href: linkForm.href }).insertContent(linkForm.text).run()
    } else {
      ed.chain().focus().setLink({ href: linkForm.href }).run()
    }
  }
  linkDialogVisible.value = false
}

function showTableDialog() {
  tableForm.rows = 3
  tableForm.cols = 3
  tableForm.withHeader = true
  tableDialogVisible.value = true
}

function insertTable() {
  const ed = editor.value as Editor | undefined
  if (!ed) return
  
  ed.chain().focus().insertTable({
    rows: tableForm.rows,
    cols: tableForm.cols,
    withHeaderRow: tableForm.withHeader
  }).run()
  
  tableDialogVisible.value = false
}

onBeforeUnmount(() => {
  const ed = editor.value as Editor | undefined
  ed?.destroy()
})
</script>

<style lang="scss" scoped>
.rich-text-editor {
  border: 1px solid $color-gray-200;
  border-radius: $border-radius-base;
  overflow: hidden;
  transition: $transition-base;
  
  &:focus-within {
    border-color: $accent-color;
    box-shadow: 0 0 0 2px rgba(15, 52, 96, 0.1);
  }
  
  .editor-toolbar {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    padding: $spacing-sm $spacing-base;
    background-color: $color-gray-50;
    border-bottom: 1px solid $color-gray-200;
    flex-wrap: wrap;
    
    .toolbar-group {
      display: flex;
      align-items: center;
      gap: 2px;
    }
    
    .toolbar-divider {
      width: 1px;
      height: 20px;
      background-color: $color-gray-300;
      margin: 0 $spacing-xs;
    }
    
    .toolbar-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border: none;
      background: transparent;
      border-radius: $border-radius-sm;
      cursor: pointer;
      color: $color-gray-600;
      transition: $transition-base;
      font-size: 14px;
      font-weight: 500;
      
      &:hover {
        background-color: $color-gray-200;
        color: $color-gray-800;
      }
      
      &.is-active {
        background-color: rgba(15, 52, 96, 0.1);
        color: $accent-color;
      }
      
      .el-icon {
        font-size: 14px;
      }
      
      &.toolbar-btn-text {
        font-family: Georgia, 'Times New Roman', serif;
        font-size: 14px;
        
        strong {
          font-weight: 700;
        }
        
        em {
          font-style: italic;
        }
      }
    }
  }
  
  .editor-content {
    :deep(.tiptap-editor) {
      min-height: 120px;
      padding: $spacing-base;
      outline: none;
      
      p {
        margin-bottom: $spacing-sm;
      }
      
      p.is-editor-empty:first-child::before {
        content: attr(data-placeholder);
        float: left;
        color: $color-gray-400;
        pointer-events: none;
        height: 0;
      }
      
      ul,
      ol {
        padding-left: $spacing-lg;
        margin-bottom: $spacing-sm;
      }
      
      ul {
        list-style: disc;
      }
      
      ol {
        list-style: decimal;
      }
      
      li {
        margin-bottom: $spacing-xs;
      }
      
      a {
        color: $accent-color;
        text-decoration: underline;
      }
      
      table {
        border-collapse: collapse;
        width: 100%;
        margin: $spacing-sm 0;
        
        td,
        th {
          border: 1px solid $color-gray-300;
          padding: $spacing-xs $spacing-sm;
          min-width: 80px;
          text-align: left;
        }
        
        th {
          background-color: $color-gray-100;
          font-weight: 600;
        }
        
        .selectedCell {
          background-color: rgba(15, 52, 96, 0.05);
        }
      }
    }
  }
}
</style>
