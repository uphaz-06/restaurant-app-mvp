from pathlib import Path

ROOT = Path(__file__).resolve().parent
md = (ROOT / "SRS_v2.md").read_text(encoding="utf-8")
lines = md.splitlines()

out = bytearray()
out.extend(b"%PDF-1.4\n")
objects = []


def add_object(payload: bytes) -> int:
    objects.append(payload)
    return len(objects)


def escape(text: str) -> str:
    return text.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


content_lines = ["BT", "/F1 11 Tf", "14 800 Td"]
y_used = 0
for raw in lines:
    text = raw.replace("\t", "    ")
    if len(text) > 95:
        chunks = [text[i : i + 95] for i in range(0, len(text), 95)]
    else:
        chunks = [text or " "]
    for chunk in chunks:
        content_lines.append(f"({escape(chunk)}) Tj")
        content_lines.append("0 -14 Td")
        y_used += 1
content_lines.append("ET")
stream = "\n".join(content_lines).encode("latin-1", "replace")

# Simple multi-page: start a new page every ~52 lines
pages = []
page_height_lines = 52
chunks = stream.decode("latin-1").split("\n")
# Rebuild pages more carefully
pages_text = []
current = ["BT", "/F1 11 Tf", "14 800 Td"]
count = 0
for raw in lines:
    text = raw.replace("\t", "    ")
    pieces = [text[i : i + 95] for i in range(0, max(len(text), 1), 95)] or [" "]
    if not text:
        pieces = [" "]
    for chunk in pieces:
        if count >= page_height_lines:
            current.append("ET")
            pages_text.append("\n".join(current).encode("latin-1", "replace"))
            current = ["BT", "/F1 11 Tf", "14 800 Td"]
            count = 0
        current.append(f"({escape(chunk)}) Tj")
        current.append("0 -14 Td")
        count += 1
current.append("ET")
pages_text.append("\n".join(current).encode("latin-1", "replace"))

font = add_object(b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")
page_ids = []
content_ids = []
for stream_bytes in pages_text:
    content_ids.append(
        add_object(
            f"<< /Length {len(stream_bytes)} >>\nstream\n".encode("latin-1")
            + stream_bytes
            + b"\nendstream"
        )
    )

pages_obj_index = len(objects) + len(pages_text) + 1  # placeholder, fix below

# We'll create page objects next, then pages parent, then catalog
page_object_numbers = []
kids_placeholder = []
for cid in content_ids:
    # page objects added after we know parent number; delay
    kids_placeholder.append(cid)

# Parent will be last-but-one; compute numbers:
# objects currently: font + content streams
# next: N page objects, then pages, then catalog
n_pages = len(content_ids)
first_page_num = len(objects) + 1
pages_num = first_page_num + n_pages
catalog_num = pages_num + 1

for i, cid in enumerate(content_ids):
    payload = (
        f"<< /Type /Page /Parent {pages_num} 0 R /MediaBox [0 0 612 792] "
        f"/Resources << /Font << /F1 {font} 0 R >> >> /Contents {cid} 0 R >>"
    ).encode("latin-1")
    add_object(payload)
    page_object_numbers.append(first_page_num + i)

kids = " ".join(f"{n} 0 R" for n in page_object_numbers)
add_object(f"<< /Type /Pages /Kids [{kids}] /Count {n_pages} >>".encode("latin-1"))
add_object(f"<< /Type /Catalog /Pages {pages_num} 0 R >>".encode("latin-1"))

# Build xref
body = b"%PDF-1.4\n"
offsets = [0]
for i, obj in enumerate(objects, start=1):
    offsets.append(len(body))
    body += f"{i} 0 obj\n".encode("latin-1") + obj + b"\nendobj\n"

xref_pos = len(body)
xref = [f"xref\n0 {len(objects) + 1}\n", "0000000000 65535 f \n"]
for off in offsets[1:]:
    xref.append(f"{off:010d} 00000 n \n")
trailer = (
    f"trailer\n<< /Size {len(objects) + 1} /Root {catalog_num} 0 R >>\n"
    f"startxref\n{xref_pos}\n%%EOF\n"
)
pdf = body + "".join(xref).encode("latin-1") + trailer.encode("latin-1")
(ROOT / "SRS_v2.pdf").write_bytes(pdf)
print("Wrote", ROOT / "SRS_v2.pdf", "pages", n_pages)
