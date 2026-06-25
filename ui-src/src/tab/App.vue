<template>
  <el-container class="app-container">
    <el-aside width="260px" class="sidebar">
      <div class="brand">
        <div class="brand-title">{{ t('brand.title') }}</div>
        <div class="brand-sub">{{ t('brand.subtitle') }}</div>
        <div class="status-row">
           <div class="status-dot"></div>
           <span class="status-text">{{ t('brand.status') }}</span>
        </div>
      </div>

      <div class="panel">
        <div class="panel-title">{{ t('sidebar.mode') }}</div>
        <el-radio-group v-model="overrideMode" size="small" fill="#3b82f6" @change="handleModeChange">
          <el-radio-button label="dnr">{{ t('sidebar.mode_dnr') }}</el-radio-button>
          <el-radio-button label="page">{{ t('sidebar.mode_page') }}</el-radio-button>
        </el-radio-group>
        <p class="mode-hint">{{ modeHint }}</p>
      </div>

      <div class="panel">
        <div class="panel-title">{{ t('sidebar.actions') }}</div>
        <div class="action-row">
           <el-checkbox v-model="selectAll" @change="handleSelectAll" :label="t('sidebar.select_all')" />
        </div>
        <div class="bulk-actions-grid">
          <el-button type="success" plain size="small" @click="bulkEnable">{{ t('sidebar.btn_enable') }}</el-button>
          <el-button type="warning" plain size="small" @click="bulkDisable">{{ t('sidebar.btn_disable') }}</el-button>
          <el-button type="danger" plain size="small" @click="bulkDelete">{{ t('sidebar.btn_delete') }}</el-button>
        </div>
      </div>

      <div class="panel debug-panel">
        <div class="panel-title">
            <span>{{ t('sidebar.logs') }}</span>
            <div class="log-controls">
                <el-switch v-model="debugMode" size="small" @change="handleDebugChange" />
                <el-button link size="small" class="clear-btn" @click="clearLogs">{{ t('sidebar.clear') }}</el-button>
            </div>
        </div>
        
        <el-input v-model="logFilter" :placeholder="t('sidebar.search_logs')" size="small" class="log-filter">
             <template #prefix>
                <span style="font-size: 12px; color: #94a3b8">🔍</span>
             </template>
        </el-input>

        <div class="log-list">
          <div v-if="filteredLogs.length === 0" class="log-empty">
            {{ t('sidebar.no_logs') }}
          </div>
          <div v-for="(log, index) in filteredLogs" :key="index" class="log-item">
             <div class="log-row-1">
                 <span :class="['method-tag', log.method]">{{ log.method }}</span>
                 <span class="log-time">{{ formatTime(log.ts).split(' ')[1] }}</span>
             </div>
             <div class="log-url" :title="log.url">{{ log.url }}</div>
             <div class="log-meta" v-if="log.ruleId">
               <span class="rule-ref">Rule: {{ log.ruleId.slice(0, 8) }}...</span>
             </div>
          </div>
        </div>
      </div>
    </el-aside>

    <el-container class="main-wrapper">
      <el-header height="auto" class="toolbar">
        <div class="toolbar-left">
          <div class="stat-item">
            <div class="stat-value">{{ filteredRules.length }}<span class="stat-total">/{{ rules.length }}</span></div>
            <div class="stat-label">{{ t('toolbar.total_rules') }}</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
             <div class="stat-value success">{{ enabledCount }}</div>
             <div class="stat-label">{{ t('toolbar.active_rules') }}</div>
          </div>
        </div>
        <div class="toolbar-actions">
          <div class="search-bar">
             <el-input v-model="filters.url" :placeholder="t('toolbar.search_placeholder')" clearable class="search-input" />
          </div>
          
          <el-tooltip :content="t('toolbar.group_by_origin')" placement="bottom">
              <el-button 
                :type="groupByOrigin ? 'primary' : 'default'" 
                :plain="!groupByOrigin"
                class="icon-btn" 
                @click="groupByOrigin = !groupByOrigin"
              >
                 <span class="custom-icon">🗂</span>
              </el-button>
          </el-tooltip>

          <el-button type="primary" class="create-btn" @click="openAddDialog">
            <span>+ {{ t('toolbar.new_rule') }}</span>
          </el-button>
          <el-dropdown trigger="click">
            <el-button class="icon-btn">
                {{ t('toolbar.menu_example') }}
                <span class="el-icon-arrow-down el-icon--right"></span>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="exportRules">{{ t('toolbar.export_json') }}</el-dropdown-item>
                <el-dropdown-item @click="triggerImport">{{ t('toolbar.import_json') }}</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          
          <!-- Hidden File Input -->
           <input type="file" ref="fileInput" accept=".json" style="display: none" @change="handleImport" />
        </div>
      </el-header>

      <el-main class="main-content">
        <el-empty v-if="filteredRules.length === 0" :description="t('list.no_rules')" />

        <div v-else class="rules-list-container">
            
            <!-- Grouped View -->
            <div v-if="groupByOrigin" class="grouped-view">
                 <div v-for="group in groupedRules" :key="group.name" class="group-section">
                     <div class="group-header" @click="toggleGroup(group.name)">
                         <span class="group-toggle-icon" :class="{ collapsed: collapsedGroups.has(group.name) }">▼</span>
                         <span class="group-icon">🌐</span>
                         <span class="group-name">{{ group.name }}</span>
                         <span class="group-count">{{ group.rules.length }}</span>
                     </div>
                     <div class="group-items" v-show="!collapsedGroups.has(group.name)">
                         <div 
                            v-for="rule in group.rules" 
                            :key="rule.id" 
                            class="rule-card" 
                            :class="{ 'is-disabled': !rule.enabled }"
                         >
                            <div class="rule-status-stripe" :class="{ active: rule.enabled }"></div>
                            <div class="rule-inner">
                                <div class="rule-select">
                                    <el-checkbox 
                                        :model-value="selectedIds.has(rule.id)"
                                        @update:model-value="(val) => handleSelectionChange(rule.id, val)"
                                    />
                                </div>
                                <div class="rule-main">
                                    <div class="rule-top">
                                         <div class="rule-url" :title="rule.urlPattern">{{ rule.urlPattern }}</div>
                                    </div>
                                    <div class="rule-bottom">
                                        <div class="badge-group">
                                            <span class="badge method-badge" :title="getMethodsLabel(rule)">{{ getMethodsLabel(rule) }}</span>
                                            <span class="badge status-badge" :class="getStatusCodeClass(rule.statusCode)">{{ rule.statusCode }}</span>
                                            <span class="badge mode-badge" :class="getInterceptModeClass(rule)">{{ getInterceptModeLabel(rule) }}</span>
                                            <span class="badge type-badge">{{ rule.contentType }}</span>
                                        </div>
                                        <div class="timestamp">{{ t('list.updated') }} {{ formatTime(rule.updatedAt) }}</div>
                                    </div>
                                </div>
                                <div class="rule-actions">
                                     <el-switch v-model="rule.enabled" @change="toggleRule(rule)" size="small" />
                                     <div class="action-buttons">
                                        <button class="icon-action" @click="editRule(rule)" :title="t('editor.title_edit')">✎</button>
                                        <button class="icon-action" @click="duplicateRule(rule)" :title="t('dialog.success_dup')">❐</button>
                                        <button class="icon-action delete" @click="deleteRule(rule)" :title="t('sidebar.btn_delete')">🗑</button>
                                     </div>
                                </div>
                            </div>
                         </div>
                     </div>
                 </div>
            </div>

            <!-- Flat View -->
            <div v-else class="rules-list">
             <div 
                v-for="rule in filteredRules" 
                :key="rule.id" 
                class="rule-card" 
                :class="{ 'is-disabled': !rule.enabled }"
             >
                <div class="rule-status-stripe" :class="{ active: rule.enabled }"></div>
                
                <div class="rule-inner">
                    <div class="rule-select">
                        <el-checkbox 
                            :model-value="selectedIds.has(rule.id)"
                            @update:model-value="(val) => handleSelectionChange(rule.id, val)"
                        />
                    </div>
                    
                    <div class="rule-main">
                        <div class="rule-top">
                             <div class="rule-url" :title="rule.urlPattern">{{ rule.urlPattern }}</div>
                        </div>
                        <div class="rule-bottom">
                            <div class="badge-group">
                                <span class="badge method-badge" :title="getMethodsLabel(rule)">{{ getMethodsLabel(rule) }}</span>
                                <span class="badge status-badge" :class="getStatusCodeClass(rule.statusCode)">{{ rule.statusCode }}</span>
                                <span class="badge mode-badge" :class="getInterceptModeClass(rule)">{{ getInterceptModeLabel(rule) }}</span>
                                <span class="badge type-badge">{{ rule.contentType }}</span>
                            </div>
                            <div class="timestamp">{{ t('list.updated') }} {{ formatTime(rule.updatedAt) }}</div>
                        </div>
                    </div>

                    <div class="rule-actions">
                         <el-switch v-model="rule.enabled" @change="toggleRule(rule)" size="small" />
                         <div class="action-buttons">
                            <button class="icon-action" @click="editRule(rule)" :title="t('editor.title_edit')">✎</button>
                            <button class="icon-action" @click="duplicateRule(rule)" :title="t('dialog.success_dup')">❐</button>
                            <button class="icon-action delete" @click="deleteRule(rule)" :title="t('sidebar.btn_delete')">🗑</button>
                         </div>
                    </div>
                </div>
             </div>
          </div>
        </div>
      </el-main>
    </el-container>
    
    <!-- Edit Dialog -->
    <el-dialog 
        v-model="dialogVisible" 
        :title="editingRule.id ? t('editor.title_edit') : t('editor.title_new')" 
        width="900px"
        :close-on-click-modal="false"
        class="custom-dialog"
    >
        <el-form :model="editingRule" label-width="120px" class="edit-form">
            <el-form-item :label="t('editor.label_url')">
                <el-input v-model="editingRule.urlPattern" placeholder="https://api.example.com/v1/users/*" />
                <div class="form-help">{{ t('editor.help_url') }}</div>
            </el-form-item>
             <el-row :gutter="20">
                <el-col :span="12">
                    <el-form-item :label="t('editor.label_status')">
                        <el-input-number v-model="editingRule.statusCode" :min="100" :max="599" style="width: 100%" controls-position="right" />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                     <el-form-item :label="t('editor.label_type')">
                        <el-select
                            v-model="editingRule.contentType"
                            filterable
                            allow-create
                            default-first-option
                            :reserve-keyword="false"
                            placeholder="application/json; charset=utf-8"
                            style="width: 100%"
                        >
                            <el-option
                                v-for="type in CONTENT_TYPES"
                                :key="type"
                                :label="type"
                                :value="type"
                            />
                        </el-select>
                    </el-form-item>
                </el-col>
             </el-row>
            <el-form-item :label="t('editor.label_methods')">
                <el-select
                    v-model="editingRule.methods"
                    multiple
                    collapse-tags
                    collapse-tags-tooltip
                    :placeholder="t('editor.placeholder_methods')"
                    style="width: 100%"
                >
                    <el-option
                        v-for="method in HTTP_METHODS"
                        :key="method"
                        :label="method"
                        :value="method"
                    />
                </el-select>
                <div class="form-help">{{ t('editor.help_methods') }}</div>
            </el-form-item>
            <el-form-item :label="t('editor.label_intercept')">
                <el-radio-group v-model="editingRule.interceptMode" size="small">
                    <el-radio-button label="auto">{{ t('editor.mode_auto') }}</el-radio-button>
                    <el-radio-button label="dnr" :disabled="editingRule.statusCode !== 200">{{ t('editor.mode_dnr') }}</el-radio-button>
                    <el-radio-button label="page">{{ t('editor.mode_page') }}</el-radio-button>
                </el-radio-group>
                <div class="form-help">{{ t('editor.help_intercept') }}</div>
            </el-form-item>
            <el-form-item :label="t('editor.label_enable')">
                <el-switch v-model="editingRule.enabled" />
            </el-form-item>

            <div class="editor-section">
                <div class="editor-toolbar">
                     <span class="editor-label">{{ t('editor.label_body') }}</span>
                     <div class="editor-tools">
                         <el-select v-model="selectedTemplate" :placeholder="t('editor.placeholder_template')" size="small" @change="applyTemplate" style="width: 140px;">
                            <el-option v-for="tpl in TEMPLATES" :key="tpl.id" :label="tpl.name" :value="tpl.id" />
                         </el-select>
                         <el-button size="small" text @click="formatJson(true)">{{ t('editor.btn_format') }}</el-button>
                         <el-button size="small" text @click="formatJson(false)">{{ t('editor.btn_minify') }}</el-button>
                     </div>
                </div>
                 <el-input
                    v-model="editingRule.responseData"
                    :rows="15"
                    type="textarea"
                    class="code-textarea"
                    spellcheck="false"
                  />
                  <div class="json-status" :class="{ error: jsonError }">
                      {{ jsonError ? '❌ ' + jsonError : '✔ ' + t('editor.valid_json') }}
                  </div>
            </div>
        </el-form>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="dialogVisible = false">{{ t('editor.btn_cancel') }}</el-button>
                <el-button type="primary" @click="saveRule">{{ t('editor.btn_save') }}</el-button>
            </span>
        </template>
    </el-dialog>

  </el-container>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

