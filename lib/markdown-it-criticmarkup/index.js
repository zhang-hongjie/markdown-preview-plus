"use strict";
const specialChars = ['-', '+', '~', '=', '>'];
function isOpening(str, pos) {
    if (str[pos] === '{' &&
        specialChars.includes(str[pos + 1]) &&
        str[pos + 2] === str[pos + 1]) {
        const op = str.slice(pos + 1, pos + 3);
        const cl = op[0] === '>' ? '<<}' : op + '}';
        return [op, cl];
    }
    else {
        return null;
    }
}
function criticInline(state, silent) {
    const { src, pos } = state;
    const tags = isOpening(src, pos);
    if (tags === null)
        return false;
    const [opening, closing] = tags;
    const endPos = src.indexOf(closing, pos + 3);
    const content = endPos >= 0 ? src.slice(pos + 3, endPos) : null;
    if (content === null)
        return false;
    if (silent)
        return true;
    const token = state.push('critic-markup');
    token.content = content;
    token.tag = opening;
    state.pos = endPos + closing.length;
    return true;
}
function criticRender(tokens, idx) {
    const token = tokens[idx];
    const tag = token.tag;
    const content = token.content;
    if (tag === '--') {
        return `<del>${content}</del>`;
    }
    else if (tag === '++') {
        return `<ins>${content}</ins>`;
    }
    else if (tag === '==') {
        return `<mark>${content}</mark>`;
    }
    else if (tag === '>>') {
        return `<span tabindex="-1" class="critic comment"><span>${content}</span></span>`;
    }
    else {
        const arr = content.split('~>');
        if (arr.length === 2) {
            return `<del>${arr[0]}</del><ins>${arr[1]}</ins>`;
        }
        else {
            return `<code>Error: ~> not found.</code>`;
        }
    }
}
module.exports = function (md) {
    md.inline.ruler.before('strikethrough', 'critic-markup', criticInline);
    md.renderer.rules['critic-markup'] = criticRender;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbWFya2Rvd24taXQtY3JpdGljbWFya3VwL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFtQkEsTUFBTSxZQUFZLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUE7QUFFOUMsU0FBUyxTQUFTLENBQUMsR0FBVyxFQUFFLEdBQVc7SUFDekMsSUFDRSxHQUFHLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRztRQUNoQixZQUFZLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDbkMsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUM3QjtRQUNBLE1BQU0sRUFBRSxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUE7UUFDdEMsTUFBTSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsR0FBRyxDQUFBO1FBQzNDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUE7S0FDaEI7U0FBTTtRQUNMLE9BQU8sSUFBSSxDQUFBO0tBQ1o7QUFDSCxDQUFDO0FBRUQsU0FBUyxZQUFZLENBQ25CLEtBQW1FLEVBQ25FLE1BQWU7SUFFZixNQUFNLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEtBQUssQ0FBQTtJQUMxQixNQUFNLElBQUksR0FBRyxTQUFTLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFBO0lBQ2hDLElBQUksSUFBSSxLQUFLLElBQUk7UUFBRSxPQUFPLEtBQUssQ0FBQTtJQUMvQixNQUFNLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxHQUFHLElBQUksQ0FBQTtJQUMvQixNQUFNLE1BQU0sR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUE7SUFDNUMsTUFBTSxPQUFPLEdBQUcsTUFBTSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUE7SUFDL0QsSUFBSSxPQUFPLEtBQUssSUFBSTtRQUFFLE9BQU8sS0FBSyxDQUFBO0lBQ2xDLElBQUksTUFBTTtRQUFFLE9BQU8sSUFBSSxDQUFBO0lBQ3ZCLE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUE7SUFDekMsS0FBSyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUE7SUFDdkIsS0FBSyxDQUFDLEdBQUcsR0FBRyxPQUFPLENBQUE7SUFDbkIsS0FBSyxDQUFDLEdBQUcsR0FBRyxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQTtJQUNuQyxPQUFPLElBQUksQ0FBQTtBQUNiLENBQUM7QUFFRCxTQUFTLFlBQVksQ0FBQyxNQUFlLEVBQUUsR0FBVztJQUNoRCxNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDekIsTUFBTSxHQUFHLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQTtJQUNyQixNQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFBO0lBQzdCLElBQUksR0FBRyxLQUFLLElBQUksRUFBRTtRQUNoQixPQUFPLFFBQVEsT0FBTyxRQUFRLENBQUE7S0FDL0I7U0FBTSxJQUFJLEdBQUcsS0FBSyxJQUFJLEVBQUU7UUFDdkIsT0FBTyxRQUFRLE9BQU8sUUFBUSxDQUFBO0tBQy9CO1NBQU0sSUFBSSxHQUFHLEtBQUssSUFBSSxFQUFFO1FBQ3ZCLE9BQU8sU0FBUyxPQUFPLFNBQVMsQ0FBQTtLQUNqQztTQUFNLElBQUksR0FBRyxLQUFLLElBQUksRUFBRTtRQUN2QixPQUFPLG9EQUFvRCxPQUFPLGdCQUFnQixDQUFBO0tBQ25GO1NBQU07UUFFTCxNQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFBO1FBQy9CLElBQUksR0FBRyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDcEIsT0FBTyxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUMsY0FBYyxHQUFHLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQTtTQUNsRDthQUFNO1lBQ0wsT0FBTyxtQ0FBbUMsQ0FBQTtTQUMzQztLQUNGO0FBQ0gsQ0FBQztBQUVELGlCQUFTLFVBQVMsRUFBUTtJQUN4QixFQUFFLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsZUFBZSxFQUFFLGVBQWUsRUFBRSxZQUFtQixDQUFDLENBQUE7SUFDN0UsRUFBRSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLEdBQUcsWUFBWSxDQUFBO0FBQ25ELENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8vIFRoaXMgZmlsZSBpbmNvcnBvcmF0ZXMgY29kZSBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS93YWZlci1saS9tYXJrZG93bi1pdC1jcml0aWNtYXJrdXBcbi8vIGNvdmVyZWQgYnkgdGhlIGZvbGxvd2luZyB0ZXJtczpcbi8vIENvcHlyaWdodCAyMDE3IFdhZmVyIExpXG4vL1xuLy8gUGVybWlzc2lvbiB0byB1c2UsIGNvcHksIG1vZGlmeSwgYW5kL29yIGRpc3RyaWJ1dGUgdGhpcyBzb2Z0d2FyZSBmb3IgYW55XG4vLyBwdXJwb3NlIHdpdGggb3Igd2l0aG91dCBmZWUgaXMgaGVyZWJ5IGdyYW50ZWQsIHByb3ZpZGVkIHRoYXQgdGhlIGFib3ZlXG4vLyBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIGFwcGVhciBpbiBhbGwgY29waWVzLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIgQU5EIFRIRSBBVVRIT1IgRElTQ0xBSU1TIEFMTCBXQVJSQU5USUVTXG4vLyBXSVRIIFJFR0FSRCBUTyBUSElTIFNPRlRXQVJFIElOQ0xVRElORyBBTEwgSU1QTElFRCBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFkgQU5EIEZJVE5FU1MuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1IgQkUgTElBQkxFIEZPUiBBTllcbi8vIFNQRUNJQUwsIERJUkVDVCwgSU5ESVJFQ1QsIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFUyBPUiBBTlkgREFNQUdFU1xuLy8gV0hBVFNPRVZFUiBSRVNVTFRJTkcgRlJPTSBMT1NTIE9GIFVTRSwgREFUQSBPUiBQUk9GSVRTLCBXSEVUSEVSIElOIEFOIEFDVElPTlxuLy8gT0YgQ09OVFJBQ1QsIE5FR0xJR0VOQ0UgT1IgT1RIRVIgVE9SVElPVVMgQUNUSU9OLCBBUklTSU5HIE9VVCBPRiBPUiBJTlxuLy8gQ09OTkVDVElPTiBXSVRIIFRIRSBVU0UgT1IgUEVSRk9STUFOQ0UgT0YgVEhJUyBTT0ZUV0FSRS5cblxuaW1wb3J0ICogYXMgbWRJdCBmcm9tICdtYXJrZG93bi1pdCdcbmltcG9ydCBUb2tlbiA9IHJlcXVpcmUoJ21hcmtkb3duLWl0L2xpYi90b2tlbicpXG5cbmNvbnN0IHNwZWNpYWxDaGFycyA9IFsnLScsICcrJywgJ34nLCAnPScsICc+J11cblxuZnVuY3Rpb24gaXNPcGVuaW5nKHN0cjogc3RyaW5nLCBwb3M6IG51bWJlcik6IFtzdHJpbmcsIHN0cmluZ10gfCBudWxsIHtcbiAgaWYgKFxuICAgIHN0cltwb3NdID09PSAneycgJiZcbiAgICBzcGVjaWFsQ2hhcnMuaW5jbHVkZXMoc3RyW3BvcyArIDFdKSAmJlxuICAgIHN0cltwb3MgKyAyXSA9PT0gc3RyW3BvcyArIDFdXG4gICkge1xuICAgIGNvbnN0IG9wID0gc3RyLnNsaWNlKHBvcyArIDEsIHBvcyArIDMpXG4gICAgY29uc3QgY2wgPSBvcFswXSA9PT0gJz4nID8gJzw8fScgOiBvcCArICd9J1xuICAgIHJldHVybiBbb3AsIGNsXVxuICB9IGVsc2Uge1xuICAgIHJldHVybiBudWxsXG4gIH1cbn1cblxuZnVuY3Rpb24gY3JpdGljSW5saW5lKFxuICBzdGF0ZTogeyBzcmM6IHN0cmluZzsgcG9zOiBudW1iZXI7IHB1c2g6ICh0b2tlbjogc3RyaW5nKSA9PiBUb2tlbiB9LFxuICBzaWxlbnQ6IGJvb2xlYW4sXG4pIHtcbiAgY29uc3QgeyBzcmMsIHBvcyB9ID0gc3RhdGVcbiAgY29uc3QgdGFncyA9IGlzT3BlbmluZyhzcmMsIHBvcylcbiAgaWYgKHRhZ3MgPT09IG51bGwpIHJldHVybiBmYWxzZVxuICBjb25zdCBbb3BlbmluZywgY2xvc2luZ10gPSB0YWdzXG4gIGNvbnN0IGVuZFBvcyA9IHNyYy5pbmRleE9mKGNsb3NpbmcsIHBvcyArIDMpXG4gIGNvbnN0IGNvbnRlbnQgPSBlbmRQb3MgPj0gMCA/IHNyYy5zbGljZShwb3MgKyAzLCBlbmRQb3MpIDogbnVsbFxuICBpZiAoY29udGVudCA9PT0gbnVsbCkgcmV0dXJuIGZhbHNlXG4gIGlmIChzaWxlbnQpIHJldHVybiB0cnVlXG4gIGNvbnN0IHRva2VuID0gc3RhdGUucHVzaCgnY3JpdGljLW1hcmt1cCcpXG4gIHRva2VuLmNvbnRlbnQgPSBjb250ZW50XG4gIHRva2VuLnRhZyA9IG9wZW5pbmdcbiAgc3RhdGUucG9zID0gZW5kUG9zICsgY2xvc2luZy5sZW5ndGhcbiAgcmV0dXJuIHRydWVcbn1cblxuZnVuY3Rpb24gY3JpdGljUmVuZGVyKHRva2VuczogVG9rZW5bXSwgaWR4OiBudW1iZXIpIHtcbiAgY29uc3QgdG9rZW4gPSB0b2tlbnNbaWR4XVxuICBjb25zdCB0YWcgPSB0b2tlbi50YWdcbiAgY29uc3QgY29udGVudCA9IHRva2VuLmNvbnRlbnRcbiAgaWYgKHRhZyA9PT0gJy0tJykge1xuICAgIHJldHVybiBgPGRlbD4ke2NvbnRlbnR9PC9kZWw+YFxuICB9IGVsc2UgaWYgKHRhZyA9PT0gJysrJykge1xuICAgIHJldHVybiBgPGlucz4ke2NvbnRlbnR9PC9pbnM+YFxuICB9IGVsc2UgaWYgKHRhZyA9PT0gJz09Jykge1xuICAgIHJldHVybiBgPG1hcms+JHtjb250ZW50fTwvbWFyaz5gXG4gIH0gZWxzZSBpZiAodGFnID09PSAnPj4nKSB7XG4gICAgcmV0dXJuIGA8c3BhbiB0YWJpbmRleD1cIi0xXCIgY2xhc3M9XCJjcml0aWMgY29tbWVudFwiPjxzcGFuPiR7Y29udGVudH08L3NwYW4+PC9zcGFuPmBcbiAgfSBlbHNlIHtcbiAgICAvLyB7fn5bdGV4dDFdfj5bdGV4dDJdfn59XG4gICAgY29uc3QgYXJyID0gY29udGVudC5zcGxpdCgnfj4nKVxuICAgIGlmIChhcnIubGVuZ3RoID09PSAyKSB7XG4gICAgICByZXR1cm4gYDxkZWw+JHthcnJbMF19PC9kZWw+PGlucz4ke2FyclsxXX08L2lucz5gXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBgPGNvZGU+RXJyb3I6IH4+IG5vdCBmb3VuZC48L2NvZGU+YFxuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgPSBmdW5jdGlvbihtZDogbWRJdCkge1xuICBtZC5pbmxpbmUucnVsZXIuYmVmb3JlKCdzdHJpa2V0aHJvdWdoJywgJ2NyaXRpYy1tYXJrdXAnLCBjcml0aWNJbmxpbmUgYXMgYW55KVxuICBtZC5yZW5kZXJlci5ydWxlc1snY3JpdGljLW1hcmt1cCddID0gY3JpdGljUmVuZGVyXG59XG4iXX0=