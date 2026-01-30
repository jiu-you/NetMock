// 存储规则
let responseOverrideRules = [];

// 调试模式日志输出
function isDebugEnabled() {
    try { return window.localStorage.getItem('__debugMode') === 'true'; } catch (_) { return false; }
}
function debugLog(...args) {
    if (isDebugEnabled()) {
        console.log(...args);
    }
}

function shouldBypassContentOverride() {
    try { return window.localStorage.getItem('__useDNRRedirect') === 'true'; } catch (_) { return false; }
}

// 初始化
(async function() {
    try {
        await loadRules();
        injectPageScript();
        syncRulesToPage();
        setupInterceptors();
        loadSettings();

        chrome.runtime.sendMessage({ type: 'CONTENT_SCRIPT_LOADED' }, () => {});
    } catch (error) {
        console.error('内容脚本初始化失败:', error);
    }
})();

// 注入页面级脚本
function injectPageScript() {
    try {
        const s = document.createElement('script');
        s.src = chrome.runtime.getURL('src/injected.js');
        s.onload = function() { this.remove(); };
        (document.head || document.documentElement).appendChild(s);
    } catch (e) {
        console.error('注入页面脚本失败:', e);
    }
}

// 将规则同步到页面上下文
function syncRulesToPage() {
    try {
        const evt = new CustomEvent('RESOURCE_OVERRIDE_RULES', { detail: { rules: responseOverrideRules } });
        window.dispatchEvent(evt);
    } catch (e) {
        console.error('同步规则到页面失败:', e);
    }
}

function setLocalFlag(key, value) {
    try { window.localStorage.setItem(key, value ? 'true' : 'false'); } catch (_) {}
}

function setLocalValue(key, value) {
    try { window.localStorage.setItem(key, String(value || '')); } catch (_) {}
}

// 读取设置到页面上下文
function loadSettings() {
    chrome.storage.local.get(['useDNRRedirect', 'debugMode', 'overrideMode'], ({ useDNRRedirect, debugMode, overrideMode }) => {
        setLocalFlag('__useDNRRedirect', !!useDNRRedirect);
        setLocalFlag('__debugMode', !!debugMode);
        setLocalValue('__overrideMode', overrideMode || 'dnr');
    });
}

// 从存储中加载规则
async function loadRules() {
    try {
        const result = await chrome.storage.local.get(['responseOverrideRules']);
        responseOverrideRules = result.responseOverrideRules || [];
    } catch (error) {
        console.error('加载规则失败:', error);
        responseOverrideRules = [];
    }
}

// 监听存储变化
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.responseOverrideRules) {
        responseOverrideRules = changes.responseOverrideRules.newValue || [];
        syncRulesToPage();
    }
    if (namespace === 'local' && changes.useDNRRedirect) {
        setLocalFlag('__useDNRRedirect', !!changes.useDNRRedirect.newValue);
    }
    if (namespace === 'local' && changes.debugMode) {
        setLocalFlag('__debugMode', !!changes.debugMode.newValue);
    }
    if (namespace === 'local' && changes.overrideMode) {
        setLocalValue('__overrideMode', changes.overrideMode.newValue || 'dnr');
    }
});

// 监听来自页面的日志消息
window.addEventListener('message', (event) => {
    if (event.source !== window) return;
    const data = event.data;
    if (!data || data.source !== 'resource-override' || data.type !== 'LOG_EVENT') return;
    chrome.runtime.sendMessage({ type: 'LOG_EVENT', payload: data.payload }, () => {});
});

// 检查URL是否匹配模式
function matchUrlPattern(url, pattern) {
    try {
        if (pattern.includes('*') || pattern.includes('?')) {
            const regexPattern = pattern
                .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
                .replace(/\\\*/g, '.*')
                .replace(/\\\?/g, '.');
            const regex = new RegExp(`^${regexPattern}$`, 'i');
            return regex.test(url);
        }
        return url.toLowerCase().includes(pattern.toLowerCase());
    } catch (error) {
        console.error('URL匹配失败:', error);
        return false;
    }
}

// 查找匹配的规则
function findMatchingRule(url) {
    const matchingRule = responseOverrideRules.find(rule =>
        rule.enabled && matchUrlPattern(url, rule.urlPattern)
    );
    if (matchingRule) {
        debugLog('找到匹配规则:', url, matchingRule);
    }
    return matchingRule;
}