// --- I18n ---
const messages = {
  en: {
    brand: {
      title: 'NetMock',
      subtitle: 'Professional API Mocking',
      status: 'Active Monitoring'
    },
    sidebar: {
      mode: 'INTERCEPTION MODE',
      mode_dnr: 'Network (DNR)',
      mode_page: 'Injected (JS)',
      mode_hint_dnr: 'Network Layer (DNR): Fast, reliable, no page injection.',
      mode_hint_page: 'Injected (JS): Can access window objects, but slower.',
      actions: 'ACTIONS',
      select_all: 'Select All',
      btn_enable: 'Enable',
      btn_disable: 'Disable',
      btn_delete: 'Delete',
      logs: 'LIVE LOGS',
      clear: 'Clear',
      search_logs: 'Filter logs...',
      no_logs: 'No active logs'
    },
    toolbar: {
      total_rules: 'Rules',
      active_rules: 'Active',
      search_placeholder: 'Search URL...',
      new_rule: 'New Rule',
      menu_example: 'Actions',
      export_json: 'Export JSON',
      import_json: 'Import JSON',
      group_by_origin: 'Group by Origin'
    },
    list: {
      no_rules: 'No rules found',
      updated: 'Updated'
    },
    editor: {
      title_new: 'Create New Rule',
      title_edit: 'Edit Rule',
      label_url: 'URL Pattern',
      help_url: 'Supports wildcards (*)',
      label_status: 'Status Code',
      label_type: 'Content Type',
      label_methods: 'Methods',
      placeholder_methods: 'Select request methods',
      help_methods: 'Only requests with selected methods will be mocked. Select multiple methods as needed.',
      label_intercept: 'Intercept Mode',
      mode_auto: 'Auto',
      mode_dnr: 'Network (DNR)',
      mode_page: 'Injected (JS)',
      help_intercept: 'Auto uses DNR for 200 responses and JS injection for non-200 responses.',
      label_enable: 'Enable Rule',
      label_body: 'Response Body',
      placeholder_template: 'Load Template',
      btn_format: 'Format',
      btn_minify: 'Minify',
      valid_json: 'Valid JSON',
      btn_cancel: 'Cancel',
      btn_save: 'Save Rule',
      error_json: 'Invalid JSON',
      error_url_req: 'URL Pattern is required',
      error_body_req: 'Response Data is required',
      error_methods_req: 'Select at least one request method',
      error_dnr_status: 'Network (DNR) mode only supports status 200. Use Auto or Injected (JS).',
      success_saved: 'Rule Saved'
    },
    dialog: {
      confirm_del_sel: 'Are you sure you want to delete selected rules?',
      confirm_del_one: 'Are you sure you want to delete this rule?',
      confirm_title: 'Confirm',
      success_bulk_enable: 'Bulk Enabled Complete',
      success_bulk_disable: 'Bulk Disabled Complete',
      warn_select_first: 'Select rules first',
      success_del_sel: 'Deleted selected rules',
      success_dup: 'Rule duplicated',
      success_del_one: 'Rule deleted',
      success_export: 'Rules exported',
      success_import: 'Imported {n} rules',
      error_import: 'Import failed: '
    },
    templates: {
        success: 'Success (200)',
        empty_list: 'Empty List',
        biz_error: 'Business Error',
        forbidden: 'Forbidden (403)',
        server_error: 'Server Error (500)'
    }
  },
  zh: {
    brand: {
      title: 'NetMock',
      subtitle: '专业 API Mock 工具',
      status: '监控中'
    },
    sidebar: {
      mode: '拦截模式',
      mode_dnr: '网络层 (DNR)',
      mode_page: '注入层 (JS)',
      mode_hint_dnr: '网络层 (DNR): 快速稳定，无页面注入。',
      mode_hint_page: '注入层 (JS): 可访问 Window 对象，较慢。',
      actions: '操作',
      select_all: '全选',
      btn_enable: '启用',
      btn_disable: '禁用',
      btn_delete: '删除',
      logs: '实时日志',
      clear: '清空',
      search_logs: '过滤日志...',
      no_logs: '暂无日志'
    },
    toolbar: {
      total_rules: '规则数',
      active_rules: '已启用',
      search_placeholder: '搜索 URL...',
      new_rule: '新建规则',
      menu_example: '操作',
      export_json: '导出 JSON',
      import_json: '导入 JSON',
      group_by_origin: '按域名分组'
    },
    list: {
      no_rules: '未找到规则',
      updated: '更新于'
    },
    editor: {
      title_new: '新建规则',
      title_edit: '编辑规则',
      label_url: 'URL 模式',
      help_url: '支持通配符 (*)',
      label_status: '状态码',
      label_type: 'Content-Type',
      label_methods: '请求方法',
      placeholder_methods: '选择请求方法',
      help_methods: '只有选中的请求方法会被 Mock，可多选。',
      label_intercept: '拦截方式',
      mode_auto: '自动',
      mode_dnr: '网络层 (DNR)',
      mode_page: '注入层 (JS)',
      help_intercept: '自动模式下，200 响应用 DNR，非 200 响应用 JS 注入以保留状态码。',
      label_enable: '启用规则',
      label_body: '响应内容',
      placeholder_template: '加载模板',
      btn_format: '格式化',
      btn_minify: '压缩',
      valid_json: 'JSON 格式正确',
      btn_cancel: '取消',
      btn_save: '保存',
      error_json: 'JSON 格式错误',
      error_url_req: '请输入 URL 模式',
      error_body_req: '请输入响应内容',
      error_methods_req: '请至少选择一个请求方法',
      error_dnr_status: '网络层 (DNR) 只能保留 200 状态码，请选择自动或注入层 (JS)。',
      success_saved: '保存成功'
    },
    dialog: {
      confirm_del_sel: '确定要删除选中的规则吗？',
      confirm_del_one: '确定要删除此规则吗？',
      confirm_title: '提示',
      success_bulk_enable: '批量启用完成',
      success_bulk_disable: '批量禁用完成',
      warn_select_first: '请先选择规则',
      success_del_sel: '已删除选中规则',
      success_dup: '规则已复制',
      success_del_one: '规则已删除',
      success_export: '导出成功',
      success_import: '成功导入 {n} 条规则',
      error_import: '导入失败: '
    },
    templates: {
        success: '成功响应 (200)',
        empty_list: '空列表',
        biz_error: '业务错误 (400)',
        forbidden: '无权限 (403)',
        server_error: '服务异常 (500)'
    }
  }
};

