// Shared XHR+Promise transport for the server-backed tabs (Lister, Disney,
// Chefs). Extracted from four identical copies.
(function() {
    'use strict';

    window.Api = {
        // 20s timeout, JSON in/out. Rejects with an Error carrying the
        // server's `error` field when there is one.
        request: function(method, url, body) {
            return new Promise(function(resolve, reject) {
                var xhr = new XMLHttpRequest();
                var timeoutId = setTimeout(function() {
                    xhr.abort();
                    reject(new Error('Request timed out'));
                }, 20000);

                xhr.open(method, url, true);
                xhr.setRequestHeader('Content-Type', 'application/json');

                xhr.onload = function() {
                    clearTimeout(timeoutId);
                    try {
                        var response = JSON.parse(xhr.responseText);
                        if (xhr.status >= 200 && xhr.status < 300) {
                            resolve(response);
                        } else {
                            reject(new Error(response.error || ('Server error: ' + xhr.status)));
                        }
                    } catch (e) {
                        reject(new Error('Invalid response from server'));
                    }
                };
                xhr.onerror = function() {
                    clearTimeout(timeoutId);
                    reject(new Error('Network error — is the server running?'));
                };
                xhr.onabort = function() {
                    clearTimeout(timeoutId);
                };

                xhr.send(body ? JSON.stringify(body) : undefined);
            });
        },

        // Returns a small client bound to an API base path, e.g.
        //   var api = Api.client('/api/lister');
        //   api.get('/state'); api.post('/active', {...}); api.del('/saved/x');
        client: function(basePath) {
            var base = window.location.origin + basePath;
            return {
                get: function(path) {
                    return window.Api.request('GET', base + path);
                },
                post: function(path, body) {
                    return window.Api.request('POST', base + path, body);
                },
                del: function(path) {
                    return window.Api.request('DELETE', base + path);
                }
            };
        }
    };
})();