// 创建模拟响应
function createMockResponse(rule) {
    try {
        const responseData = rule.responseData;
        const contentType = rule.contentType || 'application/json; charset=utf-8';
        if (contentType.includes('application/json')) {
            return new Response(responseData, {
                status: rule.statusCode || 200,
                statusText: 'OK',
                headers: {
                    'Content-Type': contentType,
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                    'x-response-override': 'true'
                }
            });
        }
        if (contentType.includes('text/')) {
            return new Response(responseData, {
                status: rule.statusCode || 200,
                statusText: 'OK',
                headers: {
                    'Content-Type': contentType,
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                    'x-response-override': 'true'
                }
            });
        }
        const blob = new Blob([responseData], { type: contentType });
        return new Response(blob, {
            status: rule.statusCode || 200,
            statusText: 'OK',
            headers: {
                'Content-Type': contentType,
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'x-response-override': 'true'
            }
        });
    } catch (error) {
        console.error('创建模拟响应失败:', error);
        return null;
    }
}

// 设置拦截器（内容脚本保留作为兜底）
function setupInterceptors() {
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
        if (shouldBypassContentOverride()) {
            return originalFetch.apply(this, args);
        }
        const url = typeof args[0] === 'string' ? args[0] : (args[0] && (args[0].url || args[0].toString()));
        const matchingRule = url && findMatchingRule(url);
        if (matchingRule) {
            debugLog('拦截fetch请求(内容脚本兜底):', url, '匹配规则:', matchingRule);
            const mockResponse = createMockResponse(matchingRule);
            if (mockResponse) return mockResponse;
        }
        return originalFetch.apply(this, args);
    };

    const originalXHROpen = XMLHttpRequest.prototype.open;
    const originalXHRSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.open = function(method, url, ...args) {
        this._method = method;
        this._url = url;
        return originalXHROpen.apply(this, [method, url, ...args]);
    };
    XMLHttpRequest.prototype.send = function(data) {
        if (shouldBypassContentOverride()) {
            return originalXHRSend.apply(this, [data]);
        }
        const matchingRule = this._url && findMatchingRule(this._url);
        if (matchingRule) {
            debugLog('拦截XMLHttpRequest请求(内容脚本兜底):', this._url, '匹配规则:', matchingRule);
            setTimeout(() => {
                try {
                    this.status = matchingRule.statusCode || 200;
                    this.statusText = 'OK';
                    this.responseText = matchingRule.responseData;
                    this.response = matchingRule.responseData;
                    this.getAllResponseHeaders = function() {
                        return `content-type: ${matchingRule.contentType}\r\naccess-control-allow-origin: *\r\naccess-control-allow-methods: GET, POST, PUT, DELETE, OPTIONS\r\naccess-control-allow-headers: Content-Type, Authorization\r\nx-response-override: true`;
                    };
                    this.getResponseHeader = function(name) {
                        const headers = {
                            'content-type': matchingRule.contentType,
                            'access-control-allow-origin': '*',
                            'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
                            'access-control-allow-headers': 'Content-Type, Authorization',
                            'x-response-override': 'true'
                        };
                        return headers[name.toLowerCase()] || null;
                    };
                    this.readyState = 4;
                    this.dispatchEvent(new Event('readystatechange'));
                    this.dispatchEvent(new Event('load'));
                    this.dispatchEvent(new Event('loadend'));
                } catch (error) {
                    console.error('XMLHttpRequest拦截失败:', error);
                    return originalXHRSend.apply(this, [data]);
                }
            }, 0);
            return;
        }
        return originalXHRSend.apply(this, [data]);
    };

    if (window.axios && window.axios.request) {
        const originalAxiosRequest = window.axios.request;
        window.axios.request = function(config) {
            if (shouldBypassContentOverride()) {
                return originalAxiosRequest.apply(this, arguments);
            }
            const url = config.url || config;
            const matchingRule = url && findMatchingRule(url);
            if (matchingRule) {
                debugLog('拦截axios请求(内容脚本兜底):', url, '匹配规则:', matchingRule);
                try {
                    return Promise.resolve({
                        data: JSON.parse(matchingRule.responseData),
                        status: matchingRule.statusCode || 200,
                        statusText: 'OK',
                        headers: {
                            'content-type': matchingRule.contentType,
                            'access-control-allow-origin': '*',
                            'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
                            'access-control-allow-headers': 'Content-Type, Authorization',
                            'x-response-override': 'true'
                        },
                        config
                    });
                } catch (error) {
                    console.error('axios拦截失败:', error);
                }
            }
            return originalAxiosRequest.apply(this, arguments);
        };
    }
}

// 监听来自background script的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'UPDATE_RULES') {
        responseOverrideRules = message.rules;
        debugLog('内容脚本规则已更新:', responseOverrideRules);
        syncRulesToPage();
        sendResponse({ success: true });
    } else if (message.type === 'GET_RULES') {
        sendResponse({ success: true, rules: responseOverrideRules });
    }
});

// 定期刷新规则（每10秒）
setInterval(async () => {
    try {
        await loadRules();
        syncRulesToPage();
    } catch (error) {
        console.error('定期刷新规则失败:', error);
    }
}, 10000);

document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        loadRules().then(syncRulesToPage);
    }
});