const lang = ref('en');
const browserLang = navigator.language || 'en';
if (browserLang.toLowerCase().includes('zh')) {
    lang.value = 'zh';
}

const t = (path) => {
    const keys = path.split('.');
    let obj = messages[lang.value];
    for (const k of keys) {
        if (!obj) return path;
        obj = obj[k];
    }
    return obj || path;
};

// --- Constants ---
const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];
const DEFAULT_METHODS = HTTP_METHODS.slice();

const CONTENT_TYPES = [
  'application/json; charset=utf-8',
  'application/json',
  'text/plain; charset=utf-8',
  'text/html; charset=utf-8',
  'text/css; charset=utf-8',
  'application/javascript; charset=utf-8',
  'application/xml; charset=utf-8',
  'text/xml; charset=utf-8',
  'application/x-www-form-urlencoded; charset=utf-8',
  'multipart/form-data',
  'application/octet-stream',
  'image/svg+xml',
  'image/png',
  'image/jpeg'
];

const TEMPLATES = computed(() => [
  { id: 'success', name: t('templates.success'), statusCode: 200, contentType: 'application/json; charset=utf-8', body: { status: 'success', data: {}, message: 'ok' } },
  { id: 'empty-list', name: t('templates.empty_list'), statusCode: 200, contentType: 'application/json; charset=utf-8', body: { status: 'success', data: [], total: 0 } },
  { id: 'biz-error', name: t('templates.biz_error'), statusCode: 400, contentType: 'application/json; charset=utf-8', body: { error: true, code: 'BUSINESS_ERROR', message: 'error' } },
  { id: 'forbidden', name: t('templates.forbidden'), statusCode: 403, contentType: 'application/json; charset=utf-8', body: { error: true, code: 'FORBIDDEN', message: 'access denied' } },
  { id: 'server-error', name: t('templates.server_error'), statusCode: 500, contentType: 'application/json; charset=utf-8', body: { error: true, code: 'SERVER_ERROR', message: 'server error' } }
]);

