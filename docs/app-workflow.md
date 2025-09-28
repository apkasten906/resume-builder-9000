# 📄 Application Workflow

```mermaid
flowchart TD
    A0[User enters credentials] -->|POST /api/auth/login| A1[JWT Token]
    A1 -->|HTTP-only cookie| A[User Authenticated]
    A -->|JWT Auth| B[Dashboard]

    B --> C[Upload Resume (UI)]
    C -->|POST /api/resumes/parse, Validate, Preview| D[Resume JSON]

    B --> E[Upload / Paste Job Description]
    E -->|Parse & Store| F[JD JSON]

    D --> G[Run Tailoring Engine]
    F --> G
    G -->|Rules: filter, reorder, diagnostics| H[Tailored Resume JSON]

    H --> I[Red Flags Panel]
    H --> J[Resume Preview]

    J --> K[Download Resume<br/>(MD/TXT)]
```
