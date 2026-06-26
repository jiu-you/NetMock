// 存储规则与设置
let responseOverrideRules = [];
let debugMode = false;
const logs = [];
const LOG_LIMIT = 200;
const SUPPORTED_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

chrome.runtime.onInstalled.addListener((details) => {
    loadState();
    if (details.reason === 'install') {
        chrome.tabs.create({
            url: chrome.runtime.getURL('ui/tab.html')
        });
    }
});
chrome.runtime.onStartup.addListener(loadState);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'UPDATE_RULES') {
        responseOverrideRules = message.rules || [];
        updateDeclarativeNetRequestRules();
        sendResponse({ success: true });
    } else if (message.type === 'PING') {
        sendResponse({ success: true, message: 'pong' });
    } else if (message.type === 'GET_RULES') {
        sendResponse({ success: true, rules: responseOverrideRules });
    } else if (message.type === 'CONTENT_SCRIPT_LOADED') {
        sendResponse({ success: true, rules: responseOverrideRules });
    } else if (message.type === 'GET_LOGS') {
        sendResponse({ success: true, logs: logs.slice() });
    } else if (message.type === 'CLEAR_LOGS') {
        logs.length = 0;
        broadcastLogs();
        sendResponse({ success: true });
    } else if (message.type === 'LOG_EVENT') {
        addLog({
            ...message.payload,
            ts: (message.payload && message.payload.ts) || Date.now()
        });
        sendResponse({ success: true });
    }
});

chrome.action.onClicked.addListener(() => {
    chrome.tabs.create({
        url: chrome.runtime.getURL('ui/tab.html')
    }, () => {
        if (chrome.runtime.lastError) {
            console.error('创建标签页失败:', chrome.runtime.lastError);
        }
    });
});

chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace !== 'local') return;
    if (changes.responseOverrideRules) {
        responseOverrideRules = changes.responseOverrideRules.newValue || [];
        updateDeclarativeNetRequestRules();
    }
    if (changes.debugMode) {
        debugMode = !!changes.debugMode.newValue;
    }
});

if (chrome.declarativeNetRequest && chrome.declarativeNetRequest.onRuleMatchedDebug) {
    chrome.declarativeNetRequest.onRuleMatchedDebug.addListener((info) => {
        if (!debugMode) return;
        const request = info && info.request ? info.request : {};
        const ruleId = info && info.rule ? info.rule.ruleId : undefined;
        addLog({
            ts: Date.now(),
            url: request.url || '',
            method: request.method || '',
            source: 'dnr',
            ruleId,
            mode: 'dnr'
        });
    });
}

function loadState() {
    chrome.storage.local.get(['responseOverrideRules', 'debugMode'], (result) => {
        responseOverrideRules = result.responseOverrideRules || [];
        debugMode = !!result.debugMode;
        updateDeclarativeNetRequestRules();
    });
}

function addLog(entry) {
    if (!debugMode) return;
    logs.unshift(entry);
    if (logs.length > LOG_LIMIT) {
        logs.length = LOG_LIMIT;
    }
    broadcastLogs();
}

function broadcastLogs() {
    try {
        chrome.runtime.sendMessage({ type: 'LOGS_UPDATED', logs: logs.slice() });
    } catch (_) {
        // ignore
    }
}

function clearDynamicRules() {
    chrome.declarativeNetRequest.getDynamicRules((existingRules) => {
        const existingRuleIds = existingRules.map(rule => rule.id);
        if (existingRuleIds.length === 0) {
            return;
        }
        chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: existingRuleIds,
            addRules: []
        }, () => {
            if (chrome.runtime.lastError) {
                console.error('清理动态规则失败:', chrome.runtime.lastError);
            }
        });
    });
}

function toBase64Unicode(text) {
    try {
        return btoa(unescape(encodeURIComponent(String(text))));
    } catch (e) {
        console.error('Base64编码失败:', e);
        return '';
    }
}

function buildDataUrlForRule(rule) {
    const contentType = rule.contentType || 'application/json; charset=utf-8';
    const body = typeof rule.responseData === 'string'
        ? rule.responseData
        : JSON.stringify(rule.responseData || {});
    const base64 = toBase64Unicode(body);
    return `data:${contentType};base64,${base64}`;
}

function getRuleMethods(rule) {
    if (!Array.isArray(rule.methods)) return SUPPORTED_METHODS.slice();
    const methods = Array.from(new Set(rule.methods
        .map(method => String(method || '').toUpperCase())
        .filter(method => SUPPORTED_METHODS.includes(method))));
    return methods.length > 0 ? methods : SUPPORTED_METHODS.slice();
}

function buildDnrCondition(rule) {
    const condition = {
        urlFilter: rule.urlPattern,
        resourceTypes: ['xmlhttprequest', 'other']
    };
    const methods = getRuleMethods(rule);
    if (methods.length !== SUPPORTED_METHODS.length) {
        condition.requestMethods = methods.map(method => method.toLowerCase());
    }
    return condition;
}

function shouldUseDnrRule(rule) {
    if (!rule || !rule.enabled || !rule.urlPattern) return false;
    if (rule.interceptMode === 'page') return false;

    // DNR redirects to data: URLs cannot carry a non-200 HTTP status.
    return (parseInt(rule.statusCode, 10) || 200) === 200;
}

function updateDeclarativeNetRequestRules() {
    try {
        chrome.declarativeNetRequest.getDynamicRules((existingRules) => {
            const existingRuleIds = existingRules.map(rule => rule.id);
            const rules = responseOverrideRules
                .filter(shouldUseDnrRule)
                .map((rule, index) => ({
                    id: index + 1,
                    priority: parseInt(rule.priority, 10) || 1,
                    action: {
                        type: 'redirect',
                        redirect: { url: buildDataUrlForRule(rule) }
                    },
                    condition: buildDnrCondition(rule)
                }));

            chrome.declarativeNetRequest.updateDynamicRules({
                removeRuleIds: existingRuleIds,
                addRules: rules
            }, () => {
                if (chrome.runtime.lastError) {
                    console.error('更新动态规则失败:', chrome.runtime.lastError);
                }
            });
        });
    } catch (error) {
        console.error('更新规则时发生错误:', error);
    }
}