// --- State ---
const overrideMode = ref('dnr');
const debugMode = ref(false);
const importStrategy = ref('append');
const rules = ref([]);
const logs = ref([]);
const selectedIds = ref(new Set());
const dialogVisible = ref(false);
const fileInput = ref(null);
const selectedTemplate = ref('');
const groupByOrigin = ref(true);
const collapsedGroups = reactive(new Set());

// Filters & Sort
const filters = reactive({
    url: '',
    status: 'all',
    contentType: '',
    statusCode: ''
});
const sort = reactive({
    field: 'manual',
    dir: 'desc'
});
const logFilter = ref('');

// Editing
const editingRule = reactive({
    id: null,
    urlPattern: '',
    statusCode: 200,
    contentType: 'application/json; charset=utf-8',
    methods: DEFAULT_METHODS.slice(),
    interceptMode: 'auto',
    enabled: true,
    responseData: ''
});
const jsonError = ref('');

// --- Computed ---
const modeHint = computed(() => {
    return overrideMode.value === 'dnr' 
        ? t('sidebar.mode_hint_dnr')
        : t('sidebar.mode_hint_page');
});

const filteredRules = computed(() => {
    let list = rules.value.filter(rule => {
        if (filters.url && !rule.urlPattern.toLowerCase().includes(filters.url.toLowerCase())) return false;
        if (filters.status === 'enabled' && !rule.enabled) return false;
        if (filters.status === 'disabled' && rule.enabled) return false;
        if (filters.contentType && !rule.contentType.toLowerCase().includes(filters.contentType.toLowerCase())) return false;
        if (filters.statusCode && String(rule.statusCode) !== filters.statusCode) return false;
        return true;
    });

    if (sort.field !== 'manual') {
        const dir = sort.dir === 'asc' ? 1 : -1;
        list = list.slice().sort((a, b) => {
            const av = a[sort.field] ?? 0;
            const bv = b[sort.field] ?? 0;
            if (typeof av === 'string' || typeof bv === 'string') {
                return String(av).localeCompare(String(bv)) * dir;
            }
            return (av - bv) * dir;
        });
    }
    return list;
});

