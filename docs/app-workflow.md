# 📄 Application Workflow

```mermaid
flowchart TD
    A[User Login] -->|JWT Auth| B[Dashboard]

    B --> C[Upload Resume]
    C -->|Parse & Store| D[Resume JSON]

    B --> E[Upload / Paste Job Description]
    E -->|Parse & Store| F[JD JSON]

    D --> G[Run Tailoring Engine]
    F --> G
    G -->|Rules: filter, reorder, diagnostics| H[Tailored Resume JSON]

    H --> I[Red Flags Panel]
    H --> J[Resume Preview]

    J --> K[Download Resume<br/>(MD/TXT)]
```
