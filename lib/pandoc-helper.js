"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CP = require("child_process");
const fs = require("fs");
const path = require("path");
const util_1 = require("./util");
const getMathJaxPath = (function () {
    let cached = null;
    return function () {
        if (cached !== null) {
            return cached;
        }
        try {
            return (cached = require.resolve('mathjax'));
        }
        catch (e) {
            return '';
        }
    };
})();
function findFileRecursive(filePath, fileName) {
    const bibFile = path.join(filePath, '../', fileName);
    if (fs.existsSync(bibFile)) {
        return bibFile;
    }
    else {
        const newPath = path.join(bibFile, '..');
        if (newPath !== filePath && !atom.project.getPaths().includes(newPath)) {
            return findFileRecursive(newPath, fileName);
        }
        else {
            return false;
        }
    }
}
function setPandocOptions(filePath, renderMath) {
    const opts = { maxBuffer: Infinity };
    if (filePath !== undefined) {
        opts.cwd = path.dirname(filePath);
    }
    const mathjaxPath = getMathJaxPath();
    const config = util_1.atomConfig().pandocConfig;
    const args = {
        from: config.pandocMarkdownFlavor,
        to: 'html',
        mathjax: renderMath ? mathjaxPath : undefined,
        filter: config.pandocFilters,
    };
    if (config.pandocBibliography) {
        args.filter.push('pandoc-citeproc');
        let bibFile = filePath && findFileRecursive(filePath, config.pandocBIBFile);
        if (!bibFile) {
            bibFile = config.pandocBIBFileFallback;
        }
        args.bibliography = bibFile ? bibFile : undefined;
        let cslFile = filePath && findFileRecursive(filePath, config.pandocCSLFile);
        if (!cslFile) {
            cslFile = config.pandocCSLFileFallback;
        }
        args.csl = cslFile ? cslFile : undefined;
    }
    return { args, opts };
}
function handleError(error, html, renderMath) {
    const err = new Error(error);
    err.html = handleSuccess(html, renderMath);
    throw err;
}
function handleMath(html) {
    const doc = document.createElement('div');
    doc.innerHTML = html;
    doc.querySelectorAll('.math').forEach(function (elem) {
        let math = elem.innerText;
        const mode = math.indexOf('\\[') > -1 ? '; mode=display' : '';
        math = math.replace(/\\[[()\]]/g, '');
        return (elem.outerHTML =
            '<span class="math">' +
                `<script type='math/tex${mode}'>${math}</script>` +
                '</span>');
    });
    return doc.innerHTML;
}
function removeReferences(html) {
    const doc = document.createElement('div');
    doc.innerHTML = html;
    doc.querySelectorAll('.references').forEach((elem) => {
        elem.remove();
    });
    return doc.innerHTML;
}
function handleSuccess(html, renderMath) {
    if (renderMath) {
        html = handleMath(html);
    }
    if (util_1.atomConfig().pandocConfig.pandocRemoveReferences) {
        html = removeReferences(html);
    }
    return html;
}
function handleResponse(error, html, renderMath) {
    if (error) {
        return handleError(error, html, renderMath);
    }
    else {
        return handleSuccess(html, renderMath);
    }
}
async function renderPandoc(text, filePath, renderMath, showErrors) {
    const { args, opts } = setPandocOptions(filePath, renderMath);
    return new Promise((resolve, reject) => {
        const cp = CP.execFile(util_1.atomConfig().pandocConfig.pandocPath, getArguments(args), opts, function (error, stdout, stderr) {
            if (error) {
                atom.notifications.addError(error.toString(), {
                    stack: error.stack,
                    dismissable: true,
                });
                reject(error);
            }
            try {
                const result = handleResponse(showErrors ? stderr || '' : '', stdout || '', renderMath);
                resolve(result);
            }
            catch (e) {
                reject(e);
            }
        });
        cp.stdin.write(text);
        cp.stdin.end();
    });
}
exports.renderPandoc = renderPandoc;
function getArguments(iargs) {
    const args = [];
    for (const [key, val] of Object.entries(iargs)) {
        if (Array.isArray(val)) {
            args.push(...val.map((v) => `--${key}=${v}`));
        }
        else if (val) {
            args.push(`--${key}=${val}`);
        }
    }
    const res = [];
    for (const val of [...args, ...util_1.atomConfig().pandocConfig.pandocArguments]) {
        const newval = val.replace(/^(--[\w\-]+)\s(.+)$/i, '$1=$2');
        if (newval.substr(0, 1) === '-') {
            res.push(newval);
        }
    }
    return res;
}
exports.testing = {
    setPandocOptions,
    getArguments,
    findFileRecursive,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFuZG9jLWhlbHBlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9wYW5kb2MtaGVscGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsb0NBQW9DO0FBQ3BDLHlCQUF5QjtBQUN6Qiw2QkFBNkI7QUFDN0IsaUNBQW1DO0FBS25DLE1BQU0sY0FBYyxHQUFHLENBQUM7SUFDdEIsSUFBSSxNQUFNLEdBQWtCLElBQUksQ0FBQTtJQUNoQyxPQUFPO1FBQ0wsSUFBSSxNQUFNLEtBQUssSUFBSSxFQUFFO1lBQ25CLE9BQU8sTUFBTSxDQUFBO1NBQ2Q7UUFDRCxJQUFJO1lBQ0YsT0FBTyxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUE7U0FDN0M7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNWLE9BQU8sRUFBRSxDQUFBO1NBQ1Y7SUFDSCxDQUFDLENBQUE7QUFDSCxDQUFDLENBQUMsRUFBRSxDQUFBO0FBRUosU0FBUyxpQkFBaUIsQ0FBQyxRQUFnQixFQUFFLFFBQWdCO0lBQzNELE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQTtJQUNwRCxJQUFJLEVBQUUsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLEVBQUU7UUFDMUIsT0FBTyxPQUFPLENBQUE7S0FDZjtTQUFNO1FBQ0wsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUE7UUFDeEMsSUFBSSxPQUFPLEtBQUssUUFBUSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEVBQUU7WUFDdEUsT0FBTyxpQkFBaUIsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUE7U0FDNUM7YUFBTTtZQUNMLE9BQU8sS0FBSyxDQUFBO1NBQ2I7S0FD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QUFFO1lBQ3RCLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUE7U0FDOUM7YUFBTSxJQUFJLEdBQUcsRUFBRTtZQUNkLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksR0FBRyxFQUFFLENBQUMsQ0FBQTtTQUM3QjtLQUNGO0lBQ0QsTUFBTSxHQUFHLEdBQWEsRUFBRSxDQUFBO0lBQ3hCLEtBQUssTUFBTSxHQUFHLElBQUksQ0FBQyxHQUFHLElBQUksRUFBRSxHQUFHLGlCQUFVLEVBQUUsQ0FBQyxZQUFZLENBQUMsZUFBZSxDQUFDLEVBQUU7UUFDekUsTUFBTSxNQUFNLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxzQkFBc0IsRUFBRSxPQUFPLENBQUMsQ0FBQTtRQUMzRCxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLEdBQUcsRUFBRTtZQUMvQixHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFBO1NBQ2pCO0tBQ0Y7SUFDRCxPQUFPLEdBQUcsQ0FBQTtBQUNaLENBQUM7QUFFWSxRQUFBLE9BQU8sR0FBRztJQUNyQixnQkFBZ0I7SUFDaEIsWUFBWTtJQUNaLGlCQUFpQjtDQUNsQixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IENQID0gcmVxdWlyZSgnY2hpbGRfcHJvY2VzcycpXG5pbXBvcnQgZnMgPSByZXF1aXJlKCdmcycpXG5pbXBvcnQgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKVxuaW1wb3J0IHsgYXRvbUNvbmZpZyB9IGZyb20gJy4vdXRpbCdcblxuLyoqXG4gKiBTZXRzIGxvY2FsIG1hdGhqYXhQYXRoIGlmIGF2YWlsYWJsZVxuICovXG5jb25zdCBnZXRNYXRoSmF4UGF0aCA9IChmdW5jdGlvbigpIHtcbiAgbGV0IGNhY2hlZDogc3RyaW5nIHwgbnVsbCA9IG51bGxcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIGlmIChjYWNoZWQgIT09IG51bGwpIHtcbiAgICAgIHJldHVybiBjYWNoZWRcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiAoY2FjaGVkID0gcmVxdWlyZS5yZXNvbHZlKCdtYXRoamF4JykpXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuICcnXG4gICAgfVxuICB9XG59KSgpXG5cbmZ1bmN0aW9uIGZpbmRGaWxlUmVjdXJzaXZlKGZpbGVQYXRoOiBzdHJpbmcsIGZpbGVOYW1lOiBzdHJpbmcpOiBzdHJpbmcgfCBmYWxzZSB7XG4gIGNvbnN0IGJpYkZpbGUgPSBwYXRoLmpvaW4oZmlsZVBhdGgsICcuLi8nLCBmaWxlTmFtZSlcbiAgaWYgKGZzLmV4aXN0c1N5bmMoYmliRmlsZSkpIHtcbiAgICByZXR1cm4gYmliRmlsZVxuICB9IGVsc2Uge1xuICAgIGNvbnN0IG5ld1BhdGggPSBwYXRoLmpvaW4oYmliRmlsZSwgJy4uJylcbiAgICBpZiAobmV3UGF0aCAhPT0gZmlsZVBhdGggJiYgIWF0b20ucHJvamVjdC5nZXRQYXRocygpLmluY2x1ZGVzKG5ld1BhdGgpKSB7XG4gICAgICByZXR1cm4gZmluZEZpbGVSZWN1cnNpdmUobmV3UGF0aCwgZmlsZU5hbWUpXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgfVxufVxuXG4vLyBleHBvcnRlZCBmb3IgdGVzdHNcbmV4cG9ydCBpbnRlcmZhY2UgQXJncyB7XG4gIGZyb206IHN0cmluZ1xuICB0bzogJ2h0bWwnXG4gIG1hdGhqYXg/OiBzdHJpbmdcbiAgZmlsdGVyOiBzdHJpbmdbXVxuICBiaWJsaW9ncmFwaHk/OiBzdHJpbmdcbiAgY3NsPzogc3RyaW5nXG59XG5cbmZ1bmN0aW9uIHNldFBhbmRvY09wdGlvbnMoZmlsZVBhdGg6IHN0cmluZyB8IHVuZGVmaW5lZCwgcmVuZGVyTWF0aDogYm9vbGVhbikge1xuICAvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL2F0b20tY29tbXVuaXR5L21hcmtkb3duLXByZXZpZXctcGx1cy9pc3N1ZXMvMzE2XG4gIGNvbnN0IG9wdHM6IENQLkV4ZWNGaWxlT3B0aW9ucyA9IHsgbWF4QnVmZmVyOiBJbmZpbml0eSB9XG4gIGlmIChmaWxlUGF0aCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgb3B0cy5jd2QgPSBwYXRoLmRpcm5hbWUoZmlsZVBhdGgpXG4gIH1cbiAgY29uc3QgbWF0aGpheFBhdGggPSBnZXRNYXRoSmF4UGF0aCgpXG4gIGNvbnN0IGNvbmZpZyA9IGF0b21Db25maWcoKS5wYW5kb2NDb25maWdcbiAgY29uc3QgYXJnczogQXJncyA9IHtcbiAgICBmcm9tOiBjb25maWcucGFuZG9jTWFya2Rvd25GbGF2b3IsXG4gICAgdG86ICdodG1sJyxcbiAgICBtYXRoamF4OiByZW5kZXJNYXRoID8gbWF0aGpheFBhdGggOiB1bmRlZmluZWQsXG4gICAgZmlsdGVyOiBjb25maWcucGFuZG9jRmlsdGVycyxcbiAgfVxuICBpZiAoY29uZmlnLnBhbmRvY0JpYmxpb2dyYXBoeSkge1xuICAgIGFyZ3MuZmlsdGVyLnB1c2goJ3BhbmRvYy1jaXRlcHJvYycpXG4gICAgbGV0IGJpYkZpbGUgPSBmaWxlUGF0aCAmJiBmaW5kRmlsZVJlY3Vyc2l2ZShmaWxlUGF0aCwgY29uZmlnLnBhbmRvY0JJQkZpbGUpXG4gICAgaWYgKCFiaWJGaWxlKSB7XG4gICAgICBiaWJGaWxlID0gY29uZmlnLnBhbmRvY0JJQkZpbGVGYWxsYmFja1xuICAgIH1cbiAgICBhcmdzLmJpYmxpb2dyYXBoeSA9IGJpYkZpbGUgPyBiaWJGaWxlIDogdW5kZWZpbmVkXG4gICAgbGV0IGNzbEZpbGUgPSBmaWxlUGF0aCAmJiBmaW5kRmlsZVJlY3Vyc2l2ZShmaWxlUGF0aCwgY29uZmlnLnBhbmRvY0NTTEZpbGUpXG4gICAgaWYgKCFjc2xGaWxlKSB7XG4gICAgICBjc2xGaWxlID0gY29uZmlnLnBhbmRvY0NTTEZpbGVGYWxsYmFja1xuICAgIH1cbiAgICBhcmdzLmNzbCA9IGNzbEZpbGUgPyBjc2xGaWxlIDogdW5kZWZpbmVkXG4gIH1cbiAgcmV0dXJuIHsgYXJncywgb3B0cyB9XG59XG5cbi8qKlxuICogSGFuZGxlIGVycm9yIHJlc3BvbnNlIGZyb20gUGFuZG9jXG4gKiBAcGFyYW0ge2Vycm9yfSBSZXR1cm5lZCBlcnJvclxuICogQHBhcmFtIHtzdHJpbmd9IFJldHVybmVkIEhUTUxcbiAqIEByZXR1cm4ge2FycmF5fSB3aXRoIEFyZ3VtZW50cyBmb3IgY2FsbGJhY2tGdW5jdGlvbiAoZXJyb3Igc2V0IHRvIG51bGwpXG4gKi9cbmZ1bmN0aW9uIGhhbmRsZUVycm9yKGVycm9yOiBzdHJpbmcsIGh0bWw6IHN0cmluZywgcmVuZGVyTWF0aDogYm9vbGVhbik6IG5ldmVyIHtcbiAgY29uc3QgZXJyID0gbmV3IEVycm9yKGVycm9yKSBhcyBFcnJvciAmIHsgaHRtbDogc3RyaW5nIH1cbiAgZXJyLmh0bWwgPSBoYW5kbGVTdWNjZXNzKGh0bWwsIHJlbmRlck1hdGgpXG4gIHRocm93IGVyclxufVxuXG4vKipcbiAqIEFkanVzdHMgYWxsIG1hdGggZW52aXJvbm1lbnRzIGluIEhUTUxcbiAqIEBwYXJhbSB7c3RyaW5nfSBIVE1MIHRvIGJlIGFkanVzdGVkXG4gKiBAcmV0dXJuIHtzdHJpbmd9IEhUTUwgd2l0aCBhZGp1c3RlZCBtYXRoIGVudmlyb25tZW50c1xuICovXG5mdW5jdGlvbiBoYW5kbGVNYXRoKGh0bWw6IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IGRvYyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gIGRvYy5pbm5lckhUTUwgPSBodG1sXG4gIGRvYy5xdWVyeVNlbGVjdG9yQWxsKCcubWF0aCcpLmZvckVhY2goZnVuY3Rpb24oZWxlbSkge1xuICAgIGxldCBtYXRoID0gKGVsZW0gYXMgSFRNTEVsZW1lbnQpLmlubmVyVGV4dFxuICAgIC8vIFNldCBtb2RlIGlmIGl0IGlzIGJsb2NrIG1hdGhcbiAgICBjb25zdCBtb2RlID0gbWF0aC5pbmRleE9mKCdcXFxcWycpID4gLTEgPyAnOyBtb2RlPWRpc3BsYXknIDogJydcblxuICAgIC8vIFJlbW92ZSBzb3Vycm91bmRpbmcgXFxbIFxcXSBhbmQgXFwoIFxcKVxuICAgIG1hdGggPSBtYXRoLnJlcGxhY2UoL1xcXFxbWygpXFxdXS9nLCAnJylcbiAgICByZXR1cm4gKGVsZW0ub3V0ZXJIVE1MID1cbiAgICAgICc8c3BhbiBjbGFzcz1cIm1hdGhcIj4nICtcbiAgICAgIGA8c2NyaXB0IHR5cGU9J21hdGgvdGV4JHttb2RlfSc+JHttYXRofTwvc2NyaXB0PmAgK1xuICAgICAgJzwvc3Bhbj4nKVxuICB9KVxuXG4gIHJldHVybiBkb2MuaW5uZXJIVE1MXG59XG5cbmZ1bmN0aW9uIHJlbW92ZVJlZmVyZW5jZXMoaHRtbDogc3RyaW5nKSB7XG4gIGNvbnN0IGRvYyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gIGRvYy5pbm5lckhUTUwgPSBodG1sXG4gIGRvYy5xdWVyeVNlbGVjdG9yQWxsKCcucmVmZXJlbmNlcycpLmZvckVhY2goKGVsZW0pID0+IHtcbiAgICBlbGVtLnJlbW92ZSgpXG4gIH0pXG4gIHJldHVybiBkb2MuaW5uZXJIVE1MXG59XG5cbi8qKlxuICogSGFuZGxlIHN1Y2Nlc3NmdWwgcmVzcG9uc2UgZnJvbSBQYW5kb2NcbiAqIEBwYXJhbSBSZXR1cm5lZCBIVE1MXG4gKiBAcmV0dXJuIFBvc3NpYmx5IG1vZGlmaWVkIHJldHVybmVkIEhUTUxcbiAqL1xuZnVuY3Rpb24gaGFuZGxlU3VjY2VzcyhodG1sOiBzdHJpbmcsIHJlbmRlck1hdGg6IGJvb2xlYW4pOiBzdHJpbmcge1xuICBpZiAocmVuZGVyTWF0aCkge1xuICAgIGh0bWwgPSBoYW5kbGVNYXRoKGh0bWwpXG4gIH1cbiAgaWYgKGF0b21Db25maWcoKS5wYW5kb2NDb25maWcucGFuZG9jUmVtb3ZlUmVmZXJlbmNlcykge1xuICAgIGh0bWwgPSByZW1vdmVSZWZlcmVuY2VzKGh0bWwpXG4gIH1cbiAgcmV0dXJuIGh0bWxcbn1cblxuLyoqXG4gKiBIYW5kbGUgcmVzcG9uc2UgZnJvbSBQYW5kb2NcbiAqIEBwYXJhbSB7T2JqZWN0fSBlcnJvciBpZiB0aHJvd25cbiAqIEBwYXJhbSB7c3RyaW5nfSBSZXR1cm5lZCBIVE1MXG4gKi9cbmZ1bmN0aW9uIGhhbmRsZVJlc3BvbnNlKGVycm9yOiBzdHJpbmcsIGh0bWw6IHN0cmluZywgcmVuZGVyTWF0aDogYm9vbGVhbikge1xuICBpZiAoZXJyb3IpIHtcbiAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IsIGh0bWwsIHJlbmRlck1hdGgpXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGhhbmRsZVN1Y2Nlc3MoaHRtbCwgcmVuZGVyTWF0aClcbiAgfVxufVxuXG4vKipcbiAqIFJlbmRlcnMgbWFya2Rvd24gd2l0aCBwYW5kb2NcbiAqIEBwYXJhbSB7c3RyaW5nfSBkb2N1bWVudCBpbiBtYXJrZG93blxuICogQHBhcmFtIHtib29sZWFufSB3aGV0aGVyIHRvIHJlbmRlciB0aGUgbWF0aCB3aXRoIG1hdGhqYXhcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrRnVuY3Rpb25cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlbmRlclBhbmRvYyhcbiAgdGV4dDogc3RyaW5nLFxuICBmaWxlUGF0aDogc3RyaW5nIHwgdW5kZWZpbmVkLFxuICByZW5kZXJNYXRoOiBib29sZWFuLFxuICBzaG93RXJyb3JzOiBib29sZWFuLFxuKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgY29uc3QgeyBhcmdzLCBvcHRzIH0gPSBzZXRQYW5kb2NPcHRpb25zKGZpbGVQYXRoLCByZW5kZXJNYXRoKVxuICByZXR1cm4gbmV3IFByb21pc2U8c3RyaW5nPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgY29uc3QgY3AgPSBDUC5leGVjRmlsZShcbiAgICAgIGF0b21Db25maWcoKS5wYW5kb2NDb25maWcucGFuZG9jUGF0aCxcbiAgICAgIGdldEFyZ3VtZW50cyhhcmdzKSxcbiAgICAgIG9wdHMsXG4gICAgICBmdW5jdGlvbihlcnJvciwgc3Rkb3V0LCBzdGRlcnIpIHtcbiAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKGVycm9yLnRvU3RyaW5nKCksIHtcbiAgICAgICAgICAgIHN0YWNrOiBlcnJvci5zdGFjayxcbiAgICAgICAgICAgIGRpc21pc3NhYmxlOiB0cnVlLFxuICAgICAgICAgIH0pXG4gICAgICAgICAgcmVqZWN0KGVycm9yKVxuICAgICAgICB9XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3QgcmVzdWx0ID0gaGFuZGxlUmVzcG9uc2UoXG4gICAgICAgICAgICBzaG93RXJyb3JzID8gc3RkZXJyIHx8ICcnIDogJycsXG4gICAgICAgICAgICBzdGRvdXQgfHwgJycsXG4gICAgICAgICAgICByZW5kZXJNYXRoLFxuICAgICAgICAgIClcbiAgICAgICAgICByZXNvbHZlKHJlc3VsdClcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIHJlamVjdChlKVxuICAgICAgICB9XG4gICAgICB9LFxuICAgIClcbiAgICBjcC5zdGRpbi53cml0ZSh0ZXh0KVxuICAgIGNwLnN0ZGluLmVuZCgpXG4gIH0pXG59XG5cbmZ1bmN0aW9uIGdldEFyZ3VtZW50cyhpYXJnczogQXJncykge1xuICBjb25zdCBhcmdzOiBzdHJpbmdbXSA9IFtdXG4gIGZvciAoY29uc3QgW2tleSwgdmFsXSBvZiBPYmplY3QuZW50cmllcyhpYXJncykpIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWwpKSB7XG4gICAgICBhcmdzLnB1c2goLi4udmFsLm1hcCgodikgPT4gYC0tJHtrZXl9PSR7dn1gKSlcbiAgICB9IGVsc2UgaWYgKHZhbCkge1xuICAgICAgYXJncy5wdXNoKGAtLSR7a2V5fT0ke3ZhbH1gKVxuICAgIH1cbiAgfVxuICBjb25zdCByZXM6IHN0cmluZ1tdID0gW11cbiAgZm9yIChjb25zdCB2YWwgb2YgWy4uLmFyZ3MsIC4uLmF0b21Db25maWcoKS5wYW5kb2NDb25maWcucGFuZG9jQXJndW1lbnRzXSkge1xuICAgIGNvbnN0IG5ld3ZhbCA9IHZhbC5yZXBsYWNlKC9eKC0tW1xcd1xcLV0rKVxccyguKykkL2ksICckMT0kMicpXG4gICAgaWYgKG5ld3ZhbC5zdWJzdHIoMCwgMSkgPT09ICctJykge1xuICAgICAgcmVzLnB1c2gobmV3dmFsKVxuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzXG59XG5cbmV4cG9ydCBjb25zdCB0ZXN0aW5nID0ge1xuICBzZXRQYW5kb2NPcHRpb25zLFxuICBnZXRBcmd1bWVudHMsXG4gIGZpbmRGaWxlUmVjdXJzaXZlLFxufVxuIl19