const groupedRules = computed(() => {
    const groups = {};
    const wildCardLabel = lang.value === 'zh' ? '全局 / 其他' : 'Global / Other';
    
    filteredRules.value.forEach(rule => {
        let origin = wildCardLabel;
        try {
            // Match protocol://domain...
            // Be tolerant of wildcards in protocol like *://
            const match = rule.urlPattern.match(/^(\*|[a-z0-9]+):\/\/([^\/]+)/i);
            if (match && match[2]) {
                const domain = match[2];
                // if domain contains *, it's still kind of a domain grouping but weird. 
                // Let's group by it anyway if it looks distinct
                origin = domain;
            }
        } catch {} // Fallback
        
        if (!groups[origin]) groups[origin] = [];
        groups[origin].push(rule);
    });

    return Object.keys(groups).sort().map(key => ({
        name: key,
        rules: groups[key]
    }));
});

const enabledCount = computed(() => rules.value.filter(r => r.enabled).length);
const selectAll = computed({
    get: () => filteredRules.value.length > 0 && Array.from(selectedIds.value).length >= filteredRules.value.length,
    set: (val) => { /* handled by handleSelectAll */ } 
});

const filteredLogs = computed(() => {
    const f = logFilter.value.trim().toLowerCase();
    if (!f) return logs.value;
    return logs.value.filter(log => {
        const target = `${log.url || ''} ${log.ruleId || ''} ${log.source || ''}`.toLowerCase();
        return target.includes(f);
    });
});

// --- Lifecycle ---
onMounted(async () => {
    await loadSettings();
    await loadRules();
    
    // Listeners
    if (chrome && chrome.storage) {
        chrome.storage.onChanged.addListener((changes, namespace) => {
            if (namespace !== 'local') return;
            if (changes.responseOverrideRules) {
                rules.value = normalizeRules(changes.responseOverrideRules.newValue || []);
            }
            if (changes.overrideMode) {
                overrideMode.value = changes.overrideMode.newValue || 'dnr';
            }
            if (changes.debugMode) {
                debugMode.value = !!changes.debugMode.newValue;
            }
        });
    }
    
    if (chrome && chrome.runtime) {
        chrome.runtime.onMessage.addListener((message) => {
            if (message.type === 'LOGS_UPDATED') {
                logs.value = message.logs || [];
            }
        });
        // Initial Fetch Logs
        refreshLogs();
    }
});

// --- Methods ---

const getStatusCodeClass = (code) => {
    const c = parseInt(code);
    if (c >= 200 && c < 300) return 'status-2xx';
    if (c >= 300 && c < 400) return 'status-3xx';
    if (c >= 400 && c < 500) return 'status-4xx';
    if (c >= 500) return 'status-5xx';
    return '';
};

const getEffectiveInterceptMode = (rule) => {
    if (overrideMode.value === 'page') return 'page';
    if (rule.interceptMode === 'page') return 'page';
    if ((parseInt(rule.statusCode, 10) || 200) !== 200) return 'page';
    return 'dnr';
};

const getInterceptModeLabel = (rule) => {
    return getEffectiveInterceptMode(rule) === 'page' ? t('editor.mode_page') : t('editor.mode_dnr');
};

const getInterceptModeClass = (rule) => {
    return getEffectiveInterceptMode(rule) === 'page' ? 'mode-page' : 'mode-dnr';
};

const getRuleMethods = (rule) => {
    const methods = Array.isArray(rule.methods) ? rule.methods : DEFAULT_METHODS;
    const normalized = methods
        .map(method => String(method || '').toUpperCase())
        .filter(method => HTTP_METHODS.includes(method));
    return normalized.length > 0 ? normalized : DEFAULT_METHODS;
};

const getMethodsLabel = (rule) => {
    const methods = getRuleMethods(rule);
    return methods.length === HTTP_METHODS.length ? 'ALL' : methods.join('/');
};

// Initialization
const loadSettings = async () => {
    if (!chrome || !chrome.storage) return;
    const result = await chrome.storage.local.get(['overrideMode', 'debugMode', 'importStrategy', 'groupByOrigin']);
    overrideMode.value = result.overrideMode || 'dnr';
    debugMode.value = !!result.debugMode;
    importStrategy.value = result.importStrategy || 'append';
    // Default groupByOrigin to true if undefined
    groupByOrigin.value = result.groupByOrigin !== false;
};

const loadRules = async () => {
    if (!chrome || !chrome.storage) return;
    const result = await chrome.storage.local.get(['responseOverrideRules']);
    rules.value = normalizeRules(result.responseOverrideRules || []);
};

const saveStorageRules = async () => {
    if (!chrome || !chrome.storage) return;
    await chrome.storage.local.set({ responseOverrideRules: JSON.parse(JSON.stringify(rules.value)) });
    chrome.runtime.sendMessage({ type: 'UPDATE_RULES', rules: rules.value }, () => {});
};

const checkJson = () => {
    if (!editingRule.contentType.toLowerCase().includes('json')) {
        jsonError.value = '';
        return;
    }
    try {
        JSON.parse(editingRule.responseData);
        jsonError.value = '';
    } catch (e) {
        jsonError.value = e.message;
    }
};
watch(() => editingRule.responseData, checkJson);
watch(() => editingRule.statusCode, (val) => {
    if ((parseInt(val, 10) || 200) !== 200 && editingRule.interceptMode === 'dnr') {
        editingRule.interceptMode = 'auto';
    }
});
watch(groupByOrigin, (val) => {
    if (chrome && chrome.storage) {
        chrome.storage.local.set({ groupByOrigin: val });
    }
});


// Actions
const handleModeChange = (val) => {
    if (chrome && chrome.storage) {
        chrome.storage.local.set({ overrideMode: val });
        chrome.runtime.sendMessage({ type: 'SET_OVERRIDE_MODE', mode: val }, () => {});
    }
};

