import re
from typing import Callable

_MDV2_ESCAPE_RE = re.compile(r'([_*\[\]()~`>#\+\-=|{}.!\\])')


def _escape_mdv2(text: str) -> str:
    return _MDV2_ESCAPE_RE.sub(r'\\\1', text)


def _strip_mdv2(text: str) -> str:
    cleaned = re.sub(r'\\([_*\[\]()~`>#\+\-=|{}.!\\])', r'\1', text)
    cleaned = re.sub(r'\*\*([^*]+)\*\*', r'\1', cleaned)
    cleaned = re.sub(r'\*([^*]+)\*', r'\1', cleaned)
    cleaned = re.sub(r'(?<!\w)_([^_]+)_(?!\w)', r'\1', cleaned)
    cleaned = re.sub(r'~([^~]+)~', r'\1', cleaned)
    cleaned = re.sub(r'\|\|([^|]+)\|\|', r'\1', cleaned)
    return cleaned


def utf16_len(s: str) -> int:
    return len(s.encode("utf-16-le")) // 2


MAX_MESSAGE_LENGTH = 4096


def _custom_unit_to_cp(s: str, budget: int, len_fn: Callable[[str], int]) -> int:
    if len_fn(s) <= budget:
        return len(s)
    lo, hi = 0, len(s)
    while lo < hi:
        mid = (lo + hi + 1) // 2
        if len_fn(s[:mid]) <= budget:
            lo = mid
        else:
            hi = mid - 1
    return lo


def truncate_message(
    content: str,
    max_length: int = MAX_MESSAGE_LENGTH,
    len_fn: Callable[[str], int] | None = None,
) -> list[str]:
    if len_fn is None:
        len_fn = utf16_len

    _len = len_fn
    if _len(content) <= max_length:
        return [content]

    INDICATOR_RESERVE = 10
    FENCE_CLOSE = "\n```"

    chunks: list[str] = []
    remaining = content
    carry_lang: str | None = None

    while remaining:
        prefix = f"```{carry_lang}\n" if carry_lang is not None else ""
        headroom = max_length - INDICATOR_RESERVE - _len(prefix) - _len(FENCE_CLOSE)
        if headroom < 1:
            headroom = max_length // 2

        if _len(prefix) + _len(remaining) <= max_length - INDICATOR_RESERVE:
            chunks.append(prefix + remaining)
            break

        if _len is not utf16_len:
            _cp_limit = _custom_unit_to_cp(remaining, headroom, _len)
        else:
            _cp_limit = headroom
        region = remaining[:_cp_limit]
        split_at = region.rfind("\n")
        if split_at < _cp_limit // 2:
            split_at = region.rfind(" ")
        if split_at < 1:
            split_at = _cp_limit

        candidate = remaining[:split_at]
        backtick_count = candidate.count("`") - candidate.count("\\`")
        if backtick_count % 2 == 1:
            last_bt = candidate.rfind("`")
            while last_bt > 0 and candidate[last_bt - 1] == "\\":
                last_bt = candidate.rfind("`", 0, last_bt)
            if last_bt > 0:
                safe_split = max(
                    candidate.rfind(" ", 0, last_bt),
                    candidate.rfind("\n", 0, last_bt),
                )
                if safe_split > _cp_limit // 4:
                    split_at = safe_split

        chunk_body = remaining[:split_at]
        remaining = remaining[split_at:].lstrip()

        full_chunk = prefix + chunk_body

        in_code = carry_lang is not None
        lang = carry_lang or ""
        for line in chunk_body.split("\n"):
            stripped = line.strip()
            if stripped.startswith("```"):
                if in_code:
                    in_code = False
                    lang = ""
                else:
                    in_code = True
                    tag = stripped[3:].strip()
                    lang = tag.split()[0] if tag else ""

        if in_code:
            full_chunk += FENCE_CLOSE
            carry_lang = lang
        else:
            carry_lang = None

        chunks.append(full_chunk)

    if len(chunks) > 1:
        total = len(chunks)
        chunks = [
            f"{chunk} ({i + 1}/{total})" for i, chunk in enumerate(chunks)
        ]

    return chunks


