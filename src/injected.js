(function() {
    let activeRules = [];

    function isDebugEnabled() {
        try { return localStorage.getItem('__debugMode') === 'true'; } catch (_) { return false; }
    }

    function sendLog(payload) {
        if (!isDebugEnabled()) return;
        try {
            window.postMessage({
                source: 'resource-override',
                type: 'LOG_EVENT',
                payload
            }, '*');
        } catch (_) {}
    }

    function toAbsoluteUrl(input) {
        try {
            if (!input) return '';
            const str = String(input);
            if (/^https?:\/\/|^wss?:\/\//i.test(str)) return str;
            return new URL(str, location.href).href;
        } catch (_) { return String(input || ''); }
    }

    // 简单的URL匹配：支持 * 和 ? 通配符；否则使用包含匹配
    function matchUrlPattern(url, pattern) {
        try {
            if (!pattern) return false;
            const cleanPattern = String(pattern).trim();
            if (cleanPattern.includes('*') || cleanPattern.includes('?')) {
                const regex = new RegExp('^' + cleanPattern
                    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
                    .replace(/\\\*/g, '.*')
                    .replace(/\\\?/g, '.') + '$', 'i');
                return regex.test(url);
            }
            return url.toLowerCase().includes(cleanPattern.toLowerCase());
        } catch (_) {
            return false;
        }
    }

    function findMatchingRule(url) {
        const absolute = toAbsoluteUrl(url);
        return activeRules.find(r => r && r.enabled && matchUrlPattern(absolute, r.urlPattern));
    }

    function buildMockResponse(rule) {
        const contentType = rule.contentType || 'application/json; charset=utf-8';
        const headers = new Headers({
            'Content-Type': contentType,
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'x-response-override': 'true'
        });
        const status = rule.statusCode || 200;
        const body = typeof rule.responseData === 'string' ? rule.responseData : JSON.stringify(rule.responseData ?? {});
        return new Response(body, { status, headers });
    }

    // 拦截 fetch
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
        const req = args[0];
        const rawUrl = typeof req === 'string' ? req : (req && (req.url || req.toString()));
        const absUrl = toAbsoluteUrl(rawUrl);
        const method = (req && req.method) || (args[1] && args[1].method) || 'GET';
        try { if (localStorage.getItem('__useDNRRedirect') === 'true') return originalFetch.apply(this, args); } catch (_) {}
        const rule = absUrl && findMatchingRule(absUrl);
        if (rule) {
            sendLog({
                ts: Date.now(),
                url: absUrl,
                method: String(method).toUpperCase(),
                source: 'fetch',
                ruleId: rule.id,
                statusCode: rule.statusCode,
                contentType: rule.contentType
            });
            return buildMockResponse(rule);
        }
        return originalFetch.apply(this, args);
    };

    // 拦截 XHR
    const origOpen = XMLHttpRequest.prototype.open;
    const origSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.open = function(method, url, ...rest) {
        this.__override_url = toAbsoluteUrl(url);
        this.__override_method = method;
        return origOpen.apply(this, [method, url, ...rest]);
    };
    XMLHttpRequest.prototype.send = function(data) {
        const url = this.__override_url;
        try { if (localStorage.getItem('__useDNRRedirect') === 'true') return origSend.apply(this, [data]); } catch (_) {}
        const rule = url && findMatchingRule(url);
        if (rule) {
            const contentType = rule.contentType || 'application/json; charset=utf-8';
            const raw = typeof rule.responseData === 'string' ? rule.responseData : JSON.stringify(rule.responseData ?? {});
            const parsed = (() => { try { return JSON.parse(raw); } catch (_) { return raw; } })();

            sendLog({
                ts: Date.now(),
                url,
                method: String(this.__override_method || 'GET').toUpperCase(),
                source: 'xhr',
                ruleId: rule.id,
                statusCode: rule.statusCode,
                contentType
            });

            try {
                Object.defineProperty(this, 'status', { get: () => rule.statusCode || 200 });
                Object.defineProperty(this, 'statusText', { get: () => 'OK' });
                Object.defineProperty(this, 'responseText', { get: () => raw });
                Object.defineProperty(this, 'response', { get: () => (this.responseType === 'json' ? parsed : raw) });
                Object.defineProperty(this, 'readyState', { get: () => 4 });
                this.getAllResponseHeaders = () => `content-type: ${contentType}\r\nx-response-override: true`;
                this.getResponseHeader = (name) => ({ 'content-type': contentType, 'x-response-override': 'true' })[(name || '').toLowerCase()] || null;
            } catch (_) {
                this.status = rule.statusCode || 200;
                this.statusText = 'OK';
                this.responseText = raw;
                this.response = (this.responseType === 'json' ? parsed : raw);
                this.getAllResponseHeaders = () => `content-type: ${contentType}\r\nx-response-override: true`;
                this.getResponseHeader = (name) => ({ 'content-type': contentType, 'x-response-override': 'true' })[(name || '').toLowerCase()] || null;
            }

            setTimeout(() => {
                this.dispatchEvent(new Event('readystatechange'));
                this.dispatchEvent(new Event('load'));
                this.dispatchEvent(new Event('loadend'));
            }, 0);
            return;
        }
        return origSend.apply(this, [data]);
    };

    // 拦截 axios
    function patchAxiosIfPresent() {
        if (!window.axios || !window.axios.request) return;
        const origReq = window.axios.request;
        window.axios.request = function(config) {
            const raw = (config && config.url) || config;
            const absUrl = toAbsoluteUrl(raw);
            const rule = absUrl && findMatchingRule(absUrl);
            if (rule) {
                const dataStr = typeof rule.responseData === 'string' ? rule.responseData : JSON.stringify(rule.responseData ?? {});
                sendLog({
                    ts: Date.now(),
                    url: absUrl,
                    method: String((config && config.method) || 'GET').toUpperCase(),
                    source: 'axios',
                    ruleId: rule.id,
                    statusCode: rule.statusCode,
                    contentType: rule.contentType
                });
                return Promise.resolve({
                    data: (() => { try { return JSON.parse(dataStr); } catch (_) { return dataStr; } })(),
                    status: rule.statusCode || 200,
                    statusText: 'OK',
                    headers: {
                        'content-type': rule.contentType || 'application/json; charset=utf-8',
                        'x-response-override': 'true'
                    },
                    config
                });
            }
            return origReq.apply(this, arguments);
        };
    }
    patchAxiosIfPresent();
    const axiosTimer = setInterval(patchAxiosIfPresent, 1500);
    window.addEventListener('beforeunload', () => clearInterval(axiosTimer));

    // 监听来自内容脚本的规则同步事件
    window.addEventListener('RESOURCE_OVERRIDE_RULES', (evt) => {
        if (evt && evt.detail && Array.isArray(evt.detail.rules)) {
            activeRules = evt.detail.rules;
        }
    });
})();