const handleDebugChange = (val) => {
    if (chrome && chrome.storage) {
        chrome.storage.local.set({ debugMode: val });
    }
};

const saveSettings = () => {
    if (chrome && chrome.storage) {
         chrome.storage.local.set({ importStrategy: importStrategy.value });
    }
}

const refreshLogs = () => {
    if (chrome && chrome.runtime) {
        chrome.runtime.sendMessage({ type: 'GET_LOGS' }, (response) => {
            if (response && response.success) {
                logs.value = response.logs || [];
            }
        });
    }
};

const clearLogs = () => {
    if (chrome && chrome.runtime) {
        chrome.runtime.sendMessage({ type: 'CLEAR_LOGS' }, () => {
            logs.value = [];
        });
    }
};

const handleSelectAll = (val) => {
    if (val) {
        filteredRules.value.forEach(r => selectedIds.value.add(r.id));
    } else {
        filteredRules.value.forEach(r => selectedIds.value.delete(r.id));
    }
};

const handleSelectionChange = (id, checked) => {
    if (checked) {
        selectedIds.value.add(id);
    } else {
        selectedIds.value.delete(id);
    }
};

const bulkEnable = () => bulkToggle(true);
const bulkDisable = () => bulkToggle(false);

const bulkToggle = (enabled) => {
    if (selectedIds.value.size === 0) return ElMessage.warning(t('dialog.warn_select_first'));
    
    rules.value.forEach(rule => {
        if (selectedIds.value.has(rule.id)) {
            rule.enabled = enabled;
            rule.updatedAt = Date.now();
        }
    });
    saveStorageRules();
    ElMessage.success(enabled ? t('dialog.success_bulk_enable') : t('dialog.success_bulk_disable'));
};

const bulkDelete = async () => {
    if (selectedIds.value.size === 0) return ElMessage.warning(t('dialog.warn_select_first'));
    try {
        await ElMessageBox.confirm(t('dialog.confirm_del_sel'), t('dialog.confirm_title'), { type: 'warning' });
        rules.value = rules.value.filter(rule => !selectedIds.value.has(rule.id));
        selectedIds.value.clear();
        saveStorageRules();
        ElMessage.success(t('dialog.success_del_sel'));
    } catch { }
};

const openAddDialog = () => {
    resetEditor();
    dialogVisible.value = true;
};

const editRule = (rule) => {
    Object.assign(editingRule, JSON.parse(JSON.stringify(rule)));
    jsonError.value = '';
    dialogVisible.value = true;
};

const toggleRule = (rule) => {
    // rule.enabled is already toggled by v-model
    rule.updatedAt = Date.now();
    saveStorageRules();
};

const duplicateRule = (rule) => {
    const copy = {
        ...rule,
        id: generateId(),
        enabled: true,
        createdAt: Date.now(),
        updatedAt: Date.now()
    };
    rules.value.unshift(copy);
    reassignPriorities();
    saveStorageRules();
    ElMessage.success(t('dialog.success_dup'));
};

const deleteRule = async (rule) => {
    try {
        await ElMessageBox.confirm(t('dialog.confirm_del_one'), t('dialog.confirm_title'), { type: 'warning' });
        rules.value = rules.value.filter(r => r.id !== rule.id);
        selectedIds.value.delete(rule.id);
        saveStorageRules();
        ElMessage.success(t('dialog.success_del_one'));
    } catch { }
};

const saveRule = () => {
    if (!editingRule.urlPattern) return ElMessage.error(t('editor.error_url_req'));
    if (!editingRule.responseData) return ElMessage.error(t('editor.error_body_req'));
    if (!Array.isArray(editingRule.methods) || editingRule.methods.length === 0) return ElMessage.error(t('editor.error_methods_req'));
    if (jsonError.value) return ElMessage.error(t('editor.error_json'));
    if (editingRule.interceptMode === 'dnr' && (parseInt(editingRule.statusCode, 10) || 200) !== 200) {
        return ElMessage.error(t('editor.error_dnr_status'));
    }

    const now = Date.now();
    const finalRule = { ...editingRule, updatedAt: now };
    
    if (finalRule.id) {
        const index = rules.value.findIndex(r => r.id === finalRule.id);
        if (index !== -1) {
            rules.value[index] = finalRule;
        }
    } else {
        finalRule.id = generateId();
        finalRule.createdAt = now;
        rules.value.unshift(finalRule);
        reassignPriorities();
    }
    
    saveStorageRules();
    dialogVisible.value = false;
    ElMessage.success(t('editor.success_saved'));
};

const resetEditor = () => {
    Object.assign(editingRule, {
        id: null,
        urlPattern: '',
        statusCode: 200,
        contentType: 'application/json; charset=utf-8',
        methods: DEFAULT_METHODS.slice(),
        interceptMode: 'auto',
        enabled: true,
        responseData: '{\n  "status": "success",\n  "data": {}\n}'
    });
    jsonError.value = '';
    selectedTemplate.value = '';
};

const applyTemplate = () => {
    const tpl = TEMPLATES.value.find(x => x.id === selectedTemplate.value);
    if (!tpl) return;
    editingRule.statusCode = tpl.statusCode;
    editingRule.contentType = tpl.contentType;
    editingRule.responseData = JSON.stringify(tpl.body, null, 2);
    checkJson();
};

const formatJson = (pretty) => {
    try {
        const parsed = JSON.parse(editingRule.responseData);
        editingRule.responseData = JSON.stringify(parsed, null, pretty ? 2 : 0);
        checkJson();
    } catch (e) {
        ElMessage.error(t('editor.error_json'));
    }
};

