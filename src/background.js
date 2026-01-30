// 存储规则与设置
let responseOverrideRules = [];
let overrideMode = 'dnr';
let debugMode = false;
const logs = [];
const LOG_LIMIT = 200;

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
        applyOverrideMode();
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
            ts: (message.payload && message.payload.ts) || Date.now(),
            mode: overrideMode
        });
        sendResponse({ success: true });
    } else if (message.type === 'SET_OVERRIDE_MODE') {
        overrideMode = message.mode === 'page' ? 'page' : 'dnr';
        applyOverrideMode();
        sendResponse({ success: true, mode: overrideMode });
    }
});

chrome.action.onClicked.addListener(() => {
    chrome.tabs.create({
        url: chrome.runtime.getURL('ui/tab.html')
    }).catch((error) => {
        console.error('创建标签页失败:', error);
    });
});

chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace !== 'local') return;
    if (changes.responseOverrideRules) {
        responseOverrideRules = changes.responseOverrideRules.newValue || [];
        if (overrideMode === 'dnr') {
            updateDeclarativeNetRequestRules();
        }
    }
    if (changes.overrideMode) {
        overrideMode = changes.overrideMode.newValue || 'dnr';
        applyOverrideMode();
    }
    if (changes.debugMode) {
        debugMode = !!changes.debugMode.newValue;
    }
});

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
        mode: overrideMode
    });
});

function loadState() {
    chrome.storage.local.get(['responseOverrideRules', 'overrideMode', 'debugMode'], (result) => {
        responseOverrideRules = result.responseOverrideRules || [];
        overrideMode = result.overrideMode || 'dnr';
        debugMode = !!result.debugMode;
        applyOverrideMode();
    });
}

function applyOverrideMode() {
    const useDnr = overrideMode === 'dnr';
    chrome.storage.local.set({ useDNRRedirect: useDnr, overrideMode });
    if (useDnr) {
        updateDeclarativeNetRequestRules();
    } else {
        clearDynamicRules();
    }
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
            chrome.storage.local.set({ useDNRRedirect: false });
            return;
        }
        chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: existingRuleIds,
            addRules: []
        }, () => {
            if (chrome.runtime.lastError) {
                console.error('清理动态规则失败:', chrome.runtime.lastError);
            }
            chrome.storage.local.set({ useDNRRedirect: false });
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

function updateDeclarativeNetRequestRules() {
    if (overrideMode !== 'dnr') {
        clearDynamicRules();
        return;
    }
    try {
        chrome.declarativeNetRequest.getDynamicRules((existingRules) => {
            const existingRuleIds = existingRules.map(rule => rule.id);
            const rules = responseOverrideRules
                .filter(rule => rule.enabled && rule.urlPattern)
                .map((rule, index) => ({
                    id: index + 1,
                    priority: parseInt(rule.priority, 10) || 1,
                    action: {
                        type: 'redirect',
                        redirect: { url: buildDataUrlForRule(rule) }
                    },
                    condition: {
                        urlFilter: rule.urlPattern,
                        resourceTypes: ['xmlhttprequest']
                    }
                }));

            chrome.declarativeNetRequest.updateDynamicRules({
                removeRuleIds: existingRuleIds,
                addRules: rules
            }, () => {
                if (chrome.runtime.lastError) {
                    console.error('更新动态规则失败:', chrome.runtime.lastError);
                } else {
                    chrome.storage.local.set({ useDNRRedirect: true });
                }
            });
        });
    } catch (error) {
        console.error('更新规则时发生错误:', error);
    }
}