def format_message(content: str) -> str:
    if not content:
        return content

    placeholders: dict = {}
    counter = [0]

    def _ph(value: str) -> str:
        key = f"\x00PH{counter[0]}\x00"
        counter[0] += 1
        placeholders[key] = value
        return key

    text = content

    # 1) Protect fenced code blocks
    def _protect_fenced(m):
        raw = m.group(0)
        open_end = raw.index('\n') + 1 if '\n' in raw[3:] else 3
        opening = raw[:open_end]
        body_and_close = raw[open_end:]
        body = body_and_close[:-3]
        body = body.replace('\\', '\\\\').replace('`', '\\`')
        return _ph(opening + body + '```')

    text = re.sub(
        r'(```(?:[^\n]*\n)?[\s\S]*?```)',
        _protect_fenced,
        text,
    )

    # 2) Protect inline code
    text = re.sub(
        r'(`[^`]+`)',
        lambda m: _ph(m.group(0).replace('\\', '\\\\')),
        text,
    )

    # 3) Convert markdown links
    def _convert_link(m):
        display = _escape_mdv2(m.group(1))
        url = m.group(2).replace('\\', '\\\\').replace(')', '\\)')
        return _ph(f'[{display}]({url})')

    text = re.sub(
        r'\[([^\]]+)\]\(([^()]*(?:\([^()]*\)[^()]*)*)\)',
        _convert_link,
        text,
    )

    # 4) Convert headers → bold
    def _convert_header(m):
        inner = m.group(1).strip()
        inner = re.sub(r'\*\*(.+?)\*\*', r'\1', inner)
        return _ph(f'*{_escape_mdv2(inner)}*')

    text = re.sub(
        r'^#{1,6}\s+(.+)$',
        _convert_header,
        text,
        flags=re.MULTILINE,
    )

    # 5) Convert bold
    text = re.sub(
        r'\*\*(.+?)\*\*',
        lambda m: _ph(f'*{_escape_mdv2(m.group(1))}*'),
        text,
    )

    # 6) Convert italic
    text = re.sub(
        r'\*([^*\n]+)\*',
        lambda m: _ph(f'_{_escape_mdv2(m.group(1))}_'),
        text,
    )

    # 7) Convert strikethrough
    text = re.sub(
        r'~~(.+?)~~',
        lambda m: _ph(f'~{_escape_mdv2(m.group(1))}~'),
        text,
    )

    # 8) Convert spoiler
    text = re.sub(
        r'\|\|(.+?)\|\|',
        lambda m: _ph(f'||{_escape_mdv2(m.group(1))}||'),
        text,
    )

    # 9) Convert blockquotes
    def _convert_blockquote(m):
        prefix = m.group(1)
        inner = m.group(2)
        return _ph(f'{prefix} {_escape_mdv2(inner)}')

    text = re.sub(
        r'^((?:\*\*)?>{1,3}) (.+)$',
        _convert_blockquote,
        text,
        flags=re.MULTILINE,
    )

    # 10) Escape remaining special characters
    text = _escape_mdv2(text)

    # 11) Restore placeholders
    for key in reversed(list(placeholders.keys())):
        text = text.replace(key, placeholders[key])

    # 12) Safety net: escape unescaped ( ) { }
    _code_split = re.split(r'(```[\s\S]*?```|`[^`]+`)', text)
    _safe_parts = []
    for _idx, _seg in enumerate(_code_split):
        if _idx % 2 == 1:
            _safe_parts.append(_seg)
        else:
            def _esc_bare(m, _seg=_seg):
                s = m.start()
                ch = m.group(0)
                if s > 0 and _seg[s - 1] == '\\':
                    return ch
                if ch == '(' and s > 0 and _seg[s - 1] == ']':
                    return ch
                if ch == ')':
                    before = _seg[:s]
                    if '](http' in before or '](' in before:
                        depth = 0
                        for j in range(s - 1, max(s - 2000, -1), -1):
                            if _seg[j] == '(':
                                depth -= 1
                                if depth < 0:
                                    if j > 0 and _seg[j - 1] == ']':
                                        return ch
                                    break
                            elif _seg[j] == ')':
                                depth += 1
                return '\\' + ch
            _safe_parts.append(re.sub(r'[(){}]', _esc_bare, _seg))
    text = ''.join(_safe_parts)

    return text