// Import / Export
const exportRules = () => {
    const dataStr = JSON.stringify(rules.value, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `netmock-rules-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    ElMessage.success(t('dialog.success_export'));
};

const triggerImport = () => {
    fileInput.value.click();
};

const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const incoming = JSON.parse(e.target.result);
            if (!Array.isArray(incoming)) throw new Error('Format must be an array');
            const normalized = normalizeRules(incoming);
            
            if (importStrategy.value === 'overwrite') {
                rules.value = normalized;
            } else if (importStrategy.value === 'dedupe') {
                 // Simple dedupe by URL pattern
                 const existingUrls = new Set(rules.value.map(r => r.urlPattern));
                 normalized.forEach(r => {
                     if (!existingUrls.has(r.urlPattern)) rules.value.push(r);
                 });
            } else {
                rules.value = rules.value.concat(normalized);
            }
            
            await saveStorageRules();
            ElMessage.success(t('dialog.success_import').replace('{n}', normalized.length));
        } catch (err) {
            ElMessage.error(t('dialog.error_import') + err.message);
        }
    };
    reader.readAsText(file);
    event.target.value = ''; 
};


// Utils settings
const normalizeRules = (list) => {
    const now = Date.now();
    return (Array.isArray(list) ? list : []).map(rule => ({
        id: rule.id || generateId(),
        urlPattern: rule.urlPattern || '',
        responseData: typeof rule.responseData === 'string' ? rule.responseData : JSON.stringify(rule.responseData || {}),
        statusCode: parseInt(rule.statusCode, 10) || 200,
        contentType: rule.contentType || 'application/json; charset=utf-8',
        methods: normalizeMethods(rule.methods),
        interceptMode: ['auto', 'dnr', 'page'].includes(rule.interceptMode) ? rule.interceptMode : 'auto',
        enabled: rule.enabled !== false,
        priority: rule.priority || 1,
        createdAt: rule.createdAt || now,
        updatedAt: rule.updatedAt || now
    }));
};

const normalizeMethods = (methods) => {
    if (!Array.isArray(methods)) return DEFAULT_METHODS.slice();
    const normalized = Array.from(new Set(methods
        .map(method => String(method || '').toUpperCase())
        .filter(method => HTTP_METHODS.includes(method))));
    return normalized.length > 0 ? normalized : DEFAULT_METHODS.slice();
};

const generateId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;

const reassignPriorities = () => {
    rules.value.forEach((r, i) => r.priority = rules.value.length - i);
};

const formatTime = (ts) => {
    if (!ts) return '-';
    // Use simple date string
    const d = new Date(ts);
    return `${d.getMonth()+1}/${d.getDate()} ${d.getHours()}:${d.getMinutes().toString().padStart(2,'0')}`;
};

const resetFilters = () => {
    filters.url = '';
    filters.status = 'all';
    filters.contentType = '';
    filters.statusCode = '';
    sort.field = 'manual';
    sort.dir = 'desc';
};

const toggleGroup = (groupName) => {
    if (collapsedGroups.has(groupName)) {
        collapsedGroups.delete(groupName);
    } else {
        collapsedGroups.add(groupName);
    }
};

</script>

<style scoped>
/* --- Global & Fonts --- */
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Inter:wght@400;500;600;700&display=swap');

.app-container {
  height: 100vh;
  width: 100vw;
  display: flex;
  font-family: 'Inter', -apple-system, sans-serif;
  color: #0f172a;
  background: #f8fafc;
}

/* --- Sidebar --- */
.sidebar {
  background-color: #0f172a; /* Slate 900 */
  display: flex;
  flex-direction: column;
  padding: 24px;
  overflow-y: auto;
  color: #e2e8f0;
  border-right: 1px solid #1e293b;
}

.brand {
    margin-bottom: 40px;
}
.brand-title {
    font-size: 18px;
    font-weight: 700;
    color: white;
    letter-spacing: -0.5px;
    margin-bottom: 4px;
    background: linear-gradient(to right, #60a5fa, #c084fc);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}
.brand-sub {
    font-size: 11px;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 12px;
}
.status-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    background: rgba(16, 185, 129, 0.1);
    border: 1px solid rgba(16, 185, 129, 0.2);
    border-radius: 20px;
    width: fit-content;
}
.status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: #10b981;
    box-shadow: 0 0 8px rgba(16, 185, 129, 0.6);
}
.status-text {
    font-size: 11px;
    color: #10b981;
    font-weight: 600;
}

/* Panels */
.sidebar .panel {
    margin-bottom: 32px;
}
.sidebar .panel-title {
    font-size: 11px;
    font-weight: 700;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

/* Mode Switch */
.sidebar :deep(.el-radio-group) {
    width: 100%;
}
.sidebar :deep(.el-radio-button__inner) {
    width: 100%;
    background: #1e293b;
    border-color: #334155;
    color: #94a3b8;
    box-shadow: none !important;
}
.sidebar :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
    background: #2563eb;
    border-color: #2563eb;
    color: white;
}
.mode-hint {
    font-size: 11px;
    line-height: 1.4;
    color: #64748b;
    margin-top: 8px;
}

/* Bulk Actions */
.bulk-actions-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 8px;
}
.bulk-actions-grid :deep(.el-button) {
    padding: 8px;
    margin: 0;
}
.sidebar :deep(.el-checkbox__label) {
    color: #cbd5e1;
}

/* Debug / Logs */
.log-controls {
    display: flex;
    gap: 8px;
    align-items: center;
}
.clear-btn {
    padding: 0;
    font-size: 11px;
    color: #ef4444;
}
.log-filter :deep(.el-input__wrapper) {
    background: #1e293b;
    box-shadow: none;
    border: 1px solid #334155;
    height: 28px;
}
.log-filter :deep(.el-input__inner) {
    color: white;
    font-size: 12px;
}

.log-list {
    margin-top: 12px;
    height: 250px;
    overflow-y: auto;
    background: #020617;
    border: 1px solid #1e293b;
    border-radius: 6px;
    padding: 4px;
}
.log-item {
    padding: 8px;
    border-bottom: 1px solid #1e293b;
    transition: background 0.2s;
}
.log-item:hover {
    background: rgba(255,255,255,0.03);
}
.log-row-1 {
    display: flex;
    justify-content: space-between;
    margin-bottom: 4px;
}
.method-tag {
    font-size: 9px;
    font-weight: 700;
    padding: 1px 4px;
    border-radius: 3px;
    color: #fff;
}
.method-tag.GET { background: #3b82f6; }
.method-tag.POST { background: #10b981; }
.method-tag.PUT { background: #eab308; }
.method-tag.DELETE { background: #ef4444; }

.log-time {
    font-size: 10px;
    color: #64748b;
    font-family: 'JetBrains Mono', monospace;
}
.log-url {
    font-size: 11px;
    color: #e2e8f0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 4px;
    font-family: 'JetBrains Mono', monospace;
}
.log-meta {
    font-size: 10px;
    color: #f59e0b;
}
.log-empty {
    text-align: center;
    color: #475569;
    font-size: 12px;
    padding-top: 40px;
}

/* --- Main Content --- */
.main-wrapper {
    background: #f8fafc;
    flex-direction: column;
}
.toolbar {
    height: 72px;
    background: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 32px;
    border-bottom: 1px solid #e2e8f0;
}
.stat-item {
    text-align: center;
    position: relative;
    top: 2px;
}
.stat-value {
    font-size: 18px;
    font-weight: 700;
    color: #0f172a;
    line-height: 1;
}
.stat-total {
    font-size: 12px;
    color: #94a3b8;
    font-weight: 500;
    margin-left: 2px;
}
.stat-value.success { color: #10b981; }
.stat-label {
    font-size: 11px;
    color: #64748b;
    font-weight: 500;
    margin-top: 4px;
    text-transform: uppercase;
}
.stat-divider {
    width: 1px;
    height: 32px;
    background: #e2e8f0;
    margin: 0 24px;
}
.toolbar-left { display: flex; align-items: center; }

.search-input {
    width: 280px;
}
.create-btn {
    font-weight: 600;
    padding: 10px 20px;
    height: auto;
    border-radius: 8px;
}
.icon-btn {
    padding: 10px;
    height: auto;
    border-radius: 8px;
    margin-right: 8px;
}
.custom-icon {
    font-size: 16px;
    line-height: 1;
}
.toolbar-actions { display: flex; gap: 8px; align-items: center; }

.main-content {
    padding: 24px 32px;
    overflow-y: auto;
}

/* Rule Card */
.rule-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    margin-bottom: 12px;
    border: 1px solid #e2e8f0;
    display: flex;
    overflow: hidden; /* for stripe */
    transition: all 0.2s;
    height: 90px; /* Fixed height for consistency */
}
.rule-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05);
}
.rule-status-stripe {
    width: 4px;
    background: #cbd5e1;
    transition: background 0.3s;
}
.rule-status-stripe.active {
    background: #10b981;
}
.rule-inner {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    padding: 0 20px;
    gap: 16px;
}
.rule-select {
    flex: 0 0 auto;
}
.rule-main {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 8px;
}
.rule-url {
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px;
    font-weight: 600;
    color: #1e293b;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.rule-bottom {
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 12px;
}
.badge-group {
    min-width: 0;
    display: flex;
    gap: 6px;
    overflow: hidden;
}
.badge {
    min-width: 0;
    max-width: 220px;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
    background: #f1f5f9;
    color: #475569;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.method-badge,
.status-badge,
.mode-badge {
    flex: 0 0 auto;
}
.method-badge {
    max-width: 140px;
}
.type-badge {
    flex: 1 1 auto;
}
.status-badge.status-2xx { background: #dcfce7; color: #15803d; }
.status-badge.status-4xx { background: #fee2e2; color: #b91c1c; }
.status-badge.status-5xx { background: #fef2f2; color: #991b1b; }
.mode-badge.mode-dnr { background: #dbeafe; color: #1d4ed8; }
.mode-badge.mode-page { background: #fef3c7; color: #92400e; }

.timestamp {
    flex: 0 0 auto;
    font-size: 11px;
    color: #94a3b8;
    margin-left: auto; /* push to right of main area */
}

.rule-actions {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    gap: 20px;
    padding-left: 20px;
    border-left: 1px solid #f1f5f9;
}
.action-buttons {
    flex: 0 0 auto;
    display: flex;
    gap: 6px;
}
.icon-action {
    background: none;
    border: none;
    cursor: pointer;
    padding: 6px;
    border-radius: 4px;
    color: #64748b;
    font-size: 16px;
    transition: all 0.2s;
}
.icon-action:hover {
    background: #f1f5f9;
    color: #0f172a;
}
.icon-action.delete:hover {
    background: #fee2e2;
    color: #ef4444;
}

/* Disabled State */
.rule-card.is-disabled {
    opacity: 0.7;
    background: #f8fafc;
}
.rule-card.is-disabled .rule-url {
    color: #94a3b8;
}

/* Dialog */
.code-textarea :deep(.el-textarea__inner) {
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    line-height: 1.5;
    background: #1e293b;
    color: #e2e8f0;
    border-color: #334155;
    padding: 16px;
}
.json-status {
    font-size: 12px;
    color: #10b981;
    margin-top: 8px;
    font-weight: 600;
}
.json-status.error {
    color: #ef4444;
}
.form-help {
    font-size: 11px;
    color: #94a3b8;
    margin-top: 4px;
}
.editor-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}
.editor-label {
    font-size: 13px;
    font-weight: 600;
    color: #334155;
}
.editor-tools {
    display: flex;
    gap: 8px;
    align-items: center;
}

/* Grouped View Styles */
.group-section {
    margin-bottom: 24px;
}
.group-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    padding-left: 4px;
    cursor: pointer;
    user-select: none;
}
.group-toggle-icon {
    font-size: 10px;
    color: #94a3b8;
    transition: transform 0.2s;
}
.group-toggle-icon.collapsed {
    transform: rotate(-90deg);
}
.group-icon {
    font-size: 16px;
}
.group-name {
    font-size: 14px;
    font-weight: 700;
    color: #334155;
    font-family: 'JetBrains Mono', monospace;
}
.group-count {
    background: #e2e8f0;
    color: #64748b;
    font-size: 10px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 10px;
}

</style>
