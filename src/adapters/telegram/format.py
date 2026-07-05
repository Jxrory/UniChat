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

_TABLE_SEPARATOR_RE = re.compile(
    r'^\s*\|?\s*:?-+:?\s*(?:\|\s*:?-+:?\s*){1,}\|?\s*$'
)


def _is_table_row(line: str) -> bool:
    stripped = line.strip()
    return bool(stripped) and '|' in stripped


def _split_markdown_table_row(line: str) -> list[str]:
    stripped = line.strip()
    if stripped.startswith("|"):
        stripped = stripped[1:]
    if stripped.endswith("|"):
        stripped = stripped[:-1]
    return [cell.strip() for cell in stripped.split("|")]


def _render_table_block(table_block: list[str]) -> str:
    if len(table_block) < 3:
        return "\n".join(table_block)

    headers = _split_markdown_table_row(table_block[0])
    if len(headers) < 2:
        return "\n".join(table_block)

    first_data_row = (
        _split_markdown_table_row(table_block[2])
        if len(table_block) > 2
        else []
    )
    has_row_label_col = len(first_data_row) == len(headers) + 1

    rendered_groups: list[str] = []
    for index, row in enumerate(table_block[2:], start=1):
        cells = _split_markdown_table_row(row)
        if has_row_label_col:
            heading = cells[0] if cells and cells[0] else f"Row {index}"
            data_cells = cells[1:]
        else:
            heading = next((cell for cell in cells if cell), f"Row {index}")
            data_cells = cells

        if len(data_cells) < len(headers):
            data_cells.extend([""] * (len(headers) - len(data_cells)))
        elif len(data_cells) > len(headers):
            data_cells = data_cells[: len(headers)]

        bullets: list[str] = []
        for header, value in zip(headers, data_cells):
            if not has_row_label_col and value == heading:
                continue
            bullets.append(f"• {header}: {value}")

        group_lines = [f"**{heading}**", *bullets]
        rendered_groups.append("\n".join(group_lines))

    return "\n\n".join(rendered_groups)


def _convert_table_to_bullets(text: str) -> str:
    if '|' not in text or '-' not in text:
        return text

    lines = text.split('\n')
    out: list[str] = []
    in_fence = False
    i = 0
    while i < len(lines):
        line = lines[i]
        stripped = line.lstrip()

        if stripped.startswith('```'):
            in_fence = not in_fence
            out.append(line)
            i += 1
            continue
        if in_fence:
            out.append(line)
            i += 1
            continue

        if (
            '|' in line
            and i + 1 < len(lines)
            and _TABLE_SEPARATOR_RE.match(lines[i + 1])
        ):
            table_block = [line, lines[i + 1]]
            j = i + 2
            while j < len(lines) and _is_table_row(lines[j]):
                table_block.append(lines[j])
                j += 1
            out.append(_render_table_block(table_block))
            i = j
            continue

        out.append(line)
        i += 1

    return '\n'.join(out)


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

    # 0) Convert GFM pipe tables to bold-heading + bullet groups
    text = _convert_table_to_bullets(text)

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
